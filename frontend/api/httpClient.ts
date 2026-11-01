import axios from "axios";
import { getSession } from "next-auth/react";

export const API_BASE_URL =
	process.env.NEXT_PUBLIC_API_URL ?? "http://localhost:3010";

export const httpClient = axios.create({
	baseURL: API_BASE_URL,
	withCredentials: true,
});

httpClient.interceptors.request.use(async (config) => {
	const session = await getSession();
	if (session?.accessToken) {
		config.headers.set(
			"Authorization",
			`Bearer ${session.accessToken}`,
		);
	}

	return config;
});
