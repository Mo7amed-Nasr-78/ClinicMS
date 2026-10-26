"use client";

import { useState, type FormEvent } from "react";
import { useQuery } from "@tanstack/react-query";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import { getAppointments } from "@/api/services/appointmentsService";
import {
	useBills,
	useCreateBill,
	useDeleteBill,
	useUpdateBill,
} from "@/api/hooks/Bills";
import { getApiErrorMessage } from "@/api/services/clinicService";
import type {
	BillStatus,
	BillWithRelations,
	CreateBillPayload,
} from "@/api/services/billsService";
import { getPatients } from "@/api/services/patientService";
import { BillDialogs } from "@/components/bills/BillDialogs";
import { BillsTable } from "@/components/bills/BillsTable";
import {
	emptyBillForm,
	type BillForm,
} from "@/components/bills/bill-utils";
import { Sidebar } from "@/components/dashboard/Sidebar";
import { Topbar } from "@/components/dashboard/Topbar";
import { Button } from "@/components/ui/button";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/lib/permissions";

const pageSize = 20;

export default function BillsPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [page, setPage] = useState(1);
	const [status, setStatus] = useState<BillStatus | "all">("all");
	const [formOpen, setFormOpen] = useState(false);
	const [editingBill, setEditingBill] =
		useState<BillWithRelations | null>(null);
	const [deletingBill, setDeletingBill] =
		useState<BillWithRelations | null>(null);
	const [form, setForm] = useState<BillForm>(emptyBillForm);
	const { data: session } = useSession();
	const permissions = session?.user?.permissions;
	const canCreate = hasPermission(permissions, "create:bills");
	const canUpdate = hasPermission(permissions, "update:bills");
	const canDelete = hasPermission(permissions, "delete:bills");
	const canViewAppointments = hasPermission(
		permissions,
		"view:appointments",
	);
	const {
		bills,
		pagination,
		loading,
		error,
		refetch,
	} = useBills(page, pageSize, status === "all" ? undefined : status);
	const patientsQuery = useQuery({
		queryKey: ["patients", "bill-options"],
		queryFn: ({ signal }) => getPatients(1, 100, signal),
		enabled: formOpen && (canCreate || canUpdate),
	});
	const patients = patientsQuery.data?.patients ?? [];
	const patientsLoading = patientsQuery.isFetching;
	const patientsError = patientsQuery.error
		? getApiErrorMessage(patientsQuery.error)
		: null;
	const appointmentsQuery = useQuery({
		queryKey: ["appointments", "bill-options"],
		queryFn: ({ signal }) => getAppointments(1, 100, signal),
		enabled: formOpen && canViewAppointments,
	});
	const { mutate: createBill, isPending: isCreating } = useCreateBill();
	const { mutate: updateBill, isPending: isUpdating } = useUpdateBill();
	const { mutate: deleteBill, isPending: isDeleting } = useDeleteBill();
	const isSaving = isCreating || isUpdating;

	const closeForm = () => {
		setFormOpen(false);
		setEditingBill(null);
		setForm(emptyBillForm);
	};

	const openCreateForm = () => {
		setEditingBill(null);
		setForm(emptyBillForm);
		setFormOpen(true);
	};

	const openEditForm = (bill: BillWithRelations) => {
		setEditingBill(bill);
		setForm({
			patientId: bill.patientId,
			appointmentId: bill.appointmentId ?? "",
			amount: bill.amount,
			description: bill.description,
			status: bill.status,
			dueDate: bill.dueDate?.slice(0, 10) ?? "",
			notes: bill.notes ?? "",
		});
		setFormOpen(true);
	};

	const updateForm = (field: keyof BillForm, value: string) => {
		setForm((current) => ({
			...current,
			[field]: value,
			...(field === "patientId" && { appointmentId: "" }),
		}));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		if (patientsLoading) {
			toast.error("Wait for patients to finish loading.");
			return;
		}
		if (!form.patientId || !form.description.trim()) {
			toast.error("Select a patient and enter a bill description.");
			return;
		}
		const amount = Number(form.amount);
		if (!Number.isFinite(amount) || amount < 0.01) {
			toast.error("Enter a valid bill amount.");
			return;
		}

		const payload: CreateBillPayload = {
			patientId: form.patientId,
			...(form.appointmentId && {
				appointmentId: form.appointmentId,
			}),
			amount,
			description: form.description.trim(),
			...(form.dueDate && { dueDate: form.dueDate }),
			...(form.notes.trim() && { notes: form.notes.trim() }),
		};
		const mutationOptions = {
			onSuccess: () => {
				closeForm();
				toast.success(
					editingBill
						? "Bill updated successfully."
						: "Bill created successfully.",
				);
			},
			onError: (mutationError: Error) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		};

		if (editingBill) {
			updateBill(
				{
					billId: editingBill.id,
					payload: {
						...payload,
						appointmentId: form.appointmentId || null,
						dueDate: form.dueDate || null,
						notes: form.notes.trim() || null,
						status: form.status,
					},
				},
				mutationOptions,
			);
			return;
		}
		createBill(payload, mutationOptions);
	};

	const confirmDelete = () => {
		if (!deletingBill) return;
		deleteBill(deletingBill.id, {
			onSuccess: () => {
				setDeletingBill(null);
				if (bills.length === 1 && page > 1) {
					setPage((current) => Math.max(1, current - 1));
				}
				toast.success("Bill deleted successfully.");
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
				activeItem="Billing"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Billing"
				/>
				<main className="mx-auto w-full py-6">
					<div className="flex flex-wrap items-center justify-between gap-3">
						<label
							htmlFor="bill-status-filter"
							className="flex items-center gap-2 text-sm text-ink-muted"
						>
							Status
							<Select
								value={status}
								onValueChange={(value) => {
									setStatus(value as BillStatus | "all");
									setPage(1);
								}}
							>
								<SelectTrigger
									id="bill-status-filter"
									className="h-9 w-36 bg-surface text-ink"
								>
									<SelectValue />
								</SelectTrigger>
								<SelectContent position="popper">
									<SelectItem value="all">All bills</SelectItem>
									<SelectItem value="unpaid">Unpaid</SelectItem>
									<SelectItem value="paid">Paid</SelectItem>
									<SelectItem value="cancelled">
										Cancelled
									</SelectItem>
								</SelectContent>
							</Select>
						</label>
						<div className={"flex items-center gap-3"}>
							{!loading && (
								<p className="text-sm text-ink-muted">
									{pagination.total}{" "}
									{pagination.total === 1 ? "bill" : "bills"}
								</p>
							)}
							{canCreate && (
								<Button
									type="button"
									onClick={openCreateForm}
									disabled={patientsLoading}
								>
									Create bill
								</Button>
							)}
						</div>
					</div>

					<section className="mt-4 rounded-xl border border-line bg-surface p-4 shadow-sm sm:p-5">
						{loading ? (
							<div className="flex min-h-56 items-center justify-center text-sm text-ink-muted">
								Loading bills...
							</div>
						) : error ? (
							<div className="flex flex-col items-center px-5 py-16 text-center">
								<p className="text-sm text-accent-strong">
									{error}
								</p>
								<Button
									className="mt-4"
									type="button"
									variant="outline"
									onClick={() => void refetch()}
								>
									Try again
								</Button>
							</div>
						) : (
							<BillsTable
								bills={bills}
								canUpdate={canUpdate}
								canDelete={canDelete}
								isDeleting={isDeleting}
								onEdit={openEditForm}
								onDelete={setDeletingBill}
								emptyState={
									<div className="space-y-1">
										<p className="font-medium text-ink">
											No bills found
										</p>
										<p className="text-sm text-ink-muted">
											Bills created for appointments
											will appear here.
										</p>
									</div>
								}
							/>
						)}

						{pagination.totalPages > 1 && (
							<div className="mt-3 flex flex-col gap-3 border-t border-line px-2 pt-3 sm:flex-row sm:items-center sm:justify-between">
								<p
									className="text-sm text-ink-muted"
									aria-live="polite"
								>
									Page {pagination.page} of{" "}
									{pagination.totalPages}
								</p>
								<div className="flex gap-2">
									<Button
										type="button"
										variant="outline"
										disabled={page <= 1 || loading}
										onClick={() =>
											setPage((current) =>
												Math.max(1, current - 1),
											)
										}
									>
										Previous
									</Button>
									<Button
										type="button"
										variant="outline"
										disabled={
											loading ||
											page >= pagination.totalPages
										}
										onClick={() =>
											setPage((current) => current + 1)
										}
									>
										Next
									</Button>
								</div>
							</div>
						)}
					</section>
				</main>
			</div>
			<BillDialogs
				formOpen={formOpen}
				editingBill={editingBill}
				form={form}
				patients={patients}
				appointments={
					appointmentsQuery.data?.appointments ?? []
				}
				canSelectAppointment={canViewAppointments}
				patientsLoading={patientsLoading}
				patientsError={patientsError}
				appointmentsError={
					appointmentsQuery.error
						? getApiErrorMessage(appointmentsQuery.error)
						: null
				}
				isSaving={isSaving}
				onFormOpenChange={(open) => {
					if (open) setFormOpen(true);
					else closeForm();
				}}
				onFormChange={updateForm}
				onSubmit={handleSubmit}
				deletingBill={deletingBill}
				isDeleting={isDeleting}
				onDeleteOpenChange={(open) => {
					if (!open) setDeletingBill(null);
				}}
				onDelete={confirmDelete}
			/>
		</div>
	);
}
