"use client"
import { Room } from "@prisma/client";
import { FormEvent, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { Socket } from "socket.io-client";

interface MessageInputProps {
	socket: Socket | null,
	username: string,
	isConnected: boolean,
	roomSendingTo: Room
}

const MessageInputForm = ({
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
		<form className="flex p-1 mt-2 items-center"
			onSubmit={sendMessage}>
			<br />
			<textarea className="w-[100%] rounded p-2 mr-2 bg-slate-600"
				ref={messageBox}
				onKeyDown={handleKeyDown}
				disabled={!isConnected}
				placeholder={isConnected ? "Type a message..." : "Connecting to room..."}
			></textarea>
			<br />
			<FaPaperPlane
				className="hover:cursor-pointer text-slate-600"
				size="2em"
				onClick={(e) => sendMessage(e)} />
		</form>
	);
}

export default MessageInputForm;
