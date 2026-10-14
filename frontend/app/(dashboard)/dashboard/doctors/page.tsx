import { ProtectedRoute } from "@/components/auth/ProtectedRoute";
import DoctorsPage from "@/components/dashboard/DoctorsPage";

export default async function DoctorsRoute() {
	return (
		<ProtectedRoute>
			<DoctorsPage />
		</ProtectedRoute>
	);
}
