"use client"
import { useUser } from "@auth0/nextjs-auth0/client";
import { Room } from "@prisma/client";
import { FormEvent, useRef } from "react";
import { FaPaperPlane } from "react-icons/fa6";
import { Socket } from "socket.io-client";

interface MessageInputProps {
	socket: Socket | null,
	isConnected: boolean,
	roomSendingTo: Room
}

const MessageInputForm = ({
	socket,
	isConnected,
	roomSendingTo
}: MessageInputProps) => {
	const { user, isLoading } = useUser();
	const messageBox = useRef<HTMLTextAreaElement>(null);

	if (!user || isLoading) {
		return (
			<>Loading...</>
		);
	}

	const userId = user?.sub;

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

		if (!userId || !messageBox.current?.value.trim()) return;

		socket?.emit("messageToRoom", roomSendingTo.roomName, messageBox.current.value, {
			userId,
			displayName: user.name,
			avatarUrl: user.picture
		});
		messageBox.current.value = "";
	}

	return (
		<form className="flex p-1 mt-2 items-center"
			onSubmit={sendMessage}>
			<br />
			<textarea className="w-[100%] rounded p-2 mr-2 dark:bg-slate-600 bg-slate-200"
				ref={messageBox}
				onKeyDown={handleKeyDown}
				disabled={!isConnected}
				placeholder={isConnected ? "Type a message..." : "Connecting to room..."}
			></textarea>
			<br />
			<FaPaperPlane
				className="hover:brightness-90 hover:cursor-pointer dark:text-slate-600 text-slate-400"
				size="2em"
				onClick={(e) => sendMessage(e)} />
		</form>
	);
}

export default MessageInputForm;
