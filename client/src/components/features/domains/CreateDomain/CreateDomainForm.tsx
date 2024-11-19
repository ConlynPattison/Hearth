import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, forwardRef, useContext, useEffect, useState } from "react";
import { mutate } from "swr";

interface CreateDomainFormProps {
	dialog: RefObject<HTMLDialogElement>;
	parentDomainId: number | null;
}

const CreateDomainForm = forwardRef<HTMLFormElement, CreateDomainFormProps>((
	{ dialog, parentDomainId }: CreateDomainFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);

	const [isPrivate, setIsPrivate] = useState(false);
	const [domainName, setDomainName] = useState("");

	useEffect(() => {
		if (!dialog.current) return;
		const dialogRef = dialog.current;

		const resetForm = () => {
			setIsPrivate(false);
			setDomainName("")
		}
		dialogRef.addEventListener("close", resetForm);

		return () => dialogRef.removeEventListener("close", resetForm);
	}, [dialog]);

	const create = async () => {
		axios.post(`/api/realms/${activeRealm?.realmId}/domains`, {
			body: {
				parentDomainId,
				domainName,
				isPrivate,
			},
		}).then(create => {
			if (create.status === 201) {
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
		<form action={create} ref={ref}>
			<div className="flex flex-col gap-2">
				<label className="flex flex-col">Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="domain_name"
						required
						maxLength={16}
						value={domainName}
						onChange={(e) => setDomainName(e.target.value)}
						placeholder="Name your domain..." /></label>
				<label className="flex">Is this domain private?
					<input
						className="ml-auto"
						name="domain_is_private"
						checked={isPrivate}
						onChange={(e) => setIsPrivate(e.target.checked)}
						type="checkbox" /></label>
			</div>
		</form>
	);
});

CreateDomainForm.displayName = "CreateDomainForm";

export default CreateDomainForm;
