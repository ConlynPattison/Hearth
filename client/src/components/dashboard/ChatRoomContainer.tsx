"use client"
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { MessageForView } from "@chat-app/types";
import { useState, useEffect, useRef } from "react";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { Socket } from "socket.io-client";
import MessageInputForm from "./MessageInputForm";
import SentMessages from "./SentMessages";
import { Room } from "@prisma/client";

interface ChatRoomContainerProps {
	room: Room, // TODO: currently a name, will be an ID,
}

const ChatRoomContainer = ({
	room,
}: ChatRoomContainerProps) => {
	const [messages, setMessages] = useState<MessageForView[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const scrollBox = useRef<HTMLDivElement>(null)

	const { user } = useUser();
	const socket = useSocket();

	useEffect(() => {
		if (!scrollBox.current) return;
		scrollBox.current.scrollTop = scrollBox.current.scrollHeight
	}, [messages]);

	useEffect(() => {
		if (!socket || !user || !room) return;

		const fetchRoomMessages = async () => {
			const response = await fetch(`/api/messages/${room.roomName}`);
			const messages: MessageForView[] = await response.json().catch(() => []);
			return messages;
		}

		const connectSocket = async (socket: Socket) => {
			const events = [
				"joinRoom",
				"connect",
				"message",
				"gateway"
			];
			events.forEach((event) => socket.removeAllListeners(event));

			socket.on("connect", async () => {
				setIsConnected(socket.connected)
			});

			socket.on("message", (msg, userData) => {
				const { userId, displayName, avatarUrl } = userData;
				setMessages((messagesCurr) => {
					return [...messagesCurr, {
						type: "text",
						content: msg,
						userId,
						room: room.roomName,
						displayName,
						avatarUrl,
						time: new Date().toUTCString()
					}];
				});
			});

			socket.on("gateway", (msg, userData) => {
				const { userId, displayName, avatarUrl } = userData;
				setMessages((messagesCurr) => {
					return [...messagesCurr, {
						type: "joinLeave",
						content: msg,
						userId,
						room: room.roomName,
						displayName,
						avatarUrl,
					}];
				});
			});

			socket.connect();
			setIsConnected(socket.connected);
			socket.emit("joinRoom", room.roomName, {
				userId: user.sub,
				displayName: user.name,
				avatarUrl: user.picture
			});

			fetchRoomMessages()
				.then(fetchedMessages => {
					setMessages((messagesInit) => [...fetchedMessages, ...messagesInit]);
				});
		}

		if (socket.disconnected || !socket.hasListeners("connect")) {
			connectSocket(socket);
		} else {
			setIsConnected(socket.connected);
		}

		const dismountSocket = () => {
			socket.offAny();
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

	}, [user, socket, room]);


	return (
		// <div className="px-1">
		<div className="flex flex-col h-dvh p-2">
			{/* Connection status */}
			<div className="flex">
				{isConnected
					? <><div className="pt-1 mr-1"><FaCheckCircle color="green" /></div><p>Connected</p></>
					: <><div className="pt-1 mr-1"><FaMinusCircle color="red" /></div><p>Disconnected</p></>}
			</div>
			{/* Sent messages */}
			<h1 className="text-2xl font-bold mt-2">Messages: </h1>
			<div className="flex-grow overflow-auto"
				ref={scrollBox}>
				<SentMessages messages={messages} />
			</div>
			<div className="mt-auto">
				<MessageInputForm socket={socket} roomSendingTo={room} isConnected={isConnected} />
			</div>
		</div>
		// </div>
	);
}

export default ChatRoomContainer;
