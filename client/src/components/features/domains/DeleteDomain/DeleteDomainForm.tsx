import RealmContext from "@/context/RealmContext";
import axios from "axios";
import { RefObject, forwardRef, useContext } from "react";
import { mutate } from "swr";

interface DeleteDomainFormProps {
	dialog: RefObject<HTMLDialogElement>;
	domainName: string;
	domainId: number;
}

const DeleteDomainForm = forwardRef<HTMLFormElement, DeleteDomainFormProps>((
	{ dialog, domainName, domainId }: DeleteDomainFormProps, ref) => {
	const [activeRealm] = useContext(RealmContext);

	const deleteDomain = async () => {
		axios.delete(`/api/realms/${activeRealm?.realmId}/domains/${domainId}`)
			.then(patch => {
				if (patch.status === 200) {
					alert("Realm successfully deleted!");
					mutate(`/api/realms/${activeRealm?.realmId}/domains`);
				}

				dialog.current?.close();
			}).catch(e => {
				console.error(e);
				alert("Failed to delete realm");
			});
	}

	return (
		<form action={deleteDomain} ref={ref}>
			<div className="flex flex-col gap-2">
				<p><strong>Warning: </strong>Deleting a domain is a permanent action, are you sure you want to delete {domainName}?</p>
			</div>
		</form>
	);
});

DeleteDomainForm.displayName = "DeleteDomainForm";

export default DeleteDomainForm;
