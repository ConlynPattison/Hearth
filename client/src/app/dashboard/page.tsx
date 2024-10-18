"use client"
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "../context/SocketContext";
import { useRouter } from "next/navigation";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";

type Message = {
	isJoinLeave: boolean,
	senderUsername: string,
	content: string
}

export default function Dashboard() {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const messageBox = useRef<HTMLTextAreaElement>(null);

	const router = useRouter();
	const socket = useSocket();

	useEffect(() => {
		setUsername(localStorage.getItem("username") || "");
	}, []);

	useEffect(() => {
		if (!socket || !username) return;

		socket.on("connect", () => {
			socket.emit("joinRoom", "room1", username);
			setIsConnected(socket.connected)
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

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			socket.off("message");
			socket.off("gateway");
			socket.disconnect();
		}

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			socket.off("message");
			socket.off("gateway");
			socket.disconnect();
			window.removeEventListener("beforeunload", handleBeforeUnload);
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

	const handleLeave = () => {
		router.back();
	}

	return (
		<>
			<h1 className="text-4xl font-bold text-emerald-400 text-center">{username}</h1>
			{/* Messaage-sending form */}
			<form onSubmit={sendMessage}>
				<label><br /><textarea className="bg-zinc-500 rounded border-2 border-zinc-400 p-1"
					ref={messageBox}
					onKeyDown={handleKeyDown}
					disabled={!isConnected}
					placeholder={isConnected ? "Message the room" : "Connecting to room..."}
				></textarea></label>
				<br />
				<button
					className="bg-emerald-700 rounded p-1 mb-1"
					type="submit"
				>Send</button>
			</form>
			<button
				className="bg-red-900 rounded p-1"
				type="button"
				onClick={handleLeave}
				disabled={!isConnected}
			>Leave</button>
			{/* Connection status */}
			<div className="flex">
				{isConnected
					? <><div className="pt-1 mr-1"><FaCheckCircle color="green" /></div><p>Connected</p></>
					: <><div className="pt-1 mr-1"><FaMinusCircle color="red" /></div><p>Disconnected</p></>}
			</div>
			{/* Sent messages */}
			<h1 className="text-2xl font-bold mt-2">Messages: </h1>
			{messages.map((message, index) => {
				return (
					<div key={index}>
						{
							message.isJoinLeave
								? <p>{message.content}</p>
								:
								<>
									<p className="underline">{message.senderUsername}:</p>
									<p className="whitespace-pre bg-zinc-500 w-[50%] text-wrap">{message.content}</p>
								</>
						}

					</div >
				);
			})}
		</>
	);
}
