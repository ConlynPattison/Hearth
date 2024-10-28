"use client"
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import ChatRoomContainer from "../../components/dashboard/MessagesContainer";
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
			<div className="h-[100%] bg-blue-500 w-[100px] p-2">
				<div className="p-1">
					<FaUser size="3em" className="m-auto" />
					<div className="w-[100%] text-center">
						<p className="text-sm h-[1.2em] w-[80%] overflow-hidden text-ellipsis whitespace-nowrap">
							<abbr className="no-underline" title={username ?? ""}>{username ?? ""}</abbr>
						</p>
						<FaAngleDown className="translate-x-16 -translate-y-4" />
					</div>
					{/* <Fa */}
					<FaComments size="3em" className="m-auto" />
					<a
						className=" hover:cursor-pointer"
						href="/api/auth/logout"
						title="Log out"
					><FaArrowRightFromBracket size="2em" className="m-auto my-2" /></a>
				</div>
			</div>

			{/* Outer container */}
			<div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex">

				{/* Left middle inbox & rooms */}
				<div className="bg-blue-700 sm:w-[400px] sm:h-[100%]">
					<InboxesContainer setRoom={setRoom} selectedRoom={room} />
				</div>

				{/* Right middle messages */}
				<div className="bg-slate-800 w-[100%] h-[100%] p-2">
					{room && <ChatRoomContainer key={room.id} room={room} />}
				</div>

				{/* Right edge profile info */}
				<div className="bg-slate-900 sm:w-[300px] sm:h-[100%]">
				</div>
			</div>
		</div>
	);
}

export default withPageAuthRequired(
	Dashboard,
	{
		returnTo: "/dashboard"
	}
)
