"use client"
import { useUser, withPageAuthRequired } from "@auth0/nextjs-auth0/client";
import ChatRoomContainer from "../../components/dashboard/ChatRoomContainer";
import { FaArrowRightFromBracket, FaComments, FaPlus, FaUser } from "react-icons/fa6";
import InboxesContainer from "../../components/dashboard/InboxesContainer";
import { FormEvent, useRef, useState } from "react";
import { Room } from "@prisma/client";
import Modal from "@/components/ui/Modal";
import CreateRealmForm from "@/components/dashboard/CreateRealmForm";

const Dashboard = () => {
	const { user } = useUser();
	const username = user?.name;

	const defaultRoom: Room = {
		roomId: 829427992384792,
		roomName: "room1",
		isPrivate: false,
		realmId: 100,
		permissionsId: null
	}

	const [room, setRoom] = useState<Room>(defaultRoom);

	const dialog = useRef<HTMLDialogElement>(null);

	const openModal = (e: FormEvent) => {
		e.stopPropagation();
		if (dialog.current && !dialog.current.open) {
			dialog.current.showModal();
		}
	}
	const closeModal = (e: FormEvent) => {
		e.stopPropagation();
		if (dialog.current) {
			dialog.current.close();
		}
	}

	return (
		<div className="flex h-dvh">
			{/* Left edge nav bar */}
			<div className="h-[100%] bg-slate-900 w-[100px] pt-3">
				{/* Profile */}
				<div className="flex flex-col w-[100%]">
					<FaUser size="3em" className="text-slate-500 self-center" />
					<p
						className="self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap no-underline"
						title={username ?? ""}>
						{username ?? ""}
					</p>
				</div>
				<div className="flex flex-col bg-slate-800 py-3">
					<FaComments size="3em" className="self-center text-slate-500" />
				</div>
				<div className="flex flex-col bg-slate-900 py-3">
					<a
						className="hover:cursor-pointer self-center"
						href="/api/auth/logout"
						title="Log out"
					><FaArrowRightFromBracket size="3em"
						className="bg-transparent text-slate-500" />
					</a>
				</div>
				<div className="flex flex-col bg-slate-900 py-3 hover:cursor-pointer"
					onClick={openModal} >
					<FaPlus size="3em" className="self-center text-slate-500" />
				</div>
				<Modal ref={dialog}>
					<CreateRealmForm dialog={dialog} />
					<button type="button" onClick={closeModal}>Close</button>
				</Modal>
			</div>

			{/* Outer container */}
			<div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex">

				{/* Left middle inbox & rooms */}
				<div className="bg-slate-800 sm:w-[400px] sm:h-[100%]">
					<InboxesContainer setRoom={setRoom} selectedRoom={room} />
				</div>

				{/* Right middle messages */}
				<div className="bg-slate-800 w-[100%] h-[100%]">
					{room && <ChatRoomContainer key={room.roomId} room={room} />}
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
