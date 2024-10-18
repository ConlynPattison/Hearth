"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);
const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const SocketProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const socketInstance = io(socketURL, {
			transports: ["websocket", "polling"]
		});
		setSocket(socketInstance);
	}, []);

	if (!socketURL || !socket) {
		return (
			<div>...connecting</div>
		);
	}

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
}
