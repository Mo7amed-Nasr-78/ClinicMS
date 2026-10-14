"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
	useAppointments,
	useCreateAppointment,
	useDeleteAppointment,
	useUpdateAppointment,
} from "@/api/hooks/Appointments";
import { useDoctors } from "@/api/hooks/Doctors";
import { usePatients } from "@/api/hooks/Patients";
import { getApiErrorMessage } from "@/api/services/clinicService";
import type {
	Appointment,
	CreateAppointmentPayload,
} from "@/api/services/appointmentsService";
import { AppointmentDialogs } from "@/components/appointments/AppointmentDialogs";
import { AppointmentsList } from "@/components/appointments/AppointmentsList";
import {
	emptyForm,
	toDateInput,
	toTimeInput,
	type AppointmentForm,
} from "@/components/appointments/appointment-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { hasPermission } from "@/lib/permissions";

export default function AppointmentsPage() {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { data: session, status: sessionStatus } = useSession();
	const canViewDoctors =
		sessionStatus === "authenticated" &&
		hasPermission(session.user?.permissions, "view:doctors");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [editingAppointment, setEditingAppointment] =
		useState<Appointment | null>(null);
	const [deletingAppointment, setDeletingAppointment] =
		useState<Appointment | null>(null);
	const [form, setForm] = useState<AppointmentForm>(emptyForm);
	const {
		appointments,
		pagination,
		loading: appointmentsLoading,
		error: appointmentsError,
		refetch: refetchAppointments,
	} = useAppointments(page);
	const {
		doctors,
		loading: doctorsLoading,
		error: doctorsError,
		refetch: refetchDoctors,
	} = useDoctors(1, 100, canViewDoctors);
	const {
		patients,
		loading: patientsLoading,
		error: patientsError,
		refetch: refetchPatients,
	} = usePatients(1, 100);
	const { mutate: createAppointment, isPending: isCreating } =
		useCreateAppointment();
	const { mutate: updateAppointment, isPending: isUpdating } =
		useUpdateAppointment();
	const { mutate: deleteAppointment, isPending: isDeleting } =
		useDeleteAppointment();
	useEffect(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get("action") !== "create") return;

		startTransition(() => {
			setEditingAppointment(null);
			setForm(emptyForm);
			setIsFormOpen(true);
		});
		url.searchParams.delete("action");
		router.replace(`${url.pathname}${url.search}${url.hash}`, {
			scroll: false,
		});
	}, [router]);
	const isSaving = isCreating || isUpdating;
	const loading =
		appointmentsLoading ||
		(canViewDoctors && doctorsLoading) ||
		patientsLoading;
	const error =
		appointmentsError ??
		(canViewDoctors ? doctorsError : null) ??
		patientsError;

	const closeForm = () => {
		setIsFormOpen(false);
		setEditingAppointment(null);
		setForm(emptyForm);
	};

	const openCreateForm = () => {
		setEditingAppointment(null);
		setForm(emptyForm);
		setIsFormOpen(true);
	};

	const openEditForm = (appointment: Appointment) => {
		setEditingAppointment(appointment);
		setIsFormOpen(true);
		setForm({
			doctorId: appointment.doctorId,
			patientId: appointment.patientId,
			appointmentDate: toDateInput(appointment.appointmentDate),
			startTime: toTimeInput(appointment.startTime),
			endTime: toTimeInput(appointment.endTime),
			status: appointment.status,
			reason: appointment.reason,
			notes: appointment.notes,
		});
	};

	const updateForm = (field: keyof AppointmentForm, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (doctorsLoading || patientsLoading) {
			toast.error(
				"Wait for doctors and patients to finish loading.",
			);
			return;
		}
		if (
			!form.doctorId ||
			!form.patientId ||
			!form.appointmentDate ||
			!form.startTime ||
			!form.endTime ||
			!form.status ||
			!form.reason.trim() ||
			!form.notes.trim()
		) {
			toast.error("Complete all required appointment fields.");
			return;
		}

		const startTimeParts = form.startTime.split(":").map(Number);
		const endTimeParts = form.endTime.split(":").map(Number);
		const startMinutes = startTimeParts[0] * 60 + startTimeParts[1];
		const endMinutes = endTimeParts[0] * 60 + endTimeParts[1];
		const durationMinutes =
			(endMinutes - startMinutes + 24 * 60) % (24 * 60);
		if (
			!/^\d{2}:\d{2}$/.test(form.startTime) ||
			!/^\d{2}:\d{2}$/.test(form.endTime) ||
			durationMinutes === 0
		) {
			toast.error("End time must be after start time.");
			return;
		}

		const payload: CreateAppointmentPayload = {
			doctorId: form.doctorId,
			patientId: form.patientId,
			appointmentDate: form.appointmentDate,
			startTime: form.startTime,
			endTime: form.endTime,
			status: form.status,
			reason: form.reason.trim(),
			notes: form.notes.trim(),
		};
		const mutationOptions = {
			onSuccess: () => {
				closeForm();
				toast.success(
					editingAppointment
						? "Appointment updated successfully."
						: "Appointment created successfully.",
				);
			},
			onError: (mutationError: Error) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		};

		if (editingAppointment) {
			updateAppointment(
				{ appointmentId: editingAppointment.id, payload },
				mutationOptions,
			);
			return;
		}

		createAppointment(payload, mutationOptions);
	};

	const confirmDelete = () => {
		if (!deletingAppointment) return;
		deleteAppointment(deletingAppointment.id, {
			onSuccess: () => {
				setDeletingAppointment(null);
				if (appointments.length === 1 && page > 1) {
					setPage((current) => Math.max(1, current - 1));
				}
				toast.success("Appointment deleted successfully.");
			},
			onError: (mutationError) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		});
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Appointments"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} />
				<AppointmentsList
					appointments={appointments}
					pagination={pagination}
					page={page}
					onPageChange={setPage}
					loading={loading}
					error={error}
					onRetry={() => {
						void refetchAppointments();
						if (canViewDoctors) void refetchDoctors();
						void refetchPatients();
					}}
					onCreate={openCreateForm}
					onEdit={openEditForm}
					onDelete={setDeletingAppointment}
					isDeleting={isDeleting}
				/>
			</div>
			<AppointmentDialogs
				formOpen={isFormOpen}
				editingAppointment={editingAppointment}
				form={form}
				doctors={doctors}
				patients={patients}
				isSaving={isSaving}
				onFormOpenChange={(open) => {
					if (open) setIsFormOpen(true);
					else closeForm();
				}}
				onFormChange={updateForm}
				onSubmit={handleSubmit}
				deletingAppointment={deletingAppointment}
				isDeleting={isDeleting}
				onDeleteOpenChange={(open) => {
					if (!open) setDeletingAppointment(null);
				}}
				onDelete={confirmDelete}
			/>
		</div>
	);
}
