"use client";

import { useMemo, useState } from "react";
import {
	Lock,
	Eye,
	EyeOff,
	ArrowRight,
	Check,
	CheckCircle2,
} from "lucide-react";
import { Logomark } from "@/components/shared/Logomark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import Link from "next/link";

const REQUIREMENTS = [
	{
		id: "length",
		label: "At least 8 characters",
		test: (v) => v.length >= 8,
	},
	{ id: "number", label: "At least one number", test: (v) => /\d/.test(v) },
	{
		id: "letter",
		label: "At least one letter",
		test: (v) => /[a-zA-Z]/.test(v),
	},
];

export default function NewPassword() {
	const [password, setPassword] = useState("");
	const [confirmPassword, setConfirmPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [showConfirm, setShowConfirm] = useState(false);
	const [submitting, setSubmitting] = useState(false);
	const [submitted, setSubmitted] = useState(false);
	const [error, setError] = useState("");

	const checks = useMemo(
		() => REQUIREMENTS.map((r) => ({ ...r, met: r.test(password) })),
		[password],
	);
	const allMet = checks.every((c) => c.met);
	const passwordsMatch =
		confirmPassword.length > 0 && password === confirmPassword;

	const handleSubmit = (e) => {
		e.preventDefault();
		setError("");

		if (!allMet) {
			setError(
				"Your password doesn't meet the requirements below.",
			);
			return;
		}
		if (!passwordsMatch) {
			setError("Those passwords don't match.");
			return;
		}

		setSubmitting(true);
		// Wire this up to your real "set new password" call — this just simulates a round trip.
		setTimeout(() => {
			setSubmitting(false);
			setSubmitted(true);
		}, 1000);
	};

	return (
		<div className="min-h-screen bg-bg text-ink font-sans antialiased flex flex-col">
			<div className="flex items-center justify-between p-6">
				<Link href={"/"}>
					<span
						className="flex items-center gap-2 text-ink font-semibold text-[1.05rem]"
					>
						<Logomark />
						Wardline
					</span>
				</Link>
				<ThemeToggle />
			</div>

			<div className="flex-1 flex items-center justify-center px-6 pb-16">
				<div className="w-full max-w-[380px]">
					{!submitted ? (
						<>
							<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
								Set new password
							</p>
							<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
								Choose a new password.
							</h1>
							<p className="text-ink-muted text-[0.95rem] mb-8">
								Make it something you haven&apos;t
								used before on Wardline.
							</p>

							<form
								onSubmit={handleSubmit}
								className="flex flex-col gap-5"
								noValidate
							>
								<div>
									<label
										htmlFor="password"
										className="block text-[0.85rem] font-medium mb-2"
									>
										New password
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
												password
											}
											onChange={(
												e,
											) =>
												setPassword(
													e
														.target
														.value,
												)
											}
											placeholder="••••••••"
											className="w-full pl-10 pr-11 py-3 rounded-xl border border-line bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150"
										/>
										<button
											type="button"
											onClick={() =>
												setShowPassword(
													(
														v,
													) =>
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
								</div>

								<ul className="flex flex-col gap-1.5 -mt-2">
									{checks.map((c) => (
										<li
											key={c.id}
											className={`flex items-center gap-2 text-[0.8rem] ${
												c.met
													? "text-brand"
													: "text-ink-faint"
											}`}
										>
											<Check
												size={
													13
												}
												className={
													c.met
														? "opacity-100"
														: "opacity-40"
												}
											/>
											{c.label}
										</li>
									))}
								</ul>

								<div>
									<label
										htmlFor="confirmPassword"
										className="block text-[0.85rem] font-medium mb-2"
									>
										Confirm new password
									</label>
									<div className="relative">
										<Lock
											size={16}
											className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-faint"
											aria-hidden="true"
										/>
										<input
											id="confirmPassword"
											type={
												showConfirm
													? "text"
													: "password"
											}
											autoComplete="new-password"
											required
											value={
												confirmPassword
											}
											onChange={(
												e,
											) =>
												setConfirmPassword(
													e
														.target
														.value,
												)
											}
											placeholder="••••••••"
											className="w-full pl-10 pr-11 py-3 rounded-xl border border-line bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150"
										/>
										<button
											type="button"
											onClick={() =>
												setShowConfirm(
													(
														v,
													) =>
														!v,
												)
											}
											aria-label={
												showConfirm
													? "Hide password"
													: "Show password"
											}
											className="absolute right-3 top-1/2 -translate-y-1/2 text-ink-faint hover:text-ink"
										>
											{showConfirm ? (
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
								</div>

								{error && (
									<p className="text-[0.85rem] text-accent-strong">
										{error}
									</p>
								)}

								<button
									type="submit"
									disabled={submitting}
									className="w-full inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.92rem] py-3 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
								>
									{submitting ? (
										"Saving…"
									) : (
										<>
											Save new
											password{" "}
											<ArrowRight
												size={
													16
												}
											/>
										</>
									)}
								</button>
							</form>
						</>
					) : (
						<div>
							<div className="w-11 h-11 rounded-full bg-surface-2 text-brand flex items-center justify-center mb-6">
								<CheckCircle2 size={22} />
							</div>
							<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
								Password updated.
							</h1>
							<p className="text-ink-muted text-[0.95rem] mb-8 leading-[1.6]">
								Your password has been changed.
								You can now log in with your new
								password.
							</p>
							<a
								href="#"
								className="inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.92rem] px-6 py-3 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px"
							>
								Back to log in{" "}
								<ArrowRight size={16} />
							</a>
						</div>
					)}
				</div>
			</div>
		</div>
	);
}
