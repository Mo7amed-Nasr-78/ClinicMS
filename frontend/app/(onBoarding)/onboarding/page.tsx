"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useSession } from "next-auth/react";
import { toast } from "sonner";
import {
	Building2,
	Mail,
	Phone,
	MapPin,
	ArrowLeft,
	ArrowRight,
} from "lucide-react";
import { Logomark } from "@/components/shared/Logomark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { Stepper } from "@/components/onboarding/Stepper";
import { LogoUpload, validateLogo } from "@/components/onboarding/LogoUpload";
import { createClinic, getApiErrorMessage } from "@/api/services/clinicService";
import { useClinicStore } from "@/stores/clinicStore";

/* ------------------------------------------------------------------ */
/* Config                                                              */
/* ------------------------------------------------------------------ */

const STEPS = [{ label: "Clinic" }, { label: "Contact" }, { label: "Logo" }];

type Values = { name: string; email: string; phone: string; address: string };
type Errors = Partial<Record<keyof Values | "logo", string>>;

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const PHONE_RE = /^\+?[0-9\s().-]{7,20}$/;

const INPUT =
	"w-full pl-10 pr-4 py-3 rounded-xl border bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150";

function validate(step: number, v: Values): Errors {
	const e: Errors = {};
	if (step === 0) {
		if (v.name.trim().length < 2) e.name = "Enter your clinic's name.";
	}
	if (step === 1) {
		if (!EMAIL_RE.test(v.email.trim()))
			e.email = "Enter a valid email address.";
		if (!PHONE_RE.test(v.phone.trim()))
			e.phone = "Enter a valid phone number.";
		if (v.address.trim().length < 5)
			e.address = "Enter the clinic's street address.";
	}
	return e;
}

/* ------------------------------------------------------------------ */
/* Field wrapper                                                       */
/* ------------------------------------------------------------------ */

function Field({
	id,
	label,
	error,
	icon: Icon,
	textarea = false,
	...props
}: {
	id: string;
	label: string;
	error?: string;
	icon: React.ComponentType<{
		size?: number;
		className?: string;
		"aria-hidden"?: boolean;
	}>;
	textarea?: boolean;
} & React.InputHTMLAttributes<HTMLInputElement & HTMLTextAreaElement>) {
	const shared = {
		id,
		"aria-invalid": !!error,
		"aria-describedby": error ? `${id}-error` : undefined,
		className: `${INPUT} ${error ? "border-accent-strong" : "border-line"}`,
	};

	return (
		<div>
			<label
				htmlFor={id}
				className="block text-[0.85rem] font-medium mb-2"
			>
				{label}
			</label>
			<div className="relative">
				<Icon
					size={16}
					className={`absolute left-3 text-ink-faint ${textarea ? "top-[15px]" : "top-1/2 -translate-y-1/2"}`}
					aria-hidden
				/>
				{textarea ? (
					<textarea
						rows={3}
						{...shared}
						{...(props as React.TextareaHTMLAttributes<HTMLTextAreaElement>)}
					/>
				) : (
					<input {...shared} {...props} />
				)}
			</div>
			{error && (
				<p
					id={`${id}-error`}
					role="alert"
					className="mt-2 text-[0.82rem] text-accent-strong"
				>
					{error}
				</p>
			)}
		</div>
	);
}

/* ------------------------------------------------------------------ */
/* Page                                                                */
/* ------------------------------------------------------------------ */

