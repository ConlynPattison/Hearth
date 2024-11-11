import { FaArrowRightFromBracket, FaComments } from "react-icons/fa6"
import Realms from "./Realms";
import Profile from "./Profile";
import CreateRealm from "@/components/features/realms/CreateRealm";

const SideBar = () => {
	return (
		<div className="h-[100%] dark:bg-slate-900 bg-slate-200 w-[100px] pt-3 overflow-y-scroll">
			{/* Profile */}
			<Profile />
			<div className="flex flex-col dark:bg-slate-800 bg-slate-50 py-3">
				<FaComments size="3em" className="self-center dark:text-slate-500 text-slate-700" />
			</div>
			<div className="flex flex-col dark:bg-slate-900 bg-slate-200 py-3">
				<a
					className="hover:cursor-pointer self-center"
					href="/api/auth/logout"
					title="Log out"
				><FaArrowRightFromBracket size="3em"
					className="bg-transparent dark:text-slate-500 text-slate-700" />
				</a>
			</div>
			<Realms />
			<CreateRealm />
		</div>
	)
}

export default SideBar;
