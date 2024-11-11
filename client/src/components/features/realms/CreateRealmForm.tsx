import axios from "axios";
import { RefObject } from "react";
import { mutate } from "swr";

interface CreateRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const CreateRealmForm = ({ dialog }: CreateRealmFormProps) => {
	const create = async (e: FormData) => {
		const isSearchable = e.get("realm_is_private");
		const realmName = e.get("realm_name");

		if (!realmName || typeof realmName !== "string") {
			alert("Failed to create realm");
			return;
		}

		axios.post("/api/realms", {
			body: {
				isSearchable: (isSearchable === null || isSearchable === "off") ? false : true,
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
		<form action={create}>
			<div className="flex flex-col">
				<label>Name:
					<input
						className="hover:brightness-90 dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="realm_name"
						required
						maxLength={16}
						placeholder="Name your realm..." /></label>
				<label>Is this realm private?
					<input
						name="realm_is_private"
						type="checkbox" /></label>
				<button
					className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit"
				>Submit</button>
			</div>
		</form>
	);
};

export default CreateRealmForm;
