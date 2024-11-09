import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";

interface PatchRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const CreateRealmForm = ({ dialog }: PatchRealmFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const create = async (e: FormData) => {
		const isPrivate = e.get("realm_is_private") || undefined;
		const realmName = e.get("realm_name");

		if (!realmName || typeof realmName !== "string") {
			alert("Failed to update realm");
			return;
		}

		axios.patch("/api/realms", {
			body: {
				isPrivate: isPrivate === undefined ? false : isPrivate as unknown as boolean,
				realmName
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
		<form action={create}>
			<div className="flex flex-col">
				<label>Name:
					<input
						name="realm_name"
						required
						maxLength={16}
						minLength={1}
						defaultValue={activeRealm?.realmName}
						placeholder="Rename your realm..." /></label>
				<label>Is this Realm Private?
					<input
						name="realm_is_private"
						defaultChecked={activeRealm?.isSearchable}
						type="checkbox" /></label>
				<button type="submit">Submit</button>
			</div>
		</form>
	);
};

export default CreateRealmForm;
