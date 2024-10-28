"use client"
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Message } from "@chat-app/types";
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
    const [username, setUsername] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);
    const scrollBox = useRef<HTMLDivElement>(null)

    const { user, isLoading } = useUser();
    const socket = useSocket();

    useEffect(() => {
        if (!scrollBox.current) return;
        scrollBox.current.scrollTop = scrollBox.current.scrollHeight
    }, [messages]);

    useEffect(() => {
        if (user)
            setUsername(user.name || "Unknown User");
    }, [user]);

    useEffect(() => {
        if (!socket || !username || isLoading || !room) return;

        const fetchRoomMessages = async () => {
            const response = await fetch(`/api/messages/${room.name}`);
            const messages: Message[] = await response.json().catch(() => []);
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

            socket.on("message", (msg, sender) => {
                setMessages((messagesCurr) => {
                    return [...messagesCurr, {
                        type: "text", // TODO: this will change
                        content: msg,
                        user: sender,
                        room: room.name
                    }];
                });
            });

            socket.on("gateway", (msg, user) => {
                setMessages((messagesCurr) => {
                    return [...messagesCurr, {
                        type: "joinLeave", // TODO: this will change
                        content: msg,
                        user: user,
                        room: room.name
                    }];
                });
            });

            socket.connect();
            socket.emit("joinRoom", room.name, username);
            setIsConnected(socket.connected);

            const fetchedMessages = await fetchRoomMessages();
            setMessages((messagesInit) => [...fetchedMessages, ...messagesInit]);
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

    }, [username, socket, isLoading, room]);


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
                <SentMessages messages={messages} username={username} />
            </div>
            <div className="mt-auto">
                <MessageInputForm socket={socket} roomSendingTo={room} username={username} isConnected={isConnected} />
            </div>
        </div>
        // </div>
    );
}

export default ChatRoomContainer;
