import type { ReactNode } from "react";
import { redirect } from "next/navigation";

import { auth } from "@/auth";
import { RefreshSessionOnMount } from "./RefreshSessionOnMount";

export async function ProtectedRoute({ children }: { children: ReactNode }) {
	const session = await auth();

	if (!session?.user || session.error) {
		redirect("/login");
	}

	return (
		<RefreshSessionOnMount session={session}>
			{children}
		</RefreshSessionOnMount>
	);
}
