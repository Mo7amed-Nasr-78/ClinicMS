import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReactNode } from "react";

export default function DoctorsPage({ children }: { children: ReactNode }) {
	return (
		<PermissionGate
			permissions={["view:doctors"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
