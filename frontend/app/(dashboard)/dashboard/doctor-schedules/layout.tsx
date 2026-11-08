import type { ReactNode } from "react";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function DoctorSchedulesLayout({
	children,
}: {
	children: ReactNode;
}) {
	return (
		<PermissionGate
			permissions={["view:doctor-schedules"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
