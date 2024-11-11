import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";

interface PatchRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const PatchRealmForm = ({ dialog }: PatchRealmFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const patch = async (e: FormData) => {
		const isSearchable = e.get("realm_is_private");
		const realmName = e.get("realm_name");

		if (!realmName || typeof realmName !== "string") {
			alert("Failed to update realm");
			return;
		}

		axios.patch("/api/realms", {
			body: {
				isSearchable: (isSearchable === null || isSearchable === "off") ? false : true,
				realmName,
				realmId: activeRealm?.realmId
			},
		}).then(patch => {
			if (patch.status === 200) {
				alert("Realm successfully updated!");
				mutate("/api/realms");
			}

			dialog.current?.close();
		}).catch(e => {
			console.error(e);
			alert("Failed to update realm, invalid arguments provided.");
		});
	}

	return (
		<form action={patch}>
			<div className="flex flex-col">
				<label>Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="realm_name"
						required
						maxLength={16}
						minLength={1}
						defaultValue={activeRealm?.realmName}
						placeholder="Rename your realm..." /></label>
				<label>Is this realm private?
					<input
						name="realm_is_private"
						defaultChecked={activeRealm?.isSearchable}
						type="checkbox" /></label>
				<button
					className="hover:brightness-90 dark:bg-green-900 dark:color-by-mode text-green-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit">Submit</button>
			</div>
		</form>
	);
};

export default PatchRealmForm;
