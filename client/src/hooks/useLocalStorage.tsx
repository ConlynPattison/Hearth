import { redirect } from "next/navigation";

const useLocalStorage = () => {
	// set local storage
	const setStorage = (key: string, value: string) => localStorage.setItem(key, value);

	// get from local storage
	const getStorage = (key: string) => localStorage.getItem(key);

	// remove from local storage
	const removeStorage = (key: string) => localStorage.removeItem(key);

	// get or redirect
	const getValidStorage = (key: string, redirectTo: string) => {
		const value = getStorage(key);

		if (!value) {
			redirect(redirectTo);
		}

		else {
			return value;
		}

	}
	return { setStorage, getStorage, removeStorage, getValidStorage }
}

export default useLocalStorage;
