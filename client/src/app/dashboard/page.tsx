"use client"
import { useEffect, useState } from "react";
import { io } from "socket.io-client";

type Message = {
	senderUsername: string,
	content: string
}

const socket = io("http://localhost:4000", {
	withCredentials: true,
	extraHeaders: {
		"my-custom-header": "abcd"
	}
});


export default function Dashboard() {
	const [username, setUsername] = useState(localStorage.getItem("username"));
	const [messages, setMessages] = useState<Message[]>([]);
	const [messageBoxContent, setMessageBoxContent] = useState("");

	useEffect(() => {
		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", username);
		});

		socket.on("message", (msg, sender) => {
			console.log("got message from server: " + msg)
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					content: msg,
					senderUsername: sender
				}];
			});
		});

		return () => { socket.disconnect() };
	}, [username]);

	const sendMessage = () => {
		if (!username || messageBoxContent.length === 0) {
			return;
		}
		console.log(messageBoxContent)
		socket.emit("messageToRoom", "room1", messageBoxContent, username);
		console.log(messages);
		setMessageBoxContent("");
	}

	return (
		<>
			{username}
			<label>Message: <textarea value={messageBoxContent} onChange={(e) => setMessageBoxContent(e.target.value)}></textarea></label>
			<button type="button" onClick={sendMessage}>Send</button>
			<h1>Messages: </h1>
			{messages.map((message) => {
				return (
					<div>
						<p>{message.senderUsername}: </p>
						<p>{message.content}</p>
					</div>
				)
			})}
		</>
	);
}