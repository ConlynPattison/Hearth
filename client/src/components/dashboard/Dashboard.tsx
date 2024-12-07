"use client"
import ChatRoomContainer from "./ChatRoomContainer";
import InboxesContainer from "./InboxesContainer";
import PersonalContainer from "./me/PersonalContainer";
import SideBar from "./side/SideBar";
import { RealmProvider } from "@/context/RealmContext";
import { RoomProvider } from "@/context/RoomContext";

interface DashboardProps {
	showDirectMessages: boolean;
}

const Dashboard = ({ showDirectMessages }: DashboardProps) => {

	return (
		<>
			{<RealmProvider>
				<div className="flex h-dvh">
					{/* Left edge nav bar */}
					<SideBar showDirectMessages={showDirectMessages} />
					<RoomProvider>
						{/* Outer container */}
						<div className="bg-red-600 w-[100%] overflow-y-auto h-[100%] sm:flex no-scrollbar">

							{/* Left middle inbox & rooms */}
							<div className="bg-slate-100 dark:bg-slate-800 sm:w-[240px] sm:h-[100%]">
								{showDirectMessages ?
									<PersonalContainer />
									:
									<InboxesContainer />
								}
							</div>

							{/* Right middle messages */}
							<div className="bg-slate-50 dark:bg-slate-750 w-[100%] h-[100%]">
								<ChatRoomContainer />
							</div>

							{/* Right edge profile info */}
							<div className="bg-slate-200 dark:bg-slate-900 sm:w-[300px] sm:h-[100%]">
							</div>
						</div>
					</RoomProvider>
				</div >
			</RealmProvider>}
		</>
	);
}

export default Dashboard;
