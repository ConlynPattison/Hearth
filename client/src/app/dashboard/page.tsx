"use client"
import { useEffect, useState } from "react";
import { useSocket } from "../context/SocketContext";

type Message = {
	senderUsername: string,
	content: string
}

export default function Dashboard() {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [messageBoxContent, setMessageBoxContent] = useState("");

	const socket = useSocket()!;

	useEffect(() => {
		setUsername(localStorage.getItem("username") || "");
	}, [])

	useEffect(() => {
		if (!socket || !username) return;

		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", username);
		});

		socket.on("message", (msg, sender) => {
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					content: msg,
					senderUsername: sender
				}];
			});
		});
		return () => {
			socket.off("message");
			socket.disconnect();
		};

	}, [username, socket]);

	const sendMessage = () => {
		if (!username || !messageBoxContent.trim()) return;

		socket?.emit("messageToRoom", "room1", messageBoxContent, username);
		setMessageBoxContent("");
	}

	return (
		<>
			{username}
			<label>Message: <textarea value={messageBoxContent} onChange={(e) => setMessageBoxContent(e.target.value)}></textarea></label>
			<button type="button" onClick={sendMessage}>Send</button>
			<h1>Messages: </h1>
			{messages.map((message, index) => {
				return (
					<div key={index}>
						<p>{message.senderUsername}: </p>
						<p>{message.content}</p>
					</div>
				)
			})}
		</>
	);
}