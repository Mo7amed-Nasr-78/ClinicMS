import type { ReactNode } from "react";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function ReportsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["doctors:report", "appointments:report", "patients:report"]}
			mode="any"
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
