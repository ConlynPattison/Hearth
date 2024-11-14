import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";
import { Domain } from "@prisma/client"
import { OptionallyParentalDomain } from "./Domains";

interface PatchRealmFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domain: Domain;
	domains: OptionallyParentalDomain[];
}

interface DomainsOptionsProps {
	domains: OptionallyParentalDomain[];
	selectedDomain: Domain;
	depth: number;
}

const DomainsOptions = ({ domains, selectedDomain, depth }: DomainsOptionsProps) => {
	const padding = "--- ".repeat(depth);

	if (depth >= 2) return;

	return (
		<>
			{domains.map((domain) =>
				<>
					<option
						value={domain.domainId}
						selected={domain.domainId === selectedDomain.parentDomainId}>
						{padding}{domain.domainName}
					</option >
					{domain.children && <DomainsOptions selectedDomain={selectedDomain} domains={domain.children} depth={1 + depth} />}
				</>
			)
			}
		</>
	)
}

const PatchDomainForm = ({ dialog, domain, domains }: PatchRealmFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const patch = async (e: FormData) => {
		const isPrivate = e.get("domain_is_private");
		const domainNameInput = e.get("domain_name");
		const parentDomainId = parseInt(e.get("domain_parent") as string, 10) || null;

		if (!domainNameInput || typeof domainNameInput !== "string") {
			alert("Failed to update domain");
			return;
		}

		axios.patch(`/api/realms/${activeRealm?.realmId}/domains`, {
			body: {
				isPrivate: (isPrivate === null || isPrivate === "off") ? false : true,
				domainName: domainNameInput,
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
		<form action={patch}>
			<div className="flex flex-col">
				<label>Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="domain_name"
						required
						maxLength={16}
						minLength={1}
						defaultValue={domain.domainName}
						placeholder="Rename your domain..." /></label>
				<label>Is this domain private?
					<input
						name="domain_is_private"
						defaultChecked={domain.isPrivate}
						type="checkbox" /></label>
				<label>Change the parent?
					<select
						className="dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="domain_parent">
						<option
							value={undefined}
							selected={domain.parentDomainId === null}
							className="italic"
						>- Root -</option>
						<DomainsOptions selectedDomain={domain} domains={domains} depth={0} />
					</select></label>
				<button
					className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit">Save</button>
			</div>
		</form>
	);
};

export default PatchDomainForm;
