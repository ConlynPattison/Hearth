"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);

export const useSocket = () => useContext(SocketContext);

export const SocketProvider = ({ children }: { children: ReactNode }) => {
	const [socket, setSocket] = useState<Socket | null>(null);

	useEffect(() => {
		const socketInstance = io("http://localhost:4000");
		setSocket(socketInstance);

		return () => { socketInstance.disconnect(); }
	}, []);

	if (!socket) {
		return (
			<div>...loading</div>
		);
	}

	return (
		<SocketContext.Provider value={socket}>
			{children}
		</SocketContext.Provider>
	);
}
