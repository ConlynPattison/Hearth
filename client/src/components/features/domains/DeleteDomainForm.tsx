import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, useContext } from "react";
import { mutate } from "swr";

interface DeleteDomainFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domainName: string;
	domainId: number;
}

const DeleteDomainForm = ({ dialog, domainName, domainId }: DeleteDomainFormProps) => {
	const [activeRealm] = useContext(RealmContext);

	const deleteDomain = async () => {

		axios.delete(`/api/realms/${activeRealm?.realmId}/domains/${domainId}`)
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
		<form action={deleteDomain}>
			<div className="flex flex-col">
				<hr />
				<p><strong>Warning: </strong>Deleting a domain is a permanent action, are you sure you want to delete {domainName}?</p>
				<button
					className="dark:bg-red-900 dark:color-by-mode text-red-800 bg-slate-200 rounded-md w-fit px-2 py-1 mt-2 self-center"
					type="submit"
				>Delete</button>
			</div>
		</form>
	);
};

export default DeleteDomainForm;
