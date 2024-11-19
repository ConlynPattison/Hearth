"use client"
import { Modal, ModalButtonGroup, ModalContent, ModalFooter, ModalHeading, useModal } from "@/components/ui/Modal";
import { FaGears } from "react-icons/fa6";
import { memo, useRef } from "react";
import PatchDomainForm from "./PatchDomainForm";
import { Domain } from "@prisma/client";
import { OptionallyParentalDomain } from "../Domains";

// Interface to allow for updating a domain on the root rather than from within a parent domain
interface PatchDomainProps {
	parentDomainName: string | null;
	domain: Domain;
	domains: OptionallyParentalDomain[];
}

const PatchDomain = memo(({ parentDomainName, domain, domains }: PatchDomainProps) => {
	const { openModal, closeModal, dialog } = useModal();
	const formRef = useRef<HTMLFormElement>(null);

	return (
		<>
			<div className="hover:cursor-pointer hover:dark:brightness-90 flex"
				title="Edit domain"
				onClick={openModal}>
				<div className="px-1 dark:text-cyan-600"><FaGears /></div>
			</div>
			<Modal ref={dialog}>
				<ModalHeading closeModal={closeModal}>
					Change Domain Properties
				</ModalHeading>
				<ModalContent>
					{parentDomainName &&
						<div>(Sub-domain of <span className="font-bold"
						>{parentDomainName}</span>)</div>}
					<PatchDomainForm ref={formRef} dialog={dialog} domain={domain} domains={domains} />
				</ModalContent>
				<ModalFooter>
					<ModalButtonGroup closeModal={closeModal}>
						<button
							className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md px-2 py-1"
							type="submit"
							onClick={() => formRef.current?.requestSubmit()}
						>Submit</button>
					</ModalButtonGroup>
				</ModalFooter>
			</Modal>
		</>
	);
});

PatchDomain.displayName = "PatchDomain";

export default PatchDomain;
