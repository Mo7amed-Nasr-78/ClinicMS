"use client";

import { useState, type FormEvent } from "react";
import { differenceInYears, format, isValid, parse, parseISO } from "date-fns";
import {
	Activity,
	CalendarDays,
	Droplet,
	FilePlus2,
	FileText,
	HeartPulse,
	Mail,
	MapPin,
	Phone,
	Pill,
	ShieldAlert,
	UserRound,
	type LucideIcon,
} from "lucide-react";
import { toast } from "sonner";
import { useCreateMedicalRecord } from "@/api/hooks/MedicalRecords";
import { useCreatePrescription } from "@/api/hooks/Prescriptions";
import type { PatientDetails } from "@/api/hooks/Patients";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { displayLabel, displayName, patientStatusClass } from "./patient-utils";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";

type PatientProfileProps = {
	patient: PatientDetails;
	canViewAppointments: boolean;
	canViewMedicalRecords: boolean;
	canViewPrescriptions: boolean;
};

type MedicalRecordForm = {
	appointmentId: string;
	diagnosis: string;
	symptoms: string;
	examination: string;
	treatment: string;
	notes: string;
};

type PrescriptionForm = {
	appointmentId: string;
	medications: string;
	notes: string;
};

const emptyMedicalRecordForm: MedicalRecordForm = {
	appointmentId: "",
	diagnosis: "",
	symptoms: "",
	examination: "",
	treatment: "",
	notes: "",
};

const emptyPrescriptionForm: PrescriptionForm = {
	appointmentId: "",
	medications: "",
	notes: "",
};

function formatDate(value: string) {
	const isoDate = parseISO(value);
	const date = isValid(isoDate)
		? isoDate
		: parse(value, "dd-MM-yyyy", new Date());
	return isValid(date) ? format(date, "MMM d, yyyy") : "Date unavailable";
}

function formatAppointmentDate(value: string) {
	const date = parseISO(value);
	return isValid(date)
		? format(date, "EEE, MMM d, yyyy")
		: "Date unavailable";
}

function formatTime(value: string | null | undefined) {
	if (!value) return "Time unavailable";
	const time = parse(value, "HH:mm", new Date());
	return isValid(time) ? format(time, "h:mm a") : value;
}

function doctorDisplayName(doctor?: {
	specialty?: string;
	user?: { firstName: string | null; lastName: string | null };
}) {
	return (
		[doctor?.user?.firstName, doctor?.user?.lastName]
			.filter(Boolean)
			.join(" ") || "Care team"
	);
}

function appointmentLabel(appointment: PatientDetails["appointments"][number]) {
	return `${formatAppointmentDate(appointment.appointmentDate)} · ${formatTime(appointment.startAt)} · ${appointment.reason || "Appointment"}`;
}

