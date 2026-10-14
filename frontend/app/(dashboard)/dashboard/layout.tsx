import { ReactNode } from "react";
import { ProtectedRoute } from "@/components/auth/ProtectedRoute";

export default function DashMainLayout({ children }: { children: ReactNode }) {
	return <ProtectedRoute>{children}</ProtectedRoute>;
}
