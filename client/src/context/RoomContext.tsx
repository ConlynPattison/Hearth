"use client"
import { Room, RoomScope } from "@prisma/client";
import { createContext, Dispatch, ReactNode, SetStateAction, useContext, useEffect, useState } from "react";
import RealmContext from "./RealmContext";

const RoomContext = createContext<[
	Room | null,
	Dispatch<SetStateAction<Room | null>> | undefined]>([null, undefined]);

export const RoomProvider = ({ children }: Readonly<{ children: ReactNode }>) => {
	const [activeRoom, setActiveRoom] = useState<Room | null>(null);
	const [activeRealm] = useContext(RealmContext);

	useEffect(() => {
		if (activeRoom !== null && activeRealm !== null) {
			document.title = `Hearth | ${activeRoom.roomName} | ${activeRealm?.realmName}`;
			return;
		}
		if (activeRoom !== null) {
			document.title = `Hearth | ${activeRoom.roomScope === RoomScope.DIRECT_MESSAGE ? "Direct Message" : "Group Chat"}`
		}
	}, [activeRoom, activeRealm])

	return (
		<RoomContext.Provider value={[activeRoom, setActiveRoom]}>
			{children}
		</RoomContext.Provider>
	);
}
export default RoomContext;
