"use client";

import type { FormEvent } from "react";
import type { AppointmentWithRelations } from "@/api/services/appointmentsService";
import type { BillWithRelations } from "@/api/services/billsService";
import type { Patient } from "@/api/services/patientService";
import { Button } from "@/components/ui/button";
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
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { formatBillStatus, type BillForm } from "./bill-utils";

type BillDialogsProps = {
	formOpen: boolean;
	editingBill: BillWithRelations | null;
	form: BillForm;
	patients: Patient[];
	appointments: AppointmentWithRelations[];
	canSelectAppointment: boolean;
	patientsLoading: boolean;
	patientsError: string | null;
	appointmentsError: string | null;
	isSaving: boolean;
	onFormOpenChange: (open: boolean) => void;
	onFormChange: (field: keyof BillForm, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	deletingBill: BillWithRelations | null;
	isDeleting: boolean;
	onDeleteOpenChange: (open: boolean) => void;
	onDelete: () => void;
};

export function BillDialogs({
	formOpen,
	editingBill,
	form,
	patients,
	appointments,
	canSelectAppointment,
	patientsLoading,
	patientsError,
	appointmentsError,
	isSaving,
	onFormOpenChange,
	onFormChange,
	onSubmit,
	deletingBill,
	isDeleting,
	onDeleteOpenChange,
	onDelete,
}: BillDialogsProps) {
	const patientAppointments = appointments.filter(
		(appointment) => appointment.patientId === form.patientId,
	);
	const linkedAppointment = editingBill?.appointment;

	return (
		<>
			<Dialog
				open={formOpen}
				onOpenChange={(open) => {
					if (!open && !isSaving) onFormOpenChange(false);
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-xl">
					<DialogHeader className="shrink-0 border-b border-line px-4 py-5 text-left">
						<DialogTitle className="text-2xl font-semibold text-ink">
							{editingBill ? "Edit bill" : "Create a bill"}
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-muted">
							Enter the patient, bill amount, and payment
							details.
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col overflow-hidden"
						onSubmit={onSubmit}
					>
						<div className="min-h-0 flex-1 space-y-4 overflow-y-auto px-4 py-5">
							<div className="space-y-1.5">
								<Label htmlFor="bill-patient">Patient *</Label>
								<Select
									value={form.patientId}
									onValueChange={(value) =>
										onFormChange("patientId", value)
									}
								>
									<SelectTrigger
										id="bill-patient"
										className="w-full"
										disabled={patientsLoading || Boolean(patientsError)}
									>
										<SelectValue placeholder="Select a patient" />
									</SelectTrigger>
									<SelectContent>
										{patients.map((patient) => (
											<SelectItem
												key={patient.id}
												value={patient.id}
											>
												{patient.firstName}{" "}
												{patient.lastName}
											</SelectItem>
										))}
									</SelectContent>
								</Select>
								{patientsLoading && (
									<p className="text-xs text-ink-muted">
										Loading patients...
									</p>
								)}
								{!patientsLoading &&
									!patientsError &&
									patients.length === 0 && (
										<p className="text-xs text-ink-muted">
											No patients are available.
										</p>
									)}
								{patientsError && (
									<p
										role="alert"
										className="text-xs text-accent-strong"
									>
										{patientsError}
									</p>
								)}
							</div>
							{canSelectAppointment && (
								<div className="space-y-1.5">
									<Label htmlFor="bill-appointment">
										Appointment
									</Label>
									<Select
										value={
											form.appointmentId ||
											"no-appointment"
										}
										onValueChange={(value) =>
											onFormChange(
												"appointmentId",
												value === "no-appointment"
													? ""
													: value,
											)
										}
									>
										<SelectTrigger
											id="bill-appointment"
											className="w-full"
										>
											<SelectValue placeholder="No appointment" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="no-appointment">
												No appointment
											</SelectItem>
											{patientAppointments.map(
												(appointment) => (
													<SelectItem
														key={
															appointment.id
														}
														value={
															appointment.id
														}
													>
														{appointment.appointmentDate.slice(
															0,
															10,
														)}{" "}
														·{" "}
														{appointment.startAt}
													</SelectItem>
												),
											)}
											{linkedAppointment &&
												editingBill.patientId ===
													form.patientId &&
												!patientAppointments.some(
													(appointment) =>
														appointment.id ===
														linkedAppointment.id,
												) && (
													<SelectItem
														value={linkedAppointment.id}
													>
														{linkedAppointment.appointmentDate.slice(
															0,
															10,
														)}{" "}
														· Linked appointment
													</SelectItem>
												)}
										</SelectContent>
									</Select>
									{appointmentsError && (
										<p
											role="alert"
											className="text-xs text-accent-strong"
										>
											{appointmentsError}
										</p>
									)}
								</div>
							)}
							<div className="grid gap-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor="bill-amount">Amount *</Label>
									<Input
										id="bill-amount"
										type="number"
										min="0.01"
										step="0.01"
										value={form.amount}
										onChange={(event) =>
											onFormChange(
												"amount",
												event.target.value,
											)
										}
										required
									/>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="bill-due-date">Due date</Label>
									<Input
										id="bill-due-date"
										type="date"
										value={form.dueDate}
										onChange={(event) =>
											onFormChange(
												"dueDate",
												event.target.value,
											)
										}
									/>
								</div>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="bill-description">
									Description *
								</Label>
								<Input
									id="bill-description"
									value={form.description}
									onChange={(event) =>
										onFormChange(
											"description",
											event.target.value,
										)
									}
									maxLength={500}
									required
								/>
							</div>
							{editingBill && (
								<div className="space-y-1.5">
									<Label htmlFor="bill-status">Status</Label>
									<Select
										value={form.status}
										onValueChange={(value) =>
											onFormChange("status", value)
										}
									>
										<SelectTrigger id="bill-status" className="w-full">
											<SelectValue />
										</SelectTrigger>
										<SelectContent>
											{(
												[
													"unpaid",
													"paid",
													"cancelled",
												] as const
											).map((status) => (
												<SelectItem
													key={status}
													value={status}
												>
													{formatBillStatus(status)}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
								</div>
							)}
							<div className="space-y-1.5">
								<Label htmlFor="bill-notes">Notes</Label>
								<textarea
									id="bill-notes"
									value={form.notes}
									onChange={(event) =>
										onFormChange(
											"notes",
											event.target.value,
										)
									}
									rows={3}
									className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								/>
							</div>
						</div>
						<DialogFooter className="shrink-0">
							<Button
								type="button"
								variant="outline"
								disabled={isSaving}
								onClick={() => onFormOpenChange(false)}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving || patientsLoading || Boolean(patientsError)}
							>
								{isSaving
									? "Saving..."
									: editingBill
										? "Save changes"
										: "Create bill"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={Boolean(deletingBill)}
				onOpenChange={onDeleteOpenChange}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Delete bill?</DialogTitle>
						<DialogDescription>
							This will permanently delete this bill. This
							action cannot be undone.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isDeleting}
							onClick={() => onDeleteOpenChange(false)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={onDelete}
						>
							{isDeleting ? "Deleting..." : "Delete bill"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
