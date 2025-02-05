// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { SuiClient, SuiHTTPTransport } from "@mysten/sui/client";

export enum Network {
	DEVNET = "DEVNET",
}

export const NetworkConfigs: Record<Network, { url: string }> = {
	[Network.DEVNET]: { url: "http://pui.rpc.devnet.pragma.build:9000" },
};

const defaultClientMap = new Map<Network | string, SuiClient>();

// NOTE: This class should not be used directly in React components, prefer to use the useSuiClient() hook instead
export const createSuiClient = (network: Network | string) => {
	const existingClient = defaultClientMap.get(network);
	if (existingClient) {
   return existingClient;
 }

	const networkUrl = network in Network ? NetworkConfigs[network as Network].url : network;

	const client = new SuiClient({
		transport: new SuiHTTPTransport({ url: networkUrl }),
	});
	defaultClientMap.set(network, client);
	return client;
};
