"use client";

import { startTransition, useEffect, useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { useRouter } from "next/navigation";
import {
	CalendarDays,
	ChevronLeft,
	ChevronRight,
	LoaderCircle,
	Plus,
	RefreshCw,
	Search,
	X,
} from "lucide-react";
import { toast } from "sonner";
import {
	useCreatePatient,
	useDeletePatient,
	usePatients,
	useUpdatePatient,
} from "@/api/hooks/Patients";
import { useCreateAppointment } from "@/api/hooks/Appointments";
import { useDoctorOptions } from "@/api/hooks/Doctors";
import { useVisitTypes } from "@/api/hooks/VisitTypes";
import { patientSchema } from "@/api/schemas/patientSchema";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { getDoctorAvailability } from "@/api/services/doctorsService";
import {
	getDoctorSchedulesForDoctor,
	type DoctorSchedule,
} from "@/api/services/doctorScheduleService";
import type { Patient } from "@/api/services/patientService";
import { PatientField } from "@/components/patients/PatientField";
import { PatientTable } from "@/components/patients/PatientTable";
import {
	defaultPatientAppointmentForm as defaultAppointmentForm,
	defaultPatientForm,
	displayName,
	doctorOptionLabel,
	type PatientAppointmentForm as AppointmentForm,
	type PatientForm,
	type PatientFormErrors,
} from "@/components/patients/patient-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
	Popover,
	PopoverContent,
	PopoverTrigger,
} from "@/components/ui/popover";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { PermissionGate } from "@/components/auth/PermissionGate";

