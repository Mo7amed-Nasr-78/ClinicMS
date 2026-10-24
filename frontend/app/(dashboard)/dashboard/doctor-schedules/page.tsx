"use client";

import { useMemo, useState, type FormEvent } from "react";
import { useSession } from "next-auth/react";
import {
	CalendarDays,
	LoaderCircle,
	Pencil,
	Plus,
	RefreshCw,
	Search,
} from "lucide-react";
import { toast } from "sonner";
import {
	useCreateDoctorSchedule,
	useDeleteDoctorSchedule,
	useDoctorSchedules,
	useUpdateDoctorSchedule,
} from "@/api/hooks/DoctorSchedules";
import { useDoctors } from "@/api/hooks/Doctors";
import { getApiErrorMessage } from "@/api/services/clinicService";
import type { UpdateDoctorSchedulePayload } from "@/api/services/doctorScheduleService";
import { DoctorScheduleTable } from "@/components/doctor-schedules/DoctorScheduleTable";
import {
	ScheduleFields,
	ScheduleSwitch,
} from "@/components/doctor-schedules/DoctorScheduleFields";
import {
	createEmptyScheduleForm,
	displayDay,
	displayTime,
	getDoctorName,
	toInputDate,
	toInputTime,
	type ScheduleEditForm,
	type ScheduleForm,
	type ScheduleRow,
} from "@/components/doctor-schedules/doctor-schedule-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
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
import { PermissionGate } from "@/components/auth/PermissionGate";
import { hasPermission } from "@/lib/permissions";

const defaultScheduleForm = createEmptyScheduleForm();

