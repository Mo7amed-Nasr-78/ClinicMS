"use client";

import { FormEvent, useState } from "react";
import { useRouter } from "next/navigation";
import { signIn } from "next-auth/react";
import Link from "next/link";
import { User, Mail, Lock, Eye, EyeOff, ArrowRight, Check } from "lucide-react";
import { toast } from "sonner";
import { Logomark } from "@/components/shared/Logomark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

/* ------------------------------------------------------------------ */
/* Validation                                                          */
/* ------------------------------------------------------------------ */

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

const PASSWORD_RULES = [
	{
		id: "len",
		label: "At least 8 characters",
		test: (p: string) => p.length >= 8,
	},
	{
		id: "case",
		label: "Upper and lower case letters",
		test: (p: string) => /[a-z]/.test(p) && /[A-Z]/.test(p),
	},
	{
		id: "num",
		label: "At least one number",
		test: (p: string) => /\d/.test(p),
	},
];

type Values = {
	firstName: string;
	lastName: string;
	email: string;
	password: string;
};
type Errors = Partial<Record<keyof Values, string>>;

function validate(v: Values): Errors {
	const e: Errors = {};
	if (!v.firstName.trim()) e.firstName = "Enter your first name.";
	if (!v.lastName.trim()) e.lastName = "Enter your last name.";
	if (!EMAIL_RE.test(v.email.trim()))
		e.email = "Enter a valid email address.";
	if (!PASSWORD_RULES.every((r) => r.test(v.password)))
		e.password =
			"Your password doesn't meet all the requirements below.";
	return e;
}

const INPUT =
	"w-full pl-10 pr-4 py-3 rounded-xl border bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150";

/* ------------------------------------------------------------------ */
/* Register page                                                       */
/* ------------------------------------------------------------------ */

