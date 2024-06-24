/// a92b03de42~1:sui/sdk/typescript/src/transactions/serializer.ts

import { SuiMoveNormalizedType } from "@mysten/sui/client";
import { CallArg } from "@mysten/sui/transactions";
import {
    MOVE_STDLIB_ADDRESS,
    SUI_FRAMEWORK_ADDRESS,
    isValidSuiAddress,
    normalizeSuiAddress,
} from "@mysten/sui/utils";

// === Constants ===

const ALLOWED_TYPES = ["Address", "Bool", "U8", "U16", "U32", "U64", "U128", "U256"];

const OBJECT_MODULE_NAME = "object";
const ID_STRUCT_NAME = "ID";

const STD_ASCII_MODULE_NAME = "ascii";
const STD_ASCII_STRUCT_NAME = "String";

const STD_UTF8_MODULE_NAME = "string";
const STD_UTF8_STRUCT_NAME = "String";

const STD_OPTION_MODULE_NAME = "option";
const STD_OPTION_STRUCT_NAME = "Option";

const RESOLVED_SUI_ID = {
    address: SUI_FRAMEWORK_ADDRESS,
    module: OBJECT_MODULE_NAME,
    name: ID_STRUCT_NAME,
};
const RESOLVED_ASCII_STR = {
    address: MOVE_STDLIB_ADDRESS,
    module: STD_ASCII_MODULE_NAME,
    name: STD_ASCII_STRUCT_NAME,
};
const RESOLVED_UTF8_STR = {
    address: MOVE_STDLIB_ADDRESS,
    module: STD_UTF8_MODULE_NAME,
    name: STD_UTF8_STRUCT_NAME,
};

const RESOLVED_STD_OPTION = {
    address: MOVE_STDLIB_ADDRESS,
    module: STD_OPTION_MODULE_NAME,
    name: STD_OPTION_STRUCT_NAME,
};

// === Helpers ===

function isSameStruct(a: any, b: any) {
    return a.address === b.address
        && a.module === b.module
        && a.name === b.name;
}

function expectTypes(typeNames: string[], argVal?: SuiJsonValue) {
    if (typeof argVal === "undefined") {
        return;
    }
    if (!typeNames.includes(typeof argVal)) {
        const expectedTypes = typeNames.length === 1 ? typeNames[0] : `one of ${typeNames.join(", ")}`;
        throw new Error(`Expected ${String(argVal)} to be ${expectedTypes}, received ${typeof argVal}`);
    }
}

