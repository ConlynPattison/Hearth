import Link from "next/link";
import { useRouter } from "next/navigation";
import { FaUsers } from "react-icons/fa6";

interface PersonalChatOpenerProps {
	selected: boolean;
}

const PersonalChatOpener = ({ selected }: PersonalChatOpenerProps) => {

	return (
		<Link href={"/dashboard/me"}>
			<div className={`flex flex-col py-3 hover:cursor-pointer ${selected ? "dark:bg-slate-800 bg-slate-100" : "hover:brightness-90 dark:bg-slate-900 bg-slate-200"}`}
				title="Open Direct Messages">
				<div className="self-center">
					<FaUsers
						className="dark:text-slate-500 text-slate-700"
						size="3em"
						style={{ fill: `${selected ? "url(#icon-gradient)" : ""}` }}
					/>
				</div>
				<span className="text-center self-center text-sm max-w-[85%] overflow-hidden text-ellipsis whitespace-nowrap">
					Direct Messages
				</span>
			</div>
		</Link>
	);
}

export default PersonalChatOpener;
