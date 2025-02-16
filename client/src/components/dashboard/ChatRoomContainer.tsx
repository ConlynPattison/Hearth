"use client"
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { MessageForView, MessageType } from "@chat-app/types";
import { useState, useEffect, useRef, useContext } from "react";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { Socket } from "socket.io-client";
import MessageInputForm from "./MessageInputForm";
import SentMessages from "./SentMessages";
import RoomContext from "@/context/RoomContext";
import { mutate } from "swr";
import { UserDetailedDirectRoomResponse } from "@/app/api/rooms/route";
import { RoomScope } from "@prisma/client";

const ChatRoomContainer = () => {
	const [messages, setMessages] = useState<MessageForView[]>([]);
	const [isConnected, setIsConnected] = useState(false);
	const scrollBox = useRef<HTMLDivElement>(null);
	const [scrolledToTop, setScrolledToTop] = useState(true);

	const [activeRoom] = useContext(RoomContext);
	const { user } = useUser();
	const socket = useSocket();

	const openedRoom = activeRoom;

	useEffect(() => {
		if (!scrollBox.current) return;
		scrollBox.current.scrollTop = scrollBox.current.scrollHeight;
	}, [messages]);

	useEffect(() => {
		setMessages([]);
	}, [activeRoom]);

	useEffect(() => {
		if (!socket || !user || !openedRoom) return;

		const fetchRoomMessages = async () => {
			const response = await fetch(`/api/messages/${openedRoom.roomId}`);
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
						room: openedRoom.roomId,
						displayName,
						avatarUrl,
						time: Date.now()
					}];
				});
				if (openedRoom.roomScope !== RoomScope.REALM) {
					mutate(
						"/api/rooms",
						(currentData: (UserDetailedDirectRoomResponse | undefined)) => {
							if (!currentData?.success || !currentData.rooms) return currentData;

							const name = userId === user.sub ? "Me" : displayName as string;

							const updatedRooms = currentData.rooms.map((room) => {
								if (room.roomId === openedRoom.roomId) {
									return {
										...room,
										lastSentMessage: {
											content: msg as string,
											displayName: name,
											type: "text" as MessageType,
										},
									};
								}
								return room;
							});

							return {
								...currentData,
								rooms: updatedRooms,
							};
						},
						false // Do no revalidate with server, immediately update UI
					);
				}
			});

			socket.on("gateway", (msg, userData) => {
				const { userId, displayName, avatarUrl } = userData;
				setMessages((messagesCurr) => {
					return [...messagesCurr, {
						type: "joinLeave",
						content: msg,
						userId,
						room: openedRoom.roomId,
						displayName,
						avatarUrl,
					}];
				});
			});

			socket.connect();
			setIsConnected(socket.connected);
			socket.emit("joinRoom", openedRoom.roomId, {
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

	}, [user, socket, openedRoom]);

	return (
		<> {openedRoom &&
			<div className="flex flex-col h-dvh relative dark:bg-slate-750">
				{/* Heading */}
				<div className="flex-shrink-0 h-[60px] border-b-2 dark:border-slate-800 border-slate-200 overflow-hidden">
					{/* Connection status */}
					<div className="flex px-1">
						{isConnected
							// todo: change the name of private chat to match the UserDetailedRoom in dms selectors
							? <><div className="pt-1 mr-1"><FaCheckCircle className="text-green-700" /></div><p>Connected to {activeRoom?.roomName || "private chat"}</p></>
							: <><div className="pt-1 mr-1"><FaMinusCircle className="text-red-700" /></div><p>Disconnected</p></>}
					</div>
					<h1 className="px-1 text-2xl font-bold mt-1">Messages: </h1>
				</div>

				{scrolledToTop || <div className="absolute top-[60px] left-0 right-0 h-20 bg-gradient-to-b from-background dark:from-slate-800 from-0% to-transparent to-100% pointer-events-none z-10"></div>}
				<div className="flex-grow overflow-auto flex"
					onScroll={(e) => {
						const atTop = e.currentTarget.scrollTop === 0;
						if (atTop !== scrolledToTop) setScrolledToTop(atTop)
					}}
					ref={scrollBox}>
					<SentMessages messages={messages} />
				</div>
				<div className="mt-auto">
					<MessageInputForm socket={socket} roomSendingTo={openedRoom} isConnected={isConnected} />
				</div>
			</div>}
		</>

	);
}

export default ChatRoomContainer;