export function PatientProfile({
	patient,
	canViewAppointments,
	canViewMedicalRecords,
	canViewPrescriptions,
}: PatientProfileProps) {
	const [recordDialogOpen, setRecordDialogOpen] = useState(false);
	const [prescriptionDialogOpen, setPrescriptionDialogOpen] =
		useState(false);
	const [recordForm, setRecordForm] = useState(emptyMedicalRecordForm);
	const [prescriptionForm, setPrescriptionForm] = useState(
		emptyPrescriptionForm,
	);
	const { mutate: createRecord, isPending: isCreatingRecord } =
		useCreateMedicalRecord(patient.id);
	const { mutate: createPrescription, isPending: isCreatingPrescription } =
		useCreatePrescription(patient.id);
	const appointments = patient.appointments ?? [];
	const records = patient.medicalRecords ?? [];
	const prescriptions = patient.prescriptions ?? [];
	const birthDate = patient.dateOfBirth
		? parseISO(patient.dateOfBirth)
		: null;
	const parsedBirthDate =
		birthDate && isValid(birthDate)
			? birthDate
			: patient.dateOfBirth
				? parse(patient.dateOfBirth, "dd-MM-yyyy", new Date())
				: null;
	const age =
		parsedBirthDate && isValid(parsedBirthDate)
			? differenceInYears(new Date(), parsedBirthDate)
			: null;
	const patientName = displayName(patient.firstName, patient.lastName);
	const initials =
		`${patient.firstName[0] ?? ""}${patient.lastName[0] ?? ""}`.toUpperCase();
	const selectedRecordAppointment = appointments.find(
		(appointment) => appointment.id === recordForm.appointmentId,
	);
	const selectedPrescriptionAppointment = appointments.find(
		(appointment) => appointment.id === prescriptionForm.appointmentId,
	);

	const submitMedicalRecord = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedRecordAppointment) {
			toast.error("Choose an appointment for this medical record.");
			return;
		}
		createRecord(
			{
				patientId: patient.id,
				doctorId: selectedRecordAppointment.doctorId,
				appointmentId: selectedRecordAppointment.id,
				diagnosis: recordForm.diagnosis.trim(),
				symptoms: recordForm.symptoms.trim(),
				examination: recordForm.examination.trim(),
				treatment: recordForm.treatment.trim(),
				notes: recordForm.notes.trim(),
			},
			{
				onSuccess: () => {
					setRecordDialogOpen(false);
					setRecordForm(emptyMedicalRecordForm);
					toast.success("Medical record added.");
				},
				onError: (error) =>
					toast.error(getApiErrorMessage(error)),
			},
		);
	};

	const submitPrescription = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!selectedPrescriptionAppointment) {
			toast.error("Choose an appointment for this prescription.");
			return;
		}
		createPrescription(
			{
				patientId: patient.id,
				doctorId: selectedPrescriptionAppointment.doctorId,
				appointmentId: selectedPrescriptionAppointment.id,
				medications: prescriptionForm.medications.trim(),
				notes: prescriptionForm.notes.trim(),
			},
			{
				onSuccess: () => {
					setPrescriptionDialogOpen(false);
					setPrescriptionForm(emptyPrescriptionForm);
					toast.success("Prescription added.");
				},
				onError: (error) =>
					toast.error(getApiErrorMessage(error)),
			},
		);
	};

	return (
		<main className="mx-auto w-full max-w-7xl pb-12">
			<div className="border-b border-line pb-5 pt-3">
				<div className="flex flex-col gap-5 sm:flex-row sm:items-center sm:justify-between">
					<div className="flex min-w-0 items-center gap-4">
						<div className="flex size-20 shrink-0 items-center justify-center rounded-2xl bg-brand text-lg font-semibold text-chip">
							{initials || (
								<UserRound aria-hidden="true" />
							)}
						</div>
						<div className="min-w-0">
							<p className="font-mono text-[0.68rem] uppercase tracking-[0.12em] text-ink-faint">
								Patient record ·{" "}
								{patient.id
									.slice(0, 8)
									.toUpperCase()}
							</p>
							<div className="mt-1 flex flex-wrap items-center gap-3">
								<h1 className="font-serif text-3xl font-normal text-ink sm:text-4xl">
									{patientName}
								</h1>
								<Badge
									variant="outline"
									className={patientStatusClass(
										patient.status,
									)}
								>
									{displayLabel(
										patient.status,
									)}
								</Badge>
							</div>
							<p className="mt-1 text-sm text-ink-muted">
								{age === null
									? "Age not recorded"
									: `${age} years old`}
								<span className="px-2 text-ink-faint">
									·
								</span>
								Added{" "}
								{formatDate(patient.createdAt)}
							</p>
						</div>
					</div>
					<div className="flex flex-col items-end gap-2">
						<div className="flex items-center gap-2">
							{canViewAppointments && (
								<Badge
									variant="outline"
									className="h-8 gap-2 border-line bg-surface px-3 text-ink-muted"
								>
									<CalendarDays
										className="size-3.5"
										aria-hidden="true"
									/>
									{appointments.length}{" "}
									appointments
								</Badge>
							)}
							{canViewMedicalRecords && (
								<Badge
									variant="outline"
									className="h-8 gap-2 border-line bg-surface px-3 text-ink-muted"
								>
									<FileText
										className="size-3.5"
										aria-hidden="true"
									/>
									{records.length} records
								</Badge>
							)}
						</div>
						<div className="flex items-center gap-2">
							<PermissionGate
								permissions={[
									"create:medical-records",
								]}
							>
								<Dialog
									open={recordDialogOpen}
									onOpenChange={(open) => {
										setRecordDialogOpen(
											open,
										);
										if (!open)
											setRecordForm(
												emptyMedicalRecordForm,
											);
									}}
								>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setRecordDialogOpen(
												true,
											)
										}
									>
										<FilePlus2 aria-hidden="true" />
										Add medical record
									</Button>
									<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-xl">
										<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
											<DialogTitle className="text-2xl font-semibold text-ink">
												Add
												medical
												record
											</DialogTitle>
											<DialogDescription className="text-sm text-ink-muted">
												For{" "}
												{
													patientName
												}
												. Choose
												the
												appointment
												this
												record
												belongs
												to.
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={
												submitMedicalRecord
											}
											className="flex min-h-0 flex-1 flex-col overflow-hidden"
										>
											<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
												<AppointmentSelect
													id="medical-record-appointment"
													appointments={
														appointments
													}
													value={
														recordForm.appointmentId
													}
													onValueChange={(
														appointmentId,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																appointmentId,
															}),
														)
													}
												/>
												<TextField
													label="Diagnosis"
													value={
														recordForm.diagnosis
													}
													required
													onChange={(
														diagnosis,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																diagnosis,
															}),
														)
													}
												/>
												<TextField
													label="Symptoms"
													value={
														recordForm.symptoms
													}
													onChange={(
														symptoms,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																symptoms,
															}),
														)
													}
												/>
												<TextField
													label="Examination"
													value={
														recordForm.examination
													}
													onChange={(
														examination,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																examination,
															}),
														)
													}
												/>
												<TextField
													label="Treatment"
													value={
														recordForm.treatment
													}
													onChange={(
														treatment,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																treatment,
															}),
														)
													}
												/>
												<TextField
													label="Notes"
													value={
														recordForm.notes
													}
													onChange={(
														notes,
													) =>
														setRecordForm(
															(
																current,
															) => ({
																...current,
																notes,
															}),
														)
													}
												/>
											</div>
											<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
												<Button
													type="button"
													variant="ghost"
													disabled={
														isCreatingRecord
													}
													onClick={() =>
														setRecordDialogOpen(
															false,
														)
													}
												>
													Cancel
												</Button>
												<Button
													type="submit"
													disabled={
														isCreatingRecord ||
														!appointments.length
													}
												>
													{isCreatingRecord
														? "Saving..."
														: "Add record"}
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</PermissionGate>
							<PermissionGate
								permissions={[
									"create:prescriptions",
								]}
							>
								<Dialog
									open={
										prescriptionDialogOpen
									}
									onOpenChange={(open) => {
										setPrescriptionDialogOpen(
											open,
										);
										if (!open)
											setPrescriptionForm(
												emptyPrescriptionForm,
											);
									}}
								>
									<Button
										type="button"
										variant="outline"
										onClick={() =>
											setPrescriptionDialogOpen(
												true,
											)
										}
									>
										<Pill aria-hidden="true" />
										Add prescription
									</Button>
									<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-xl">
										<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
											<DialogTitle className="text-2xl font-semibold text-ink">
												Add
												prescription
											</DialogTitle>
											<DialogDescription className="text-sm text-ink-muted">
												For{" "}
												{
													patientName
												}
												. Choose
												the
												appointment
												this
												prescription
												belongs
												to.
											</DialogDescription>
										</DialogHeader>
										<form
											onSubmit={
												submitPrescription
											}
											className="flex min-h-0 flex-1 flex-col overflow-hidden"
										>
											<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-6 py-5">
												<AppointmentSelect
													id="prescription-appointment"
													appointments={
														appointments
													}
													value={
														prescriptionForm.appointmentId
													}
													onValueChange={(
														appointmentId,
													) =>
														setPrescriptionForm(
															(
																current,
															) => ({
																...current,
																appointmentId,
															}),
														)
													}
												/>
												<TextField
													label="Medications"
													value={
														prescriptionForm.medications
													}
													required
													onChange={(
														medications,
													) =>
														setPrescriptionForm(
															(
																current,
															) => ({
																...current,
																medications,
															}),
														)
													}
												/>
												<TextField
													label="Notes"
													value={
														prescriptionForm.notes
													}
													onChange={(
														notes,
													) =>
														setPrescriptionForm(
															(
																current,
															) => ({
																...current,
																notes,
															}),
														)
													}
												/>
											</div>
											<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
												<Button
													type="button"
													variant="ghost"
													disabled={
														isCreatingPrescription
													}
													onClick={() =>
														setPrescriptionDialogOpen(
															false,
														)
													}
												>
													Cancel
												</Button>
												<Button
													type="submit"
													disabled={
														isCreatingPrescription ||
														!appointments.length
													}
												>
													{isCreatingPrescription
														? "Saving..."
														: "Add prescription"}
												</Button>
											</DialogFooter>
										</form>
									</DialogContent>
								</Dialog>
							</PermissionGate>
						</div>
					</div>
				</div>
			</div>

			<section className="grid gap-4 py-5 lg:grid-cols-[1.2fr_0.8fr]">
				<InfoCard
					title="Patient information"
					// subtitle="Personal and contact details"
					icon={UserRound}
					iconClassName="bg-brand/10 text-brand"
				>
					<div className="grid gap-x-6 gap-y-5 sm:grid-cols-2">
						<InfoItem
							icon={Mail}
							label="Email"
							value={patient.email}
						/>
						<InfoItem
							icon={Phone}
							label="Phone"
							value={patient.phone}
						/>
						<InfoItem
							icon={MapPin}
							label="Address"
							value={patient.address}
						/>
						<InfoItem
							icon={Phone}
							label="Emergency contact"
							value={patient.emergencyContact}
						/>
					</div>
				</InfoCard>
				<InfoCard
					title="Clinical snapshot"
					// subtitle="Key details for care"
					icon={HeartPulse}
					iconClassName="bg-accent/10 text-accent-strong"
				>
					<div className="grid grid-cols-2 gap-4">
						<Snapshot
							label="Date of birth"
							value={
								patient.dateOfBirth
									? formatDate(
											patient.dateOfBirth,
										)
									: "Not provided"
							}
						/>
						<Snapshot
							label="Gender"
							value={displayLabel(patient.gender)}
						/>
						<Snapshot
							label="Blood type"
							value={
								patient.bloodType ||
								"Not recorded"
							}
							icon={Droplet}
						/>
						<Snapshot
							label="Allergies"
							value={
								patient.allergies?.trim() ||
								"None recorded"
							}
						/>
					</div>
				</InfoCard>
			</section>

			<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
				<div className="border-b border-line pb-4">
					<SectionHeading
						icon={CalendarDays}
						title="Appointments"
						count={appointments.length}
					/>
				</div>
				{!canViewAppointments ? (
					<EmptyState
						icon={ShieldAlert}
						message="Your role does not include appointment access."
					/>
				) : appointments.length === 0 ? (
					<EmptyState
						icon={CalendarDays}
						message="No appointments are recorded for this patient yet."
					/>
				) : (
					<div className="divide-y divide-line">
						{appointments
							.slice(0, 5)
							.map((appointment) => (
								<article
									key={appointment.id}
									className="grid gap-3 py-4 sm:grid-cols-[9rem_minmax(0,1fr)_auto] sm:items-center"
								>
									<div className="flex items-center gap-3 text-sm">
										<span className="flex size-10 shrink-0 flex-col items-center justify-center rounded-lg bg-surface-2 text-brand">
											<span className="font-mono text-[0.6rem] uppercase">
												{format(
													parseISO(
														appointment.appointmentDate,
													),
													"MMM",
												)}
											</span>
											<span className="text-sm font-semibold leading-4">
												{format(
													parseISO(
														appointment.appointmentDate,
													),
													"d",
												)}
											</span>
										</span>
										<span className="text-xs text-ink-muted">
											{formatTime(
												appointment.startAt,
											)}
										</span>
									</div>
									<div className="min-w-0">
										<p className="truncate text-sm font-medium text-ink">
											{appointment.reason ||
												"Appointment"}
										</p>
										<p className="mt-1 truncate text-xs text-ink-muted">
											Dr.{" "}
											{doctorDisplayName(
												appointment.doctor,
											)}
											{appointment
												.doctor
												?.specialty
												? ` · ${appointment.doctor.specialty}`
												: ""}
										</p>
									</div>
									<Badge
										variant="outline"
										className="w-fit capitalize"
									>
										{appointment.status.replaceAll(
											"_",
											" ",
										)}
									</Badge>
								</article>
							))}
					</div>
				)}
			</section>

			<div className="grid gap-4 pt-5 lg:grid-cols-2">
				<HistorySection
					title="Medical records"
					icon={Activity}
					count={records.length}
					visible={canViewMedicalRecords}
					deniedMessage="Your role does not include medical-record access."
					emptyMessage="No medical records have been added for this patient."
				>
					{records.slice(0, 4).map((record) => (
						<article
							key={record.id}
							className="py-4 first:pt-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<h3 className="font-medium text-ink">
									{record.diagnosis ||
										"Clinical note"}
								</h3>
								<time className="text-xs text-ink-faint">
									{formatDate(
										record.createdAt,
									)}
								</time>
							</div>
							<p className="mt-1 text-xs text-ink-muted">
								Dr.{" "}
								{doctorDisplayName(
									record.doctor,
								)}
								{record.doctor?.specialty
									? ` · ${record.doctor.specialty}`
									: ""}
							</p>
							{record.treatment && (
								<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
									{record.treatment}
								</p>
							)}
							{record.notes && (
								<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
									{record.notes}
								</p>
							)}
						</article>
					))}
				</HistorySection>
				<HistorySection
					title="Prescriptions"
					icon={Pill}
					count={prescriptions.length}
					visible={canViewPrescriptions}
					deniedMessage="Your role does not include prescription access."
					emptyMessage="No prescriptions have been added for this patient."
				>
					{prescriptions.slice(0, 4).map((prescription) => (
						<article
							key={prescription.id}
							className="py-4 first:pt-5"
						>
							<div className="flex flex-wrap items-start justify-between gap-2">
								<h3 className="font-medium text-ink">
									Prescription
								</h3>
								<time className="text-xs text-ink-faint">
									{formatDate(
										prescription.createdAt,
									)}
								</time>
							</div>
							<p className="mt-1 text-xs text-ink-muted">
								Dr.{" "}
								{doctorDisplayName(
									prescription.doctor,
								)}
								{prescription.doctor?.specialty
									? ` · ${prescription.doctor.specialty}`
									: ""}
							</p>
							<p className="mt-3 whitespace-pre-wrap text-sm leading-6 text-ink">
								{prescription.medications ||
									"Medication details not recorded."}
							</p>
							{prescription.notes && (
								<p className="mt-2 whitespace-pre-wrap text-sm leading-6 text-ink-muted">
									{prescription.notes}
								</p>
							)}
						</article>
					))}
				</HistorySection>
			</div>
		</main>
	);
}

