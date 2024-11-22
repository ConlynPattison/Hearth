import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { Fragment, RefObject, forwardRef, useContext, useState } from "react";
import { mutate } from "swr";
import { Domain } from "@prisma/client"
import { OptionallyParentalDomain } from "../Domains";
import React from "react";

interface PatchRealmFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domain: Domain;
	domains: OptionallyParentalDomain[];
}

export interface DomainsOptionsProps {
	beingPatchedDomainId: number;
	domains: OptionallyParentalDomain[];
	depth: number;
	maxDepth: number;
}

const DomainsOptions = ({ domains, depth, maxDepth, beingPatchedDomainId }: DomainsOptionsProps) => {
	const padding = "--- ".repeat(depth);

	if (depth >= maxDepth) return;

	return (
		<>
			{domains.map((domain) =>
				<Fragment key={domain.domainId}>
					{beingPatchedDomainId !== domain.domainId && <option
						key={`option_${domain.domainId}`}
						value={domain.domainId}>
						{padding}{domain.domainName}
					</option >}
					{domain.children && <DomainsOptions key={domain.domainId} beingPatchedDomainId={beingPatchedDomainId} domains={domain.children} depth={1 + depth} maxDepth={maxDepth} />}
				</Fragment>
			)
			}
		</>
	);
}

const PatchDomainForm = forwardRef<HTMLFormElement, PatchRealmFormProps>(({ dialog, domain, domains }: PatchRealmFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);

	const [isPrivate, setIsPrivate] = useState(domain.isPrivate);
	const [domainName, setDomainName] = useState(domain.domainName);
	const [parentDomainId, setParentDomainId] = useState<number | null>(domain.parentDomainId);

	const patch = async () => {
		axios.patch(`/api/realms/${activeRealm?.realmId}/domains`, {
			body: {
				isPrivate,
				domainName,
				domainId: domain.domainId,
				parentDomainId
			},
		}).then(patch => {
			if (patch.status === 200) {
				alert("Domain successfully updated!");
				mutate(`/api/realms/${activeRealm?.realmId}/domains`);
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to update domain, invalid arguments provided.");
		});
	}

	return (
		<form action={patch} ref={ref}>
			<div className="flex flex-col gap-2">
				<label className="flex flex-col">Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="domain_name"
						required
						maxLength={16}
						minLength={1}
						value={domainName}
						onChange={(e) => setDomainName(e.target.value)}
						placeholder="Rename your domain..." /></label>
				<label className="flex">Is this domain private?
					<input
						className="ml-auto"
						name="domain_is_private"
						checked={isPrivate}
						onChange={(e) => setIsPrivate(e.target.checked)}
						type="checkbox" /></label>
				<label className="flex" >Parent domain:
					<select
						className="dark:bg-slate-600 bg-slate-200 ml-auto px-1 rounded-sm"
						value={parentDomainId ?? undefined}
						name="domain_parent"
						title="Domain parent"
						onChange={(e) => setParentDomainId(parseInt(e.target.value, 10))}
					>
						<option
							value={undefined}
							className="italic"
						>- Root -</option>
						<DomainsOptions key={domain.domainId} beingPatchedDomainId={domain.domainId} domains={domains} depth={0} maxDepth={2} />
					</select>
				</label>
			</div>
		</form>
	);
});

PatchDomainForm.displayName = "PatchDomainForm";

export default PatchDomainForm;
export { DomainsOptions };
