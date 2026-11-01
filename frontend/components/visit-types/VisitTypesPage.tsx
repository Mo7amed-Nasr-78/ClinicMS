"use client";

import { useState, type FormEvent } from "react";
import { Plus } from "lucide-react";
import { toast } from "sonner";
import {
	useCreateVisitType,
	useDeactivateVisitType,
	useUpdateVisitType,
	useVisitTypes,
} from "@/api/hooks/VisitTypes";
import {
	type VisitType,
	type VisitTypePayload,
} from "@/api/services/visitTypesService";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { PermissionGate } from "@/components/auth/PermissionGate";
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
import { VisitTypesTable } from "./VisitTypesTable";

type VisitTypeForm = {
	name: string;
	defaultDurationMin: string;
	price: string;
	color: string;
	isFollowUp: boolean;
	isActive: boolean;
};

const emptyForm: VisitTypeForm = {
	name: "",
	defaultDurationMin: "30",
	price: "",
	color: "",
	isFollowUp: false,
	isActive: true,
};

function visitTypeToForm(visitType: VisitType): VisitTypeForm {
	return {
		name: visitType.name,
		defaultDurationMin: String(visitType.defaultDurationMin),
		price: visitType.price == null ? "" : String(visitType.price),
		color: visitType.color ?? "",
		isFollowUp: visitType.isFollowUp,
		isActive: visitType.isActive,
	};
}

