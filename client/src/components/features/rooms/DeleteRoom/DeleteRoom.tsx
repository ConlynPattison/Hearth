"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaTrashCan } from "react-icons/fa6";
import { useRef, ReactNode, memo } from "react";
import DeleteRoomForm from "./DeleteRoomForm";

// Interface to allow for creating a room on the root rather than from within a domain
interface DeleteRoomProps {
	roomId: number;
	roomName: string | null;
	children?: ReactNode;
}

const DeleteRoom = memo(({ children, roomId, roomName }: DeleteRoomProps) => {
	const { openModal, closeModal, dialog } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Delete room"
				onClick={openModal}>
				{children}
				<div className="px-1 dark:text-red-700"><FaTrashCan /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Delete Room
				</ModalHeading>
				<ModalContent>
					<DeleteRoomForm ref={formRef} dialog={dialog} roomName={roomName} roomId={roomId} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}>
						<button
							className="hover:brightness-90 dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md px-2 py-1"
							type="submit"
							onClick={() => formRef.current?.requestSubmit()}
						>Submit</button>
					</ModalButtonGroup>
				</ModalFooter>
			</Modal>
		</>
	);
});

DeleteRoom.displayName = "DeleteRoom";

export default DeleteRoom;
