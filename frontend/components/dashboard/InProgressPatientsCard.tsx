"use client";

import { useState, type FormEvent } from "react";
import { format, parse, isValid } from "date-fns";
import { useSession } from "next-auth/react";
import {
	CalendarDays,
	Check,
	CircleAlert,
	FilePlus2,
	Pill,
	Stethoscope,
} from "lucide-react";
import { toast } from "sonner";
import {
	useAppointments,
	useCompleteAppointment,
} from "@/api/hooks/Appointments";
import { useCreateMedicalRecord } from "@/api/hooks/MedicalRecords";
import { useCreatePrescription } from "@/api/hooks/Prescriptions";
import { getApiErrorMessage } from "@/api/services/clinicService";
import type { AppointmentWithRelations } from "@/api/services/appointmentsService";
import type { CreateMedicalRecordPayload } from "@/api/services/medicalRecordsService";
import type { CreatePrescriptionPayload } from "@/api/services/prescriptionsService";
import { hasPermission } from "@/lib/permissions";
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

type FormKind = "record" | "prescription";
type RecordForm = Omit<
	CreateMedicalRecordPayload,
	"patientId" | "doctorId" | "appointmentId"
>;
type PrescriptionForm = Omit<
	CreatePrescriptionPayload,
	"patientId" | "doctorId" | "appointmentId"
>;

const emptyRecordForm: RecordForm = {
	diagnosis: "",
	symptoms: "",
	examination: "",
	treatment: "",
	notes: "",
};

const emptyPrescriptionForm: PrescriptionForm = {
	medications: "",
	notes: "",
};

function patientName(appointment: AppointmentWithRelations) {
	return `${appointment.patient.firstName} ${appointment.patient.lastName}`.trim();
}

function doctorName(appointment: AppointmentWithRelations) {
	return [
		appointment.doctor.user.firstName,
		appointment.doctor.user.lastName,
	]
		.filter(Boolean)
		.join(" ") || "Doctor";
}

function formatTime(value: string) {
	const parsed = parse(value, "HH:mm", new Date());
	return isValid(parsed) ? format(parsed, "h:mm a") : value;
}

function AppointmentTextField({
	id,
	label,
	value,
	required = false,
	onChange,
}: {
	id: string;
	label: string;
	value: string;
	required?: boolean;
	onChange: (value: string) => void;
}) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id}>{label}{required ? " *" : ""}</Label>
			<textarea
				id={id}
				value={value}
				onChange={(event) => onChange(event.target.value)}
				required={required}
				rows={3}
				className="w-full rounded-lg border border-input bg-transparent px-3 py-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
			/>
		</div>
	);
}

