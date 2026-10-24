"use client";

import { useMemo, useState, type FormEvent } from "react";
import { LoaderCircle, Plus, RefreshCw, Search } from "lucide-react";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
	useCreateReceptionist,
	useDeleteReceptionist,
	useReceptionists,
	useUpdateReceptionist,
} from "@/api/hooks/Receptionists";
import {
	getReceptionistApiErrorMessage,
	type Receptionist,
} from "@/api/services/receptionistsService";
import { hasPermission } from "@/lib/permissions";
import { ReceptionistDialogs } from "@/components/receptionists/ReceptionistDialogs";
import { ReceptionistTable } from "@/components/receptionists/ReceptionistTable";
import {
	defaultReceptionistForm,
	receptionistName,
	type ReceptionistForm,
} from "@/components/receptionists/receptionist-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

export default function ReceptionistsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [search, setSearch] = useState("");
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedReceptionist, setSelectedReceptionist] =
		useState<Receptionist | null>(null);
	const [receptionistToDeactivate, setReceptionistToDeactivate] =
		useState<Receptionist | null>(null);
	const [form, setForm] = useState<ReceptionistForm>(
		defaultReceptionistForm,
	);
	const { data: session } = useSession();
	const permissions = session?.user?.permissions;
	const canCreate = hasPermission(
		permissions,
		"create:receptionists",
	);
	const canUpdate = hasPermission(
		permissions,
		"update:receptionists",
	);
	const canDelete = hasPermission(
		permissions,
		"delete:receptionists",
	);
	const { receptionists, loading, error, refetch } = useReceptionists();
	const { mutate: create, isPending: isCreating } =
		useCreateReceptionist();
	const { mutate: update, isPending: isUpdating } =
		useUpdateReceptionist();
	const { mutate: deactivate, isPending: isDeactivating } =
		useDeleteReceptionist();
	const isSaving = isCreating || isUpdating;

	const visibleReceptionists = useMemo(() => {
		const query = search.trim().toLowerCase();
		if (!query) return receptionists;

		return receptionists.filter((receptionist) =>
			[
				receptionistName(receptionist),
				receptionist.user.email,
				receptionist.user.phone,
				receptionist.status,
			]
				.join(" ")
				.toLowerCase()
				.includes(query),
		);
	}, [receptionists, search]);

	const openCreateForm = () => {
		setSelectedReceptionist(null);
		setForm(defaultReceptionistForm);
		setIsFormOpen(true);
	};

	const openEditForm = (receptionist: Receptionist) => {
		setSelectedReceptionist(receptionist);
		setForm({
			firstName: receptionist.user.firstName ?? "",
			lastName: receptionist.user.lastName ?? "",
			email: receptionist.user.email,
			password: "",
			phone: receptionist.user.phone ?? "",
			status: receptionist.status,
		});
		setIsFormOpen(true);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const contact = {
			firstName: form.firstName.trim(),
			lastName: form.lastName.trim(),
			phone: form.phone.trim(),
		};

		const onSuccess = (message: string) => {
			setForm(defaultReceptionistForm);
			setSelectedReceptionist(null);
			setIsFormOpen(false);
			toast.success(message);
		};
		const onError = (mutationError: unknown) => {
			toast.error(getReceptionistApiErrorMessage(mutationError));
		};

		if (selectedReceptionist) {
			update(
				{
					id: selectedReceptionist.id,
					payload: { ...contact, status: form.status },
				},
				{
					onSuccess: () =>
						onSuccess("Receptionist updated successfully."),
					onError,
				},
			);
			return;
		}

		create(
			{
				...contact,
				email: form.email.trim(),
				password: form.password,
			},
			{
				onSuccess: () =>
					onSuccess("Receptionist created successfully."),
				onError,
			},
		);
	};

	const confirmDeactivation = () => {
		if (!receptionistToDeactivate) return;

		deactivate(receptionistToDeactivate.id, {
			onSuccess: () => {
				setReceptionistToDeactivate(null);
				toast.success("Receptionist deactivated successfully.");
			},
			onError: (mutationError) => {
				toast.error(
					getReceptionistApiErrorMessage(mutationError),
				);
			},
		});
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Receptionists"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Receptionists"
				/>
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="mt-2 text-sm text-ink-muted">
								{receptionists.length} receptionist
								{receptionists.length === 1 ? "" : "s"}{" "}
								in this clinic
							</p>
						</div>
						{canCreate && (
							<Button type="button" onClick={openCreateForm}>
								<Plus aria-hidden="true" />
								Add receptionist
							</Button>
						)}
					</header>

					<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
						<div className="mb-4 flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
							<div className="relative w-full sm:max-w-md">
								<Search
									className="pointer-events-none absolute left-3 top-1/2 size-4 -translate-y-1/2 text-ink-faint"
									aria-hidden="true"
								/>
								<Input
									aria-label="Search receptionists"
									value={search}
									onChange={(event) =>
										setSearch(event.target.value)
									}
									placeholder="Search name, email, phone, or status"
									className="pl-10"
								/>
							</div>
						</div>

						{loading ? (
							<div
								className="flex min-h-56 items-center justify-center"
								role="status"
								aria-label="Loading receptionists"
							>
								<LoaderCircle
									className="size-7 animate-spin text-brand"
									aria-hidden="true"
								/>
							</div>
						) : error ? (
							<div className="flex flex-col items-center px-5 py-16 text-center">
								<p className="text-sm font-medium text-ink">
									Couldn&apos;t load receptionist records
								</p>
								<p className="mt-1 max-w-md text-sm text-ink-muted">
									{error}
								</p>
								<Button
									className="mt-4"
									variant="outline"
									onClick={() => void refetch()}
								>
									<RefreshCw
										size={15}
										aria-hidden="true"
									/>
									Try again
								</Button>
							</div>
						) : (
							<ReceptionistTable
								receptionists={visibleReceptionists}
								onEdit={openEditForm}
								onDeactivate={
									setReceptionistToDeactivate
								}
								canUpdate={canUpdate}
								canDelete={canDelete}
								emptyState={
									<p className="text-center text-ink-muted">
										{receptionists.length === 0
											? "No receptionists registered with this clinic yet."
											: "No matching receptionists. Try a different search."}
									</p>
								}
							/>
						)}
					</section>
				</main>
			</div>

			<ReceptionistDialogs
				form={form}
				setForm={setForm}
				selectedReceptionist={selectedReceptionist}
				setSelectedReceptionist={setSelectedReceptionist}
				isFormOpen={isFormOpen}
				setIsFormOpen={setIsFormOpen}
				onSubmit={handleSubmit}
				isSaving={isSaving}
				receptionistToDeactivate={receptionistToDeactivate}
				setReceptionistToDeactivate={
					setReceptionistToDeactivate
				}
				onConfirmDeactivation={confirmDeactivation}
				isDeactivating={isDeactivating}
			/>
		</div>
	);
}
