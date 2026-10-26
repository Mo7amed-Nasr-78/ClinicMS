"use client";

import type { ReactNode } from "react";
import { useSession } from "next-auth/react";
import { hasPermission } from "@/lib/permissions";
import { useClinicStore } from "@/stores/clinicStore";

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
	const clinicPermissions = useClinicStore(
		(state) => state.user?.permissions,
	);
	if (status !== "authenticated") return null;
	const userPermissions =
		session.user?.permissions?.length
			? session.user.permissions
			: clinicPermissions;

	const allowed =
		mode === "any"
			? permissions.some((permission) =>
					hasPermission(userPermissions, permission),
				)
			: permissions.every((permission) =>
					hasPermission(userPermissions, permission),
				);

	return allowed ? children : null;
}
