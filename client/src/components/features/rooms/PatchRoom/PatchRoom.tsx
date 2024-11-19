"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaGears } from "react-icons/fa6";
import { useRef, ReactNode, memo } from "react";
import PatchRoomForm from "./PatchRoomForm";
import { Room } from "@prisma/client";
import { OptionallyParentalDomain } from "../../domains/Domains";

interface PatchRoomProps {
	room: Room;
	children?: ReactNode;
	domains: OptionallyParentalDomain[];
}

const PatchRoom = memo(({ children, room, domains }: PatchRoomProps) => {
	const { openModal, closeModal, dialog } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Update room"
				onClick={openModal}>
				{children}
				<div className="px-1 dark:text-cyan-600"><FaGears /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Change Room Properties
				</ModalHeading>
				<ModalContent>
					<PatchRoomForm ref={formRef} dialog={dialog} room={room} domains={domains} />
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

PatchRoom.displayName = "PatchRoom";

export default PatchRoom;