export default function Register() {
	const router = useRouter();
	const [values, setValues] = useState<Values>({
		firstName: "",
		lastName: "",
		email: "",
		password: "",
	});
	const [errors, setErrors] = useState<Errors>({});
	const [showPassword, setShowPassword] = useState(false);
	const [submitting, setSubmitting] = useState(false);

	const set =
		(key: keyof Values) => (e: React.ChangeEvent<HTMLInputElement>) => {
			setValues((v) => ({ ...v, [key]: e.target.value }));
			if (errors[key])
				setErrors((prev) => ({ ...prev, [key]: undefined }));
		};

	const border = (key: keyof Values) =>
		errors[key] ? "border-accent-strong" : "border-line";

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();

		const found = validate(values);
		if (Object.keys(found).length) {
			setErrors(found);
			return;
		}

		setSubmitting(true);
		try {
			const result = await signIn("credentials", {
				action: "register",
				firstName: values.firstName.trim(),
				lastName: values.lastName.trim(),
				email: values.email.trim(),
				password: values.password,
				redirect: false,
			});

			if (result?.error) {
				toast.error(
					"Unable to create your account. Check your details and try again.",
				);
				setSubmitting(false);
				return;
			}

			toast.success("Account created successfully.");
			router.push("/onboarding");
			router.refresh();
		} catch {
			toast.error(
				"Unable to create your account. Please try again.",
			);
			setSubmitting(false);
		}
	};

	return (
		<div className="min-h-screen bg-bg text-ink font-sans antialiased grid grid-cols-1 min-[960px]:grid-cols-2">
			{/* ---------------- Brand panel ---------------- */}
			<div className="hidden min-[960px]:flex flex-col justify-between bg-brand-deep text-onbrand p-12 relative overflow-hidden">
				<div
					className="absolute inset-0 opacity-[0.06] pointer-events-none"
					style={{
						backgroundImage:
							"linear-gradient(rgb(var(--color-onbrand)) 1px, transparent 1px), linear-gradient(90deg, rgb(var(--color-onbrand)) 1px, transparent 1px)",
						backgroundSize: "44px 44px",
						WebkitMaskImage:
							"radial-gradient(ellipse 65% 55% at 30% 20%, black 0%, transparent 72%)",
						maskImage:
							"radial-gradient(ellipse 65% 55% at 30% 20%, black 0%, transparent 72%)",
					}}
				/>

				<Link href="/">
					<span className="relative flex items-center gap-2 font-semibold text-[1.05rem]">
						<Logomark />
						Wardline
					</span>
				</Link>

				<div className="relative max-w-[420px]">
					<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-onbrand-muted mb-4">
						Clinic operating system
					</p>
					<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(2rem,3vw,2.6rem)] leading-[1.15] mb-4">
						A calmer way to run your clinic starts here.
					</h1>
					<p className="text-onbrand-muted text-[1rem] leading-[1.6]">
						Create your account, tell us about your
						clinic, and start booking — scheduling,
						charts, billing, and reminders in one place.
					</p>
				</div>

				<div className="relative flex items-center justify-between font-mono text-[0.78rem] text-onbrand-muted">
					<span>500+ clinics running on Wardline</span>
					<span>© 2026 Wardline, Inc.</span>
				</div>
			</div>

			{/* ---------------- Form panel ---------------- */}
			<div className="flex flex-col min-h-screen">
				<div className="flex items-center justify-between p-6 min-[960px]:justify-end">
					<Link
						href="/"
						className="flex items-center gap-2 text-brand-deep font-semibold text-[1.05rem] min-[960px]:hidden"
					>
						<Logomark />
						Wardline
					</Link>
					<ThemeToggle />
				</div>

				<div className="flex-1 flex items-center justify-center px-6 pb-16">
					<div className="w-full max-w-[400px]">
						<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
							Create account
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
							Let&apos;s get you set up.
						</h2>
						<p className="text-ink-muted text-[0.95rem] mb-8">
							It takes about a minute. You&apos;ll
							add your clinic details next.
						</p>

						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-5"
							noValidate
						>
							{/* First / last name */}
							<div className="grid grid-cols-1 min-[420px]:grid-cols-2 gap-4">
								<div>
									<label
										htmlFor="firstName"
										className="block text-[0.85rem] font-medium mb-2"
									>
										First name
									</label>
									<div className="relative">
										<User
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
											aria-hidden="true"
										/>
										<input
											id="firstName"
											type="text"
											autoComplete="given-name"
											required
											autoFocus
											value={
												values.firstName
											}
											onChange={set(
												"firstName",
											)}
											aria-invalid={
												!!errors.firstName
											}
											aria-describedby={
												errors.firstName
													? "firstName-error"
													: undefined
											}
											placeholder="Amira"
											className={`${INPUT} ${border("firstName")}`}
										/>
									</div>
									{errors.firstName && (
										<p
											id="firstName-error"
											role="alert"
											className="mt-2 text-[0.82rem] text-accent-strong"
										>
											{
												errors.firstName
											}
										</p>
									)}
								</div>

								<div>
									<label
										htmlFor="lastName"
										className="block text-[0.85rem] font-medium mb-2"
									>
										Last name
									</label>
									<div className="relative">
										<User
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
											aria-hidden="true"
										/>
										<input
											id="lastName"
											type="text"
											autoComplete="family-name"
											required
											value={
												values.lastName
											}
											onChange={set(
												"lastName",
											)}
											aria-invalid={
												!!errors.lastName
											}
											aria-describedby={
												errors.lastName
													? "lastName-error"
													: undefined
											}
											placeholder="Hassan"
											className={`${INPUT} ${border("lastName")}`}
										/>
									</div>
									{errors.lastName && (
										<p
											id="lastName-error"
											role="alert"
											className="mt-2 text-[0.82rem] text-accent-strong"
										>
											{
												errors.lastName
											}
										</p>
									)}
								</div>
							</div>

							{/* Email */}
							<div>
								<label
									htmlFor="email"
									className="block text-[0.85rem] font-medium mb-2"
								>
									Work email
								</label>
								<div className="relative">
									<Mail
										size={16}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
										aria-hidden="true"
									/>
									<input
										id="email"
										type="email"
										autoComplete="email"
										required
										value={values.email}
										onChange={set(
											"email",
										)}
										aria-invalid={
											!!errors.email
										}
										aria-describedby={
											errors.email
												? "email-error"
												: undefined
										}
										placeholder="you@clinic.com"
										className={`${INPUT} ${border("email")}`}
									/>
								</div>
								{errors.email && (
									<p
										id="email-error"
										role="alert"
										className="mt-2 text-[0.82rem] text-accent-strong"
									>
										{errors.email}
									</p>
								)}
							</div>

							{/* Password */}
							<div>
								<label
									htmlFor="password"
									className="block text-[0.85rem] font-medium mb-2"
								>
									Password
								</label>
								<div className="relative">
									<Lock
										size={16}
										className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
										aria-hidden="true"
									/>
									<input
										id="password"
										type={
											showPassword
												? "text"
												: "password"
										}
										autoComplete="new-password"
										required
										value={
											values.password
										}
										onChange={set(
											"password",
										)}
										aria-invalid={
											!!errors.password
										}
										aria-describedby={
											errors.password
												? "password-error password-rules"
												: "password-rules"
										}
										placeholder="••••••••"
										className={`${INPUT} pr-11 ${border("password")}`}
									/>
									<button
										type="button"
										onClick={() =>
											setShowPassword(
												(v) =>
													!v,
											)
										}
										aria-label={
											showPassword
												? "Hide password"
												: "Show password"
										}
										className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
									>
										{showPassword ? (
											<EyeOff
												size={
													16
												}
											/>
										) : (
											<Eye
												size={
													16
												}
											/>
										)}
									</button>
								</div>
								{errors.password && (
									<p
										id="password-error"
										role="alert"
										className="mt-2 text-[0.82rem] text-accent-strong"
									>
										{errors.password}
									</p>
								)}
								<ul
									id="password-rules"
									className="mt-3 flex flex-col gap-1.5"
								>
									{PASSWORD_RULES.map(
										(rule) => {
											const met =
												rule.test(
													values.password,
												);
											return (
												<li
													key={
														rule.id
													}
													className={`flex items-center gap-2 text-[0.8rem] transition-colors duration-150 ${
														met
															? "text-brand"
															: "text-ink-faint"
													}`}
												>
													<span
														className={`w-4 h-4 rounded-full flex items-center justify-center border transition-colors duration-150 ${
															met
																? "bg-brand border-brand text-chip"
																: "border-line-strong"
														}`}
													>
														{met && (
															<Check
																size={
																	10
																}
																strokeWidth={
																	3
																}
															/>
														)}
													</span>
													{
														rule.label
													}
													<span className="sr-only">
														{met
															? " (met)"
															: " (not met yet)"}
													</span>
												</li>
											);
										},
									)}
								</ul>
							</div>

							<button
								type="submit"
								disabled={submitting}
								className="w-full inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.92rem] py-3 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
							>
								{submitting ? (
									"Creating your account…"
								) : (
									<>
										Create account{" "}
										<ArrowRight
											size={16}
										/>
									</>
								)}
							</button>

							<p className="text-center text-[0.78rem] text-ink-faint leading-[1.5]">
								By creating an account you agree
								to our{" "}
								<a
									href="#"
									className="underline hover:text-ink-muted"
								>
									Terms
								</a>{" "}
								and{" "}
								<a
									href="#"
									className="underline hover:text-ink-muted"
								>
									Privacy Policy
								</a>
								.
							</p>
						</form>

						<p className="mt-8 text-center text-[0.88rem] text-ink-muted">
							Already have an account?{" "}
							<Link
								href="/login"
								className="text-brand font-medium hover:text-brand-deep"
							>
								Log in
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
