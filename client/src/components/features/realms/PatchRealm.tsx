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
			<div className="hover:brightness-90 dark:bg-slate-900 bg-slate-200 flex flex-col py-2 text-center rounded-md mt-3 mx-2 hover:cursor-pointer"
				onClick={openModal}
				title="Update realm properties">
				<FaGear size="2em" className="self-center dark:text-slate-500 text-slate-700" />
			</div>
			<Modal ref={dialog}>
				{tryingDelete ?
					<div className="flex flex-col">
						<h1 className="text-center text-lg"
						>Delete Realm</h1>
						<hr />
						<DeleteRealmForm dialog={dialog} />
						<button
							className="hover:brightness-90 dark:bg-slate-700 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
							type="button"
							onClick={() => setTryingDelete(false)}
						>Cancel</button>
					</div>
					:
					<div className="flex flex-col">
						<h1 className="text-center text-lg"
						>Update Realm Info</h1>
						<hr />
						<PatchRealmForm dialog={dialog} />
						<button
							className="hover:brightness-90 dark:bg-slate-700 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
							type="button"
							onClick={closeModal}
						>Close</button>
						<button
							className="hover:brightness-90 dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center disabled:dark:bg-red-950 disabled:bg-slate-300"
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
