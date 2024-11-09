import { FaArrowRightFromBracket, FaComments } from "react-icons/fa6"
import Realms from "./Realms";
import Profile from "./Profile";
import CreateRealm from "@/components/features/realms/CreateRealm";

const SideBar = () => {
	return (
		<div className="h-[100%] bg-slate-900 w-[100px] pt-3 overflow-y-scroll">
			{/* Profile */}
			<Profile />
			<div className="flex flex-col bg-slate-800 py-3">
				<FaComments size="3em" className="self-center text-slate-500" />
			</div>
			<div className="flex flex-col bg-slate-900 py-3">
				<a
					className="hover:cursor-pointer self-center"
					href="/api/auth/logout"
					title="Log out"
				><FaArrowRightFromBracket size="3em"
					className="bg-transparent text-slate-500" />
				</a>
			</div>
			<Realms />
			<CreateRealm />
		</div>
	)
}

export default SideBar;
