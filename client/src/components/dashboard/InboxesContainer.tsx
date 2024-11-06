import { Room } from "@prisma/client";
import { Dispatch, SetStateAction } from "react";

const rooms: Room[] = [
	{
		roomId: 829427992384792,
		roomName: "room1",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	},
	{
		roomId: 239873249328,
		roomName: "Side Populus",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	},
	{
		roomId: 432984973215,
		roomName: "Bwazil Room",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	},
	{
		roomId: 1923048329874982,
		roomName: "Relish Tides",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	},
	{
		roomId: 239487312984732,
		roomName: "Tandom Room Extra",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	}
]

interface InboxProps {
	room: Room,
	setRoom: Dispatch<SetStateAction<Room>>,
	isSelectedRoom: boolean
}

const Inbox = ({ room, setRoom, isSelectedRoom }: InboxProps) => {

	const bg = isSelectedRoom ?
		"bg-gradient-to-tl from-purple-700 to-red-500"
		: "bg-slate-900";
	return (
		<button className={`${bg} py-3 text-center rounded-md mt-3 mx-3`}
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
		<div className="flex flex-col">
			{rooms.map((room) =>
				<Inbox
					key={room.roomId}
					room={room}
					setRoom={setRoom}
					isSelectedRoom={room.roomId === selectedRoom.roomId}
				/>
			)}
		</div>
	);
}

export default InboxesContainer;