function AppointmentSelect({
	id,
	appointments,
	value,
	onValueChange,
}: {
	id: string;
	appointments: NonNullable<PatientDetails["appointments"]>;
	value: string;
	onValueChange: (value: string) => void;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>
				Appointment{" "}
				<span className="text-accent-strong">*</span>
			</Label>
			<Select
				value={value}
				onValueChange={onValueChange}
				disabled={!appointments.length}
			>
				<SelectTrigger id={id} className="w-full">
					<SelectValue
						placeholder={
							appointments.length
								? "Select appointment"
								: "No appointments available"
						}
					/>
				</SelectTrigger>
				<SelectContent>
					{appointments.map((appointment) => (
						<SelectItem
							key={appointment.id}
							value={appointment.id}
						>
							{appointmentLabel(appointment)}
						</SelectItem>
					))}
				</SelectContent>
			</Select>
			{!appointments.length && (
				<p className="text-xs text-ink-muted">
					Add an appointment before creating this item.
				</p>
			)}
		</div>
	);
}

function TextField({
	label,
	value,
	required = false,
	onChange,
}: {
	label: string;
	value: string;
	required?: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<div className="space-y-1.5">
			<Label>
				{label}{" "}
				{required && (
					<span className="text-accent-strong">*</span>
				)}
			</Label>
			<textarea
				className="flex min-h-20 w-full rounded-lg border border-line bg-surface px-3 py-2 text-sm text-ink outline-none placeholder:text-ink-faint focus-visible:border-brand focus-visible:ring-2 focus-visible:ring-brand/20 disabled:cursor-not-allowed disabled:opacity-50"
				value={value}
				required={required}
				onChange={(event) => onChange(event.target.value)}
				placeholder={label}
			/>
		</div>
	);
}

