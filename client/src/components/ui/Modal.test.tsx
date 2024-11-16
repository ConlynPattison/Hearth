"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaFlaskVial } from "react-icons/fa6";
import CreateDomainForm from "../features/domains/CreateDomainForm";

const Test = () => {
	const { dialog, openModal, closeModal } = useModal();

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Test modal"
				onClick={openModal}>
				<div className="px-1 dark:text-cyan-600"><FaFlaskVial /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Modal Heading
				</ModalHeading>
				<ModalContent>
					<CreateDomainForm dialog={dialog} parentDomainId={null} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}></ModalButtonGroup>
				</ModalFooter>
			</Modal>
		</>
	);
}

export default Test;
