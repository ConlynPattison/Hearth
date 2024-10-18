export type MessageType = "joinLeave" | "image" | "video" | "text" | "link";

export type Message = {
	type: MessageType,
	user: string,
	content: string,
	room: string,
	time?: string // created once the socket server emits to other clients
};