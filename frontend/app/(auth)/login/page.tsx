"use client";

import { FormEvent, useState } from "react";
import { Mail, Lock, Eye, EyeOff, ArrowRight } from "lucide-react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { getSession, signIn } from "next-auth/react";
import { toast } from "sonner";
import { Logomark } from "@/components/shared/Logomark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";
import { useAccessTokenStore } from "@/stores/accessTokenStore";
import { useClinicStore } from "@/stores/clinicStore";

/* ------------------------------------------------------------------ */
/* Login page                                                          */
/* ------------------------------------------------------------------ */

export default function Login() {
	const router = useRouter();
	const fetchMyClinic = useClinicStore((state) => state.fetchMyClinic);
	const [email, setEmail] = useState("");
	const [password, setPassword] = useState("");
	const [showPassword, setShowPassword] = useState(false);
	const [remember, setRemember] = useState(true);
	const [submitting, setSubmitting] = useState(false);

	const handleSubmit = async (e: FormEvent) => {
		e.preventDefault();
		setSubmitting(true);

		try {
			const result = await signIn("credentials", {
				email,
				password,
				redirect: false,
			});

			if (!result || result.error) {
				toast.error("Invalid email or password.");
				return;
			}

			try {
				const session = await getSession();
				if (!session?.accessToken) {
					toast.error(
						"Signed in, but unable to retrieve your access token.",
					);
					return;
				}

				useAccessTokenStore
					.getState()
					.setAccessToken(session.accessToken);
				const clinic = await fetchMyClinic();
				toast.success("Signed in successfully.");
				router.replace(clinic ? "/dashboard" : "/onboarding");
				router.refresh();
			} catch {
				toast.error(
					"Signed in, but unable to load your clinic information.",
				);
			}
		} catch {
			toast.error("Unable to sign in. Please try again.");
		} finally {
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

				<Link href={"/"}>
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
						Welcome back to the calm schedule.
					</h1>
					<p className="text-onbrand-muted text-[1rem] leading-[1.6]">
						Booking, charts, billing, and reminders —
						still all in one place, right where you left
						them.
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
					<a
						href="#"
						className="flex items-center gap-2 text-brand-deep font-semibold text-[1.05rem] min-[960px]:hidden"
					>
						<Logomark />
						Wardline
					</a>
					<ThemeToggle />
				</div>

				<div className="flex-1 flex items-center justify-center px-6 pb-16">
					<div className="w-full max-w-[380px]">
						<p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
							Log in
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
							Good to see you again.
						</h2>
						<p className="text-ink-muted text-[0.95rem] mb-8">
							Enter your details to get back to
							today&apos;s schedule.
						</p>

						<form
							onSubmit={handleSubmit}
							className="flex flex-col gap-5"
							noValidate
						>
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
										value={email}
										onChange={(e) =>
											setEmail(
												e.target
													.value,
											)
										}
										placeholder="you@clinic.com"
										className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150"
									/>
								</div>
							</div>

							<div>
								<div className="flex items-center justify-between mb-2">
									<label
										htmlFor="password"
										className="block text-[0.85rem] font-medium"
									>
										Password
									</label>
									<Link
										href={
											"/forgetPassword"
										}
									>
										<span className="text-[0.82rem] text-brand hover:text-brand-deep">
											Forgot
											password?
										</span>
									</Link>
								</div>
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
										autoComplete="current-password"
										required
										value={password}
										onChange={(e) =>
											setPassword(
												e.target
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
							</div>

							<label className="flex items-center gap-2 text-[0.85rem] text-ink-muted select-none cursor-pointer">
								<input
									type="checkbox"
									checked={remember}
									onChange={(e) =>
										setRemember(
											e.target
												.checked,
										)
									}
									className="w-4 h-4 rounded border-line-strong accent-brand"
								/>
								Keep me signed in
							</label>

							<button
								type="submit"
								disabled={submitting}
								className="w-full inline-flex items-center justify-center gap-2 bg-brand text-chip font-medium text-[0.92rem] py-3 rounded-full hover:bg-brand-deep transition-colors duration-150 active:translate-y-px disabled:opacity-60 disabled:pointer-events-none"
							>
								{submitting ? (
									"Logging in…"
								) : (
									<>
										Log in{" "}
										<ArrowRight
											size={16}
										/>
									</>
								)}
							</button>
						</form>

						<p className="mt-8 text-center text-[0.88rem] text-ink-muted">
							Don&apos;t have an account?{" "}
							<Link href={"/register"}>
								<span className="text-brand font-medium hover:text-brand-deep underline">
									Create Account
								</span>
							</Link>
						</p>
					</div>
				</div>
			</div>
		</div>
	);
}
