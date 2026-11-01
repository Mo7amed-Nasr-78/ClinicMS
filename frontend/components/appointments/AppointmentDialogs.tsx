"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { format, parseISO } from "date-fns";
import { CalendarDays } from "lucide-react";
import type { Appointment } from "@/api/services/appointmentsService";
import {
	getDoctorAvailability,
	type Doctor,
} from "@/api/services/doctorsService";
import { getApiErrorMessage } from "@/api/services/clinicService";
import {
	getDoctorSchedulesForDoctor,
	type DoctorSchedule,
} from "@/api/services/doctorScheduleService";
import type { Patient } from "@/api/services/patientService";
import { useVisitTypes } from "@/api/hooks/VisitTypes";
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
import {
	doctorName,
	patientName,
	toDateInput,
	toTimeInput,
	type AppointmentForm,
} from "./appointment-utils";

type AppointmentDialogsProps = {
	formOpen: boolean;
	editingAppointment: Appointment | null;
	form: AppointmentForm;
	doctors: Doctor[];
	patients: Patient[];
	isSaving: boolean;
	onFormOpenChange: (open: boolean) => void;
	onFormChange: (field: keyof AppointmentForm, value: string) => void;
	onSubmit: (event: FormEvent<HTMLFormElement>) => void;
	deletingAppointment: Appointment | null;
	isDeleting: boolean;
	onDeleteOpenChange: (open: boolean) => void;
	onDelete: () => void;
};

