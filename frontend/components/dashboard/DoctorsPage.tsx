"use client";

import { useMemo, useState, type FormEvent } from "react";
import {
	ChevronLeft,
	ChevronRight,
	LoaderCircle,
	RefreshCw,
	Search,
} from "lucide-react";
import { toast } from "sonner";
import {
	useCreateDoctor,
	useDeleteDoctor,
	useDoctors,
	useUpdateDoctor,
} from "@/api/hooks/Doctors";
import { getApiErrorMessage, type Doctor } from "@/api/services/doctorsService";
import { DoctorDialogs } from "@/components/doctors/DoctorDialogs";
import { DoctorTable } from "@/components/doctors/DoctorTable";
import {
	defaultDoctorForm,
	doctorDisplayName,
	type DoctorForm,
} from "@/components/doctors/doctor-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { PermissionGate } from "../auth/PermissionGate";

export default function DoctorsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [page, setPage] = useState(1);
	const [isModalOpen, setIsModalOpen] = useState(false);
	const [selectedDoctor, setSelectedDoctor] = useState<Doctor | null>(null);
	const [doctorToDeactivate, setDoctorToDeactivate] =
		useState<Doctor | null>(null);
	const [form, setForm] = useState<DoctorForm>(defaultDoctorForm);
	const { doctors, pagination, loading, error, refetch } = useDoctors(page);
	const { mutate: createDoctor, isPending: isCreating } = useCreateDoctor();
	const { mutate: updateDoctor, isPending: isUpdating } = useUpdateDoctor();
	const { mutate: deactivateDoctor, isPending: isDeactivating } =
		useDeleteDoctor();
	const isPending = isCreating || isUpdating;

	const visibleDoctors = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return doctors;

		return doctors.filter((doctor) =>
			[
				doctorDisplayName(doctor),
				doctor.user?.email,
				doctor.user?.phone,
				doctor.specialty,
				doctor.licenseNumber,
				doctor.status ?? "active",
				doctor.id ?? doctor.licenseNumber,
			]
				.join(" ")
				.toLowerCase()
				.includes(query),
		);
	}, [doctors, search]);

	// const handleFormChange =
	// 	(field: keyof DoctorForm) =>
	// 	(event: React.ChangeEvent<HTMLInputElement>) => {
	// 		setForm((current) => ({
	// 			...current,
	// 			[field]: event.target.value,
	// 		}));
	// 	};

	const openEditModal = (doctor: Doctor) => {
		setSelectedDoctor(doctor);
		setForm({
			firstName: doctor.user?.firstName ?? doctor.firstName ?? "",
			lastName: doctor.user?.lastName ?? doctor.lastName ?? "",
			email: doctor.user?.email ?? doctor.email ?? "",
			password: "",
			phone: doctor.user?.phone ?? doctor.phone ?? "",
			specialty: doctor.specialty,
			licenseNumber: doctor.licenseNumber,
			consultationDuration: String(doctor.consultationDuration),
			consultationFee: String(doctor.consultationFee),
		});
		setIsModalOpen(true);
	};

	const handleMutationSuccess = (message: string) => {
		setForm(defaultDoctorForm);
		setSelectedDoctor(null);
		setIsModalOpen(false);
		toast.success(message);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const profile = {
			firstName: form.firstName.trim(),
			lastName: form.lastName.trim(),
			phone: form.phone.trim(),
			specialty: form.specialty.trim(),
			licenseNumber: form.licenseNumber.trim(),
			consultationDuration: Number(form.consultationDuration),
			consultationFee: Number(form.consultationFee),
		};

		if (selectedDoctor) {
			updateDoctor(
				{ id: selectedDoctor.id, payload: profile },
				{
					onSuccess: () =>
						handleMutationSuccess(
							"Doctor updated successfully.",
						),
					onError: (mutationError) => {
						toast.error(
							getApiErrorMessage(mutationError),
						);
					},
				},
			);
			return;
		}

		createDoctor(
			{
				...profile,
				email: form.email.trim(),
				password: form.password,
			},
			{
				onSuccess: () =>
					handleMutationSuccess(
						"Doctor created successfully.",
					),
				onError: (mutationError) => {
					toast.error(getApiErrorMessage(mutationError));
				},
			},
		);
	};

	const confirmDeactivation = () => {
		if (!doctorToDeactivate) return;

		deactivateDoctor(doctorToDeactivate.id, {
			onSuccess: () => {
				setDoctorToDeactivate(null);
				toast.success("Doctor deactivated successfully.");
			},
			onError: (mutationError) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		});
	};

	return (
		<div className="h-screen flex overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Doctors"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} title="Doctors" />
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="mt-2 text-sm text-ink-muted">
								{pagination.total} doctor record
								{pagination.total === 1
									? ""
									: "s"}
							</p>
						</div>
						<PermissionGate permissions={["create:doctors"]}>
							<Button
								type="button"
								onClick={() => {
									setSelectedDoctor(null);
									setForm(defaultDoctorForm);
									setIsModalOpen(true);
								}}
							>
								Add doctor
							</Button>
						</PermissionGate>
					</header>

					<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
						<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="relative w-full sm:max-w-md">
								<Search
									className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
									aria-hidden="true"
								/>
								<Input
									aria-label="Search doctors"
									value={search}
									onChange={(event) => {
										setSearch(
											event.target
												.value,
										);
										setPage(1);
									}}
									placeholder="Search specialty, status, or license"
									className="pl-10"
								/>
							</div>
						</div>

						{loading ? (
							<div
								className="flex min-h-56 items-center justify-center"
								role="status"
								aria-label="Loading doctors"
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
									records
								</p>
								<p className="mt-1 max-w-md text-sm text-ink-muted">
									{error}
								</p>
								<Button
									className="mt-4"
									variant="outline"
									onClick={() =>
										void refetch()
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
							<>
								<DoctorTable
									doctors={visibleDoctors}
									onEdit={openEditModal}
									onDeactivate={
										setDoctorToDeactivate
									}
									emptyState={
										<p className="text-center text-ink-muted">
											{pagination.total ===
											0
												? "No doctors registered with this clinic yet."
												: "No matching doctors. Try a different name, specialty, or license number."}
										</p>
									}
								/>
								{pagination.totalPages > 1 && (
									<div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
										<p
											className="text-sm text-ink-muted"
											aria-live="polite"
										>
											Page{" "}
											{
												pagination.page
											}{" "}
											of{" "}
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
							</>
						)}
					</section>
				</main>
			</div>

			<DoctorDialogs
				form={form}
				setForm={setForm}
				selectedDoctor={selectedDoctor}
				setSelectedDoctor={setSelectedDoctor}
				isModalOpen={isModalOpen}
				setIsModalOpen={setIsModalOpen}
				onSubmit={handleSubmit}
				isPending={isPending}
				doctorToDeactivate={doctorToDeactivate}
				setDoctorToDeactivate={setDoctorToDeactivate}
				onConfirmDeactivation={confirmDeactivation}
				isDeactivating={isDeactivating}
			/>
		</div>
	);
}
