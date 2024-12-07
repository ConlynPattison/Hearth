import RoomContext from "@/context/RoomContext";
import { Room, RoomType } from "@prisma/client";
import { useContext } from "react";
import { FaComments, FaMicrophoneLines } from "react-icons/fa6";
import DeleteRoom from "./DeleteRoom/DeleteRoom";
import PatchRoom from "./PatchRoom/PatchRoom";
import { OptionallyParentalDomain } from "../domains/Domains";

interface RoomIconProps {
	roomType: RoomType;
}

const RoomIcon = ({ roomType }: RoomIconProps) => {
	return (
		<div className="pl-1 pr-2 self-center">
			{roomType === RoomType.TEXT ?
				<FaComments /> :
				<FaMicrophoneLines />}
		</div>
	);
}

interface RoomProps {
	room: Room;
	selected: boolean;
	domains: OptionallyParentalDomain[];
	showAdmin: boolean;
}

const RoomItem = ({ room, selected, domains, showAdmin }: RoomProps) => {
	const [activeRoom, setActiveRoom] = useContext(RoomContext);

	const bg = selected ?
		"bg-gradient-to-tl dark:from-purple-700 dark:to-red-500 from-purple-400 to-red-200"
		: "hover:bg-slate-200 dark:hover:bg-slate-700 hover:bg-slate-200";

	return (
		<div className={`flex py-1 px-2 my-1 hover:cursor-pointer rounded-md ${bg} group`}
			onClick={() => {
				if (setActiveRoom === undefined) return;
				if (activeRoom === null || activeRoom && activeRoom.roomId !== room.roomId) {
					setActiveRoom(room);
				}
			}}>
			<RoomIcon roomType={room.roomType} />
			<div className="w-full overflow-hidden text-ellipsis text-nowrap">{room.roomName}</div>
			{showAdmin &&
				<div className="hidden group-hover:flex ml-auto self-center">
					<PatchRoom room={room} domains={domains} />
					<DeleteRoom roomId={room.roomId} roomName={room.roomName} />
				</div>}
		</div>
	);
}

export default RoomItem;
