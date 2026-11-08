import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { ReactNode } from "react";

export default function VisitTypesRoute({ children }: { children: ReactNode }) {
	return (
		<PermissionGate
			permissions={["view:visit-types"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}
