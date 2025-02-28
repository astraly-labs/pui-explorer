// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

/**
 * This is an App UI Component, which is responsible for network selection.
 * It's as context un-aware as it reasonably can be, being a controlled component.
 * In the future, this should move outside of the base `~/ui/` directory, but for
 * now we are including App UI Components in the base UI component directory.
 */

import { autoUpdate, flip, FloatingPortal, offset, shift, useFloating } from "@floating-ui/react";
import { Popover } from "@headlessui/react";
import { useZodForm } from "@mysten/core";
import { HamburgerRest16 } from "@mysten/icons";
import { Text } from "@mysten/ui";
import clsx from "clsx";
import { AnimatePresence, motion } from "framer-motion";
import { useEffect, useState } from "react";
import { z } from "zod";

import { NavItem } from "./NavItem";
import { ReactComponent as CheckIcon } from "../icons/check_16x16.svg";
import { ReactComponent as MenuIcon } from "../icons/menu.svg";

import type { ComponentProps, ReactNode } from "react";

export type NetworkOption = {
	id: string;
	label: string;
};

export type NetworkSelectProps = {
	networks: NetworkOption[];
	value: string;
	version?: number | string;
	binaryVersion?: string;
	onChange(networkId: string): void;
};

enum NetworkState {
	UNSELECTED = "UNSELECTED",
	PENDING = "PENDING",
	SELECTED = "SELECTED",
}

type SelectableNetworkProps = {
	state: NetworkState;
	children: ReactNode;
	onClick(): void;
} & ComponentProps<"div">;

function SelectableNetwork({ state, children, onClick, ...props }: SelectableNetworkProps) {
	return (
		<div
			role="button"
			onClick={onClick}
			className={clsx(
				"flex items-start gap-3 rounded-md px-1.25 py-2 text-body font-semibold hover:bg-gray-40 ui-active:bg-gray-40",
				state !== NetworkState.UNSELECTED ? "text-steel-darker" : "text-steel-dark",
			)}
			{...props}
		>
			<CheckIcon
				className={clsx("flex-shrink-0", {
					"text-success": state === NetworkState.SELECTED,
					"text-steel": state === NetworkState.PENDING,
					"text-gray-45": state === NetworkState.UNSELECTED,
				})}
			/>
			<div className="mt-px">
				<Text
					variant="body/semibold"
					color={state === NetworkState.SELECTED ? "steel-darker" : "steel-dark"}
				>
					{children}
				</Text>
			</div>
		</div>
	);
}

function NetworkVersion({
	label,
	version,
	binaryVersion,
}: {
	label: string;
	version: number | string;
	binaryVersion: string;
}) {
	return (
		<div className="flex flex-col justify-between gap-1 px-4 py-3">
			<Text variant="subtitleSmall/medium" color="steel-dark">
				Sui {label}
			</Text>
			<Text variant="subtitleSmall/medium" color="steel-dark">
				v{binaryVersion} (Protocol {version})
			</Text>
		</div>
	);
}

function NetworkSelectPanel({ networks, onChange, value }: Omit<NetworkSelectProps, "version">) {
	const isCustomNetwork = !networks.find(({ id }) => id === value);
	const [customOpen, setCustomOpen] = useState(isCustomNetwork);

	useEffect(() => {
		setCustomOpen(isCustomNetwork);
	}, [isCustomNetwork]);

	return (
		<>
			{networks.map((network) => (
				<SelectableNetwork
					key={network.id}
					state={
						!customOpen && value === network.id ? NetworkState.SELECTED : NetworkState.UNSELECTED
					}
					onClick={() => {
						onChange(network.id);
					}}
				>
					{network.label}
				</SelectableNetwork>
			))}
		</>
	);
}

function ResponsiveIcon() {
	return (
		<div>
			<HamburgerRest16 className="hidden md:block" />
			<MenuIcon className="block md:hidden" />
		</div>
	);
}

export function NetworkSelect({
	networks,
	value,
	version,
	binaryVersion,
	onChange,
}: NetworkSelectProps) {
	const { x, y, refs, strategy } = useFloating({
		placement: "bottom-end",
		middleware: [offset(5), flip(), shift()],
		whileElementsMounted: autoUpdate,
	});

	const selected = networks.find(({ id }) => id === value);

	return (
		<Popover>
			{({ open, close }) => (
				<>
					<Popover.Button ref={refs.setReference} as={NavItem} afterIcon={<ResponsiveIcon />}>
						<div className="hidden md:block">
							<Text variant="body/semibold" color="hero-darkest">
								{selected?.label || "Custom"}
							</Text>
						</div>
					</Popover.Button>
					<FloatingPortal>
						<AnimatePresence>
							{open && (
								<Popover.Panel
									static
									ref={refs.setFloating}
									as={motion.div}
									initial={{
										opacity: 0,
										scale: 0.95,
									}}
									animate={{
										opacity: 1,
										scale: 1,
									}}
									exit={{
										opacity: 0,
										scale: 0.95,
									}}
									transition={{ duration: 0.15 }}
									className="z-20 flex w-52 flex-col gap-2 rounded-lg bg-white/80 px-3 py-4 shadow-lg backdrop-blur focus:outline-none"
									style={{
										position: strategy,
										top: y ?? 0,
										left: x ?? 0,
									}}
								>
									<NetworkSelectPanel
										networks={networks}
										value={value}
										onChange={(network) => {
											onChange(network);
											close();
										}}
									/>
									{!!value && version && binaryVersion ? (
										<div className="-mx-3 -mb-4 mt-2 rounded-b-lg bg-hero-darkest/5">
											<NetworkVersion
												label={selected?.label ?? "Custom RPC"}
												binaryVersion={binaryVersion}
												version={version}
											/>
										</div>
									) : null}
								</Popover.Panel>
							)}
						</AnimatePresence>
					</FloatingPortal>
				</>
			)}
		</Popover>
	);
}
