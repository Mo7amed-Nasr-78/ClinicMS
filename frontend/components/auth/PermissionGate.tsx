"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";

type PermissionGateProps = {
	permissions: readonly string[];
	mode?: "all" | "any";
	children: ReactNode;
};

export function PermissionGate({
	permissions,
	mode = "all",
	children,
}: PermissionGateProps) {
	const { data: session, status } = useSession();
	if (status !== "authenticated") return null;

	const allowed =
		mode === "any"
			? permissions.some((permission) =>
					hasPermission(
						session.user?.permissions,
						permission,
					),
				)
			: permissions.every((permission) =>
					hasPermission(
						session.user?.permissions,
						permission,
					),
				);

	return allowed ? children : null;
}
