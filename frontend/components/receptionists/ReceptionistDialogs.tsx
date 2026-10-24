"use client";

import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import type { ComponentProps } from "react";
import type { Receptionist } from "@/api/services/receptionistsService";
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
	defaultReceptionistForm,
	receptionistName,
	type ReceptionistForm,
} from "./receptionist-utils";

type ReceptionistDialogsProps = {
	form: ReceptionistForm;
	setForm: Dispatch<SetStateAction<ReceptionistForm>>;
	selectedReceptionist: Receptionist | null;
	setSelectedReceptionist: Dispatch<
		SetStateAction<Receptionist | null>
	>;
	isFormOpen: boolean;
	setIsFormOpen: (open: boolean) => void;
	onSubmit: FormEventHandler<HTMLFormElement>;
	isSaving: boolean;
	receptionistToDeactivate: Receptionist | null;
	setReceptionistToDeactivate: Dispatch<
		SetStateAction<Receptionist | null>
	>;
	onConfirmDeactivation: () => void;
	isDeactivating: boolean;
};

type ReceptionistFieldProps = ComponentProps<typeof Input> & {
	label: string;
};

function ReceptionistField({
	id,
	label,
	...props
}: ReceptionistFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-sm font-medium text-ink">
				{label}
				{props.required && (
					<span className="ml-1 text-accent-strong" aria-hidden="true">
						*
					</span>
				)}
			</Label>
			<Input id={id} required={props.required} {...props} />
		</div>
	);
}

export function ReceptionistDialogs({
	form,
	setForm,
	selectedReceptionist,
	setSelectedReceptionist,
	isFormOpen,
	setIsFormOpen,
	onSubmit,
	isSaving,
	receptionistToDeactivate,
	setReceptionistToDeactivate,
	onConfirmDeactivation,
	isDeactivating,
}: ReceptionistDialogsProps) {
	const handleChange =
		(field: keyof ReceptionistForm) =>
		(event: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
			setForm((current) => ({
				...current,
				[field]: event.target.value,
			}));
		};

	const resetForm = () => {
		setIsFormOpen(false);
		setSelectedReceptionist(null);
		setForm(defaultReceptionistForm);
	};

	return (
		<>
			<Dialog
				open={isFormOpen}
				onOpenChange={(open) => {
					setIsFormOpen(open);
					if (!open) {
						setSelectedReceptionist(null);
						setForm(defaultReceptionistForm);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							{selectedReceptionist
								? "Edit receptionist"
								: "Add a receptionist"}
						</DialogTitle>
						<DialogDescription>
							{selectedReceptionist
								? "Update their contact details or account status."
								: "Create a receptionist account for this clinic."}
						</DialogDescription>
					</DialogHeader>
					<form className="space-y-4" onSubmit={onSubmit}>
						<div className="grid gap-4 sm:grid-cols-2">
							<ReceptionistField
								id="receptionist-first-name"
								label="First name"
								autoComplete="given-name"
								value={form.firstName}
								onChange={handleChange("firstName")}
							/>
							<ReceptionistField
								id="receptionist-last-name"
								label="Last name"
								autoComplete="family-name"
								value={form.lastName}
								onChange={handleChange("lastName")}
							/>
						</div>
						<ReceptionistField
							id="receptionist-email"
							label="Email"
							type="email"
							autoComplete="email"
							required
							disabled={Boolean(selectedReceptionist)}
							value={form.email}
							onChange={handleChange("email")}
						/>
						<ReceptionistField
							id="receptionist-phone"
							label="Phone"
							type="tel"
							autoComplete="tel"
							value={form.phone}
							onChange={handleChange("phone")}
						/>
						{!selectedReceptionist ? (
							<ReceptionistField
								id="receptionist-password"
								label="Temporary password"
								type="password"
								autoComplete="new-password"
								required
								minLength={8}
								value={form.password}
								onChange={handleChange("password")}
							/>
						) : (
							<div className="space-y-1.5">
								<Label
									htmlFor="receptionist-status"
									className="text-sm font-medium text-ink"
								>
									Account status
								</Label>
								<select
									id="receptionist-status"
									value={form.status}
									onChange={handleChange("status")}
									className="flex h-9 w-full rounded-md border border-input bg-background px-3 py-1 text-sm shadow-xs outline-none focus-visible:border-ring focus-visible:ring-3 focus-visible:ring-ring/50"
								>
									<option value="active">Active</option>
									<option value="inActive">
										Inactive
									</option>
									<option value="suspended">
										Suspended
									</option>
								</select>
							</div>
						)}
						<DialogFooter>
							<Button
								type="button"
								variant="ghost"
								onClick={resetForm}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isSaving}>
								{isSaving
									? "Saving..."
									: selectedReceptionist
										? "Save changes"
										: "Create receptionist"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={receptionistToDeactivate !== null}
				onOpenChange={(open) => {
					if (!open && !isDeactivating) {
						setReceptionistToDeactivate(null);
					}
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Deactivate receptionist?</DialogTitle>
						<DialogDescription>
							{receptionistToDeactivate
								? `${receptionistName(receptionistToDeactivate)} will lose access to this clinic.`
								: "This receptionist will lose access to this clinic."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							disabled={isDeactivating}
							onClick={() =>
								setReceptionistToDeactivate(null)
							}
						>
							Cancel
						</Button>
						<Button
							type="button"
							variant="destructive"
							disabled={isDeactivating}
							onClick={onConfirmDeactivation}
						>
							{isDeactivating
								? "Deactivating..."
								: "Deactivate"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