export function getPureSerializationTypeAndValue(
    normalizedType: SuiMoveNormalizedType,
    argVal: SuiJsonValue | undefined,
    typeArguments: string[],
    isOption = false,
): { type: string[] | undefined; value: SuiJsonValue | undefined  }
{
    console.debug(" ==== getPureSerializationTypeAndValue ====");
    console.debug("normalizedType:", JSON.stringify(normalizedType), "argVal:", argVal);

    if (typeof normalizedType === "string" && ALLOWED_TYPES.includes(normalizedType))
    {
        if (normalizedType in ["U8", "U16", "U32", "U64", "U128", "U256"])
        {
            expectTypes(["number"], argVal);
        }
        else if (normalizedType === "Bool")
        {
            expectTypes(["string", "number", "boolean"], argVal);

            const argStr = String(argVal);
            if ( !["true", "false", "1", "0"].includes(argStr) ) {
                throw new Error(`Invalid Bool: ${JSON.stringify(argStr)}`);
            }

            const boolValue = argStr === "true" || argStr === "1";
            return { type: [normalizedType], value: boolValue };
        }
        else if (normalizedType === "Address")
        {
            expectTypes(["string"], argVal);

            const normalizedAddr = normalizeSuiAddress(argVal as string);
            if (argVal && !isValidSuiAddress(normalizedAddr)) {
                throw new Error(`Invalid Sui address: ${JSON.stringify(argVal)}`);
            }

            return { type: [normalizedType], value: normalizedAddr };
        }

        return { type: [normalizedType], value: argVal };
    }
    else if (typeof normalizedType === "string") {
        throw new Error(`Unknown pure normalized type ${JSON.stringify(normalizedType, null, 2)}`);
    }

    if ("TypeParameter" in normalizedType)
    {
        const typeArg = typeArguments[normalizedType.TypeParameter].trim();
        const typeArgType = parseTypeArgument(typeArg);
        return getPureSerializationTypeAndValue(
            typeArgType,
            argVal,
            typeArguments,
            isOption,
        );
    }

    if ("Vector" in normalizedType)
    {
        // Some vector<u8> args should be serialized with bcs.string
        const serializeAsString =
            typeof argVal === "string"
            && normalizedType.Vector === "U8"
            && !argVal.trim().startsWith("["); // skip actual vector<u8>
        if (serializeAsString) {
            return { type: ["String"], value: argVal };
        }

        // Actual vector<u8> args come in the form of a JSON string that needs to be parsed
        if (typeof argVal === "string") {
            try {
                argVal = JSON.parse(argVal);
            } catch (err) {
                throw new Error(`Malformed array: ${String(argVal)}`);
            }
        }

        if (!Array.isArray(argVal) && typeof argVal !== "undefined") {
            throw new Error(`Expect ${String(argVal)} to be a array, received ${typeof argVal}`);
        }

        // Infer the type of the vector from its first element
        const { type: innerType } = getPureSerializationTypeAndValue(
            normalizedType.Vector,
            // undefined when argVal is empty
            argVal ? argVal[0] : undefined,
            typeArguments,
            isOption,
        );

        if (typeof innerType === "undefined") {
            return { type: undefined, value: argVal };
        }

        // Transform the vector elements into actual booleans, normalized addresses, etc
        if (Array.isArray(argVal)) {
            const serializedValues: SuiJsonValue[] = [];
            for (const val of argVal) {
                const { value } = getPureSerializationTypeAndValue(
                    normalizedType.Vector,
                    val,
                    typeArguments,
                    isOption,
                );
                serializedValues.push(value!);
            }
            argVal = serializedValues;
        }

        return {
            type: [
                isOption ? "Option": "Vector",
                ...innerType.flat()
            ],
            value: argVal,
        };
    }

    if ("Struct" in normalizedType)
    {
        if (isSameStruct(normalizedType.Struct, RESOLVED_ASCII_STR)) {
            return { type: ["String"], value: argVal };
        }
        else if (isSameStruct(normalizedType.Struct, RESOLVED_UTF8_STR)) {
            return { type: ["String"], value: argVal };
        }
        else if (isSameStruct(normalizedType.Struct, RESOLVED_SUI_ID)) {
            return { type: ["Address"], value: argVal };
        }
        else if (isSameStruct(normalizedType.Struct, RESOLVED_STD_OPTION)) {
            const optionToVec: SuiMoveNormalizedType = {
                Vector: normalizedType.Struct.typeArguments[0],
            };
            const argValArr = [argVal!];
            return getPureSerializationTypeAndValue(
                optionToVec,
                argValArr,
                typeArguments,
                true,
            );
        }
    }

    return { type: undefined, value: argVal };
}

/// a92b03de42~1:sui/sdk/typescript/src/client/types/common.ts

export type SuiJsonValue = boolean | number | string | CallArg | SuiJsonValue[];

/// Helpers

const validPrimitiveTypes = [
    "Bool", "U8", "U16", "U32", "U64", "U128", "U256", "Address", "Signer"
];

function parseTypeArgument(input: string): SuiMoveNormalizedType {
    input = input.trim();

    // Handle vector type
    const isVector = input.startsWith("vector<") && input.endsWith(">");
    if (isVector) {
        const innerType = input.slice(7, -1).trim();
        return { Vector: parseTypeArgument(innerType) };
    }

    // Handle primitive types
    const capitalizedInput = input.charAt(0).toUpperCase() + input.slice(1).toLowerCase();
    if (validPrimitiveTypes.includes(capitalizedInput)) {
        return capitalizedInput as SuiMoveNormalizedType;
    }

    // Handle struct types
    const structMatch = input.match(/^(0x[a-fA-F0-9]+)::([a-zA-Z0-9_]+)::([a-zA-Z0-9_]+)(<(.+)>)?$/);
    if (structMatch) {
        const [, address, module, name, , typeArgsStr] = structMatch;
        const typeArguments = typeArgsStr ? parseTypeArguments(typeArgsStr) : [];
        return {
            Struct: {
                address,
                module,
                name,
                typeArguments,
            }
        };
    }

    const errMsg = `Unsupported type: ${input}`;
    console.warn(errMsg);
    throw new Error(errMsg);
}

function parseTypeArguments(input: string): SuiMoveNormalizedType[] {
    const typeArguments: SuiMoveNormalizedType[] = [];
    let depth = 0;
    let currentArg = "";

    for (const char of input) {
        if (char === "<") depth++;
        if (char === ">") depth--;
        if (char === "," && depth === 0) {
            typeArguments.push(parseTypeArgument(currentArg.trim()));
            currentArg = "";
        } else {
            currentArg += char;
        }
    }

    if (currentArg.trim()) {
        typeArguments.push(parseTypeArgument(currentArg.trim()));
    }

    return typeArguments;
}
