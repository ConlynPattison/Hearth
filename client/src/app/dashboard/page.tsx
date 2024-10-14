"use client"
import { useEffect, useState } from "react";
import { io } from "socket.io-client";
import useLocalStorage from "@/hooks/useLocalStorage";

type Message = {
	username: string,
	
}

export default function Dashboard() {
	const [username, setUsername] = useState(localStorage.getItem("username"));

	useEffect(() => {
		const socket = io("http://localhost:4000", {
			withCredentials: true,
			extraHeaders: {
				"my-custom-header": "abcd"
			}
		});

		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", username);

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
			{username}
			<h1>Messages: </h1>
		</>
	);
}