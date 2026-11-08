"use client";

import { useState, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { useCreatePatient } from "@/api/hooks/Patients";
import { patientSchema } from "@/api/schemas/patientSchema";
import { getApiErrorMessage } from "@/api/services/clinicService";
import type { CreatePatientPayload } from "@/api/services/patientService";
import { PatientField } from "@/components/patients/PatientField";
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

type RegisterPatientForm = CreatePatientPayload & {
	relativeName: string;
	relativePhone: string;
	relativeRelation: string;
};

const initialForm: RegisterPatientForm = {
	firstName: "",
	lastName: "",
	dateOfBirth: "",
	gender: "",
	bloodType: "",
	phone: "",
	email: "",
	address: "",
	emergencyContact: "",
	allergies: "",
	relativeName: "",
	relativePhone: "",
	relativeRelation: "",
};

export default function RegisterPatientPage() {
	const router = useRouter();
	const [sidebarOpen, setSidebarOpen] = useState(false);
	const [form, setForm] = useState<RegisterPatientForm>(initialForm);
	const [errors, setErrors] = useState<Record<string, string>>({});
	const { mutate: createPatient, isPending } = useCreatePatient();

	const updateField = (field: keyof RegisterPatientForm, value: string) => {
		setForm((current) => ({ ...current, [field]: value }));
		setErrors((current) => ({ ...current, [field]: "" }));
	};

	const handleSubmit = (event: FormEvent<HTMLFormElement>) => {
		event.preventDefault();
		const result = patientSchema.safeParse({
			...form,
			emergencyContact: form.relativePhone.trim(),
		});

		if (!result.success) {
			const nextErrors: Record<string, string> = {};
			for (const issue of result.error.issues) {
				const field = issue.path[0];
				if (typeof field === "string" && !nextErrors[field]) {
					nextErrors[field] = issue.message;
				}
			}
			setErrors(nextErrors);
			return;
		}

		createPatient(result.data, {
			onSuccess: () => {
				toast.success("Patient registered successfully.");
				router.push("/dashboard/patients");
			},
			onError: (error) => toast.error(getApiErrorMessage(error)),
		});
	};

	return (
		<div className="flex h-screen overflow-hidden bg-bg font-sans text-ink antialiased">
			<Sidebar
				open={sidebarOpen}
				onClose={() => setSidebarOpen(false)}
				activeItem="Patients"
			/>
			<div className="flex h-full min-w-0 flex-1 flex-col overflow-y-auto px-4 sm:px-6">
				<Topbar
					onMenuClick={() => setSidebarOpen(true)}
					title="Register patient"
				/>
				<main className="mx-auto w-full pb-10">
					<form
						onSubmit={handleSubmit}
						noValidate
						className="mt-5 space-y-5"
					>
						<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
							<div className="mb-5 border-b border-line pb-4">
								<h2 className="font-semibold text-ink">
									Personal details
								</h2>
								<p className="text-sm text-ink-muted">
									Basic information used to identify the patient.
								</p>
							</div>
							<div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
								<PatientField
									id="register-first-name"
									label="First name"
									value={form.firstName}
									onChange={(event) =>
										updateField("firstName", event.target.value)
									}
									error={errors.firstName}
									required
									autoComplete="given-name"
								/>
								<PatientField
									id="register-last-name"
									label="Last name"
									value={form.lastName}
									onChange={(event) =>
										updateField("lastName", event.target.value)
									}
									error={errors.lastName}
									required
									autoComplete="family-name"
								/>
								<PatientField
									id="register-date-of-birth"
									label="Date of birth"
									type="date"
									value={form.dateOfBirth}
									onChange={(event) =>
										updateField("dateOfBirth", event.target.value)
									}
									error={errors.dateOfBirth}
									required
								/>
								<div className="space-y-1.5">
									<label
										htmlFor="register-gender"
										className="text-sm font-medium text-ink"
									>
										Gender <span className="text-accent-strong">*</span>
									</label>
									<Select
										value={form.gender}
										onValueChange={(value) =>
											updateField("gender", value)
										}
									>
										<SelectTrigger
											id="register-gender"
											className="w-full"
											aria-invalid={Boolean(errors.gender)}
										>
											<SelectValue placeholder="Select gender" />
										</SelectTrigger>
										<SelectContent>
											<SelectItem value="male">Male</SelectItem>
											<SelectItem value="female">Female</SelectItem>
										</SelectContent>
									</Select>
									{errors.gender && (
										<p role="alert" className="text-xs text-accent-strong">
											{errors.gender}
										</p>
									)}
								</div>
								<PatientField
									id="register-blood-type"
									label="Blood type"
									value={form.bloodType}
									onChange={(event) =>
										updateField("bloodType", event.target.value)
									}
									error={errors.bloodType}
									required
									placeholder="e.g. AB+"
								/>
							</div>
						</section>

						<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
							<div className="mb-5 border-b border-line pb-4">
								<h2 className="font-semibold text-ink">
									Contact details
								</h2>
								<p className="text-sm text-ink-muted">
									How the clinic can reach the patient.
								</p>
							</div>
							<div className="grid gap-x-5 gap-y-4 sm:grid-cols-2">
								<PatientField
									id="register-phone"
									label="Phone"
									type="tel"
									value={form.phone}
									onChange={(event) =>
										updateField("phone", event.target.value)
									}
									error={errors.phone}
									required
									autoComplete="tel"
								/>
								<PatientField
									id="register-email"
									label="Email"
									type="email"
									value={form.email}
									onChange={(event) =>
										updateField("email", event.target.value)
									}
									error={errors.email}
									required
									autoComplete="email"
								/>
								<PatientField
									id="register-address"
									label="Address"
									value={form.address}
									onChange={(event) =>
										updateField("address", event.target.value)
									}
									error={errors.address}
									autoComplete="street-address"
								/>
								<PatientField
									id="register-allergies"
									label="Allergies"
									value={form.allergies}
									onChange={(event) =>
										updateField("allergies", event.target.value)
									}
									error={errors.allergies}
									placeholder="Optional"
								/>
							</div>
						</section>

						<section className="rounded-xl border border-line bg-surface p-5 sm:p-6">
							<div className="mb-5 border-b border-line pb-4">
								<h2 className="font-semibold text-ink">
									Emergency contact
								</h2>
								<p className="text-sm text-ink-muted">
									Provide someone the clinic can contact on the
									patient&apos;s behalf.
								</p>
							</div>
							<div className="grid gap-x-5 gap-y-4 sm:grid-cols-3">
								<PatientField
									id="relative-name"
									label="Contact name"
									value={form.relativeName}
									onChange={(event) =>
										updateField("relativeName", event.target.value)
									}
									error={errors.relativeName}
									autoComplete="name"
									placeholder="Full name"
								/>
								<PatientField
									id="relative-phone"
									label="Contact phone"
									type="tel"
									value={form.relativePhone}
									onChange={(event) =>
										updateField("relativePhone", event.target.value)
									}
									error={errors.relativePhone}
									autoComplete="tel"
									placeholder="Phone number"
								/>
								<PatientField
									id="relative-relation"
									label="Relationship to patient"
									value={form.relativeRelation}
									onChange={(event) =>
										updateField("relativeRelation", event.target.value)
									}
									error={errors.relativeRelation}
									placeholder="e.g. Parent, spouse, guardian"
								/>
							</div>
						</section>

						<div className="flex flex-col-reverse gap-3 border-t border-line pt-5 sm:flex-row sm:justify-end">
							<Button
								type="button"
								variant="outline"
								onClick={() => router.push("/dashboard/patients")}
							>
								Cancel
							</Button>
							<Button type="submit" disabled={isPending}>
								{isPending ? "Registering..." : "Register patient"}
							</Button>
						</div>
					</form>
				</main>
			</div>
		</div>
	);
}
