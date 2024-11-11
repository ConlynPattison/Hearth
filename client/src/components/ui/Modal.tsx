import { forwardRef } from "react";

interface ModalProps {
	children: React.ReactNode
}

const Modal = forwardRef<HTMLDialogElement, ModalProps>(({
	children
}: { children: React.ReactNode }, ref) => {

	return (
		<dialog className="backdrop:backdrop-blur-sm rounded-md p-4"
			ref={ref}>
			{children}
			{/* <button type="button" onClick={() => {
				(ref as RefObject<HTMLDialogElement>).current?.close();
			}}>Close</button> */}
		</dialog >
	);
});

Modal.displayName = "Modal";

export default Modal;
