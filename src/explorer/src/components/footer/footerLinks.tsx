// Copyright (c) Mysten Labs, Inc.
// SPDX-License-Identifier: Apache-2.0

import { type ReactNode } from "react";

type FooterItem = {
	category: string;
	items: { title: string; children: ReactNode; href: string }[];
};
export type FooterItems = FooterItem[];

// function FooterIcon({ children }: { children: ReactNode }) {
// 	return <div className="flex items-center text-steel-darker">{children}</div>;
// }

export const footerLinks = [
	{
		title: "About",
		href: "https://www.pragma.build/",
	},
	{
		title: "GitHub",
		href: "https://github.com/astraly-labs/",
	},
	{
		title: "Twitter",
		href: "https://x.com/PragmaOracle",
	},
	{
		title: "Discord",
		href: "https://discord.gg/M9aRZtZHU7",
	},
];

/*
export const socialLinks = [
	{
		children: (
			<FooterIcon>
				<SocialDiscord24 />
			</FooterIcon>
		),
		href: 'https://discord.gg/DsxqP88EQp',
	},
	{
		children: (
			<FooterIcon>
				<SocialTwitter24 />
			</FooterIcon>
		),
		href: 'https://twitter.com/polymedia_app',
	},
];
*/
