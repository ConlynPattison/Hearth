"use client"
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useRouter } from "next/navigation";

type Message = {
	isJoinLeave: boolean,
	senderUsername: string,
	content: string
}

export default function Dashboard() {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const messageBox = useRef<HTMLTextAreaElement>(null);

	const socket = useSocket()!;

	useEffect(() => {
		setUsername(localStorage.getItem("username") || "");
	}, []);

	useEffect(() => {
		if (!socket || !username) return;

		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", username);
		});

		socket.on("message", (msg, sender) => {
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					isJoinLeave: false,
					content: msg,
					senderUsername: sender
				}];
			});
		});

		socket.on("gateway", (msg, user) => {
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					isJoinLeave: true,
					content: msg,
					senderUsername: user
				}];
			});
		});

		window.addEventListener("beforeunload", (e) => {
			e.preventDefault();
			socket.emit("leaveRoom", "room1", username);
			socket.off("message");
			socket.off("gateway");
			socket.disconnect();
		})

		return () => {
			socket.emit("leaveRoom", "room1", username);
			socket.off("message");
			socket.off("gateway");
			socket.disconnect();
		};

	}, [username, socket]);

	const sendMessage = (e: FormEvent) => {
		e.preventDefault();

		if (!username || !messageBox.current?.value.trim()) return;

		socket?.emit("messageToRoom", "room1", messageBox.current.value, username);
		messageBox.current.value = "";
	}

	const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
		if (e.key === "Enter" && !e.shiftKey) {
			// Prevent new line
			e.preventDefault();

			// Submit form
			sendMessage(e as React.FormEvent);
		}
	};

	return (
		<>
			<h1 className="text-4xl font-bold text-emerald-400 text-center">{username}</h1>
			<form onSubmit={sendMessage}>
				<label>Message: <br /><textarea className="bg-zinc-700 rounded border-2 border-zinc-400"
					ref={messageBox}
					onKeyDown={handleKeyDown}
				></textarea></label>
				<br />
				<button
					className="bg-emerald-700 rounded p-1 -translate-y-2.5 mt-2"
					type="submit"
				>Send</button>
			</form>
			<button
				className="bg-red-900 rounded p-1 -translate-y-2.5 mt-2"
				type="button"
				onClick={() => console.log("leaving")}
			>Leave</button>
			<h1>Messages: </h1>
			{messages.map((message, index) => {
				return (
					<div key={index}>
						{
							message.isJoinLeave
								? <p>{message.content}</p>
								:
								<>
									<p className="underline">{message.senderUsername}:</p>
									<p className="whitespace-pre bg-zinc-700 w-[50%] text-wrap">{message.content}</p>
								</>
						}

					</div >
				);
			})}
		</>
	);
}