export default function DoctorSchedulesPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const { data: session, status: sessionStatus } = useSession();
	const canViewDoctors =
		sessionStatus === "authenticated" &&
		hasPermission(session.user?.permissions, "view:doctors");
	const [isCreateOpen, setIsCreateOpen] = useState(false);
	const [editingSchedule, setEditingSchedule] =
		useState<ScheduleRow | null>(null);
	const [deletingSchedule, setDeletingSchedule] =
		useState<ScheduleRow | null>(null);
	const [form, setForm] = useState<ScheduleForm>(defaultScheduleForm);
	const [editForm, setEditForm] = useState<ScheduleEditForm>({
		dayOfWeek: 1,
		startTime: "09:00",
		endTime: "11:00",
		isAvailable: true,
		isActive: true,
		slotDuration: 30,
		effectiveFrom: defaultScheduleForm.effectiveFrom,
		effectiveTo: defaultScheduleForm.effectiveTo,
	});
	const [search, setSearch] = useState("");
	const {
		schedules,
		loading: schedulesLoading,
		error: schedulesError,
		refetch: refetchSchedules,
	} = useDoctorSchedules();
	const {
		doctors,
		loading: doctorsLoading,
		error: doctorsError,
		refetch: refetchDoctors,
	} = useDoctors(1, 100, canViewDoctors);
	const { mutate: submitSchedule, isPending: isCreating } =
		useCreateDoctorSchedule();
	const { mutate: updateSchedule, isPending: isUpdating } =
		useUpdateDoctorSchedule();
	const { mutate: removeSchedule, isPending: isDeleting } =
		useDeleteDoctorSchedule();

	const doctorById = useMemo(
		() =>
			new Map(
				doctors.flatMap((doctor) =>
					doctor.id ? [[doctor.id, doctor] as const] : [],
				),
			),
		[doctors],
	);
	const visibleSchedules = schedules
		.filter(
			(schedule) =>
				!canViewDoctors || doctorById.has(schedule.doctorId),
		)
		.filter((schedule) => {
			const doctor = doctorById.get(schedule.doctorId);
			return [
				doctor ? getDoctorName(doctor) : "",
				schedule.dayOfWeek,
				displayTime(schedule.startTime),
				displayTime(schedule.endTime),
			]
				.join(" ")
				.toLowerCase()
				.includes(search.trim().toLowerCase());
		});
	const scheduleRows = visibleSchedules.map((schedule) => ({
		...schedule,
		doctor: doctorById.get(schedule.doctorId),
	}));
	const error = schedulesError ?? (canViewDoctors ? doctorsError : null);
	const loading = schedulesLoading || (canViewDoctors && doctorsLoading);

	const openEditDialog = (schedule: ScheduleRow) => {
		setEditingSchedule(schedule);
		setEditForm({
			dayOfWeek: schedule.dayOfWeek,
			startTime: toInputTime(schedule.startTime),
			endTime: toInputTime(schedule.endTime),
			isAvailable: schedule.isAvailable,
			isActive: schedule.isActive,
			slotDuration: schedule.slotDuration,
			effectiveFrom: toInputDate(schedule.effectiveFrom),
			effectiveTo: toInputDate(schedule.effectiveTo),
		});
	};

	const handleUpdate = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (!editingSchedule) return;
		if (
			editForm.startTime >= editForm.endTime ||
			editForm.effectiveFrom > editForm.effectiveTo ||
			editForm.slotDuration < 1
		) {
			toast.error(
				"Check the schedule hours, duration, and effective dates.",
			);
			return;
		}

		const payload: UpdateDoctorSchedulePayload = {
			dayOfWeek: editForm.dayOfWeek,
			startTime: editForm.startTime,
			endTime: editForm.endTime,
			isAvailable: editForm.isAvailable,
			isActive: editForm.isActive,
			slotDuration: editForm.slotDuration,
			effectiveFrom: editForm.effectiveFrom,
			effectiveTo: editForm.effectiveTo,
		};
		updateSchedule(
			{ id: editingSchedule.id, payload },
			{
				onSuccess: () => {
					setEditingSchedule(null);
					toast.success("Doctor schedule updated.");
				},
				onError: (mutationError) => {
					toast.error(getApiErrorMessage(mutationError));
				},
			},
		);
	};

	const handleDelete = () => {
		if (!deletingSchedule) return;
		removeSchedule(deletingSchedule.id, {
			onSuccess: () => {
				setDeletingSchedule(null);
				toast.success("Doctor schedule deleted.");
			},
			onError: (mutationError) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		});
	};

	const handleCreate = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (
			!form.doctorId ||
			!form.startTime ||
			!form.endTime ||
			!form.effectiveFrom ||
			!form.effectiveTo
		) {
			toast.error("Choose a doctor and both schedule times.");
			return;
		}
		if (
			form.startTime >= form.endTime ||
			form.effectiveFrom > form.effectiveTo ||
			form.slotDuration < 1
		) {
			toast.error(
				"Check the schedule hours, duration, and effective dates.",
			);
			return;
		}

		submitSchedule(
			{
				...form,
			},
			{
				onSuccess: () => {
					setForm(createEmptyScheduleForm());
					setIsCreateOpen(false);
					toast.success("Doctor schedule added.");
				},
				onError: (mutationError) => {
					toast.error(getApiErrorMessage(mutationError));
				},
			},
		);
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Schedule"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} title={"Doctor schedules"} />
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 border-b border-line pb-4 pt-3 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="mt-2 text-sm text-ink-muted">
								{visibleSchedules.length} weekly
								availability{" "}
								{visibleSchedules.length === 1
									? "slot"
									: "slots"}
							</p>
						</div>
						<div className="flex flex-col gap-2 sm:flex-row sm:items-center">
							<div className="relative w-full sm:w-72">
								<Search
									className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
									aria-hidden="true"
								/>
								<Input
									aria-label="Search doctor schedules"
									className="pl-9"
									value={search}
									onChange={(event) =>
										setSearch(
											event.target
												.value,
										)
									}
									placeholder="Search schedules"
								/>
							</div>
							<PermissionGate
								permissions={[
									"create:doctor-schedules",
								]}
							>
								<Button
									type="button"
									disabled={
										doctors.length === 0
									}
									onClick={() =>
										setIsCreateOpen(
											true,
										)
									}
								>
									<Plus aria-hidden="true" />
									Add schedule
								</Button>
							</PermissionGate>
						</div>
					</header>

					{loading ? (
						<div
							className="flex min-h-56 items-center justify-center"
							role="status"
							aria-label="Loading doctor schedules"
						>
							<LoaderCircle
								className="size-7 animate-spin text-brand"
								aria-hidden="true"
							/>
						</div>
					) : error ? (
						<div className="flex flex-col items-center px-5 py-16 text-center">
							<p className="text-sm font-medium text-ink">
								Couldn&apos;t load doctor
								schedules
							</p>
							<p className="mt-1 max-w-md text-sm text-ink-muted">
								{error}
							</p>
							<Button
								className="mt-4"
								variant="outline"
								onClick={() =>
									void Promise.all([
										refetchSchedules(),
										...(canViewDoctors
											? [
													refetchDoctors(),
												]
											: []),
									])
								}
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
							<DoctorScheduleTable
								schedules={scheduleRows}
								isUpdating={isUpdating}
								isDeleting={isDeleting}
								onEdit={openEditDialog}
								onDelete={setDeletingSchedule}
								emptyState={
									<>
										<p className="font-medium text-ink">
											{schedules.length ===
											0
												? "No doctor schedules yet"
												: "No matching schedules"}
										</p>
										<p className="mt-1 text-sm text-ink-muted">
											{schedules.length ===
											0
												? "Weekly availability will appear here once added."
												: "Try another doctor or day."}
										</p>
									</>
								}
							/>
						</section>
					)}
				</main>
			</div>

			<Dialog
				open={isCreateOpen}
				onOpenChange={(open) => {
					setIsCreateOpen(open);
					if (!open) setForm(createEmptyScheduleForm());
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="border-b border-line pb-4 pr-8 mb-3">
						<div className="space-y-1">
							<DialogTitle className="text-xl font-semibold text-ink sm:text-2xl">
								Add doctor schedule
							</DialogTitle>
							<DialogDescription className="text-sm text-ink-muted">
								Choose when this recurring
								schedule is bookable.
							</DialogDescription>
						</div>
					</DialogHeader>
					<form
						className="space-y-6"
						onSubmit={handleCreate}
					>
						<div className="space-y-1.5">
							<Label htmlFor="schedule-doctor">
								Doctor
							</Label>
							<Select
								value={form.doctorId}
								onValueChange={(doctorId) =>
									setForm((current) => ({
										...current,
										doctorId,
									}))
								}
							>
								<SelectTrigger
									id="schedule-doctor"
									className="w-full hover:border-brand focus-visible:border-brand focus-visible:ring-brand/30"
								>
									<SelectValue placeholder="Select a doctor" />
								</SelectTrigger>
								<SelectContent>
									{doctors
										.filter(
											(doctor) =>
												doctor.id,
										)
										.map((doctor) => (
											<SelectItem
												key={
													doctor.id
												}
												value={
													doctor.id!
												}
											>
												{getDoctorName(
													doctor,
												)}
												{doctor.specialty
													? ` · ${doctor.specialty}`
													: ""}
											</SelectItem>
										))}
								</SelectContent>
							</Select>
						</div>
						<ScheduleFields
							form={form}
							setForm={setForm}
							prefix="schedule"
						/>
						<div className="flex flex-wrap gap-x-6 gap-y-3 border-t border-line pt-4">
							<label className="flex items-center gap-2 text-sm text-ink">
								<input
									type="checkbox"
									checked={form.isAvailable}
									onChange={(event) =>
										setForm(
											(
												current,
											) => ({
												...current,
												isAvailable:
													event
														.target
														.checked,
											}),
										)
									}
								/>
								Available for booking
							</label>
							<label className="flex items-center gap-2 text-sm text-ink">
								<input
									type="checkbox"
									checked={form.isActive}
									onChange={(event) =>
										setForm(
											(
												current,
											) => ({
												...current,
												isActive: event
													.target
													.checked,
											}),
										)
									}
								/>
								Active schedule
							</label>
						</div>

						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								onClick={() =>
									setIsCreateOpen(false)
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={
									isCreating ||
									doctors.length === 0
								}
							>
								{isCreating && (
									<LoaderCircle
										className="animate-spin"
										aria-hidden="true"
									/>
								)}
								Create schedule
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={editingSchedule !== null}
				onOpenChange={(open) => {
					if (!open && !isUpdating)
						setEditingSchedule(null);
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="border-b border-line pb-4 pr-8 mb-3">
						<div className="space-y-1">
							<DialogTitle className="text-xl font-semibold text-ink sm:text-2xl">
								Edit doctor schedule
							</DialogTitle>
							<DialogDescription className="text-sm text-ink-muted">
								Adjust hours, dates, and
								booking status.
							</DialogDescription>
						</div>
					</DialogHeader>
					<form
						className="space-y-6"
						onSubmit={handleUpdate}
					>
						<ScheduleFields
							form={editForm}
							setForm={setEditForm}
							prefix="edit-schedule"
						/>
						<ScheduleSwitch
							label="Availability"
							value={editForm.isAvailable}
							onChange={(isAvailable) =>
								setEditForm((current) => ({
									...current,
									isAvailable,
								}))
							}
							onText="Available for booking"
							offText="Not available for booking"
						/>
						<ScheduleSwitch
							label="Schedule status"
							value={editForm.isActive}
							onChange={(isActive) =>
								setEditForm((current) => ({
									...current,
									isActive,
								}))
							}
							onText="Active"
							offText="Inactive"
						/>
						<DialogFooter>
							<Button
								type="button"
								variant="outline"
								disabled={isUpdating}
								onClick={() =>
									setEditingSchedule(null)
								}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isUpdating}
							>
								{isUpdating && (
									<LoaderCircle
										className="animate-spin"
										aria-hidden="true"
									/>
								)}
								Save changes
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={deletingSchedule !== null}
				onOpenChange={(open) => {
					if (!open && !isDeleting)
						setDeletingSchedule(null);
				}}
			>
				<DialogContent className="w-[calc(100%-2rem)] max-w-md rounded-lg">
					<DialogHeader>
						<DialogTitle>
							Delete this schedule?
						</DialogTitle>
						<DialogDescription>
							This removes the{" "}
							{deletingSchedule
								? displayDay(
										deletingSchedule.dayOfWeek,
									)
								: "the"}{" "}
							availability slot for{" "}
							{deletingSchedule?.doctor
								? getDoctorName(
										deletingSchedule.doctor,
									)
								: "this doctor"}
							.
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isDeleting}
							onClick={() =>
								setDeletingSchedule(null)
							}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeleting}
							onClick={handleDelete}
						>
							{isDeleting && (
								<LoaderCircle
									className="animate-spin"
									aria-hidden="true"
								/>
							)}
							Delete schedule
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