function InfoItem({
	icon: Icon,
	label,
	value,
}: {
	icon: LucideIcon;
	label: string;
	value?: string | null;
}) {
	return (
		<div className="flex min-w-0 gap-3">
			<span className="mt-0.5 flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-brand">
				<Icon className="size-4" aria-hidden="true" />
			</span>
			<div className="min-w-0">
				<p className="text-xs text-ink-muted">{label}</p>
				<p className="mt-0.5 wrap-break-word text-sm font-medium text-ink">
					{value?.trim() || "Not provided"}
				</p>
			</div>
		</div>
	);
}

function InfoCard({
	icon: Icon,
	iconClassName,
	title,
	subtitle = "",
	children,
}: {
	icon: LucideIcon;
	iconClassName: string;
	title: string;
	subtitle?: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
			<div className="mb-5 flex items-center gap-3 border-b border-line pb-3">
				<span
					className={`flex size-9 items-center justify-center rounded-lg ${iconClassName}`}
				>
					<Icon className="size-4" aria-hidden="true" />
				</span>
				<div>
					<h2 className="font-semibold text-ink">
						{title}
					</h2>
					<p className="text-xs text-ink-muted">
						{subtitle}
					</p>
				</div>
			</div>
			{children}
		</section>
	);
}

function Snapshot({
	label,
	value,
	icon: Icon,
}: {
	label: string;
	value: string;
	icon?: LucideIcon;
}) {
	return (
		<div className="rounded-lg bg-surface-2 p-3">
			<p className="text-xs text-ink-muted">{label}</p>
			<p className="mt-1 flex items-center gap-1.5 text-sm font-medium text-ink">
				{Icon && (
					<Icon
						className="size-3.5 text-accent-strong"
						aria-hidden="true"
					/>
				)}
				{value}
			</p>
		</div>
	);
}

