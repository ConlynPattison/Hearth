import type { Metadata } from "next";
import { UserProvider } from "@auth0/nextjs-auth0/client";
import localFont from "next/font/local";
import "./globals.css";

const geistSans = localFont({
	src: "./fonts/GeistVF.woff",
	variable: "--font-geist-sans",
	weight: "100 900",
});
const geistMono = localFont({
	src: "./fonts/GeistMonoVF.woff",
	variable: "--font-geist-mono",
	weight: "100 900",
});

export const metadata: Metadata = {
	title: "Hearth",
	description: "Community and communication application"
};

export default function RootLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<html lang="en">
			<head>
				<meta name="viewport" content="width=device-width, initial-scale=1.0" />
			</head>
			<UserProvider>
				<body className={`${geistSans.variable} ${geistMono.variable} antialiased`}>
					{children}
					<div id="modal-root"></div>
				</body>
			</UserProvider>
		</html>
	);
}
