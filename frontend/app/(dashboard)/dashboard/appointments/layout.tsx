import type { ReactNode } from "react";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function AppointmentsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["view:appointments"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
