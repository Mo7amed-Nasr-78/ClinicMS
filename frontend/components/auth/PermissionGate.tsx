"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";

type PermissionGateProps = {
	permissions: readonly string[];
	mode?: "all" | "any";
	children: ReactNode;
	fallback?: ReactNode;
};

export function PermissionGate({
	permissions,
	mode = "all",
	children,
	fallback = null,
}: PermissionGateProps) {
	const { data: session, status } = useSession();
	if (status !== "authenticated") return null;
	const userPermissions = session.user?.permissions;

	const allowed =
		mode === "any"
			? permissions.some((permission) =>
					hasPermission(userPermissions, permission),
				)
			: permissions.every((permission) =>
					hasPermission(userPermissions, permission),
				);

	return allowed ? children : fallback;
}
