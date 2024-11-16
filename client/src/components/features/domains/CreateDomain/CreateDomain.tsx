"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaPlus } from "react-icons/fa6";
import { useRef, ReactNode } from "react";
import CreateDomainForm from "./CreateDomainForm";

// Interface to allow for creating a domain on the root rather than from within a parent domain
interface CreateDomainProps {
	parentDomainName: string | null,
	parentDomainId: number | null
	children?: ReactNode
}

const CreateDomain = ({ parentDomainName, parentDomainId, children }: CreateDomainProps) => {
	const { closeModal, openModal, dialog } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Create domain"
				onClick={openModal}>
				{children}
				<div className="px-1 dark:text-green-600"><FaPlus /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Create New Domain
				</ModalHeading>
				<ModalContent>
					{parentDomainName &&
						<div className="font-bold pb-4">Will be a sub-domain of &quot;{parentDomainName}&quot;</div>}
					<CreateDomainForm ref={formRef} dialog={dialog} parentDomainId={parentDomainId} />
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
}

export default CreateDomain;
