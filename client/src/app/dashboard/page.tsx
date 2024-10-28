"use client"
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import ChatRoomContainer from "../../components/dashboard/ChatRoomContainer";
import { FaAngleDown, FaArrowRightFromBracket, FaComments, FaUser } from "react-icons/fa6";
import InboxesContainer from "../../components/dashboard/InboxesContainer";
import { useState } from "react";
import { Room } from "@prisma/client";

const Dashboard = () => {
	const {
		user,
	} = useUser();

	const defaultRoom = {
		id: 829427992384792,
		name: "room1",
		isPrivate: false
	}
	const [room, setRoom] = useState<Room>(defaultRoom);

	const username = user?.name;

	return (
		<div className="flex h-screen">
			{/* Left edge nav bar */}
			<div className="h-[100%] bg-slate-900 w-[100px] pt-3">
				{/* Profile */}
				<div className="flex flex-col">
					<FaUser size="3em" className="text-slate-500 self-center" />
					<div className="self-center">
						<text className="text-sm h-[1em] w-[80%] overflow-hidden text-ellipsis whitespace-nowrap">
							<abbr className="no-underline" title={username ?? ""}>{username ?? ""}</abbr>
						</text>
						<FaAngleDown className="translate-x-14 -translate-y-5" />
					</div>
				</div>
				<div className="flex flex-col bg-slate-800 py-3">
					<FaComments size="3em" className="self-center text-slate-500" />
				</div>
				<div className="flex flex-col bg-slate-900 py-3">
					<a
						className=" hover:cursor-pointer self-center"
						href="/api/auth/logout"
						title="Log out"
					><FaArrowRightFromBracket size="3em"
						className="bg-transparent text-slate-500" />
					</a>
				</div>
			</div>

			{/* Outer container */}
			<div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex">

				{/* Left middle inbox & rooms */}
				<div className="bg-slate-800 sm:w-[400px] sm:h-[100%]">
					<InboxesContainer setRoom={setRoom} selectedRoom={room} />
				</div>

				{/* Right middle messages */}
				<div className="bg-slate-800 w-[100%] h-[100%]">
					{room && <ChatRoomContainer key={room.id} room={room} />}
				</div>

				{/* Right edge profile info */}
				<div className="bg-slate-900 sm:w-[300px] sm:h-[100%]">
				</div>
			</div>
		</div >
	);
}

export default withPageAuthRequired(
	Dashboard,
	{
		returnTo: "/dashboard"
	}
)