export function AppointmentDialogs({
	formOpen,
	editingAppointment,
	form,
	doctors,
	patients,
	isSaving,
	onFormOpenChange,
	onFormChange,
	onSubmit,
	deletingAppointment,
	isDeleting,
	onDeleteOpenChange,
	onDelete,
}: AppointmentDialogsProps) {
	const [calendarOpen, setCalendarOpen] = useState(false);
	const {
		visitTypes,
		loading: visitTypesLoading,
		error: visitTypesError,
	} = useVisitTypes(formOpen);
	const visitTypeOptions = visitTypes.filter(
		(visitType) =>
			visitType.isActive ||
			visitType.id === editingAppointment?.visitTypeId,
	);
	const doctorOptions = doctors.filter(
		(doctor) =>
			doctor.status?.toLowerCase() !== "inactive" ||
			doctor.id === editingAppointment?.doctorId,
	);
	const schedulesQuery = useQuery({
		queryKey: ["doctor-schedules", form.doctorId],
		queryFn: ({ signal }) =>
			getDoctorSchedulesForDoctor(form.doctorId, signal),
		enabled: formOpen && Boolean(form.doctorId),
	});
	const schedules = schedulesQuery.data ?? [];
	const currentAppointmentDate = editingAppointment
		? toDateInput(editingAppointment.appointmentDate)
		: "";
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
	const canLoadAvailability =
		isDateScheduled(form.appointmentDate) ||
		(form.appointmentDate === currentAppointmentDate &&
			form.doctorId === editingAppointment?.doctorId);
	const availabilityQuery = useQuery({
		queryKey: [
			"doctor-availability",
			form.doctorId,
			form.appointmentDate,
		],
		queryFn: ({ signal }) =>
			getDoctorAvailability(
				form.doctorId,
				form.appointmentDate,
				signal,
			),
		enabled:
			formOpen &&
			Boolean(form.doctorId) &&
			Boolean(form.appointmentDate) &&
			schedulesQuery.isSuccess &&
			canLoadAvailability,
	});
	const currentAppointmentStart = editingAppointment
		? toTimeInput(editingAppointment.startTime)
		: "";
	const currentAppointmentEnd = editingAppointment
		? toTimeInput(editingAppointment.endTime)
		: "";
	const isCurrentSlot =
		form.doctorId === editingAppointment?.doctorId &&
		form.appointmentDate === currentAppointmentDate &&
		form.startTime === currentAppointmentStart &&
		form.endTime === currentAppointmentEnd;
	const slots = availabilityQuery.data?.slots ?? [];
	const currentSlotMissing =
		isCurrentSlot &&
		!slots.some(
			(slot) =>
				slot.startTime === currentAppointmentStart &&
				slot.endTime === currentAppointmentEnd,
		);
	const slotValue =
		form.startTime && form.endTime
			? `${form.startTime}|${form.endTime}`
			: "";

	const updateDoctor = (doctorId: string) => {
		if (doctorId === form.doctorId) return;
		onFormChange("doctorId", doctorId);
		onFormChange("appointmentDate", "");
		onFormChange("startTime", "");
		onFormChange("endTime", "");
		setCalendarOpen(false);
	};

	const selectSlot = (value: string) => {
		const [startTime, endTime] = value.split("|");
		onFormChange("startTime", startTime);
		onFormChange("endTime", endTime);
	};

	const formatSlotTime = (value: string) => {
		const [hourText, minute] = value.split(":");
		const hour = Number(hourText);
		return `${hour % 12 || 12}:${minute} ${hour < 12 ? "AM" : "PM"}`;
	};

	return (
		<>
			<Dialog
				open={formOpen}
				onOpenChange={(open) => {
					if (!open && !isSaving) onFormOpenChange(false);
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-semibold text-ink">
							{editingAppointment
								? "Edit appointment"
								: "Add an appointment"}
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-muted">
							Choose a patient, doctor, and visit
							time.
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col overflow-hidden"
						onSubmit={onSubmit}
					>
						<div className="min-h-0 flex-1 space-y-5 overflow-y-auto px-6 py-5">
							<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
								<div className="space-y-1.5">
									<Label htmlFor="appointment-patient">
										Patient{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={
											form.patientId
										}
										onValueChange={(
											value,
										) =>
											onFormChange(
												"patientId",
												value,
											)
										}
									>
										<SelectTrigger
											id="appointment-patient"
											className="w-full"
										>
											<SelectValue placeholder="Select patient" />
										</SelectTrigger>
										<SelectContent>
											{patients.map(
												(
													patient,
												) => (
													<SelectItem
														key={
															patient.id
														}
														value={
															patient.id
														}
													>
														{patientName(
															patient,
														)}
													</SelectItem>
												),
											)}
										</SelectContent>
									</Select>
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-doctor">
										Doctor{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={
											form.doctorId
										}
										onValueChange={
											updateDoctor
										}
									>
										<SelectTrigger
											id="appointment-doctor"
											className="w-full"
										>
											<SelectValue placeholder="Select doctor" />
										</SelectTrigger>
										<SelectContent>
											{doctorOptions.map(
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
														{doctorName(
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
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-visit-type">
										Visit type{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={form.visitTypeId}
										onValueChange={(value) =>
											onFormChange(
												"visitTypeId",
												value,
											)
										}
										disabled={visitTypesLoading || Boolean(visitTypesError)}
									>
										<SelectTrigger
											id="appointment-visit-type"
											className="w-full"
										>
											<SelectValue
												placeholder={
													visitTypesLoading
														? "Loading visit types..."
														: "Select visit type"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{visitTypeOptions.map((visitType) => (
												<SelectItem
													key={visitType.id}
													value={visitType.id}
												>
													{visitType.name}
												</SelectItem>
											))}
										</SelectContent>
									</Select>
									{visitTypesError && (
										<p className="text-sm text-destructive" role="alert">
											{visitTypesError}
										</p>
									)}
									{!visitTypesLoading &&
										!visitTypesError &&
										visitTypeOptions.length === 0 && (
											<p className="text-sm text-ink-muted">
												No active visit types are available.
											</p>
										)}
								</div>
								<div className="space-y-1.5">
									<Label htmlFor="appointment-date">
										Date{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Popover
										open={calendarOpen}
										onOpenChange={
											setCalendarOpen
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
													!form.doctorId ||
													schedulesQuery.isPending
												}
											>
												<CalendarDays
													className="size-4 text-ink-muted"
													aria-hidden="true"
												/>
												{form.appointmentDate
													? format(
															parseISO(
																form.appointmentDate,
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
													form.appointmentDate
														? parseISO(
																form.appointmentDate,
															)
														: undefined
												}
												defaultMonth={
													form.appointmentDate
														? parseISO(
																form.appointmentDate,
															)
														: new Date()
												}
												disabled={(
													day,
												) => {
													const dateValue =
														format(
															day,
															"yyyy-MM-dd",
														);
													return (
														dateValue !==
															currentAppointmentDate &&
														!isDateScheduled(
															dateValue,
														)
													);
												}}
												onSelect={(
													day,
												) => {
													if (
														!day
													)
														return;
													const dateValue =
														format(
															day,
															"yyyy-MM-dd",
														);
													if (
														dateValue !==
														form.appointmentDate
													) {
														onFormChange(
															"startTime",
															"",
														);
														onFormChange(
															"endTime",
															"",
														);
													}
													onFormChange(
														"appointmentDate",
														dateValue,
													);
													setCalendarOpen(
														false,
													);
												}}
											/>
										</PopoverContent>
									</Popover>
									{schedulesQuery.isError && (
										<p
											className="text-sm text-destructive"
											role="alert"
										>
											{getApiErrorMessage(
												schedulesQuery.error,
											)}
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
										value={form.status}
										onValueChange={(
											value,
										) =>
											onFormChange(
												"status",
												value,
											)
										}
									>
										<SelectTrigger
											id="appointment-status"
											className="w-full"
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
									<Label htmlFor="appointment-slot">
										Available time slot{" "}
										<span className="text-accent-strong">
											*
										</span>
									</Label>
									<Select
										value={slotValue}
										onValueChange={
											selectSlot
										}
										disabled={
											!form.appointmentDate ||
											availabilityQuery.isPending ||
											(!slots.length &&
												!currentSlotMissing)
										}
									>
										<SelectTrigger
											id="appointment-slot"
											className="w-full"
										>
											<SelectValue
												placeholder={
													!form.appointmentDate
														? "Choose a date first"
														: availabilityQuery.isPending
															? "Loading available slots..."
															: "Select a time slot"
												}
											/>
										</SelectTrigger>
										<SelectContent>
											{currentSlotMissing && (
												<SelectItem
													value={`${currentAppointmentStart}|${currentAppointmentEnd}`}
												>
													{formatSlotTime(
														currentAppointmentStart,
													)}
													{
														" - "
													}
													{formatSlotTime(
														currentAppointmentEnd,
													)}
													{
														" (current appointment)"
													}
												</SelectItem>
											)}
											{slots.map(
												(
													slot,
												) => (
													<SelectItem
														key={`${slot.startTime}-${slot.endTime}`}
														value={`${slot.startTime}|${slot.endTime}`}
													>
														{formatSlotTime(
															slot.startTime,
														)}
														{
															" - "
														}
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
											className="text-sm text-destructive"
											role="alert"
										>
											{getApiErrorMessage(
												availabilityQuery.error,
											)}
										</p>
									)}
									{availabilityQuery.isSuccess &&
										slots.length ===
											0 &&
										!currentSlotMissing && (
											<p className="text-sm text-ink-muted">
												No
												available
												slots
												for this
												date.
											</p>
										)}
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
										value={form.reason}
										onChange={(event) =>
											onFormChange(
												"reason",
												event
													.target
													.value,
											)
										}
										placeholder="Reason for visit"
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
										value={form.notes}
										onChange={(event) =>
											onFormChange(
												"notes",
												event
													.target
													.value,
											)
										}
										placeholder="Additional notes"
									/>
								</div>
							</div>
						</div>
						<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
							<Button
								type="button"
								variant="ghost"
								onClick={() =>
									onFormOpenChange(false)
								}
								disabled={isSaving}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isSaving}
							>
								{isSaving
									? "Saving..."
									: editingAppointment
										? "Save changes"
										: "Create appointment"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={deletingAppointment !== null}
				onOpenChange={(open) => {
					if (!open && !isDeleting)
						onDeleteOpenChange(false);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Delete appointment?
						</DialogTitle>
						<DialogDescription>
							This permanently removes the
							appointment record.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							disabled={isDeleting}
							onClick={() =>
								onDeleteOpenChange(false)
							}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={onDelete}
						>
							{isDeleting
								? "Deleting..."
								: "Delete appointment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
