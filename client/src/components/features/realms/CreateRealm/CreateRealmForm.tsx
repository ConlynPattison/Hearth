import axios from "axios";
import { RefObject, forwardRef, useState } from "react";
import { mutate } from "swr";

interface CreateRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const CreateRealmForm = forwardRef<HTMLFormElement, CreateRealmFormProps>((
	{ dialog }: CreateRealmFormProps, ref) => {
	const [isPrivate, setIsPrivate] = useState(false);
	const [realmName, setRealmName] = useState("");

	const create = async () => {
		axios.post("/api/realms", {
			body: {
				isSearchable: !isPrivate,
				realmName
			},
		}).then(create => {
			if (create.status === 200) {
				alert("Realm successfully created!");
				mutate("/api/realms");
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to create realm, invalid arguments provided.");
		});
	}

	return (
		<form action={create} ref={ref}>
			<div className="flex flex-col gap-4">
				<label className="flex flex-col">Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 px-1 rounded-sm"
						name="realm_name"
						required
						maxLength={16}
						value={realmName}
						onChange={(e) => setRealmName(e.target.value)}
						placeholder="Name your realm..." /></label>
				<label className="flex">Is this realm private?
					<input
						className="ml-auto"
						name="realm_is_private"
						checked={isPrivate}
						onChange={(e) => setIsPrivate(e.target.checked)}
						type="checkbox" /></label>
			</div>
		</form>
	);
});

CreateRealmForm.displayName = "CreateRealmForm";

export default CreateRealmForm;
