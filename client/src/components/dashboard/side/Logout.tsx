import { FaArrowRightFromBracket } from "react-icons/fa6"

const Logout = () => {
	return (
		<div className="flex flex-col dark:bg-slate-900 bg-slate-200 py-3">
			<a
				className="hover:cursor-pointer self-center"
				href="/api/auth/logout"
				title="Log out"
			><FaArrowRightFromBracket size="2.5em"
				className="bg-transparent dark:text-slate-500 text-slate-700" />
			</a>
		</div>
	);
}

export default Logout;
