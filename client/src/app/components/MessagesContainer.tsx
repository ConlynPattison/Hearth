"use client"
import { useSocket } from "@/context/SocketContext";
import { useUser } from "@auth0/nextjs-auth0/client";
import { Message } from "@chat-app/types";
import { useState, useEffect } from "react";
import { FaCheckCircle, FaMinusCircle } from "react-icons/fa";
import { Socket } from "socket.io-client";
import MessageInput from "./dashboard/MessageInput";
import SentMessages from "./dashboard/SentMessages";

interface ChatRoomContainerProps {
    room: string, // TODO: currently a name, will be an ID,
}

const ChatRoomContainer = ({
    room,
}: ChatRoomContainerProps) => {
    const [username, setUsername] = useState("");
    const [messages, setMessages] = useState<Message[]>([]);
    const [isConnected, setIsConnected] = useState(false);

    const { user, isLoading } = useUser();
    const socket = useSocket();

    useEffect(() => {
        if (user)
            setUsername(user.name || "Unknown User");
    }, [user]);

    useEffect(() => {
        if (!socket || !username || isLoading) return;

        const fetchRoomMessages = async () => {
            const response = await fetch(`/api/messages/${room}`);

            const messages: Message[] = await response.json();
            return messages;
        }

        const handleConnect = async (socket: Socket) => {
            socket.emit("joinRoom", room, username);
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
                    room
                }];
            });
        });

        socket.on("gateway", (msg, user) => {
            setMessages((messagesCurr) => {
                return [...messagesCurr, {
                    type: "joinLeave", // TODO: this will change
                    content: msg,
                    user: user,
                    room
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

    }, [username, socket, isLoading, room]);


    return (
        <>
            <h1 className="text-4xl font-bold text-emerald-400 text-center">{username}</h1>
            {/* Connection status */}
            <div className="flex">
                {isConnected
                    ? <><div className="pt-1 mr-1"><FaCheckCircle color="green" /></div><p>Connected</p></>
                    : <><div className="pt-1 mr-1"><FaMinusCircle color="red" /></div><p>Disconnected</p></>}
            </div>
            {/* Sent messages */}
            <h1 className="text-2xl font-bold mt-2">Messages: </h1>
            <SentMessages messages={messages} username={username} />
            <MessageInput socket={socket} username={username} isConnected={isConnected} />
            <a
                className="bg-red-900 rounded p-1"
                type="button"
                href="/api/auth/logout"
            >Logout</a>
        </>
    );
}

export default ChatRoomContainer;