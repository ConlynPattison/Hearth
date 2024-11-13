"use client"
import Modal from "@/components/ui/Modal";
import { FaPlus } from "react-icons/fa6";
import { useRef, FormEvent, ReactNode } from "react";
import CreateDomainForm from "./CreateDomainForm";

// Interface to allow for creating a domain on the root rather than from within a parent domain
interface CreateRealmProps {
	parentDomainName: string | null,
	parentDomainId: number | null
	children?: ReactNode
}

const CreateDomain = ({ parentDomainName, parentDomainId, children }: CreateRealmProps) => {
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
				title="Create domain"
				onClick={openModal}>
				{children}
				<div className="translate-y-[2px] px-1 hover:dark:text-green-600"><FaPlus /></div>
			</div>
			<Modal ref={dialog}>
				<div className="flex flex-col">
					<h1 className="text-center text-lg"
					>New Domain Info</h1>
					{parentDomainName &&
						<div>(Sub-domain of <strong>{parentDomainName}</strong>)</div>}
					<hr />
					<CreateDomainForm dialog={dialog} parentDomainId={parentDomainId} />
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

export default CreateDomain;