export default function VisitTypesPage() {
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [isFormOpen, setIsFormOpen] = useState(false);
	const [selectedVisitType, setSelectedVisitType] =
		useState<VisitType | null>(null);
	const [visitTypeToDeactivate, setVisitTypeToDeactivate] =
		useState<VisitType | null>(null);
	const [form, setForm] = useState<VisitTypeForm>(emptyForm);
	const { visitTypes, loading, error, refetch } = useVisitTypes();
	const { mutate: create, isPending: isCreating } = useCreateVisitType();
	const { mutate: update, isPending: isUpdating } = useUpdateVisitType();
	const { mutate: deactivate, isPending: isDeactivating } =
		useDeactivateVisitType();
	const isSaving = isCreating || isUpdating;

	const closeForm = () => {
		setIsFormOpen(false);
		setSelectedVisitType(null);
		setForm(emptyForm);
	};

	const openCreateForm = () => {
		setSelectedVisitType(null);
		setForm(emptyForm);
		setIsFormOpen(true);
	};

	const openEditForm = (visitType: VisitType) => {
		setSelectedVisitType(visitType);
		setForm(visitTypeToForm(visitType));
		setIsFormOpen(true);
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const name = form.name.trim();
		const defaultDurationMin = Number(form.defaultDurationMin);
		const price =
			form.price.trim() === "" ? null : Number(form.price);

		if (!name || !Number.isInteger(defaultDurationMin) || defaultDurationMin < 1) {
			toast.error("Enter a name and a valid duration of at least one minute.");
			return;
		}
		if (price !== null && (!Number.isFinite(price) || price < 0)) {
			toast.error("Price must be a non-negative number.");
			return;
		}

		const payload: VisitTypePayload = {
			name,
			defaultDurationMin,
			price,
			color: form.color.trim() || null,
			isFollowUp: form.isFollowUp,
			isActive: form.isActive,
		};
		const onSuccess = () => {
			closeForm();
			toast.success(
				selectedVisitType
					? "Visit type updated successfully."
					: "Visit type created successfully.",
			);
		};
		const onError = (mutationError: Error) => {
			toast.error(getApiErrorMessage(mutationError));
		};

		if (selectedVisitType) {
			update(
				{ id: selectedVisitType.id, payload },
				{ onSuccess, onError },
			);
			return;
		}
		create(payload, { onSuccess, onError });
	};

	const confirmDeactivation = () => {
		if (!visitTypeToDeactivate) return;
		deactivate(visitTypeToDeactivate.id, {
			onSuccess: () => {
				setVisitTypeToDeactivate(null);
				toast.success("Visit type deactivated successfully.");
			},
			onError: (mutationError) => {
				toast.error(getApiErrorMessage(mutationError));
			},
		});
	};

	const updateForm = (field: keyof VisitTypeForm, value: string | boolean) => {
		setForm((current) => ({ ...current, [field]: value }));
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Visit Types"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Visit Types"
				/>
				<main className="mx-auto w-full pb-10">
					<header className="flex flex-col gap-4 pt-4 sm:flex-row sm:items-end sm:justify-between">
						<div>
							<p className="mt-2 text-sm text-ink-muted">
								{visitTypes.length} visit type
								{visitTypes.length === 1 ? "" : "s"}
							</p>
						</div>
						<div className="flex flex-wrap gap-2">
							<PermissionGate
								permissions={["create:visit-types"]}
							>
								<Button
									type="button"
									onClick={openCreateForm}
								>
									<Plus aria-hidden="true" />
									Add visit type
								</Button>
							</PermissionGate>
						</div>
					</header>

					<section
						aria-label="Clinic visit types"
						className="mt-5 overflow-hidden rounded-lg border border-line bg-surface p-5"
					>
						{loading ? (
							<p
								role="status"
								className="p-8 text-center text-sm text-ink-muted"
							>
								Loading visit types...
							</p>
						) : error ? (
							<div className="space-y-3 p-8 text-center">
								<p role="alert" className="text-sm text-destructive">
									{error}
								</p>
								<Button
									type="button"
									variant="outline"
									onClick={() => void refetch()}
								>
									Try again
								</Button>
							</div>
						) : (
							<VisitTypesTable
								visitTypes={visitTypes}
								onEdit={openEditForm}
								onDeactivate={setVisitTypeToDeactivate}
							/>
						)}
					</section>
				</main>
			</div>

			<Dialog
				open={isFormOpen}
				onOpenChange={(open) => {
					if (open) setIsFormOpen(true);
					else closeForm();
				}}
			>
				<DialogContent className="w-[calc(100%-2rem)] sm:max-w-lg">
					<DialogHeader>
						<DialogTitle>
							{selectedVisitType
								? "Edit visit type"
								: "Add visit type"}
						</DialogTitle>
						<DialogDescription>
							Set the appointment type details used by your
							clinic.
						</DialogDescription>
					</DialogHeader>
					<form className="space-y-4" onSubmit={handleSubmit}>
						<div className="space-y-1.5">
							<Label htmlFor="visit-type-name">Name</Label>
							<Input
								id="visit-type-name"
								required
								minLength={1}
								value={form.name}
								onChange={(event) =>
									updateForm("name", event.target.value)
								}
								placeholder="e.g. Consultation"
							/>
						</div>
						<div className="grid gap-4 sm:grid-cols-2">
							<div className="space-y-1.5">
								<Label htmlFor="visit-type-duration">
									Default duration (minutes)
								</Label>
								<Input
									id="visit-type-duration"
									type="number"
									required
									min={1}
									step={1}
									value={form.defaultDurationMin}
									onChange={(event) =>
										updateForm(
											"defaultDurationMin",
											event.target.value,
										)
									}
								/>
							</div>
							<div className="space-y-1.5">
								<Label htmlFor="visit-type-price">
									Price (optional)
								</Label>
								<Input
									id="visit-type-price"
									type="number"
									min={0}
									step="0.01"
									value={form.price}
									onChange={(event) =>
										updateForm("price", event.target.value)
									}
									placeholder="Leave blank if not set"
								/>
							</div>
						</div>
						<div className="space-y-1.5">
							<Label htmlFor="visit-type-color">
								Color (optional)
							</Label>
							<Input
								id="visit-type-color"
								value={form.color}
								onChange={(event) =>
									updateForm("color", event.target.value)
								}
								placeholder="#2f6d63"
							/>
						</div>
						<label className="flex items-center gap-2 text-sm text-ink">
							<input
								type="checkbox"
								checked={form.isFollowUp}
								onChange={(event) =>
									updateForm(
										"isFollowUp",
										event.target.checked,
									)
								}
							/>
							This is a follow-up visit
						</label>
						{selectedVisitType && (
							<label className="flex items-center gap-2 text-sm text-ink">
								<input
									type="checkbox"
									checked={form.isActive}
									onChange={(event) =>
										updateForm(
											"isActive",
											event.target.checked,
										)
									}
								/>
								Active and available for appointments
							</label>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={closeForm}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving
									? "Saving..."
									: selectedVisitType
										? "Save changes"
										: "Create visit type"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={visitTypeToDeactivate !== null}
				onOpenChange={(open) => {
					if (!open && !isDeactivating) {
						setVisitTypeToDeactivate(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Deactivate visit type?</DialogTitle>
						<DialogDescription>
							{visitTypeToDeactivate
								? `${visitTypeToDeactivate.name} will no longer be available for new appointments. Existing appointment history will be kept.`
								: "This visit type will no longer be available for new appointments."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							disabled={isDeactivating}
							onClick={() => setVisitTypeToDeactivate(null)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeactivating}
							onClick={confirmDeactivation}
						>
							{isDeactivating ? "Deactivating..." : "Deactivate"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</div>
	);
}
