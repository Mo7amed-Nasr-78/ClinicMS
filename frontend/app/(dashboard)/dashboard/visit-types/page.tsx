import { PermissionGate } from "@/components/auth/PermissionGate";
import VisitTypesPage from "@/components/visit-types/VisitTypesPage";

export default function VisitTypesRoute() {
	return (
		<PermissionGate permissions={["view:visit-types"]}>
			<VisitTypesPage />
		</PermissionGate>
	);
}
