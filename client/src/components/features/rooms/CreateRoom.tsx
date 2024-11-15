"use client"
import Modal from "@/components/ui/Modal";
import { FaCommentMedical } from "react-icons/fa6";
import { useRef, FormEvent, ReactNode } from "react";
import CreateRoomForm from "./CreateRoomForm";
import { RoomScope } from "@prisma/client";

// Interface to allow for creating a room on the root rather than from within a domain
interface CreateRoomProps {
	domainName: string | null;
	domainId: number | null;
	roomScope: RoomScope;
	children?: ReactNode;
}

const CreateRoom = ({ domainName, domainId, roomScope, children }: CreateRoomProps) => {
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
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Create room"
				onClick={openModal}>
				{children}
				<div className="px-1 dark:text-yellow-600"><FaCommentMedical /></div>
			</div>
			<Modal ref={dialog}>
				<div className="flex flex-col">
					<h1 className="text-center text-lg"
					>New Room Info</h1>
					{domainName &&
						<div>(Will be created within domain <strong>{domainName}</strong>)</div>}
					<hr />
					<CreateRoomForm dialog={dialog} domainId={domainId} roomScope={roomScope} />
					<button
						className="hover:brightness-90 dark:bg-slate-700 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
						type="button"
						onClick={closeModal}
					>Close</button>
				</div>
			</Modal>
		</>
	);
}

export default CreateRoom;
