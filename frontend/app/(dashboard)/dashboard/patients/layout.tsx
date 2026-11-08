import type { ReactNode } from "react";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function PatientsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["view:patients"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}