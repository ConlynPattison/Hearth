import PatchRealm from "../features/realms/PatchRealm/PatchRealm";
import Domains from "../features/domains/Domains";

const InboxesContainer = () => {
	return (
		<div className="flex flex-col h-[100%] sm:w-[240px]">
			<PatchRealm />
			<Domains />
		</div>
	);
}

export default InboxesContainer;
