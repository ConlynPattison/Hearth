"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaGear } from "react-icons/fa6";
import PatchRealmForm from "./PatchRealmForm";
import { useRef, useContext, useState, useEffect } from "react";
import RealmContext from "@/context/RealmContext";
import DeleteRealmForm from "../DeleteRealm/DeleteRealmForm";
import { UsersOnRealmsLevels } from "@prisma/client";

const PatchRealm = () => {
	const [activeRealm] = useContext(RealmContext);
	const [tryingDelete, setTryingDelete] = useState(false);
	const userCanDeleteRealm = activeRealm?.UsersOnRealms[0].memberLevel === UsersOnRealmsLevels.OWNER;

	const { dialog, closeModal, openModal } = useModal();
	const deleteFormRef = useRef<HTMLFormElement>(null);
	const updateFormRef = useRef<HTMLFormElement>(null);

	useEffect(() => {
		if (!dialog.current) return;

		const dialogRef = dialog.current;

		const resetForm = () => {
			setTryingDelete(false);
		}
		dialogRef.addEventListener("close", resetForm);

		return () => dialogRef.removeEventListener("close", resetForm);
	}, [dialog]);

	return (
		<>
			<div className="hover:brightness-90 dark:bg-slate-900 bg-slate-200 flex flex-col py-2 text-center rounded-md mt-3 mx-2 hover:cursor-pointer"
				onClick={openModal}
				title="Update realm properties">
				<FaGear size="2em" className="self-center dark:text-slate-500 text-slate-700" />
			</div>
			<Modal ref={dialog}>
				{tryingDelete ?
					<>
						<ModalHeading closeModal={closeModal}>
							Delete Realm
						</ModalHeading>
						<ModalContent>
							<DeleteRealmForm ref={deleteFormRef} dialog={dialog} />
						</ModalContent>
						<ModalFooter>
							<ModalButtonGroup closeModal={closeModal}>
								<button
									className="hover:brightness-90 dark:bg-blue-800 bg-slate-200 dark:color-by-mode text-blue-800 rounded-md w-fit px-2 py-1"
									type="button"
									onClick={() => setTryingDelete(false)}
								>Update Realm</button>
								<button
									className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1"
									type="submit"
									onClick={() => deleteFormRef.current?.requestSubmit()}
								>Submit</button>
							</ModalButtonGroup>
						</ModalFooter>
					</>
					:
					<>
						<ModalHeading closeModal={closeModal}>
							Update Realm Properties
						</ModalHeading>
						<ModalContent>
							<PatchRealmForm ref={updateFormRef} dialog={dialog} />
						</ModalContent>
						<ModalFooter>
							<ModalButtonGroup closeModal={closeModal}>
								<button
									className="hover:brightness-90 dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md w-fit px-2 py-1 disabled:dark:bg-red-950 disabled:bg-slate-300"
									type="button"
									onClick={() => setTryingDelete(true)}
									disabled={!userCanDeleteRealm}
								>Delete Realm</button>
								<button
									className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1"
									type="submit"
									onClick={() => updateFormRef.current?.requestSubmit()}
								>Submit</button>
							</ModalButtonGroup>
						</ModalFooter>
					</>}
			</Modal>
		</>
	);
}

export default PatchRealm;
