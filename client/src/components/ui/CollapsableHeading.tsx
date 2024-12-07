import { ReactNode, useState } from "react";
import { FaAngleDown, FaAngleRight } from "react-icons/fa";

const CollapsableHeading = ({ heading, children }: { heading: string, children?: ReactNode }) => {
	const [showing, setShowing] = useState(true);

	return (
		<>
			<div
				className="hover:cursor-pointer hover:dark:brightness-90 w-full overflow-hidden flex mt-8"
				onClick={() => { setShowing(curr => !curr) }}
			>
				<div className="pr-1">
					{showing ? <FaAngleDown /> : <FaAngleRight />}
				</div>
				<div className="font-bold text-xs dark:text-slate-400 text-slate-500 overflow-hidden text-ellipsis whitespace-nowrap">
					{heading}
				</div>
			</div>
			{showing && children}
		</>
	);
}

export default CollapsableHeading;