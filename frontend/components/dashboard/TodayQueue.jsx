"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { format } from "date-fns";
import { useSession } from "next-auth/react";
import {
	ArrowRight,
	Ban,
	CalendarClock,
	CalendarDays,
	Check,
	CheckCircle2,
	CircleAlert,
	Clock3,
	FileText,
	Stethoscope,
	UserCheck,
	UserX,
} from "lucide-react";
import { toast } from "sonner";
import {
	useCancelAppointment,
	useAppointments,
	useUpdateAppointment,
} from "@/api/hooks/Appointments";
import { getApiErrorMessage } from "@/api/services/clinicService";
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
	doctorName,
	patientName,
} from "@/components/appointments/appointment-utils";
import { hasPermission } from "@/lib/permissions";

const APPOINTMENT_STATUS_META = {
	scheduled: {
		label: "Scheduled",
		icon: CalendarClock,
		className: "border-line bg-surface-2 text-ink-muted",
	},
	confirmed: {
		label: "Confirmed",
		icon: CheckCircle2,
		className: "border-brand/20 bg-brand/10 text-brand",
	},
	checkedin: {
		label: "Checked in",
		icon: UserCheck,
		className: "border-gold/30 bg-gold/10 text-ink",
	},
	inprogress: {
		label: "In progress",
		icon: Stethoscope,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	completed: {
		label: "Completed",
		icon: Check,
		className: "border-brand/20 bg-brand/10 text-brand",
	},
	cancelled: {
		label: "Cancelled",
		icon: Ban,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	noshow: {
		label: "No-show",
		icon: UserX,
		className:
			"border-accent-strong/20 bg-accent/10 text-accent-strong",
	},
	rescheduled: {
		label: "Rescheduled",
		icon: Clock3,
		className: "border-gold/30 bg-gold/10 text-ink",
	},
};

function getStatusMeta(status = "") {
	const normalizedStatus = status.toLowerCase().replace(/[_\s-]/g, "");
	return (
		APPOINTMENT_STATUS_META[normalizedStatus] ?? {
			label: "Unknown status",
			icon: CalendarClock,
			className: "border-line bg-surface-2 text-ink-muted",
		}
	);
}

function formatQueueTime(value) {
	if (/^\d{2}:\d{2}$/.test(value)) return value;
	const date = new Date(value);
	if (Number.isNaN(date.getTime())) return value;
	return new Intl.DateTimeFormat("en-US", {
		timeZone: "UTC",
		hour: "2-digit",
		minute: "2-digit",
		hour12: false,
	}).format(date);
}

function hasAppointmentEnded(appointment, now) {
	const appointmentDate = appointment.appointmentDate.slice(0, 10);
	if (
		!/^\d{4}-\d{2}-\d{2}$/.test(appointmentDate) ||
		!/^\d{2}:\d{2}$/.test(appointment.endAt)
	) {
		return false;
	}

	const endTime = new Date(
		`${appointmentDate}T${appointment.endAt}:00`,
	).getTime();
	return Number.isFinite(endTime) && now >= endTime;
}

function normalizeStatus(status = "") {
	return status.toLowerCase().replace(/[_\s-]/g, "");
}

export function TodayQueue() {
	const today = format(new Date(), "yyyy-MM-dd");
	const [now, setNow] = useState(null);
	const [selectedAppointmentId, setSelectedAppointmentId] = useState(null);
	const [cancelDialogOpen, setCancelDialogOpen] = useState(false);
	const [cancelReason, setCancelReason] = useState("");
	const { data: session } = useSession();
	const canUpdateAppointments = hasPermission(
		session?.user?.permissions,
		"update:appointments",
	);
	const {
		mutate: updateAppointment,
		isPending: isUpdatingAppointment,
		variables: updateVariables,
	} = useUpdateAppointment();
	const {
		mutate: cancelAppointment,
		isPending: isCancellingAppointment,
	} = useCancelAppointment();
	const { appointments, loading, error } = useAppointments(1, 100, {
		appointmentDate: today,
	});
	const selectedAppointment = appointments.find(
		(appointment) => appointment.id === selectedAppointmentId,
	);
	const todaysAppointments = [...appointments].sort((first, second) =>
		first.startAt.localeCompare(second.startAt),
	);

	useEffect(() => {
		const updateCurrentTime = () => setNow(Date.now());
		updateCurrentTime();
		const interval = window.setInterval(updateCurrentTime, 15_000);
		return () => window.clearInterval(interval);
	}, []);

	const markNoShow = (appointment) => {
		updateAppointment(
			{
				appointmentId: appointment.id,
				payload: { status: "noShow" },
			},
			{
				onSuccess: () =>
					toast.success("Appointment marked as no-show."),
				onError: (updateError) =>
					toast.error(getApiErrorMessage(updateError)),
			},
		);
	};

	const updateStatus = (status) => {
		if (!selectedAppointment) return;
		updateAppointment(
			{
				appointmentId: selectedAppointment.id,
				payload: { status },
			},
			{
				onSuccess: () =>
					toast.success(
						`Appointment status updated to ${status === "checkedIn" ? "checked in" : "in progress"}.`,
					),
				onError: (updateError) =>
					toast.error(getApiErrorMessage(updateError)),
			},
		);
	};

	const submitCancellation = (event) => {
		event.preventDefault();
		if (!selectedAppointment) return;
		const reason = cancelReason.trim();
		if (!reason) {
			toast.error("Enter a reason for cancelling this appointment.");
			return;
		}

		cancelAppointment(
			{
				appointmentId: selectedAppointment.id,
				cancelReason: reason,
			},
			{
				onSuccess: () => {
					setCancelDialogOpen(false);
					setCancelReason("");
					toast.success("Appointment cancelled.");
				},
				onError: (cancelError) =>
					toast.error(getApiErrorMessage(cancelError)),
			},
		);
	};

	const selectedStatus = normalizeStatus(selectedAppointment?.status);
	const canCancelAppointment =
		!["completed", "cancelled", "noshow", "rescheduled"].includes(
			selectedStatus,
		);

	return (
		<>
		<section className="flex h-full min-h-72 flex-col overflow-hidden rounded-2xl border border-line bg-surface">
			<header className="flex items-center justify-between gap-4 border-b border-line px-5 py-4">
				<div className="flex min-w-0 items-center gap-3">
					<span className="flex size-10 shrink-0 items-center justify-center rounded-xl bg-brand/10 text-brand">
						<CalendarDays
							className="size-5"
							aria-hidden="true"
						/>
					</span>
					<div className="min-w-0">
						<h2 className="text-base font-semibold text-ink">
							Today&apos;s schedule
						</h2>
						<p className="mt-0.5 truncate text-xs text-ink-muted">
							{format(new Date(), "EEEE, MMMM d")}
						</p>
					</div>
					<span className="hidden shrink-0 rounded-full bg-surface-2 px-2.5 py-1 text-xs font-medium text-ink-muted sm:inline-flex">
						{loading
							? "Loading"
							: `${todaysAppointments.length} ${
									todaysAppointments.length === 1
										? "appointment"
										: "appointments"
								}`}
					</span>
				</div>
				<Link
					href="/dashboard/appointments"
					className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-brand transition-colors hover:bg-surface-2 hover:text-brand-deep focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-brand"
				>
					View all
					<ArrowRight
						className="size-4"
						aria-hidden="true"
					/>
				</Link>
			</header>

			<div className="min-h-0 flex-1 overflow-y-auto px-5">
				{loading ? (
					<ul
						className="divide-y divide-line"
						role="status"
						aria-label="Loading today's appointments"
					>
						{[0, 1, 2].map((item) => (
							<li
								key={item}
								className="flex items-center gap-4 py-4"
							>
								<span className="h-10 w-16 animate-pulse rounded-lg bg-surface-2" />
								<span className="flex-1 space-y-2">
									<span className="block h-3.5 w-2/5 animate-pulse rounded bg-surface-2" />
									<span className="block h-3 w-3/5 animate-pulse rounded bg-surface-2" />
								</span>
								<span className="h-6 w-20 animate-pulse rounded-full bg-surface-2" />
							</li>
						))}
					</ul>
				) : error ? (
					<div
						className="flex flex-col items-center gap-2 py-10 text-center"
						role="alert"
					>
						<CircleAlert
							className="size-7 text-accent-strong"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-ink">
							Unable to load today&apos;s schedule
						</p>
						<p className="max-w-sm text-xs text-ink-muted">
							{error}
						</p>
					</div>
				) : todaysAppointments.length === 0 ? (
					<div className="flex min-h-56 flex-col items-center justify-center gap-2 py-8 text-center">
						<CalendarDays
							className="mb-1 size-8 text-ink-faint"
							aria-hidden="true"
						/>
						<p className="text-sm font-medium text-ink">
							Your day is clear
						</p>
						<p className="text-xs text-ink-muted">
							No appointments are scheduled for today.
						</p>
					</div>
				) : (
					<ul className="divide-y divide-line">
						{todaysAppointments.map((appointment) => {
							const status = getStatusMeta(
								appointment.status,
							);
							const StatusIcon = status.icon;

							return (
								<li
									key={appointment.id}
									className="flex flex-wrap items-center gap-3 py-3.5 sm:gap-4"
								>
									<button
										type="button"
										aria-haspopup="dialog"
										aria-label={`View appointment for ${patientName(appointment.patient)}`}
										onClick={() =>
											setSelectedAppointmentId(
												appointment.id,
											)
										}
										className="flex min-w-0 flex-1 items-center gap-3 rounded-lg text-left outline-none focus-visible:ring-2 focus-visible:ring-brand sm:gap-4"
									>
										<div className="flex w-16 shrink-0 flex-col items-center justify-center rounded-xl bg-surface-2 px-2 py-2 text-center">
											<Clock3
												className="mb-1 size-3.5 text-brand"
												aria-hidden="true"
											/>
											<time className="font-mono text-xs font-semibold tabular-nums text-ink">
												{formatQueueTime(
													appointment.startAt,
												)}
											</time>
										</div>
										<div className="min-w-0 flex-1">
											<p className="truncate text-sm font-semibold text-ink">
												{patientName(
													appointment.patient,
												)}
											</p>
											<div className="mt-1 flex min-w-0 flex-wrap items-center gap-x-3 gap-y-1 text-xs text-ink-muted">
												<span className="inline-flex min-w-0 items-center gap-1.5">
													<Stethoscope
														className="size-3.5 shrink-0"
														aria-hidden="true"
													/>
													<span className="truncate">
														{doctorName(
															appointment.doctor,
														)}
													</span>
												</span>
												{appointment.reason && (
													<span className="inline-flex min-w-0 items-center gap-1.5">
														<FileText
															className="size-3.5 shrink-0"
															aria-hidden="true"
														/>
														<span className="truncate">
															{appointment.reason}
														</span>
													</span>
												)}
											</div>
										</div>
										<Badge
											variant="outline"
											className={`h-7 shrink-0 gap-1.5 px-2 text-[0.7rem] ${status.className}`}
										>
											<StatusIcon aria-hidden="true" />
											<span className="hidden sm:inline">
												{status.label}
											</span>
										</Badge>
									</button>
									{canUpdateAppointments &&
										now !== null &&
										hasAppointmentEnded(appointment, now) &&
										["scheduled", "confirmed"].includes(
											appointment.status
												.toLowerCase()
												.replace(/[_\s-]/g, ""),
										) && (
											<Button
												type="button"
												size="sm"
												variant="outline"
												aria-label={`Mark ${patientName(appointment.patient)}'s appointment as no-show`}
												disabled={
													isUpdatingAppointment &&
													updateVariables?.appointmentId ===
														appointment.id
												}
												onClick={() =>
													markNoShow(appointment)
												}
											>
												<UserX aria-hidden="true" />
												{isUpdatingAppointment &&
												updateVariables?.appointmentId ===
													appointment.id
													? "Updating..."
													: "Mark no-show"}
											</Button>
										)}
								</li>
							);
						})}
					</ul>
				)}
			</div>

			{!loading && !error && todaysAppointments.length > 0 && (
				<footer className="flex items-center justify-between border-t border-line bg-surface-2/40 px-5 py-3">
					<p className="text-xs text-ink-muted">
						Sorted by appointment time
					</p>
					<Link
						href="/dashboard/appointments"
						className="text-xs font-medium text-brand transition-colors hover:text-brand-deep"
					>
						Manage schedule
					</Link>
				</footer>
			)}
		</section>
		
		<Dialog
			open={Boolean(selectedAppointment) && !cancelDialogOpen}
			onOpenChange={(open) => {
				if (!open) setSelectedAppointmentId(null);
			}}
		>
			{selectedAppointment && (
				<DialogContent className="max-h-[calc(100dvh-2rem)] overflow-y-auto sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>Appointment details</DialogTitle>
						<DialogDescription>
							Review the appointment and update its status.
						</DialogDescription>
					</DialogHeader>
					<div className="grid gap-4 sm:grid-cols-2">
						<div>
							<p className="text-xs text-ink-muted">Patient</p>
							<p className="mt-1 font-medium text-ink">
								{patientName(selectedAppointment.patient)}
							</p>
							{selectedAppointment.patient.email && (
								<p className="mt-0.5 break-all text-sm text-ink-muted">
									{selectedAppointment.patient.email}
								</p>
							)}
						</div>
						<div>
							<p className="text-xs text-ink-muted">Doctor</p>
							<p className="mt-1 font-medium text-ink">
								{doctorName(selectedAppointment.doctor)}
							</p>
						</div>
						<div>
							<p className="text-xs text-ink-muted">Date</p>
							<p className="mt-1 font-medium text-ink">
								{format(
									new Date(
										`${selectedAppointment.appointmentDate.slice(0, 10)}T00:00:00`,
									),
									"MMMM d, yyyy",
								)}
							</p>
						</div>
						<div>
							<p className="text-xs text-ink-muted">Time</p>
							<p className="mt-1 font-medium text-ink">
								{formatQueueTime(selectedAppointment.startAt)}
								{" - "}
								{formatQueueTime(selectedAppointment.endAt)}
							</p>
						</div>
						<div>
							<p className="text-xs text-ink-muted">Status</p>
							<p className="mt-1 font-medium text-ink">
								{getStatusMeta(selectedAppointment.status).label}
							</p>
						</div>
						{selectedAppointment.reason && (
							<div className="sm:col-span-2">
								<p className="text-xs text-ink-muted">Reason</p>
								<p className="mt-1 text-ink">
									{selectedAppointment.reason}
								</p>
							</div>
						)}
						{selectedAppointment.notes && (
							<div className="sm:col-span-2">
								<p className="text-xs text-ink-muted">Notes</p>
								<p className="mt-1 whitespace-pre-wrap text-ink">
									{selectedAppointment.notes}
								</p>
							</div>
						)}
						{selectedAppointment.cancelReason && (
							<div className="sm:col-span-2">
								<p className="text-xs text-ink-muted">
									Cancellation reason
								</p>
								<p className="mt-1 text-ink">
									{selectedAppointment.cancelReason}
								</p>
							</div>
						)}
					</div>
					{canUpdateAppointments && (
						<DialogFooter className="flex-wrap sm:justify-between">
							<div className="flex flex-wrap gap-2">
								{["scheduled", "confirmed"].includes(
									selectedStatus,
								) && (
									<Button
										type="button"
										disabled={
											isUpdatingAppointment &&
											updateVariables?.appointmentId ===
												selectedAppointment.id
										}
										onClick={() =>
											updateStatus("checkedIn")
										}
									>
										<UserCheck aria-hidden="true" />
										Check in
									</Button>
								)}
								{selectedStatus === "checkedin" && (
									<Button
										type="button"
										disabled={
											isUpdatingAppointment &&
											updateVariables?.appointmentId ===
												selectedAppointment.id
										}
										onClick={() =>
											updateStatus("inProgress")
										}
									>
										<Stethoscope aria-hidden="true" />
										Start visit
									</Button>
								)}
							</div>
							{canCancelAppointment && (
								<Button
									type="button"
									variant="destructive"
									onClick={() => {
										setCancelReason("");
										setCancelDialogOpen(true);
									}}
								>
									<Ban aria-hidden="true" />
									Cancel appointment
								</Button>
							)}
						</DialogFooter>
					)}
				</DialogContent>
			)}
		</Dialog>
		<Dialog
			open={cancelDialogOpen}
			onOpenChange={(open) => {
				if (!isCancellingAppointment) setCancelDialogOpen(open);
			}}
		>
			<DialogContent>
				<DialogHeader>
					<DialogTitle>Cancel appointment?</DialogTitle>
					<DialogDescription>
						Enter a reason for cancelling this appointment. This
						will be saved with the cancellation.
					</DialogDescription>
				</DialogHeader>
				<form onSubmit={submitCancellation} className="space-y-4">
					<div className="space-y-1.5">
						<Label htmlFor="appointment-cancel-reason">
							Cancellation reason
						</Label>
						<textarea
							id="appointment-cancel-reason"
							value={cancelReason}
							onChange={(event) =>
								setCancelReason(event.target.value)
							}
							maxLength={500}
							rows={4}
							required
							disabled={isCancellingAppointment}
							className="w-full rounded-lg border border-input bg-transparent px-2.5 py-2 text-sm text-ink outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50 disabled:opacity-50"
						/>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isCancellingAppointment}
							onClick={() => setCancelDialogOpen(false)}
						>
							Keep appointment
						</Button>
						<Button
							type="submit"
							variant="destructive"
							disabled={
								isCancellingAppointment ||
								!cancelReason.trim()
							}
						>
							{isCancellingAppointment
								? "Cancelling..."
								: "Confirm cancellation"}
						</Button>
					</DialogFooter>
				</form>
			</DialogContent>
		</Dialog>
		</>
	);
}
