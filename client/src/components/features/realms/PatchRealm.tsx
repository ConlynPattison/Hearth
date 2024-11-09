"use client"
import Modal from "@/components/ui/Modal";
import { FaGear } from "react-icons/fa6";
import PatchRealmForm from "./PatchRealmForm";
import { useRef, FormEvent } from "react";

const PatchRealm = () => {
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
		<div className="bg-slate-900 flex flex-col py-3 text-center rounded-md mt-3 mx-3 hover:cursor-pointer"
			onClick={openModal}
			title="Change realm properties">
			<FaGear size="3em" className="self-center text-slate-500" />
			<Modal ref={dialog}>
				<h1 className="text-center text-lg"
				>Update Server Info</h1>
				<PatchRealmForm dialog={dialog} />
				<button type="button" onClick={closeModal}>Close</button>
			</Modal>
		</div>
	);
}

export default PatchRealm;
