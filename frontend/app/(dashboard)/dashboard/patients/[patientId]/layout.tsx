import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReactNode } from "react";

export default function PatientDetailPage({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["view:patients:detail"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