export default function Onboarding() {
	const router = useRouter();
	const { update } = useSession();
	const [step, setStep] = useState(0);
	const [values, setValues] = useState<Values>({
		name: "",
		email: "",
		phone: "",
		address: "",
	});
	const [logo, setLogo] = useState<File | null>(null);
	const [errors, setErrors] = useState<Errors>({});
	const [submitting, setSubmitting] = useState(false);
	const fetchMyClinic = useClinicStore((state) => state.fetchMyClinic);

	const isLast = step === STEPS.length - 1;

	const set =
		(key: keyof Values) =>
		(e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
			setValues((v) => ({ ...v, [key]: e.target.value }));
			if (errors[key])
				setErrors((prev) => ({ ...prev, [key]: undefined }));
		};

	const handleLogo = (file: File | null) => {
		if (!file) {
			setLogo(null);
			setErrors((prev) => ({ ...prev, logo: undefined }));
			return;
		}
		const problem = validateLogo(file);
		if (problem) {
			setLogo(null);
			setErrors((prev) => ({ ...prev, logo: problem }));
			return;
		}
		setErrors((prev) => ({ ...prev, logo: undefined }));
		setLogo(file);
	};

	const goBack = () => {
		setErrors({});
		setStep((s) => Math.max(0, s - 1));
	};

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const found = validate(step, values);
		if (Object.keys(found).length) {
			setErrors(found);
			return;
		}
		setErrors({});

		if (!isLast) {
			setStep((s) => s + 1);
			return;
		}

		setSubmitting(true);
		try {
			await createClinic({
				name: values.name.trim(),
				email: values.email.trim(),
				phone: values.phone.trim(),
				address: values.address.trim(),
				logo,
			});
			await fetchMyClinic();
			await update();
			toast.success("Clinic created successfully.");
			router.push("/dashboard");
		} catch (err) {
			toast.error(getApiErrorMessage(err));
		} finally {
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-bg text-ink font-sans antialiased flex flex-col">
			<div className="flex items-center justify-between p-6">
				<Link href="/">
					<span className="flex items-center gap-2 text-ink font-semibold text-[1.05rem]">
						<Logomark />
						Wardline
					</span>
				</Link>
				<ThemeToggle />
			</div>

			<div className="flex-1 flex items-center justify-center px-6 pb-16">
				<div className="w-full max-w-[440px]">
					<Stepper steps={STEPS} current={step} />

					<form
						onSubmit={handleSubmit}
						noValidate
						className="flex flex-col gap-5"
						key={step}
					>
						{step === 0 && (
							<>
								<div className="mb-3">
									<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
										Set up your clinic
									</p>
									<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
										What&apos;s your
										clinic called?
									</h1>
									<p className="text-ink-muted text-[0.95rem]">
										This is the name
										patients and staff
										will see on
										bookings, reminders,
										and invoices.
									</p>
								</div>
								<Field
									id="name"
									label="Clinic name"
									icon={Building2}
									type="text"
									autoComplete="organization"
									autoFocus
									value={values.name}
									onChange={set("name")}
									placeholder="Birchwood Family Health"
									error={errors.name}
								/>
							</>
						)}

						{step === 1 && (
							<>
								<div className="mb-3">
									<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
										Contact details
									</p>
									<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
										How can patients
										reach you?
									</h1>
									<p className="text-ink-muted text-[0.95rem]">
										We&apos;ll use these
										on reminders and
										receipts. You can
										change them later in
										Settings.
									</p>
								</div>
								<Field
									id="email"
									label="Clinic email"
									icon={Mail}
									type="email"
									autoComplete="email"
									autoFocus
									value={values.email}
									onChange={set("email")}
									placeholder="hello@clinic.com"
									error={errors.email}
								/>
								<Field
									id="phone"
									label="Phone number"
									icon={Phone}
									type="tel"
									autoComplete="tel"
									value={values.phone}
									onChange={set("phone")}
									placeholder="+1 555 010 2030"
									error={errors.phone}
								/>
								<Field
									id="address"
									label="Address"
									icon={MapPin}
									textarea
									autoComplete="street-address"
									value={values.address}
									onChange={set("address")}
									placeholder="12 Main Street, Springfield"
									error={errors.address}
								/>
							</>
						)}

						{step === 2 && (
							<>
								<div className="mb-3">
									<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
										Branding
									</p>
									<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
										Add your logo.
									</h1>
									<p className="text-ink-muted text-[0.95rem]">
										It shows up on
										patient messages and
										invoices. Optional —
										you can add it
										later.
									</p>
								</div>
								<LogoUpload
									file={logo}
									onChange={handleLogo}
									error={errors.logo}
								/>
							</>
						)}

						<div className="flex items-center gap-3 mt-2">
							{step > 0 && (
								<button
									type="button"
									onClick={goBack}
									disabled={submitting}
									className="inline-flex items-center justify-center gap-1.5 px-5 py-3 rounded-full border border-line-strong text-ink font-medium text-[0.92rem] hover:border-brand transition-colors duration-150 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
								>
									<ArrowLeft size={16} />
									Back
								</button>
							)}
							<button
								type="submit"
								disabled={submitting}
								className="flex-1 inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.92rem] py-3 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
							>
								{submitting ? (
									"Creating your clinic…"
								) : isLast ? (
									<>
										Create clinic{" "}
										<ArrowRight
											size={16}
										/>
									</>
								) : (
									<>
										Continue{" "}
										<ArrowRight
											size={16}
										/>
									</>
								)}
							</button>
						</div>
					</form>
				</div>
			</div>
		</div>
	);
}
