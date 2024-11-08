"use client"
import Modal from "@/components/ui/Modal";
import { FaPlus } from "react-icons/fa6";
import CreateRealmForm from "../CreateRealmForm";
import { useRef, FormEvent } from "react";

const CreateRealm = () => {
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
		<div className="flex flex-col bg-slate-900 py-3 hover:cursor-pointer"
			onClick={openModal} >
			<FaPlus size="3em" className="self-center text-slate-500" />
			<Modal ref={dialog}>
				<CreateRealmForm dialog={dialog} />
				<button type="button" onClick={closeModal}>Close</button>
			</Modal>
		</div>
	);
}

export default CreateRealm;
