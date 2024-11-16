import { Room, RoomScope, RoomType } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";
import PatchRealm from "../features/realms/PatchRealm/PatchRealm";
import Domains from "../features/domains/Domains";

const rooms: Room[] = [
	{
		roomId: 829427992384792,
		roomName: "room1",
		isPrivate: false,
		realmId: 100,
		domainId: null,
		roomDescription: "test room",
		roomScope: RoomScope.REALM,
		roomType: RoomType.TEXT,
		isAgeRestricted: false,
		roomIconUrl: ""
	},
	{
		roomId: 432984973215,
		roomName: "Bwazil Room",
		isPrivate: false,
		realmId: 100,
		domainId: null,
		roomDescription: "test room",
		roomScope: RoomScope.REALM,
		roomType: RoomType.TEXT,
		isAgeRestricted: false,
		roomIconUrl: ""
	},
]

interface InboxProps {
	room: Room,
	setRoom: Dispatch<SetStateAction<Room>>,
	isSelectedRoom: boolean
}

const Inbox = ({ room, setRoom, isSelectedRoom }: InboxProps) => {

	const bg = isSelectedRoom ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:brightness-90 dark:bg-slate-900 bg-slate-200";
	return (
		<button className={`${bg} py-2 text-center rounded-md mt-2 mx-2`}
			onClick={() => setRoom(room)}
			type="button"
		>
			{room.roomName}
		</button>
	)
}

interface InboxesContainerProps {
	setRoom: Dispatch<SetStateAction<Room>>,
	selectedRoom: Room
}

const InboxesContainer = ({
	setRoom,
	selectedRoom
}: InboxesContainerProps) => {

	return (
		<div className="flex flex-col h-[100%] sm:w-[240px]">
			<PatchRealm />
			{rooms.map((room) =>
				<Inbox
					key={room.roomId}
					room={room}
					setRoom={setRoom}
					isSelectedRoom={room.roomId === selectedRoom.roomId}
				/>
			)}
			{/* Testing for domains: */}
			<Domains />
		</div>
	);
}

export default InboxesContainer;
