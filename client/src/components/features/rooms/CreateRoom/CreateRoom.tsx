"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaCommentMedical } from "react-icons/fa6";
import { useRef, ReactNode, memo } from "react";
import CreateRoomForm from "./CreateRoomForm";
import { RoomScope } from "@prisma/client";

// Interface to allow for creating a room on the root rather than from within a domain
interface CreateRoomProps {
	domainName: string | null;
	domainId: number | null;
	roomScope: RoomScope;
	children?: ReactNode;
}

const CreateRoom = memo(({ children, domainName, domainId, roomScope }: CreateRoomProps) => {
	const { openModal, closeModal, dialog } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Create room"
				onClick={openModal}>
				{children}
				<div className="px-1 dark:text-yellow-600"><FaCommentMedical /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Create New Room
				</ModalHeading>
				<ModalContent>
					{domainName &&
						<div className="font-bold pb-4">
							Room will be created within the &quot;{domainName}&quot; domain
						</div>}
					<CreateRoomForm ref={formRef} roomScope={roomScope} dialog={dialog} domainId={domainId} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}>
						<button
							className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md px-2 py-1"
							type="submit"
							onClick={() => formRef.current?.requestSubmit()}
						>Submit</button>
					</ModalButtonGroup>
				</ModalFooter>
			</Modal>
		</>
	);
});

CreateRoom.displayName = "CreateRoom"

export default CreateRoom;