function SectionHeading({
	icon: Icon,
	title,
	count,
}: {
	icon: LucideIcon;
	title: string;
	count: number;
}) {
	return (
		<div className="flex items-center gap-3">
			<span className="flex size-9 shrink-0 items-center justify-center rounded-lg bg-surface-2 text-brand">
				<Icon className="size-4" aria-hidden="true" />
			</span>
			<h2 className="min-w-0 flex-1 font-semibold text-ink">
				{title}
			</h2>
			<span className="font-mono text-xs text-ink-faint">
				{count.toString().padStart(2, "0")}
			</span>
		</div>
	);
}

function EmptyState({
	icon: Icon,
	message,
}: {
	icon: LucideIcon;
	message: string;
}) {
	return (
		<div className="flex min-h-36 flex-col items-center justify-center border-t border-dashed border-line px-4 text-center">
			<Icon className="size-5 text-ink-faint" aria-hidden="true" />
			<p className="mt-3 max-w-xs text-sm text-ink-muted">
				{message}
			</p>
		</div>
	);
}

function HistorySection({
	icon,
	title,
	count,
	visible,
	deniedMessage,
	emptyMessage,
	children,
}: {
	icon: LucideIcon;
	title: string;
	count: number;
	visible: boolean;
	deniedMessage: string;
	emptyMessage: string;
	children: React.ReactNode;
}) {
	return (
		<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
			<div className="border-b border-line pb-4">
				<SectionHeading
					icon={icon}
					title={title}
					count={count}
				/>
			</div>
			{!visible ? (
				<EmptyState
					icon={ShieldAlert}
					message={deniedMessage}
				/>
			) : count === 0 ? (
				<EmptyState icon={icon} message={emptyMessage} />
			) : (
				<div className="divide-y divide-line">{children}</div>
			)}
		</section>
	);
}
