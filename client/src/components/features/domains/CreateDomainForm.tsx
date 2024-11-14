import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";

interface CreateDomainFormProps {
	dialog: RefObject<HTMLDialogElement>;
	parentDomainId: number | null;
}

const CreateDomainForm = ({ dialog, parentDomainId }: CreateDomainFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const create = async (e: FormData) => {
		const isPrivate = e.get("domain_is_private");
		const domainName = e.get("domain_name");

		if (!domainName || typeof domainName !== "string") {
			alert("Failed to create realm");
			return;
		}

		axios.post(`/api/realms/${activeRealm?.realmId}/domains`, {
			body: {
				parentDomainId,
				domainName,
				isPrivate: (isPrivate === null || isPrivate === "off") ? false : true
			},
		}).then(create => {
			if (create.status === 200) {
				alert("Domain successfully created!");
				mutate(`/api/realms/${activeRealm?.realmId}/domains`);
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to create domain.");
		});
	}

	return (
		<form action={create}>
			<div className="flex flex-col">
				<label>Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="domain_name"
						required
						maxLength={16}
						placeholder="Name your domain..." /></label>
				<label>Is this domain private?
					<input
						name="domain_is_private"
						type="checkbox" /></label>
				<button
					className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit"
				>Submit</button>
			</div>
		</form>
	);
};

export default CreateDomainForm;
