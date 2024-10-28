"use client"
import { Room } from "@prisma/client";
import { FormEvent, useRef } from "react";
import { Socket } from "socket.io-client";

interface MessageInputProps {
    socket: Socket | null,
    username: string,
    isConnected: boolean,
    roomSendingTo: Room
}

const MessageInput = ({
    socket,
    username,
    isConnected,
    roomSendingTo
}: MessageInputProps) => {
    const messageBox = useRef<HTMLTextAreaElement>(null);

    const handleKeyDown = (e: React.KeyboardEvent<HTMLTextAreaElement>) => {
        if (e.key === "Enter" && !e.shiftKey) {
            // Prevent new line
            e.preventDefault();

            // Submit form
            sendMessage(e as React.FormEvent);
        }
    };

    const sendMessage = (e: FormEvent) => {
        e.preventDefault();

        if (!username || !messageBox.current?.value.trim()) return;

        socket?.emit("messageToRoom", roomSendingTo.name, messageBox.current.value, username);
        messageBox.current.value = "";
    }

    return (
        <form onSubmit={sendMessage}>
            <br />
            <label><textarea className="w-[100%] rounded border-2 border-zinc-400 p-1"
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
    );
}

export default MessageInput;
