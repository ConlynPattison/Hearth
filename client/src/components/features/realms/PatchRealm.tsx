"use client"
import Modal from "@/components/ui/Modal";
import { FaGear } from "react-icons/fa6";
import PatchRealmForm from "./PatchRealmForm";
import { useRef, FormEvent, useContext, useState } from "react";
import RealmContext from "@/context/RealmContext";
import DeleteRealmForm from "./DeleteRealmForm";
import { UsersOnRealmsLevels } from "@prisma/client";

const PatchRealm = () => {
	const [activeRealm] = useContext(RealmContext);
	const [tryingDelete, setTryingDelete] = useState(false);
	const userCanDeleteRealm = activeRealm?.UsersOnRealms[0].memberLevel === UsersOnRealmsLevels.OWNER;

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
			<div className="bg-slate-900 flex flex-col py-3 text-center rounded-md mt-3 mx-3 hover:cursor-pointer"
				onClick={openModal}
				title="Update realm properties">
				<FaGear size="3em" className="self-center text-slate-500" />
			</div>
			<Modal ref={dialog}>
				{tryingDelete ?
					<div className="flex flex-col">
						<h1 className="text-center text-lg"
						>Delete Realm</h1>
						<DeleteRealmForm dialog={dialog} />
						<button type="button" onClick={() => setTryingDelete(false)}>Cancel</button>
					</div>
					:
					<div className="flex flex-col">
						<h1 className="text-center text-lg"
						>Update Realm Info</h1>
						<PatchRealmForm dialog={dialog} />
						<button type="button" onClick={closeModal}>Close</button>
						<button
							type="button"
							onClick={() => setTryingDelete(true)}
							disabled={!userCanDeleteRealm}
						>Delete Realm</button>
					</div>}
			</Modal>
		</>
	);
}

export default PatchRealm;
