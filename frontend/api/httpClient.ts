import axios from "axios";
import { useAccessTokenStore } from "@/stores/accessTokenStore";

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export const httpClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

httpClient.interceptors.request.use((config) => {
	const accessToken = useAccessTokenStore.getState().getAccessToken();
	if (accessToken) {
		config.headers.set("Authorization", `Bearer ${accessToken}`);
	}

	return config;
});
