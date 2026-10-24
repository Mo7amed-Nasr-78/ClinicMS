import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import ReceptionistsPage from "@/components/dashboard/ReceptionistsPage";

export default async function ReceptionistsRoute() {
	return (
		<ProtectedRoute>
			<ReceptionistsPage />
		</ProtectedRoute>
	);
}
