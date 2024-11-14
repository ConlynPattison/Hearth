import Realms from "./Realms";
import Profile from "./Profile";
import CreateRealm from "@/components/features/realms/CreateRealm";
import Logout from "./Logout";

const SideBar = () => {
	return (
		<div className="h-[100%] dark:bg-slate-900 bg-slate-200 w-[100px] pt-3 overflow-y-scroll no-scrollbar">
			{/* Profile */}
			<Profile />
			{/* <div className="flex flex-col dark:bg-slate-800 bg-slate-50 py-3">
				<FaComments size="3em" className="self-center dark:text-slate-500 text-slate-700" />
			</div> */}
			<Realms />
			<CreateRealm />
			<Logout />
		</div>
	)
}

export default SideBar;
