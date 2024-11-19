"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaTrashCan } from "react-icons/fa6";
import DeleteDomainForm from "./DeleteDomainForm";
import { memo, useRef } from "react";

// Interface to allow for creating a domain on the root rather than from within a parent domain
interface DeleteDomainProps {
	domainName: string;
	domainId: number;
}

const DeleteDomain = memo(({ domainName, domainId }: DeleteDomainProps) => {
	const { dialog, openModal, closeModal } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Delete domain"
				onClick={openModal}>
				<div className="px-1 dark:text-red-700"><FaTrashCan /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Delete Domain
				</ModalHeading>
				<ModalContent>
					<DeleteDomainForm ref={formRef} dialog={dialog} domainId={domainId} domainName={domainName} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}>
						<button
							className="dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md w-fit px-2 py-1 self-center"
							type="submit"
							onClick={() => formRef.current?.requestSubmit()}
						>Delete</button>
					</ModalButtonGroup>
				</ModalFooter>
			</Modal >
		</>
	);
});

DeleteDomain.displayName = "DeleteDomain";

export default DeleteDomain;
