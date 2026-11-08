import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReactNode } from "react";

export default function RegisterPatientPage({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["create:patients"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
