import { SocketProvider } from "../../context/SocketContext";

export default function DashboardLayout({
	children,
}: Readonly<{
	children: React.ReactNode;
}>) {
	return (
		<SocketProvider>
			{children}
		</SocketProvider>
	);
}
