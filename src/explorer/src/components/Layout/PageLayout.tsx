// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { useElementDimensions } from "@mysten/core";
import { LoadingIndicator } from "@mysten/ui";
import clsx from "clsx";
import { type ReactNode, useRef } from "react";

import Footer from "../footer/Footer";
import Header from "../header/Header";
import { useNetworkContext } from "~/context";
import { Banner } from "~/ui/Banner";
import { Network } from "~/utils/api/DefaultRpcClient";

export type PageLayoutProps = {
	gradient?: {
		content: ReactNode;
		size: "lg" | "md";
	};
	isError?: boolean;
	content: ReactNode;
	loading?: boolean;
};

const DEFAULT_HEADER_HEIGHT = 68;

export function PageLayout({ gradient, content, loading, isError }: PageLayoutProps) {
	const [network] = useNetworkContext();
	const isGradientVisible = !!gradient;
	const renderNetworkDegradeBanner = false;
	const headerRef = useRef<HTMLElement | null>(null);
	const [headerHeight] = useElementDimensions(headerRef, DEFAULT_HEADER_HEIGHT);

	const networkDegradeBannerCopy =
		network === String(Network.DEVNET)
			? "Sui Explorer (Testnet) is currently under-going maintenance. Some data may be incorrect or missing."
			: "The explorer is running slower than usual. We're working to fix the issue and appreciate your patience.";

	return (
		<div className="relative min-h-screen w-full">
			<section ref={headerRef} className="fixed top-0 z-20 flex w-full flex-col">
				{renderNetworkDegradeBanner && (
					<Banner rounded="none" align="center" variant="warning" fullWidth>
						<div className="break-normal">{networkDegradeBannerCopy}</div>
					</Banner>
				)}
				{<Header />}
			</section>
			{loading && (
				<div className="absolute left-1/2 right-0 top-1/2 flex -translate-x-1/2 -translate-y-1/2 transform justify-center">
					<LoadingIndicator variant="lg" />
				</div>
			)}
			<main
				className="relative z-10 bg-offwhite"
				style={
					!isGradientVisible
						? {
								paddingTop: `${headerHeight}px`,
						  }
						: {}
				}
			>
				{isGradientVisible ? (
					<section
						style={{
							paddingTop: `${headerHeight}px`,
						}}
						className={clsx(
							"group/gradientContent",
							loading && "bg-gradients-graph-cards",
							isError && "bg-gradients-failure",
							!isError && "bg-gradients-graph-cards",
						)}
					>
						<div
							className={clsx(
								"mx-auto max-w-[1440px] py-8 lg:px-6 xl:px-10",
								gradient.size === "lg" && "px-4 xl:py-12",
								gradient.size === "md" && "px-4",
							)}
						>
							{gradient.content}
						</div>
					</section>
				) : null}
				{!loading && (
					<section className="mx-auto max-w-[1440px] px-5 pb-20 pt-10 sm:py-8 md:p-10 md:pb-25">
						{content}
					</section>
				)}
			</main>
			<Footer />
		</div>
	);
}
