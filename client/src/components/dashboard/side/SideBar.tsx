import Realms from "./Realms";
import Profile from "./Profile";
import CreateRealm from "@/components/features/realms/CreateRealm/CreateRealm";
import Logout from "./Logout";

interface SideBarProps {
	showDirectMessages: boolean;
}

const SideBar = ({ showDirectMessages }: SideBarProps) => {
	return (
		<div className="flex flex-col dark:bg-slate-900 bg-slate-200 w-[100px]">
			<div className="h-[100%] overflow-y-scroll no-scrollbar flex flex-col">
				<Profile />
				{/* <div className="flex flex-col dark:bg-slate-800 bg-slate-50 py-3">
				<FaComments size="3em" className="self-center dark:text-slate-500 text-slate-700" />
			</div> */}
				<Realms selectedDMs={showDirectMessages}/>
				<CreateRealm />
			</div>
			<Logout />
		</div>

	)
}

export default SideBar;
