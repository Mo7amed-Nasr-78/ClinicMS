import { create } from "zustand";

const ACCESS_TOKEN_TTL_MS = 15 * 60 * 1000;

type AccessTokenState = {
	accessToken: string | null;
	expiresAt: number;
	setAccessToken: (accessToken: string) => void;
	getAccessToken: () => string | null;
	clearAccessToken: () => void;
};

export const useAccessTokenStore = create<AccessTokenState>((set, get) => ({
	accessToken: null,
	expiresAt: 0,
	setAccessToken(accessToken) {
		set({
			accessToken,
			expiresAt: Date.now() + ACCESS_TOKEN_TTL_MS,
		});
	},
	getAccessToken() {
		const { accessToken, expiresAt } = get();
		if (!accessToken || Date.now() >= expiresAt) {
			set({ accessToken: null, expiresAt: 0 });
			return null;
		}
		return accessToken;
	},
	clearAccessToken() {
		set({ accessToken: null, expiresAt: 0 });
	},
}));
