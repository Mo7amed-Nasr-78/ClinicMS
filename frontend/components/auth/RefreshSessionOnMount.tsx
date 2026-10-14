"use client";

import { useEffect, useRef, type ReactNode } from "react";
import { SessionProvider, signOut, useSession } from "next-auth/react";
import type { Session } from "next-auth";
import { useClinicStore } from "@/stores/clinicStore";

function RefreshSession({ children }: { children: ReactNode }) {
	const { status, update } = useSession();
	const fetchMyClinic = useClinicStore((state) => state.fetchMyClinic);
	const refreshStarted = useRef(false);

	useEffect(() => {
		if (status === "loading" || refreshStarted.current) return;
		refreshStarted.current = true;

		if (status === "unauthenticated") {
			void signOut({ redirectTo: "/login" });
			return;
		}

		void update()
			.then(async (session) => {
				if (!session?.accessToken || session.error) {
					void signOut({ redirectTo: "/login" });
					return;
				}

				try {
					await fetchMyClinic();
				} catch {
					// Clinic loading should not invalidate a refreshed session.
				}
			})
			.catch(() => signOut({ redirectTo: "/login" }));
	}, [fetchMyClinic, status, update]);

	return children;
}

export function RefreshSessionOnMount({
	children,
	session,
}: {
	children: ReactNode;
	session: Session;
}) {
	return (
		<SessionProvider session={session}>
			<RefreshSession>{children}</RefreshSession>
		</SessionProvider>
	);
}