export default function Patients() {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [selectedPatient, setSelectedPatient] = useState<Patient | null>(
		null,
	);
	const [patientToDelete, setPatientToDelete] = useState<Patient | null>(
		null,
	);
	const [patientForAppointment, setPatientForAppointment] =
		useState<Patient | null>(null);
	const [appointmentForm, setAppointmentForm] = useState<AppointmentForm>(
		defaultAppointmentForm,
	);
	const [appointmentCalendarOpen, setAppointmentCalendarOpen] =
		useState(false);
	const [form, setForm] = useState<PatientForm>(defaultPatientForm);
	const [formErrors, setFormErrors] = useState<PatientFormErrors>({});
	const [page, setPage] = useState(1);
	const [search, setSearch] = useState("");
	const [status, setStatus] = useState("all");
	const { patients, pagination, loading, error, refetch } =
		usePatients(page);
	const { mutate: submitPatient, isPending: isCreating } =
		useCreatePatient();
	const { mutate: updatePatient, isPending: isUpdating } =
		useUpdatePatient();
	const { mutate: deletePatient, isPending: isDeleting } =
		useDeletePatient();
	const {
		doctors,
		loading: loadingDoctors,
		error: doctorsError,
	} = useDoctorOptions();
	const { mutate: submitAppointment, isPending: isCreatingAppointment } =
		useCreateAppointment();
	const {
		visitTypes,
		loading: loadingVisitTypes,
		error: visitTypesError,
	} = useVisitTypes(patientForAppointment !== null);
	const activeVisitTypes = visitTypes.filter(
		(visitType) => visitType.isActive,
	);
	const schedulesQuery = useQuery({
		queryKey: ["doctor-schedules", appointmentForm.doctorId],
		queryFn: ({ signal }) =>
			getDoctorSchedulesForDoctor(appointmentForm.doctorId, signal),
		enabled:
			patientForAppointment !== null &&
			Boolean(appointmentForm.doctorId),
	});
	const schedules = schedulesQuery.data ?? [];
	const isDateScheduled = (dateValue: string) => {
		if (!/^\d{4}-\d{2}-\d{2}$/.test(dateValue)) return false;
		const [year, month, day] = dateValue.split("-").map(Number);
		const dayOfWeek = new Date(
			Date.UTC(year, month - 1, day),
		).getUTCDay();

		return schedules.some((schedule: DoctorSchedule) => {
			const effectiveFrom = schedule.effectiveFrom.slice(0, 10);
			const effectiveTo = schedule.effectiveTo.slice(0, 10);
			return (
				schedule.isAvailable &&
				schedule.isActive &&
				schedule.dayOfWeek === dayOfWeek &&
				dateValue >= effectiveFrom &&
				dateValue <= effectiveTo
			);
		});
	};
	const availabilityQuery = useQuery({
		queryKey: [
			"doctor-availability",
			appointmentForm.doctorId,
			appointmentForm.appointmentDate,
		],
		queryFn: ({ signal }) =>
			getDoctorAvailability(
				appointmentForm.doctorId,
				appointmentForm.appointmentDate,
				signal,
			),
		enabled:
			patientForAppointment !== null &&
			Boolean(appointmentForm.doctorId) &&
			Boolean(appointmentForm.appointmentDate) &&
			schedulesQuery.isSuccess &&
			isDateScheduled(appointmentForm.appointmentDate),
	});
	const availableSlots = availabilityQuery.data?.slots ?? [];
	const selectedSlot =
		appointmentForm.startTime && appointmentForm.endTime
			? `${appointmentForm.startTime}|${appointmentForm.endTime}`
			: "";
	useEffect(() => {
		const url = new URL(window.location.href);
		if (url.searchParams.get("action") !== "create") return;

		startTransition(() => {
			setSelectedPatient(null);
			setForm(defaultPatientForm);
			setFormErrors({});
			setIsCreateOpen(true);
		});
		url.searchParams.delete("action");
		router.replace(`${url.pathname}${url.search}${url.hash}`, {
			scroll: false,
		});
	}, [router]);
	const activeDoctors = doctors.filter(
		(doctor) => doctor.status?.toLowerCase() !== "inactive",
	);
	const isSaving = isCreating || isUpdating;
	const normalizedSearch = search.trim().toLowerCase();
	const visiblePatients = patients.filter((patient) => {
		const matchesSearch = [
			displayName(patient.firstName, patient.lastName),
			patient.email,
			patient.phone,
			patient.id,
		]
			.join(" ")
			.toLowerCase()
			.includes(normalizedSearch);

		return (
			matchesSearch &&
			(status === "all" || patient.status === status)
		);
	});

	const handlePatientChange =
		(field: keyof PatientForm) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setForm((current) => ({
				...current,
				[field]: event.target.value,
			}));
			setFormErrors((current) => ({
				...current,
				[field]: undefined,
			}));
		};

	const openEditPatient = (patient: Patient) => {
		setSelectedPatient(patient);
		setForm({
			firstName: patient.firstName,
			lastName: patient.lastName,
			dateOfBirth: patient.dateOfBirth,
			gender: patient.gender,
			bloodType: patient.bloodType,
			phone: patient.phone,
			email: patient.email,
			address: patient.address,
			emergencyContact: patient.emergencyContact,
			allergies: patient.allergies,
		});
		setFormErrors({});
		setIsCreateOpen(true);
	};

	const closePatientForm = () => {
		setIsCreateOpen(false);
		setSelectedPatient(null);
		setForm(defaultPatientForm);
		setFormErrors({});
	};

	const closeAppointmentDialog = () => {
		setPatientForAppointment(null);
		setAppointmentForm(defaultAppointmentForm);
		setAppointmentCalendarOpen(false);
	};

	const openAppointmentDialog = (patient: Patient) => {
		setPatientForAppointment(patient);
		setAppointmentForm(defaultAppointmentForm);
		setAppointmentCalendarOpen(false);
	};

	const formatSlotTime = (value: string) => {
		const [hourText, minute] = value.split(":");
		const hour = Number(hourText);
		return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
	};

	const handleAppointmentSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!patientForAppointment) return;

		if (
			!appointmentForm.doctorId ||
			!appointmentForm.visitTypeId ||
			!appointmentForm.appointmentDate ||
			!appointmentForm.startTime ||
			!appointmentForm.endTime ||
			!appointmentForm.reason.trim() ||
			!appointmentForm.notes.trim()
		) {
			toast.error("Complete all required appointment fields.");
			return;
		}

		if (
			!schedulesQuery.isSuccess ||
			!isDateScheduled(appointmentForm.appointmentDate) ||
			!availableSlots.some(
				(slot) =>
					slot.startTime === appointmentForm.startTime &&
					slot.endTime === appointmentForm.endTime,
			)
		) {
			toast.error("Select an available time slot.");
			return;
		}

		const startTimeParts = appointmentForm.startTime
			.split(":")
			.map(Number);
		const endTimeParts = appointmentForm.endTime.split(":").map(Number);
		const startMinutes = startTimeParts[0] * 60 + startTimeParts[1];
		const endMinutes = endTimeParts[0] * 60 + endTimeParts[1];
		if (
			!/^\d{2}:\d{2}$/.test(appointmentForm.startTime) ||
			!/^\d{2}:\d{2}$/.test(appointmentForm.endTime) ||
			endMinutes <= startMinutes
		) {
			toast.error("End time must be after start time.");
			return;
		}

		submitAppointment(
			{
				doctorId: appointmentForm.doctorId,
				patientId: patientForAppointment.id,
				visitTypeId: appointmentForm.visitTypeId,
				appointmentDate: appointmentForm.appointmentDate,
				startTime: appointmentForm.startTime,
				endTime: appointmentForm.endTime,
				status: appointmentForm.status,
				reason: appointmentForm.reason.trim(),
				notes: appointmentForm.notes.trim(),
			},
			{
				onSuccess: () => {
					closeAppointmentDialog();
					toast.success(
						"Appointment created successfully.",
					);
				},
				onError: (mutationError) => {
					toast.error(getApiErrorMessage(mutationError));
				},
			},
		);
	};

	const handleCreatePatient = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const result = patientSchema.safeParse(form);
		if (!result.success) {
			const nextErrors: PatientFormErrors = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0];
				if (
					typeof field === "string" &&
					!nextErrors[field as keyof PatientForm]
				) {
					nextErrors[field as keyof PatientForm] =
						issue.message;
				}
			}
			setFormErrors(nextErrors);
			return;
		}

		const onSuccess = () => {
			closePatientForm();
			if (!selectedPatient) {
				setPage(1);
				setSearch("");
				setStatus("all");
			}
			toast.success(
				selectedPatient
					? "Patient updated successfully."
					: "Patient added successfully.",
			);
		};
		const onError = (mutationError: Error) => {
			toast.error(getApiErrorMessage(mutationError));
		};

		if (selectedPatient) {
			updatePatient(
				{ patientId: selectedPatient.id, payload: result.data },
				{ onSuccess, onError },
			);
			return;
		}

		submitPatient(result.data, {
			onSuccess,
			onError,
		});
	};

	const confirmDeletePatient = () => {
		if (!patientToDelete) return;

		deletePatient(patientToDelete.id, {
			onSuccess: () => {
				setPatientToDelete(null);
				if (patients.length === 1 && page > 1) {
					setPage((current) => Math.max(1, current - 1));
				}
				toast.success("Patient deleted successfully.");
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
				activeItem="Patients"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Patients"
				/>
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="mt-2 text-sm text-ink-muted">
								{pagination.total} registered{" "}
								{pagination.total === 1
									? "patient"
									: "patients"}
							</p>
						</div>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center ml-auto">
							<div className="relative w-full sm:w-72">
								<Search
									className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
									aria-hidden="true"
								/>
								<Input
									aria-label="Search patients"
									className="pl-9 pr-9"
									value={search}
									onChange={(event) =>
										setSearch(
											event.target
												.value,
										)
									}
									placeholder="Search patients"
								/>
								{search && (
									<Button
										type="button"
										variant="ghost"
										size="icon-sm"
										className="absolute right-1 top-1/2 -translate-y-1/2"
										aria-label="Clear search"
										onClick={() =>
											setSearch("")
										}
									>
										<X aria-hidden="true" />
									</Button>
								)}
							</div>
							<Select
								value={status}
								onValueChange={setStatus}
							>
								<SelectTrigger
									aria-label="Filter patients by status"
									className="w-full sm:w-44"
								>
									<SelectValue placeholder="Filter by status" />
								</SelectTrigger>
								<SelectContent>
									<SelectItem value="all">
										All statuses
									</SelectItem>
									<SelectItem value="upcoming">
										Upcoming
									</SelectItem>
									<SelectItem value="active">
										Active
									</SelectItem>
									<SelectItem value="inactive">
										Inactive
									</SelectItem>
								</SelectContent>
							</Select>
							<PermissionGate
								permissions={[
									"create:patients",
								]}
							>
								<Button
									type="button"
									onClick={() => {
										setSelectedPatient(
											null,
										);
										setForm(
											defaultPatientForm,
										);
										setFormErrors({});
										setIsCreateOpen(
											true,
										);
									}}
								>
									<Plus aria-hidden="true" />
									Add patient
								</Button>
							</PermissionGate>
						</div>
					</header>

					{loading ? (
						<div
							className="flex min-h-56 items-center justify-center"
							role="status"
							aria-label="Loading patients"
						>
							<LoaderCircle
								className="size-7 animate-spin text-brand"
								aria-hidden="true"
							/>
						</div>
					) : error ? (
						<div className="flex flex-col items-center px-5 py-16 text-center">
							<p className="text-sm font-medium text-ink">
								Couldn&apos;t load patient
								records
							</p>
							<p className="mt-1 max-w-md text-sm text-ink-muted">
								{error}
							</p>
							<Button
								className="mt-4"
								onClick={() => void refetch()}
								variant="outline"
							>
								<RefreshCw
									size={15}
									aria-hidden="true"
								/>
								Try again
							</Button>
						</div>
					) : (
						<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
							<PatientTable
								patients={visiblePatients}
								onEdit={openEditPatient}
								onDelete={setPatientToDelete}
								onSchedule={
									openAppointmentDialog
								}
								isDeleting={isDeleting}
								isCreatingAppointment={
									isCreatingAppointment
								}
								emptyState={
									<div>
										<p className="font-medium text-ink">
											{patients.length ===
											0
												? "No patient records yet"
												: "No matching patients"}
										</p>
										<p className="mt-1 text-sm text-ink-muted">
											{patients.length ===
											0
												? "Patients registered with your clinic will appear here."
												: "Try another name, email, phone number, or status."}
										</p>
									</div>
								}
							/>
							{pagination.totalPages > 1 && (
								<div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
									<p
										className="text-sm text-ink-muted"
										aria-live="polite"
									>
										Page{" "}
										{pagination.page} of{" "}
										{
											pagination.totalPages
										}
									</p>
									<div className="flex gap-2">
										<Button
											type="button"
											variant="outline"
											size="icon"
											aria-label="Previous page"
											disabled={
												page <=
												1
											}
											onClick={() =>
												setPage(
													(
														current,
													) =>
														Math.max(
															1,
															current -
																1,
														),
												)
											}
										>
											<ChevronLeft aria-hidden="true" />
										</Button>
										<Button
											type="button"
											variant="outline"
											size="icon"
											aria-label="Next page"
											disabled={
												page >=
												pagination.totalPages
											}
											onClick={() =>
												setPage(
													(
														current,
													) =>
														Math.min(
															pagination.totalPages,
															current +
																1,
														),
												)
											}
										>
											<ChevronRight aria-hidden="true" />
										</Button>
									</div>
								</div>
							)}
						</section>
					)}
				</main>
			</div>

			<Dialog
				open={isCreateOpen}
				onOpenChange={(open) => {
					if (!open) {
						closePatientForm();
					} else {
						setIsCreateOpen(true);
					}
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-semibold text-ink">
							{selectedPatient
								? "Edit patient"
								: "Add a patient"}
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-muted">
							{selectedPatient
								? "Update the patient's personal and contact details. "
								: "Enter the patient's personal and contact details. "}{" "}
							<span className="text-accent-strong">
								*
							</span>{" "}
							Required fields.
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col overflow-hidden"
						onSubmit={handleCreatePatient}
						noValidate
					>
						<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
							<section className="space-y-3">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
									Personal details
								</h2>
								<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
									<PatientField
										id="patient-first-name"
										label="First name"
										value={
											form.firstName
										}
										onChange={handlePatientChange(
											"firstName",
										)}
										error={
											formErrors.firstName
										}
										required
										placeholder="e.g. Nasr"
									/>
									<PatientField
										id="patient-last-name"
										label="Last name"
										value={
											form.lastName
										}
										onChange={handlePatientChange(
											"lastName",
										)}
										error={
											formErrors.lastName
										}
										required
										placeholder="e.g. One"
									/>
									<PatientField
										id="patient-date-of-birth"
										label="Date of birth"
										type="date"
										value={
											form.dateOfBirth
										}
										onChange={handlePatientChange(
											"dateOfBirth",
										)}
										error={
											formErrors.dateOfBirth
										}
										required
									/>
									<div className="space-y-1.5">
										<Label
											htmlFor="patient-gender"
											className="text-sm font-medium text-ink"
										>
											Gender{" "}
											<span
												className="text-accent-strong"
												aria-hidden="true"
											>
												*
											</span>
										</Label>
										<Select
											value={
												form.gender
											}
											onValueChange={(
												value,
											) => {
												setForm(
													(
														current,
													) => ({
														...current,
														gender: value,
													}),
												);
												setFormErrors(
													(
														current,
													) => ({
														...current,
														gender: undefined,
													}),
												);
											}}
										>
											<SelectTrigger
												id="patient-gender"
												aria-label="Gender"
												aria-invalid={Boolean(
													formErrors.gender,
												)}
												className="w-full"
											>
												<SelectValue placeholder="Select gender" />
											</SelectTrigger>
											<SelectContent>
												<SelectItem value="male">
													Male
												</SelectItem>
												<SelectItem value="female">
													Female
												</SelectItem>
											</SelectContent>
										</Select>
										{formErrors.gender && (
											<p
												role="alert"
												className="text-xs text-accent-strong"
											>
												{
													formErrors.gender
												}
											</p>
										)}
									</div>
									<PatientField
										id="patient-blood-type"
										label="Blood type"
										value={
											form.bloodType
										}
										onChange={handlePatientChange(
											"bloodType",
										)}
										error={
											formErrors.bloodType
										}
										required
										placeholder="e.g. AB+"
									/>
								</div>
							</section>
							<section className="space-y-3 border-t border-line pt-5">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
									Contact details
								</h2>
								<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
									<PatientField
										id="patient-phone"
										label="Phone"
										type="tel"
										value={form.phone}
										onChange={handlePatientChange(
											"phone",
										)}
										error={
											formErrors.phone
										}
										required
										placeholder="01229301343"
									/>
									<PatientField
										id="patient-email"
										label="Email"
										type="email"
										value={form.email}
										onChange={handlePatientChange(
											"email",
										)}
										error={
											formErrors.email
										}
										required
										placeholder="name@example.com"
									/>
									<PatientField
										id="patient-address"
										label="Address"
										value={form.address}
										onChange={handlePatientChange(
											"address",
										)}
										placeholder="Optional"
									/>
									<PatientField
										id="patient-emergency-contact"
										label="Emergency contact"
										value={
											form.emergencyContact
										}
										onChange={handlePatientChange(
											"emergencyContact",
										)}
										placeholder="Optional"
									/>
									<PatientField
										id="patient-allergies"
										label="Allergies"
										value={
											form.allergies
										}
										onChange={handlePatientChange(
											"allergies",
										)}
										placeholder="Optional"
									/>
								</div>
							</section>
						</div>
						<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
							<Button
								type="button"
								variant="ghost"
								onClick={() =>
									setIsCreateOpen(false)
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving}
							>
								{isSaving
									? selectedPatient
										? "Saving..."
										: "Adding..."
									: selectedPatient
										? "Save changes"
										: "Add patient"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={patientToDelete !== null}
				onOpenChange={(open) => {
					if (!open && !isDeleting)
						setPatientToDelete(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Delete patient record?
						</DialogTitle>
						<DialogDescription>
							{patientToDelete
								? `This will permanently delete ${displayName(patientToDelete.firstName, patientToDelete.lastName)}'s patient record.`
								: "This will permanently delete the patient record."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							disabled={isDeleting}
							onClick={() =>
								setPatientToDelete(null)
							}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={confirmDeletePatient}
						>
							{isDeleting
								? "Deleting..."
								: "Delete patient"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>

			<Dialog
				open={patientForAppointment !== null}
				onOpenChange={(open) => {
					if (!open && !isCreatingAppointment) {
						closeAppointmentDialog();
					}
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-semibold text-ink">
							Add an appointment
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-muted">
							{patientForAppointment
								? `Schedule a visit for ${displayName(patientForAppointment.firstName, patientForAppointment.lastName)}.`
								: "Schedule a patient visit."}
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col overflow-hidden"
						onSubmit={handleAppointmentSubmit}
					>
						<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
							<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor="appointment-doctor">
										Doctor{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={
											appointmentForm.doctorId
										}
										onValueChange={(
											doctorId,
										) => {
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													doctorId,
													appointmentDate:
														"",
													startTime:
														"",
													endTime: "",
												}),
											);
											setAppointmentCalendarOpen(
												false,
											);
										}}
									>
										<SelectTrigger
											id="appointment-doctor"
											aria-label="Select doctor"
											className="w-full"
											disabled={
												loadingDoctors ||
												Boolean(
													doctorsError,
												) ||
												activeDoctors.length ===
													0
											}
										>
											<SelectValue
												placeholder={
													loadingDoctors
														? "Loading doctors..."
														: "Select doctor"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{activeDoctors.map(
												(
													doctor,
												) => (
													<SelectItem
														key={
															doctor.id
														}
														value={
															doctor.id
														}
													>
														{doctorOptionLabel(
															doctor,
														)}
														{doctor.specialty
															? ` · ${doctor.specialty}`
															: ""}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									{doctorsError && (
										<p
											role="alert"
											className="text-xs text-accent-strong"
										>
											{doctorsError}
										</p>
									)}
									{!loadingDoctors &&
										!doctorsError &&
										activeDoctors.length ===
											0 && (
											<p className="text-xs text-ink-muted">
												No
												active
												doctors
												available.
											</p>
										)}
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-visit-type">
										Visit type{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={
											appointmentForm.visitTypeId
										}
										onValueChange={(
											visitTypeId,
										) =>
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													visitTypeId,
												}),
											)
										}
										disabled={
											loadingVisitTypes ||
											Boolean(
												visitTypesError,
											) ||
											activeVisitTypes.length ===
												0
										}
									>
										<SelectTrigger
											id="appointment-visit-type"
											className="w-full"
											aria-label="Select visit type"
										>
											<SelectValue
												placeholder={
													loadingVisitTypes
														? "Loading visit types..."
														: "Select visit type"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{activeVisitTypes.map(
												(
													visitType,
												) => (
													<SelectItem
														key={
															visitType.id
														}
														value={
															visitType.id
														}
													>
														{
															visitType.name
														}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									{visitTypesError && (
										<p
											role="alert"
											className="text-xs text-accent-strong"
										>
											{visitTypesError}
										</p>
									)}
									{!loadingVisitTypes &&
										!visitTypesError &&
										activeVisitTypes.length ===
											0 && (
											<p className="text-xs text-ink-muted">
												No
												active
												visit
												types
												available.
											</p>
										)}
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-date">
										Appointment date{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Popover
										open={
											appointmentCalendarOpen
										}
										onOpenChange={
											setAppointmentCalendarOpen
										}
									>
										<PopoverTrigger
											asChild
										>
											<Button
												id="appointment-date"
												type="button"
												variant="outline"
												className="w-full justify-start gap-2 border-line bg-surface text-left font-normal hover:bg-muted"
												disabled={
													!appointmentForm.doctorId ||
													schedulesQuery.isPending
												}
											>
												<CalendarDays
													className="size-4 text-ink-muted"
													aria-hidden="true"
												/>
												{appointmentForm.appointmentDate
													? format(
															parseISO(
																appointmentForm.appointmentDate,
															),
															"EEE, MMM d, yyyy",
														)
													: schedulesQuery.isPending
														? "Loading schedule dates..."
														: "Choose a date"}
											</Button>
										</PopoverTrigger>
										<PopoverContent
											align="start"
											className="w-auto p-1"
										>
											<Calendar
												mode="single"
												selected={
													appointmentForm.appointmentDate
														? parseISO(
																appointmentForm.appointmentDate,
															)
														: undefined
												}
												defaultMonth={
													appointmentForm.appointmentDate
														? parseISO(
																appointmentForm.appointmentDate,
															)
														: new Date()
												}
												disabled={(
													day,
												) =>
													!isDateScheduled(
														format(
															day,
															"yyyy-MM-dd",
														),
													)
												}
												onSelect={(
													day,
												) => {
													if (
														!day
													)
														return;
													const appointmentDate =
														format(
															day,
															"yyyy-MM-dd",
														);
													setAppointmentForm(
														(
															current,
														) => ({
															...current,
															appointmentDate,
															startTime:
																"",
															endTime: "",
														}),
													);
													setAppointmentCalendarOpen(
														false,
													);
												}}
											/>
										</PopoverContent>
									</Popover>
									{schedulesQuery.isError && (
										<p
											role="alert"
											className="text-xs text-accent-strong"
										>
											{getApiErrorMessage(
												schedulesQuery.error,
											)}
										</p>
									)}
								</div>
								<div className="space-y-1.5 sm:col-span-2">
									<Label htmlFor="appointment-slot">
										Available time slot{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={selectedSlot}
										onValueChange={(
											value,
										) => {
											const [
												startTime,
												endTime,
											] =
												value.split(
													"|",
												);
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													startTime,
													endTime,
												}),
											);
										}}
										disabled={
											!appointmentForm.appointmentDate ||
											availabilityQuery.isPending ||
											availableSlots.length ===
												0
										}
									>
										<SelectTrigger
											id="appointment-slot"
											className="w-full"
										>
											<SelectValue
												placeholder={
													!appointmentForm.appointmentDate
														? "Choose a date first"
														: availabilityQuery.isPending
															? "Loading available slots..."
															: "Select a time slot"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{availableSlots.map(
												(
													slot,
												) => (
													<SelectItem
														key={`${slot.startTime}-${slot.endTime}`}
														value={`${slot.startTime}|${slot.endTime}`}
													>
														{formatSlotTime(
															slot.startTime,
														)}{" "}
														-{" "}
														{formatSlotTime(
															slot.endTime,
														)}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
									{availabilityQuery.isError && (
										<p
											role="alert"
											className="text-xs text-accent-strong"
										>
											{getApiErrorMessage(
												availabilityQuery.error,
											)}
										</p>
									)}
									{availabilityQuery.isSuccess &&
										availableSlots.length ===
											0 && (
											<p className="text-xs text-ink-muted">
												No
												available
												slots
												for this
												date.
											</p>
										)}
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-status">
										Status{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={
											appointmentForm.status
										}
										onValueChange={(
											status,
										) =>
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													status,
												}),
											)
										}
									>
										<SelectTrigger
											id="appointment-status"
											className="w-full"
											aria-label="Appointment status"
										>
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="scheduled">
												Scheduled
											</SelectItem>
											<SelectItem value="confirmed">
												Confirmed
											</SelectItem>
											<SelectItem value="checkedIn">
												CheckedIn
											</SelectItem>
											<SelectItem value="inProgress">
												InProgress
											</SelectItem>
											<SelectItem value="completed">
												Completed
											</SelectItem>
											<SelectItem value="cancelled">
												Cancelled
											</SelectItem>
											<SelectItem value="noShow">
												NoShow
											</SelectItem>
											<SelectItem value="rescheduled">
												Rescheduled
											</SelectItem>
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5 sm:col-span-2">
									<Label htmlFor="appointment-reason">
										Reason{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Input
										id="appointment-reason"
										required
										value={
											appointmentForm.reason
										}
										placeholder="Reason for visit"
										onChange={(event) =>
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													reason: event
														.target
														.value,
												}),
											)
										}
									/>
								</div>
								<div className="space-y-1.5 sm:col-span-2">
									<Label htmlFor="appointment-notes">
										Notes{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Input
										id="appointment-notes"
										required
										value={
											appointmentForm.notes
										}
										placeholder="Additional notes"
										onChange={(event) =>
											setAppointmentForm(
												(
													current,
												) => ({
													...current,
													notes: event
														.target
														.value,
												}),
											)
										}
									/>
								</div>
							</div>
						</div>
						<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
							<Button
								type="button"
								variant="ghost"
								disabled={isCreatingAppointment}
								onClick={closeAppointmentDialog}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									isCreatingAppointment ||
									loadingDoctors ||
									Boolean(doctorsError) ||
									activeDoctors.length === 0 ||
									loadingVisitTypes ||
									Boolean(visitTypesError) ||
									activeVisitTypes.length === 0
								}
							>
								{isCreatingAppointment
									? "Creating..."
									: "Create appointment"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>
		</div>
	);
}
