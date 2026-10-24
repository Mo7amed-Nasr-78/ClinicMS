"use client";

import { useState, type ReactNode } from "react";
import { useParams } from "next/navigation";
import { useSession } from "next-auth/react";
import { AlertCircle, RefreshCw } from "lucide-react";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { usePatientDetails } from "@/api/hooks/Patients";
import { PatientProfile } from "@/components/patients/PatientProfile";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { hasPermission } from "@/lib/permissions";

export default function PatientDetailPage() {
	const params = useParams<{ patientId: string }>();
	const patientId = params.patientId;
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { data: session } = useSession();
	const patientQuery = usePatientDetails(patientId);
	const permissions = session?.user?.permissions;
	const canViewAppointments = hasPermission(
		permissions,
		"view:appointments",
	);
	const canViewMedicalRecords = hasPermission(
		permissions,
		"view:medical_records",
	);
	const canViewPrescriptions = hasPermission(
		permissions,
		"view:prescriptions",
	);

	if (patientQuery.isPending) {
		return (
			<DashboardShell
				sidebarOpen={sidebarOpen}
				onSidebarChange={setSidebarOpen}
			>
				<div className="flex min-h-80 items-center justify-center">
					<div
						className="size-8 animate-spin rounded-full border-2 border-line border-t-brand"
						role="status"
						aria-label="Loading patient"
					/>
				</div>
			</DashboardShell>
		);
	}

	if (patientQuery.isError || !patientQuery.data) {
		return (
			<DashboardShell
				sidebarOpen={sidebarOpen}
				onSidebarChange={setSidebarOpen}
			>
				<div className="mx-auto w-full max-w-5xl py-10">
					<div className="flex flex-col items-center border-y border-line px-5 py-14 text-center">
						<AlertCircle
							className="size-8 text-accent-strong"
							aria-hidden="true"
						/>
						<h1 className="mt-4 font-serif text-3xl text-ink">
							Could not load patient
						</h1>
						<p className="mt-2 max-w-md text-sm text-ink-muted">
							{getApiErrorMessage(
								patientQuery.error,
							)}
						</p>
						<Button
							type="button"
							size="sm"
							variant="outline"
							onClick={() =>
								void patientQuery.refetch()
							}
							className="mt-5"
						>
							<RefreshCw
								className="size-3.5"
								aria-hidden="true"
							/>
							Try again
						</Button>
					</div>
				</div>
			</DashboardShell>
		);
	}

	return (
		<DashboardShell
			sidebarOpen={sidebarOpen}
			onSidebarChange={setSidebarOpen}
		>
			<PatientProfile
				patient={patientQuery.data}
				canViewAppointments={canViewAppointments}
				canViewMedicalRecords={canViewMedicalRecords}
				canViewPrescriptions={canViewPrescriptions}
			/>
		</DashboardShell>
	);
}

function DashboardShell({
	children,
	sidebarOpen,
	onSidebarChange,
}: {
	children: ReactNode;
	sidebarOpen: boolean;
	onSidebarChange: (open: boolean) => void;
}) {
	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => onSidebarChange(false)}
				activeItem="Patients"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => onSidebarChange(true)}
					title="patient profile"
				/>
				{children}
			</div>
		</div>
	);
}
