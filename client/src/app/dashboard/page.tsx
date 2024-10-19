"use client"
import { FormEvent, useEffect, useRef, useState } from "react";
import { useSocket } from "../../context/SocketContext";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { Message } from "@chat-app/types";
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import { Socket } from "socket.io-client";

const Dashboard = () => {
	const [username, setUsername] = useState("");
	const [messages, setMessages] = useState<Message[]>([]);
	const [isConnected, setIsConnected] = useState(false);

	const messageBox = useRef<HTMLTextAreaElement>(null);
	const scrollBox = useRef<HTMLDivElement>(null)

	const { user, isLoading, error } = useUser();
	const socket = useSocket();

	useEffect(() => {
		if (user)
			setUsername(user.name || "Unknown User");
	}, [user]);

	useEffect(() => {
		if (!scrollBox.current) return;
		scrollBox.current.scrollTop = scrollBox.current.scrollHeight
	}, [messages]);

	useEffect(() => {
		if (!socket || !username || isLoading) return;

		const fetchRoomMessages = async () => {
			const room = "room1";
			const response = await fetch(`/api/messages/${room}`);

			const messages: Message[] = await response.json();
			return messages;
		}

		const handleConnect = async (socket: Socket) => {
			socket.emit("joinRoom", "room1", username);
			setIsConnected(socket.connected);
			const fetchedMessages = await fetchRoomMessages();
			setMessages((messagesInit) => [...fetchedMessages, ...messagesInit]);
		}

		if (socket.connected) {
			handleConnect(socket);
		}

		socket.on("connect", async () => {
			await handleConnect(socket);
		});

		socket.on("message", (msg, sender) => {
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					type: "text", // TODO: this will change
					content: msg,
					user: sender,
					room: "room1" // TODO: this will change
				}];
			});
		});

		socket.on("gateway", (msg, user) => {
			setMessages((messagesCurr) => {
				return [...messagesCurr, {
					type: "joinLeave", // TODO: this will change
					content: msg,
					user: user,
					room: "room1" // TODO: this will change
				}];
			});
		});

		const dismountSocket = () => {
			socket.off("message");
			socket.off("gateway");
			socket.disconnect();
		}

		const handleBeforeUnload = (e: BeforeUnloadEvent) => {
			e.preventDefault();
			dismountSocket();
		}

		window.addEventListener("beforeunload", handleBeforeUnload);

		return () => {
			dismountSocket();
			window.removeEventListener("beforeunload", handleBeforeUnload);
		};

	}, [username, socket, isLoading]);

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
					disabled={!isConnected}
				>Send</button>
			</form>
			<a
				className="bg-red-900 rounded p-1"
				type="button"
				href="/api/auth/logout"
			>Logout</a>
			{/* Connection status */}
			<div className="flex">
				{isConnected
					? <><div className="pt-1 mr-1"><FaCheckCircle color="green" /></div><p>Connected</p></>
					: <><div className="pt-1 mr-1"><FaMinusCircle color="red" /></div><p>Disconnected</p></>}
			</div>
			{/* Sent messages */}
			<h1 className="text-2xl font-bold mt-2">Messages: </h1>
			<div className="h-[400px] w-[50%] overflow-y-auto"
				ref={scrollBox}>
				{messages.map((message, index) => {
					return (
						<div key={index}
							className="w-[100%]">
							{
								message.type === "joinLeave"
									? <p>{message.content}</p>
									:
									<>
										<p className={message.user === username ? "text-right" : ""}>{message.user}:</p>
										{
											message.user === username ?
												<div className="flex flex-row-reverse">
													<p className="whitespace-pre bg-zinc-500 w-fit max-w-[75%] flex-wrap text-wrap rounded-md px-1 rounded-tr-none mb-1 mr-1">{message.content}</p>
												</div>
												:
												<div>
													<p className="whitespace-pre bg-zinc-500 w-fit max-w-[75%] flex-wrap text-wrap rounded-md px-1 rounded-tl-none mb-1">{message.content}</p>
												</div>
										}
									</>
							}

						</div >
					);
				})}
			</div >
		</>
	);
}

export default withPageAuthRequired(
	Dashboard,
	{
		returnTo: "/dashboard"
	}
)
