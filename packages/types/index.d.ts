export type MessageType = "joinLeave" | "image" | "video" | "text" | "link";

export type Message = {
	type: MessageType,
	userId: string,
	content: string,
	room: string,
	time?: string // created once the socket server emits to other clients
};

export type MessageForView = Message & {
	displayName: string,
	avatarUrl: string
};
