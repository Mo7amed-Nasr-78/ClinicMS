import type { ReactNode } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function ReportsLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate permissions={["doctors:report", "appointments:report", "patients:report"]}>
			{children}
		</PermissionGate>
	);
}
