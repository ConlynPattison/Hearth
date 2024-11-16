import { FormEvent, forwardRef, useRef } from "react";
import { createPortal } from "react-dom";
import { FaX } from "react-icons/fa6";

interface ModalProps {
	children?: React.ReactNode
}

type ModalHeadingProps = ModalProps & {
	closeModal: (e: FormEvent) => void
}

type ModalButtonGroupProps = ModalHeadingProps;

const ModalDivider = () => {
	return (
		<hr className="h-[1px] dark:bg-slate-600 bg-slate-300 border-0" />
	);
}

const useModal = () => {
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

	return { dialog, openModal, closeModal };
}

const ModalHeading = ({ children, closeModal }: ModalHeadingProps) => {
	return (
		<div className="mb-3">
			<div className="flex pb-1">
				<h1 className="text-2xl text-left w-[100%]">
					{children}
				</h1>
				<button className="self-center border-none hover:bg-slate-200 dark:hover:bg-slate-700 p-1 rounded-md translate-x-3 -translate-y-3"
					onClick={closeModal}
					type="button"
					title="Close">
					<div className="flex items-center justify-center h-full">
						<FaX className="text-slate-500" />
					</div>
				</button>
			</div>
			<ModalDivider />
		</div>
	);
}

const ModalContent = ({ children }: ModalProps) => {
	return (
		<div>
			{children}
		</div>
	);
}

const ModalFooter = ({ children }: ModalProps) => {
	return (
		<div className="mt-3">
			<ModalDivider />
			<div className="pt-1">
				{children}
			</div>
		</div>
	);
}

const ModalButtonGroup = ({ children, closeModal }: ModalButtonGroupProps) => {
	return (
		<div className="flex">
			<button
				className=" ml-auto hover:bg-slate-200 dark:hover:bg-slate-700 px-2 py-1 rounded-md"
				onClick={closeModal}
				type="button">
				Cancel
			</button>
			{children}
		</div >
	);
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(({
	children
}: { children?: React.ReactNode }, ref) => {

	const modalRoot = document.getElementById("modal-root");

	return createPortal(
		<dialog className="backdrop:backdrop-blur-sm backdrop:backdrop-brightness-75 rounded-md p-6 color-by-mode dark:bg-slate-800 shadow-2xl max-w-[65%]"
			ref={ref}>
			{children}
		</dialog >,
		modalRoot ?? document.body
	);
});

Modal.displayName = "Modal";

export { Modal, ModalHeading, ModalContent, ModalFooter, ModalButtonGroup, useModal };
