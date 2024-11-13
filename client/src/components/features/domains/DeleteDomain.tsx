"use client"
import Modal from "@/components/ui/Modal";
import { FaTrash } from "react-icons/fa6";
import { useRef, FormEvent } from "react";
import DeleteDomainForm from "./DeleteDomainForm";

// Interface to allow for creating a domain on the root rather than from within a parent domain
interface DeleteDomainProps {
	domainName: string;
	domainId: number;
}

const DeleteDomain = ({ domainName, domainId }: DeleteDomainProps) => {
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
				title="Delete domain"
				onClick={openModal}>
				<div className="translate-y-[2px] px-1 dark:text-red-700"><FaTrash /></div>
			</div>
			<Modal ref={dialog}>
				<div className="flex flex-col">
					<h1 className="text-center text-lg"
					>Delete Domain</h1>
					<hr />
					<DeleteDomainForm dialog={dialog} domainId={domainId} domainName={domainName} />
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

export default DeleteDomain;
