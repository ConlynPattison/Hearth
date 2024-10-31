"use client"
import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

const SocketContext = createContext<Socket | null>(null);
export const useSocket = () => useContext(SocketContext);
const socketURL = process.env.NEXT_PUBLIC_SOCKET_URL;

export const SocketProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [socket, setSocket] = useState<Socket | null>(null);
	useEffect(() => {
		// Fetching token from Next.js cookies given by successful Auth0 authentication
		const getToken = async () => {
			const data = fetch("/api/auth/token")
				.then(async response => {
					const data = await response.json();
					return data;
				}).catch(error => console.error(error));
			return data;
		}

		// Init socket once token is received and provide auth for socket server authentication
		getToken().then(data => {
			const socketInstance = io(socketURL, {
				transports: ["websocket", "polling"],
				auth: {
					token: data.token
				}
			});
			setSocket(socketInstance);
		}).catch(error => console.error(error));
	}, []);

	if (!socketURL || !socket) {
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
