"use client"
import Modal from "@/components/ui/Modal";
import { FaGears } from "react-icons/fa6";
import { useRef, FormEvent } from "react";
import PatchDomainForm from "./PatchDomainForm";
import { Domain } from "@prisma/client";
import { OptionallyParentalDomain } from "./Domains";

// Interface to allow for updating a domain on the root rather than from within a parent domain
interface PatchDomainProps {
	parentDomainName: string | null;
	domain: Domain;
	domains: OptionallyParentalDomain[];
}

const PatchDomain = ({ parentDomainName, domain, domains }: PatchDomainProps) => {
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
				title="Change domain"
				onClick={openModal}>
				<div className="translate-y-[2px] px-1 dark:text-cyan-600"><FaGears /></div>
			</div>
			<Modal ref={dialog}>
				<div className="flex flex-col">
					<h1 className="text-center text-lg"
					>Change Domain Info</h1>
					{parentDomainName &&
						<div>(Sub-domain of <span className="font-bold"
						>{parentDomainName}</span>)</div>}
					<hr />
					<PatchDomainForm dialog={dialog} domain={domain} domains={domains} />
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

export default PatchDomain;