export function InProgressPatientsCard() {
	const today = format(new Date(), "yyyy-MM-dd");
	const { data: session } = useSession();
	const permissions = session?.user?.permissions;
	const canCreateRecord = hasPermission(
		permissions,
		"create:medical-records",
	);
	const canCreatePrescription = hasPermission(
		permissions,
		"create:prescriptions",
	);
	const canCompleteAppointment = hasPermission(
		permissions,
		"complete:appointments",
	);
	const { appointments, loading, error } = useAppointments(1, 100, {
		appointmentDate: today,
		status: "inProgress",
	});
	const [activeAppointment, setActiveAppointment] =
		useState<AppointmentWithRelations | null>(null);
	const [formKind, setFormKind] = useState<FormKind | null>(null);
	const [recordForm, setRecordForm] = useState(emptyRecordForm);
	const [prescriptionForm, setPrescriptionForm] = useState(
		emptyPrescriptionForm,
	);
	const {
		mutate: createRecord,
		isPending: isCreatingRecord,
	} = useCreateMedicalRecord(activeAppointment?.patient.id ?? "");
	const {
		mutate: createPrescription,
		isPending: isCreatingPrescription,
	} = useCreatePrescription(activeAppointment?.patient.id ?? "");
	const {
		mutate: completeAppointmentMutation,
		isPending: isCompletingAppointment,
	} = useCompleteAppointment();
	const saving = isCreatingRecord || isCreatingPrescription;

	const closeForm = () => {
		setFormKind(null);
		setRecordForm(emptyRecordForm);
		setPrescriptionForm(emptyPrescriptionForm);
	};

	const handleRecordSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!activeAppointment) return;
		createRecord(
			{
				...recordForm,
				patientId: activeAppointment.patientId,
				doctorId: activeAppointment.doctorId,
				appointmentId: activeAppointment.id,
				diagnosis: recordForm.diagnosis.trim(),
				symptoms: recordForm.symptoms.trim(),
				examination: recordForm.examination.trim(),
				treatment: recordForm.treatment.trim(),
				notes: recordForm.notes.trim(),
			},
			{
				onSuccess: () => {
					closeForm();
					toast.success("Medical record added.");
				},
				onError: (mutationError) =>
					toast.error(getApiErrorMessage(mutationError)),
			},
		);
	};

	const handlePrescriptionSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!activeAppointment) return;
		createPrescription(
			{
				...prescriptionForm,
				patientId: activeAppointment.patientId,
				doctorId: activeAppointment.doctorId,
				appointmentId: activeAppointment.id,
				medications: prescriptionForm.medications.trim(),
				notes: prescriptionForm.notes.trim(),
			},
			{
				onSuccess: () => {
					closeForm();
					toast.success("Prescription added.");
				},
				onError: (mutationError) =>
					toast.error(getApiErrorMessage(mutationError)),
			},
		);
	};

	const completeAppointment = (appointment: AppointmentWithRelations) => {
		completeAppointmentMutation(
			appointment.id,
			{
				onSuccess: () => toast.success("Appointment completed."),
				onError: (mutationError) =>
					toast.error(getApiErrorMessage(mutationError)),
			},
		);
	};

	return (
		<>
			<section className="flex max-h-[34rem] min-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
				<header className="flex items-center justify-between gap-3 border-b border-line px-5 py-4">
					<div className="flex min-w-0 items-center gap-3">
						<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-accent/10 text-accent-strong">
							<Stethoscope className="size-5" aria-hidden="true" />
						</span>
						<div className="min-w-0">
							<h2 className="truncate text-base font-semibold text-ink">
								In-progress patients
							</h2>
							<p className="text-xs text-ink-muted">
								Today&apos;s active appointments
							</p>
						</div>
					</div>
					<span className="shrink-0 rounded-full bg-accent/10 px-2.5 py-1 text-xs font-semibold text-accent-strong">
						{loading ? "..." : appointments.length} active
					</span>
				</header>
				<div className="min-h-0 flex-1 overflow-y-auto">
					{loading ? (
						<p className="px-4 py-10 text-center text-sm text-ink-muted" role="status">
							Loading in-progress patients...
						</p>
					) : error ? (
						<div className="flex flex-col items-center gap-2 px-4 py-10 text-center" role="alert">
							<CircleAlert className="size-6 text-accent-strong" aria-hidden="true" />
							<p className="text-sm text-accent-strong">{error}</p>
						</div>
					) : appointments.length === 0 ? (
						<div className="flex flex-col items-center justify-center gap-2 px-4 py-10 text-center">
							<CalendarDays className="size-7 text-ink-faint" aria-hidden="true" />
							<p className="text-sm font-medium text-ink">No in-progress patients</p>
							<p className="text-xs text-ink-muted">
								Appointments started today will appear here.
							</p>
						</div>
					) : (
						<ul className="divide-y divide-line px-4">
							{appointments.map((appointment) => (
								<li key={appointment.id} className="flex flex-wrap items-center gap-3 py-4">
									<div className="min-w-0 flex-1">
										<p className="truncate text-sm font-semibold text-ink">
											{patientName(appointment)}
										</p>
										<p className="mt-1 truncate text-xs text-ink-muted">
											{doctorName(appointment)} · {formatTime(appointment.startAt)}
										</p>
										{appointment.reason && (
											<p className="mt-1 truncate text-xs text-ink-faint">
												{appointment.reason}
											</p>
										)}
									</div>
									<div className="flex flex-wrap gap-2">
										{canCreateRecord && (
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => {
													setActiveAppointment(appointment);
													setFormKind("record");
												}}
											>
												<FilePlus2 aria-hidden="true" />
												Medical record
											</Button>
										)}
										{canCreatePrescription && (
											<Button
												type="button"
												size="sm"
												variant="outline"
												onClick={() => {
													setActiveAppointment(appointment);
													setFormKind("prescription");
												}}
											>
												<Pill aria-hidden="true" />
												Prescription
											</Button>
										)}
										{canCompleteAppointment && (
											<Button
												type="button"
												size="sm"
												onClick={() => completeAppointment(appointment)}
												disabled={isCompletingAppointment}
											>
												<Check aria-hidden="true" />
												Complete
											</Button>
										)}
									</div>
								</li>
							))}
						</ul>
					)}
				</div>
			</section>

			<Dialog
				open={formKind !== null}
				onOpenChange={(open) => {
					if (!open && !saving) closeForm();
				}}
			>
				{formKind && activeAppointment && (
					<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
						<DialogHeader>
							<DialogTitle>
								{formKind === "record" ? "Add medical record" : "Add prescription"}
							</DialogTitle>
							<DialogDescription>
								For {patientName(activeAppointment)} · this appointment.
							</DialogDescription>
						</DialogHeader>
						{formKind === "record" ? (
							<form onSubmit={handleRecordSubmit} className="space-y-4">
								<AppointmentTextField
									id="appointment-record-diagnosis"
									label="Diagnosis"
									value={recordForm.diagnosis}
									required
									onChange={(diagnosis) =>
										setRecordForm((current) => ({ ...current, diagnosis }))
									}
								/>
								<AppointmentTextField
									id="appointment-record-symptoms"
									label="Symptoms"
									value={recordForm.symptoms}
									onChange={(symptoms) =>
										setRecordForm((current) => ({ ...current, symptoms }))
									}
								/>
								<AppointmentTextField
									id="appointment-record-examination"
									label="Examination"
									value={recordForm.examination}
									onChange={(examination) =>
										setRecordForm((current) => ({ ...current, examination }))
									}
								/>
								<AppointmentTextField
									id="appointment-record-treatment"
									label="Treatment"
									value={recordForm.treatment}
									onChange={(treatment) =>
										setRecordForm((current) => ({ ...current, treatment }))
									}
								/>
								<AppointmentTextField
									id="appointment-record-notes"
									label="Notes"
									value={recordForm.notes}
									onChange={(notes) =>
										setRecordForm((current) => ({ ...current, notes }))
									}
								/>
								<DialogFooter>
									<Button type="button" variant="outline" disabled={saving} onClick={closeForm}>
										Cancel
									</Button>
									<Button type="submit" disabled={saving || !recordForm.diagnosis.trim()}>
										{isCreatingRecord ? "Saving…" : "Add record"}
									</Button>
								</DialogFooter>
							</form>
						) : (
							<form onSubmit={handlePrescriptionSubmit} className="space-y-4">
								<AppointmentTextField
									id="appointment-prescription-medications"
									label="Medications"
									value={prescriptionForm.medications}
									required
									onChange={(medications) =>
										setPrescriptionForm((current) => ({ ...current, medications }))
									}
								/>
								<AppointmentTextField
									id="appointment-prescription-notes"
									label="Notes"
									value={prescriptionForm.notes}
									onChange={(notes) =>
										setPrescriptionForm((current) => ({ ...current, notes }))
									}
								/>
								<DialogFooter>
									<Button type="button" variant="outline" disabled={saving} onClick={closeForm}>
										Cancel
									</Button>
									<Button
										type="submit"
										disabled={saving || !prescriptionForm.medications.trim()}
									>
										{isCreatingPrescription ? "Saving…" : "Add prescription"}
									</Button>
								</DialogFooter>
							</form>
						)}
					</DialogContent>
				)}
			</Dialog>
		</>
	);
}
