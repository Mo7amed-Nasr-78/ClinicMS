import axios from "axios";
import { create } from "zustand";
import {
	getApiErrorMessage,
	getMyClinic,
	type ClinicUser,
	type MyClinic,
} from "@/api/services/clinicService";

type ClinicState = {
	clinic: MyClinic | null;
	user: ClinicUser | null;
	isLoading: boolean;
	error: string | null;
	fetchMyClinic: () => Promise<MyClinic | null>;
};

export const useClinicStore = create<ClinicState>((set) => ({
	clinic: null,
	user: null,
	isLoading: false,
	error: null,
	async fetchMyClinic() {
		set({ isLoading: true, error: null });

		try {
			const clinic = await getMyClinic();
			set({ clinic, user: clinic.user, isLoading: false });
			return clinic;
		} catch (error) {
			if (
				axios.isAxiosError(error) &&
				error.response?.status === 404
			) {
				set({ clinic: null, user: null, isLoading: false });
				return null;
			}

			set({
				isLoading: false,
				error: getApiErrorMessage(error),
			});
			throw error;
		}
	},
}));
