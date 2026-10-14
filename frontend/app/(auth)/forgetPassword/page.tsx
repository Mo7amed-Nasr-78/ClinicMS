"use client";

import { useState, FormEvent } from "react";
import { Mail, ArrowLeft, ArrowRight, CheckCircle2 } from "lucide-react";
import Link from "next/link";
import { Logomark } from "@/components/shared/Logomark";
import { ThemeToggle } from "@/components/shared/ThemeToggle";

export default function ResetPassword() {
    const [email, setEmail] = useState("");
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [error, setError] = useState("");

    const handleSubmit = (e: FormEvent) => {
        e.preventDefault();
        setError("");
        setSubmitting(true);

        // Wire this up to your real "send reset link" call — this just simulates a round trip.
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
                    <Link href={"/login"}>
                        <span
                            className="inline-flex items-center gap-1.5 text-[0.85rem] text-ink-muted hover:text-ink mb-8"
                        >
                            <ArrowLeft size={15} />
                            Back to log in
                        </span>
                    </Link>

                    {!submitted ? (
                        <>
                            <p className="font-mono uppercase tracking-[0.08em] text-[0.72rem] font-medium text-brand mb-3">
                                Reset password
                            </p>
                            <h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
                                Forgot your password?
                            </h1>
                            <p className="text-ink-muted text-[0.95rem] mb-8">
                                Enter the email on your account
                                and we&apos;ll send you a link
                                to set a new one.
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
                                            onChange={(
                                                e,
                                            ) =>
                                                setEmail(
                                                    e
                                                        .target
                                                        .value,
                                                )
                                            }
                                            placeholder="you@clinic.com"
                                            className="w-full pl-10 pr-4 py-3 rounded-xl border border-line bg-surface text-ink text-[0.92rem] placeholder:text-ink-faint focus:border-brand outline-none transition-colors duration-150"
                                        />
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
                                        "Sending link…"
                                    ) : (
                                        <>
                                            Send reset
                                            link{" "}
                                            <ArrowRight
                                                size={
                                                    16
                                                }
                                            />
                                        </>
                                    )}
                                </button>
                            </form>

                            <p className="mt-8 text-center text-[0.88rem] text-ink-muted">
                                Don&apos;t have an account?{" "}
                                <a
                                    href="#pricing"
                                    className="text-brand font-medium hover:text-brand-deep"
                                >
                                    Start a free trial
                                </a>
                            </p>
                        </>
                    ) : (
                        <div>
                            <div className="w-11 h-11 rounded-full bg-surface-2 text-brand flex items-center justify-center mb-6">
                                <CheckCircle2 size={22} />
                            </div>
                            <h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.8rem,3vw,2.2rem)] mb-2">
                                Check your email.
                            </h1>
                            <p className="text-ink-muted text-[0.95rem] mb-8 leading-[1.6]">
                                If an account exists for{" "}
                                <span className="text-ink font-medium">
                                    {email}
                                </span>
                                , we&apos;ve sent a link to reset
                                your password. It&apos;ll expire
                                in 30 minutes.
                            </p>
                            <button
                                type="button"
                                onClick={() =>
                                    setSubmitted(false)
                                }
                                className="text-[0.88rem] text-brand font-medium hover:text-brand-deep"
                            >
                                Didn&apos;t get it? Try a
                                different email
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}
