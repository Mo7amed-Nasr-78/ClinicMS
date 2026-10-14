"use client";

import type { Dispatch, FormEventHandler, SetStateAction } from "react";
import type { ComponentProps } from "react";
import type { Doctor } from "@/api/services/doctorsService";
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
	defaultDoctorForm,
	doctorDisplayName,
	type DoctorForm,
} from "./doctor-utils";

type DoctorDialogsProps = {
	form: DoctorForm;
	setForm: Dispatch<SetStateAction<DoctorForm>>;
	selectedDoctor: Doctor | null;
	setSelectedDoctor: Dispatch<SetStateAction<Doctor | null>>;
	isModalOpen: boolean;
	setIsModalOpen: (open: boolean) => void;
	onSubmit: FormEventHandler<HTMLFormElement>;
	isPending: boolean;
	doctorToDeactivate: Doctor | null;
	setDoctorToDeactivate: Dispatch<SetStateAction<Doctor | null>>;
	onConfirmDeactivation: () => void;
	isDeactivating: boolean;
};

type DoctorFieldProps = ComponentProps<typeof Input> & {
	label: string;
};

function DoctorField({ id, label, className, ...props }: DoctorFieldProps) {
	return (
		<div className="space-y-1.5">
			<Label htmlFor={id} className="text-sm font-medium text-ink">
				{label}{" "}
				<span className="text-accent-strong" aria-hidden="true">
					*
				</span>
			</Label>
			<Input id={id} className={className} required {...props} />
		</div>
	);
}

export function DoctorDialogs({
	form,
	setForm,
	selectedDoctor,
	setSelectedDoctor,
	isModalOpen,
	setIsModalOpen,
	onSubmit,
	isPending,
	doctorToDeactivate,
	setDoctorToDeactivate,
	onConfirmDeactivation,
	isDeactivating,
}: DoctorDialogsProps) {
	const handleFormChange =
		(field: keyof DoctorForm) =>
		(event: React.ChangeEvent<HTMLInputElement>) => {
			setForm((current) => ({
				...current,
				[field]: event.target.value,
			}));
		};

	const closeForm = () => {
		setIsModalOpen(false);
		setSelectedDoctor(null);
		setForm(defaultDoctorForm);
	};

	return (
		<>
			<Dialog
				open={isModalOpen}
				onOpenChange={(open) => {
					setIsModalOpen(open);
					if (!open) {
						setSelectedDoctor(null);
						setForm(defaultDoctorForm);
					}
				}}
			>
				<DialogContent className="flex max-h-[calc(100dvh-2rem)] w-[calc(100%-2rem)] max-w-2xl flex-col gap-0 overflow-hidden rounded-lg sm:max-w-2xl">
					<DialogHeader className="shrink-0 border-b border-line px-6 py-5 text-left">
						<DialogTitle className="text-2xl font-semibold text-ink">
							{selectedDoctor
								? "Edit doctor"
								: "Add a doctor"}
						</DialogTitle>
						<DialogDescription className="text-sm text-ink-muted">
							Enter the doctor&apos;s contact and
							practice details.{" "}
							<span className="text-accent-strong">
								*
							</span>{" "}
							Required fields.
						</DialogDescription>
					</DialogHeader>
					<form
						className="flex min-h-0 flex-1 flex-col overflow-hidden"
						onSubmit={onSubmit}
					>
						<div className="min-h-0 flex-1 space-y-6 overflow-y-auto px-6 py-5">
							<section className="space-y-3">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
									Personal details
								</h2>
								<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
									<DoctorField
										id="doctor-first-name"
										name="firstName"
										label="First name"
										placeholder="e.g. Ahmed"
										value={
											form.firstName
										}
										onChange={handleFormChange(
											"firstName",
										)}
									/>
									<DoctorField
										id="doctor-last-name"
										name="lastName"
										label="Last name"
										placeholder="e.g. Ali"
										value={
											form.lastName
										}
										onChange={handleFormChange(
											"lastName",
										)}
									/>
									<DoctorField
										id="doctor-email"
										name="email"
										label="Email"
										type="email"
										placeholder="name@clinic.com"
										value={form.email}
										disabled={Boolean(
											selectedDoctor,
										)}
										onChange={handleFormChange(
											"email",
										)}
									/>
									<DoctorField
										id="doctor-phone"
										name="phone"
										label="Phone"
										type="tel"
										placeholder="Phone number"
										value={form.phone}
										onChange={handleFormChange(
											"phone",
										)}
									/>
								</div>
							</section>
							<section className="space-y-3 border-t border-line pt-5">
								<h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
									Practice details
								</h2>
								<div className="grid gap-x-4 gap-y-4 sm:grid-cols-2">
									<DoctorField
										id="doctor-specialty"
										name="specialty"
										label="Specialty"
										placeholder="e.g. Cardiology"
										value={
											form.specialty
										}
										onChange={handleFormChange(
											"specialty",
										)}
									/>
									<DoctorField
										id="doctor-license-number"
										name="licenseNumber"
										label="License number"
										placeholder="License number"
										value={
											form.licenseNumber
										}
										onChange={handleFormChange(
											"licenseNumber",
										)}
									/>
									<DoctorField
										id="doctor-consultation-duration"
										name="consultationDuration"
										label="Consultation duration (minutes)"
										type="number"
										min={15}
										placeholder="30"
										value={
											form.consultationDuration
										}
										onChange={handleFormChange(
											"consultationDuration",
										)}
									/>
									<DoctorField
										id="doctor-consultation-fee"
										name="consultationFee"
										label="Consultation fee"
										type="number"
										min={0}
										step="0.01"
										placeholder="500"
										value={
											form.consultationFee
										}
										onChange={handleFormChange(
											"consultationFee",
										)}
									/>
								</div>
							</section>
							{!selectedDoctor && (
								<section className="space-y-3 border-t border-line pt-5">
									<h2 className="text-xs font-semibold uppercase tracking-wide text-ink-muted">
										Account access
									</h2>
									<div className="sm:max-w-[calc(50%-0.5rem)]">
										<DoctorField
											id="doctor-password"
											name="password"
											label="Temporary password"
											type="password"
											placeholder="Create a password"
											value={
												form.password
											}
											onChange={handleFormChange(
												"password",
											)}
										/>
									</div>
								</section>
							)}
						</div>
						<DialogFooter className="shrink-0 border-t border-line bg-surface px-6 py-4">
							<Button
								type="button"
								variant="ghost"
								onClick={closeForm}
							>
								Cancel
							</Button>
							<Button
								type="submit"
								disabled={isPending}
							>
								{isPending
									? selectedDoctor
										? "Saving..."
										: "Creating..."
									: selectedDoctor
										? "Save changes"
										: "Create doctor"}
							</Button>
						</DialogFooter>
					</form>
				</DialogContent>
			</Dialog>

			<Dialog
				open={doctorToDeactivate !== null}
				onOpenChange={(open) => {
					if (!open && !isDeactivating)
						setDoctorToDeactivate(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>
							Deactivate doctor?
						</DialogTitle>
						<DialogDescription>
							{doctorToDeactivate
								? `${doctorDisplayName(doctorToDeactivate)} will no longer be able to access this clinic. Their clinical history will be kept.`
								: "The doctor will no longer be able to access this clinic."}
						</DialogDescription>
					</DialogHeader>
					<DialogFooter>
						<Button
							type="button"
							variant="ghost"
							disabled={isDeactivating}
							onClick={() =>
								setDoctorToDeactivate(null)
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
