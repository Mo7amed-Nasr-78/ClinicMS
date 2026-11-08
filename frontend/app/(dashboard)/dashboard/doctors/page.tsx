"use client";

import { useMemo, useState, type FormEvent } from "react";
import { toast } from "sonner";
import {
	useCreateDoctor,
	useDeleteDoctor,
	useDoctors,
	useUpdateDoctor,
} from "@/api/hooks/Doctors";
import { getApiErrorMessage, type Doctor } from "@/api/services/doctorsService";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { DoctorDialogs } from "@/components/doctors/DoctorDialogs";
import { DoctorsPageHeader } from "@/components/doctors/DoctorsPageHeader";
import { DoctorsRecords } from "@/components/doctors/DoctorsRecords";
import {
	defaultDoctorForm,
	type DoctorForm,
} from "@/components/doctors/doctor-utils";

export default function DoctorsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
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
						handleMutationSuccess("Doctor updated successfully."),
					onError: (mutationError) =>
						toast.error(getApiErrorMessage(mutationError)),
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
					handleMutationSuccess("Doctor created successfully."),
				onError: (mutationError) =>
					toast.error(getApiErrorMessage(mutationError)),
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
			onError: (mutationError) =>
				toast.error(getApiErrorMessage(mutationError)),
		});
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Doctors"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar onMenuClick={() => setSidebarOpen(true)} title="Doctors" />
				<main className="mx-auto w-full pb-10">
					<DoctorsPageHeader
						total={pagination.total}
						onAdd={() => {
							setSelectedDoctor(null);
							setForm(defaultDoctorForm);
							setIsModalOpen(true);
						}}
					/>
					<DoctorsRecords
						doctors={doctors}
						loading={loading}
						error={error}
						onRetry={() => void refetch()}
						onEdit={openEditModal}
						onDeactivate={setDoctorToDeactivate}
						total={pagination.total}
						currentPage={pagination.page}
						totalPages={pagination.totalPages}
						page={page}
						setPage={setPage}
					/>
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
