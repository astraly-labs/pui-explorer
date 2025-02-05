// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useContext } from "react";

import { NetworkContext } from "../../context";
import { Network } from "../../utils/api/DefaultRpcClient";
import { NetworkSelect, type NetworkOption } from "~/ui/header/NetworkSelect";

export default function WrappedNetworkSelect() {
	const [network, setNetwork] = useContext(NetworkContext);

	const networks = [
		{ id: Network.DEVNET, label: "Devnet" },
	].filter(Boolean) as NetworkOption[];

	return (
		<NetworkSelect
			value={network}
			onChange={(networkId) => {
				setNetwork(networkId);
			}}
			networks={networks}
		/>
	);
}
