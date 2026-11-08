import { PermissionGate } from "@/components/auth/PermissionGate"
import { AccessDeniedPage } from "@/components/auth/AccessDeniedPage"
import { ReactNode } from "react"

export default function ReceptionistsRoute({ children }: { children: ReactNode }) {
    return (
        <PermissionGate
            permissions={["view:receptionists"]}
            fallback={<AccessDeniedPage />}
        >
            {children}
        </PermissionGate>
    )
}