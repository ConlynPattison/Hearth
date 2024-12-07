import RealmContext from "@/context/RealmContext";
import Image from "next/image";
import { useContext } from "react";
import CollapsableHeading from "../ui/CollapsableHeading";
import { ADMIN_LEVELS } from "@/util/auth";
import { FaCrown } from "react-icons/fa6";
import { UsersOnRealmsLevels } from "@prisma/client";

interface MembersListProps {
	displayName: string;
	avatarUrl: string;
	isOwner?: boolean;
}

const MembersListItem = ({ displayName, avatarUrl, isOwner = false }: MembersListProps) => {
	return (
		<div className={`group hover:dark:bg-slate-800 hover:bg-slate-300 hover:cursor-pointer rounded-md flex`}
			title={displayName}>
			<div className="z-10 p-1 flex h-[45px] my-1 flex-shrink flex-grow min-w-0 w-full"
			>
				<Image
					className="rounded-full max-h-[35px] min-w-[35px] my-auto"
					alt="Picture"
					src={avatarUrl || "/favicon\.ico"}
					width={35}
					height={35} />
				<div className="ml-1 overflow-x-hidden whitespace-nowrap text-ellipsis self-center">
					{displayName}
				</div>
				{isOwner &&
					<div className="self-center ml-1 p-1 dark:text-amber-400 text-amber-500"
						title="Realm Owner"
					>
						<FaCrown />
					</div>}
			</div>
		</div>
	);
}

const MembersList = () => {
	const [activeRealm] = useContext(RealmContext);

	if (activeRealm === null) return (<></>);

	return (
		<div className="px-2 w-[200px] mt-3">
			<CollapsableHeading heading="Admins">
				{activeRealm.UsersOnRealms
					.filter((userOnRealm) => (
						(ADMIN_LEVELS.includes(userOnRealm.memberLevel))
					)).map((userOnRealm) => (
						<MembersListItem
							key={userOnRealm.userOnRealmId}
							displayName={userOnRealm.user.displayName}
							avatarUrl={userOnRealm.user.avatarUrl}
							isOwner={userOnRealm.memberLevel === UsersOnRealmsLevels.OWNER} />
					))}
			</CollapsableHeading>
			<CollapsableHeading heading="Members">
				{activeRealm.UsersOnRealms
					.filter((userOnRealm) => (
						!(ADMIN_LEVELS.includes(userOnRealm.memberLevel))
					)).map((userOnRealm) => (
						<MembersListItem
							key={userOnRealm.userOnRealmId}
							displayName={userOnRealm.user.displayName}
							avatarUrl={userOnRealm.user.avatarUrl} />
					))}
			</CollapsableHeading>
		</div>
	);
}

export default MembersList;
