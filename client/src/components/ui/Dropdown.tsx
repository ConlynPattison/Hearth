import { CSSProperties, DetailedHTMLProps, LiHTMLAttributes, ReactNode, useCallback, useEffect, useMemo, useRef, useState } from "react";
import { FaBars, FaX } from "react-icons/fa6";

interface DropdownListItemProps {
	icon: ReactNode,
	children?: ReactNode,
	intrinsicProps?: DetailedHTMLProps<LiHTMLAttributes<HTMLLIElement>, HTMLLIElement>
}
const DropdownListItem = ({ icon, children, intrinsicProps }: DropdownListItemProps) => {
	return (
		<li className="bg-slate-200 dark:bg-slate-800 px-2 py-1 rounded-md hover:cursor-pointer hover:bg-slate-300 dark:hover:bg-slate-700 flex"
			{...intrinsicProps}
		>
			<div className="self-center pr-2">
				{icon}
			</div>
			<span>
				{children}
			</span>
		</li>
	);
}

interface DropdownListCategoryProps {
	children?: ReactNode
}
const DropdownListCategory = ({ children }: DropdownListCategoryProps) => {
	return (
		<ol className="flex flex-col gap-1 float-none">
			{children}
		</ol>
	)
}

const DropdownCategoryDivider = () => {
	return (
		<hr className="h-[1px] dark:bg-slate-600 bg-slate-400 border-0" />
	);
}

interface DropdownProps {
	useBars?: boolean,
	children?: ReactNode,
	openingNode?: ReactNode,
	onClose?: () => void,
	onOpen?: () => void,
}
const Dropdown = ({ useBars, children, openingNode, onClose, onOpen }: DropdownProps) => {
	const [isOpen, setIsOpen] = useState(false);
	const [x, setX] = useState(0);
	const [y, setY] = useState(0);
	const dropdownRef = useRef<HTMLDivElement>(null);
	const menuRef = useRef<HTMLDivElement>(null);

	const defaultPosition = useMemo(() => { return ({ top: 99999, left: 99999 }) }, []);
	const [position, setPosition] = useState<CSSProperties>(defaultPosition);

	const openMenu = () => {
		setIsOpen(true);
		if (onOpen) onOpen();
	}

	const closeMenu = useCallback(() => {
		setPosition(defaultPosition);
		setIsOpen(false);
		if (onClose) onClose();
	}, [onClose, defaultPosition]);

	const handleButtonClick = (e: React.MouseEvent<HTMLDivElement, MouseEvent>) => {
		e.stopPropagation();
		if (!isOpen) {
			setX(e.clientX);
			setY(e.clientY)
			openMenu();
			return;
		}
	}

	useEffect(() => {
		if (!dropdownRef.current) return;

		const handleDocClick = (e: MouseEvent) => {
			// if we have set the dom reference and if the clicked target Node is not a child of this reference => close
			if (dropdownRef.current && !dropdownRef.current.contains(e.target as Node)) {
				closeMenu();
			}
		}

		if (isOpen) {
			document.addEventListener("click", handleDocClick);
		} else {
			document.removeEventListener("click", handleDocClick);
		}

		return () => {
			document.removeEventListener("click", handleDocClick);
		}

	}, [dropdownRef, isOpen, closeMenu]);

	useEffect(() => {
		if (!isOpen || menuRef.current === null) return;
		// if the width of the container goes over the right edge, change to right-base
		const menuWidth = menuRef.current?.clientWidth;

		if (document.body.clientWidth - x < menuWidth) {
			setPosition({ top: y, right: document.body.clientWidth - x });
		} else {
			setPosition({ top: y, left: x });
		}
	}, [menuRef, isOpen, x, y]);

	return (
		<div className="flex-shrink-0" ref={dropdownRef}>
			{useBars ?
				<div className="w-fit bg-transparent rounded-md hover:cursor-pointer dark:hover:bg-slate-700 px-1 py-1"
					title="Open Menu"
					onClick={handleButtonClick}
				><FaBars /></div> :
				<div className="hover:cursor-pointer"
					title="Open Menu"
					onClick={handleButtonClick}
				>
					{openingNode}
				</div>}
			{isOpen && <div className={`${menuRef ?? "hidden"} dark:border-slate-600 border border-slate-300 bg-slate-200 dark:bg-slate-800 rounded-md px-1 py-1 flex flex-col gap-1 z-20 fixed shadow-lg`}
				ref={menuRef}
				style={position}>
				<button className="self-center ml-auto border-none hover:bg-slate-300 dark:hover:bg-slate-700 p-1 rounded-md"
					onClick={closeMenu}
					type="button"
					title="Close">
					<div className="flex items-center justify-center h-full">
						<FaX className="text-slate-500" />
					</div>
				</button>
				{children}
			</div>}
		</div>
	);
}

export { Dropdown, DropdownCategoryDivider, DropdownListCategory, DropdownListItem };
