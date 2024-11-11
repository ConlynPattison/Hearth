"use client"
import Modal from "@/components/ui/Modal";
import { FaPlus } from "react-icons/fa6";
import { useRef, FormEvent } from "react";
import CreateRealmForm from "./CreateRealmForm";

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
		<>
			<div className={`flex flex-col dark:bg-slate-900 bg-slate-200 py-3 hover:cursor-pointer hover:brightness-90`}
				onClick={openModal}
				title="Create new realm">
				<FaPlus size="3em" className="self-center dark:text-slate-500 text-slate-700" />
			</div>
			<Modal ref={dialog}>
				<div className="flex flex-col">
					<h1 className="text-center text-lg"
					>New Realm Info</h1>
					<hr />
					<CreateRealmForm dialog={dialog} />
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

export default CreateRealm;
