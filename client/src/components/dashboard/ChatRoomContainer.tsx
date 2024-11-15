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
	const scrollBox = useRef<HTMLDivElement>(null);
	const [scrolledToTop, setScrolledToTop] = useState(true);

	const { user } = useUser();
	const socket = useSocket();

	useEffect(() => {
		if (!scrollBox.current) return;
		scrollBox.current.scrollTop = scrollBox.current.scrollHeight;
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
						room: room.roomName ?? "", // TODO: change when server handles ID
						displayName,
						avatarUrl,
						time: Date.now()
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
						room: room.roomName ?? "", // TODO: change when server handles ID
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
		<div className="flex flex-col h-dvh relative dark:bg-slate-750">
			{/* Heading */}
			<div className="flex-shrink-0 h-[60px] border-b-2 dark:border-slate-800 border-slate-200 overflow-hidden">
				{/* Connection status */}
				<div className="flex px-1">
					{isConnected
						? <><div className="pt-1 mr-1"><FaCheckCircle color="green" /></div><p>Connected</p></>
						: <><div className="pt-1 mr-1"><FaMinusCircle color="red" /></div><p>Disconnected</p></>}
				</div>
				<h1 className="px-1 text-2xl font-bold mt-1">Messages: </h1>
			</div>

			{scrolledToTop || <div className="absolute top-[60px] left-0 right-0 h-20 bg-gradient-to-b from-background dark:from-slate-800 from-0% to-transparent to-100% pointer-events-none z-10"></div>}
			<div className="flex-grow overflow-auto"
				onScroll={(e) => {
					const atTop = e.currentTarget.scrollTop === 0;
					if (atTop !== scrolledToTop) setScrolledToTop(atTop)
				}}
				ref={scrollBox}>
				<SentMessages messages={messages} />
			</div>
			<div className="mt-auto">
				<MessageInputForm socket={socket} roomSendingTo={room} isConnected={isConnected} />
			</div>
		</div>
	);
}

export default ChatRoomContainer;
