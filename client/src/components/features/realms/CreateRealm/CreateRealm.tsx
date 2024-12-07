"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaPlus } from "react-icons/fa6";
import { useRef } from "react";
import CreateRealmForm from "./CreateRealmForm";

const CreateRealm = () => {
	const { dialog, closeModal, openModal } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className={`flex flex-col dark:bg-slate-900 bg-slate-200 py-3 hover:cursor-pointer hover:brightness-90`}
				onClick={openModal}
				title="Create new realm">
				<FaPlus
					size="3em"
					className="self-center dark:text-slate-500 text-slate-700"
					style={{ fill: "url(#icon-gradient)" }}
				/>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Create New Realm
				</ModalHeading>
				<ModalContent>
					<CreateRealmForm ref={formRef} dialog={dialog} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}>
						<button
							className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1"
							type="submit"
							onClick={() => formRef.current?.requestSubmit()}
						>Submit</button>
					</ModalButtonGroup>
				</ModalFooter>
			</Modal>
		</>
	);
}

export default CreateRealm;
