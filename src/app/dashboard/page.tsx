"use client"
import { useEffect } from "react";
import { io } from "socket.io-client";

import { useSearchParams } from "next/navigation";

export default function Dashboard() {
	const searchParams = useSearchParams();

	useEffect(() => {
		const socket = io("http://localhost:4000", {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});

		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", searchParams.get("username"));

			socket.on("message", (msg) => {
				console.log(`Message from server room: ${msg}`)
			});

			socket.emit("messageToRoom", "room1", "hello world")

		});


		return () => {
			socket.disconnect();
		}

	}, []);

	return (
		<>
			{searchParams.get("username")}

		</>
	);
}