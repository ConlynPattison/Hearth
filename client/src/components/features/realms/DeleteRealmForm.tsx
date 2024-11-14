import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";

interface DeleteRealmFormProps {
	dialog: RefObject<HTMLDialogElement>
}

const DeleteRealmForm = ({ dialog }: DeleteRealmFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const deleteRealm = async (e: FormData) => {
		const realmName = e.get("realm_name");
		console.log(realmName, typeof realmName)

		if (!realmName || typeof realmName !== "string" || realmName !== activeRealm?.realmName) {
			alert("Failed to delete realm, check name spelling");
			return;
		}

		axios.delete(`/api/realms/${activeRealm?.realmId}`)
			.then(patch => {
				if (patch.status === 200) {
					alert("Realm successfully deleted!");
					mutate("/api/realms");
				}

				dialog.current?.close();
			}).catch(e => {
				console.error(e);
				alert("Failed to delete realm");
			});
	}

	return (
		<form action={deleteRealm}>
			<div className="flex flex-col">
				<hr />
				<p><strong>Warning: </strong>Deleting a realm removes it from Hearth entirely. To confirm, type the name of your realm below: </p>
				<label className=" self-center">Name:
					<input
						className="dark:bg-slate-600 bg-slate-200 ml-1 px-1 rounded-sm"
						name="realm_name"
						required
						maxLength={16}
						minLength={1}
						placeholder="Type name of realm..." /></label>
				<button
					className="dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit"
				>Delete</button>
			</div>
		</form>
	);
};

export default DeleteRealmForm;
