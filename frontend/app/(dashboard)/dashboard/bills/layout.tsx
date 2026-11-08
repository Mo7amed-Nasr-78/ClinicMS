import type { ReactNode } from "react";
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function BillsLayout({ children }: { children: ReactNode }) {
	return (
		<PermissionGate
			permissions={["view:bills"]}
			fallback={<AccessDeniedPage />}
		>
			{children}
		</PermissionGate>
	);
}