"use client";

import { useEffect, useRef, useState } from "react";
import {
	Calendar,
	FileText,
	Bell,
	CreditCard,
	Users,
	BarChart3,
	Check,
	ArrowRight,
	Menu,
	X,
	Star,
	Sun,
	Moon,
} from "lucide-react";
import Link from "next/link";

/* ------------------------------------------------------------------ */
/* Data                                                                */
/* ------------------------------------------------------------------ */

const NAV_LINKS = [
	{ label: "Product", href: "#features" },
	{ label: "How it works", href: "#how-it-works" },
	{ label: "Pricing", href: "#pricing" },
];

const TRUST_NAMES = [
	"Birchwood Family Health",
	"Northside Pediatrics",
	"Delta Physical Therapy",
	"Union Square Dermatology",
	"Harlow Family Medicine",
];

const BEFORE = [
	"Reminders go out by whoever remembers to make the calls",
	"Charts live in one system, billing in another",
	"Cancellations sit empty until someone notices",
	"Every provider keeps their own version of today's schedule",
];

const AFTER = [
	"Reminders send themselves, two days and two hours out",
	"Charts and billing sit on the same record",
	"Open slots are offered to the waitlist automatically",
	"One schedule, live, on every screen in the building",
];

const FEATURES = [
	{
		icon: Calendar,
		title: "Scheduling",
		desc: "Book, reschedule, and fill cancellations from one calendar every provider can see.",
	},
	{
		icon: FileText,
		title: "Patient records",
		desc: "Visit notes, history, and results live on the same timeline as the appointment.",
	},
	{
		icon: Bell,
		title: "Reminders",
		desc: "Automatic texts and emails confirm visits and cut down on no-shows.",
	},
	{
		icon: CreditCard,
		title: "Billing",
		desc: "Send invoices and collect card payments without leaving the chart.",
	},
	{
		icon: Users,
		title: "Staff coordination",
		desc: "Shift coverage and room assignments update for everyone in real time.",
	},
	{
		icon: BarChart3,
		title: "Reporting",
		desc: "See no-show rates, revenue, and provider load at a glance.",
	},
];

const STEPS = [
	{
		n: "01",
		title: "Book",
		desc: "The patient books online, or the front desk books by phone. The slot locks instantly.",
	},
	{
		n: "02",
		title: "Remind",
		desc: "Automated texts confirm the visit two days and two hours out.",
	},
	{
		n: "03",
		title: "Check in",
		desc: "The patient checks in from their phone. The queue updates for the room.",
	},
	{
		n: "04",
		title: "Visit",
		desc: "The provider opens the chart with history and vitals already loaded.",
	},
	{
		n: "05",
		title: "Follow up",
		desc: "Wardline schedules the next visit and closes the loop on its own.",
	},
];

const STATS = [
	{ value: "38%", label: "fewer no-shows in the first quarter" },
	{ value: "12 min", label: "saved per check-in, on average" },
	{ value: "4.8 / 5", label: "front-desk staff satisfaction" },
	{ value: "500+", label: "clinics running on Wardline" },
];

const PRICING = [
	{
		name: "Solo",
		desc: "For a single provider finding their footing.",
		price: "$79",
		period: "/mo",
		features: [
			"1 provider seat",
			"Online booking",
			"Text & email reminders",
			"Basic billing",
		],
		cta: "Start free trial",
		featured: false,
	},
	{
		name: "Practice",
		desc: "For growing teams with more than one room.",
		price: "$189",
		period: "/mo",
		features: [
			"Up to 8 provider seats",
			"Everything in Solo",
			"Full billing & invoicing",
			"Staff coordination",
			"Reporting dashboard",
		],
		cta: "Start free trial",
		featured: true,
	},
	{
		name: "Network",
		desc: "For multi-location groups and clinics.",
		price: "Custom",
		period: "",
		features: [
			"Unlimited seats",
			"Everything in Practice",
			"Multi-location scheduling",
			"Dedicated onboarding",
			"Priority support",
		],
		cta: "Talk to sales",
		featured: false,
	},
];

const INITIAL_QUEUE = [
	{ time: "09:00", name: "Priya Nandakumar", status: "in-room" },
	{ time: "09:20", name: "Marcus Toussaint", status: "waiting" },
	{ time: "09:40", name: "Elena Rousseva", status: "waiting" },
	{ time: "10:00", name: "James Okafor", status: "complete" },
];

const STATUS_META = {
	waiting: { label: "Waiting", dot: "bg-gold" },
	"in-room": { label: "In room", dot: "bg-accent animate-blip" },
	complete: { label: "Complete", dot: "bg-brand" },
};

const THEME_STYLES = {
	page: {
		backgroundColor: "rgb(var(--color-bg))",
		color: "rgb(var(--color-ink))",
	},
	header: {
		backgroundColor: "rgba(var(--color-bg-rgb), 0.82)",
		borderColor: "rgb(var(--color-line))",
	},
	panel: {
		backgroundColor: "rgb(var(--color-surface))",
		borderColor: "rgb(var(--color-line))",
	},
} as const;

function nextStatus(s) {
	if (s === "waiting") return "in-room";
	if (s === "in-room") return "complete";
	return "waiting";
}

/* ------------------------------------------------------------------ */
/* Small visual pieces                                                */
/* ------------------------------------------------------------------ */

function Logomark({ size = 22 }) {
	return (
		<svg
			width={size}
			height={size}
			viewBox="0 0 24 24"
			fill="none"
			aria-hidden="true"
		>
			<circle
				cx="12"
				cy="12"
				r="10.5"
				stroke="currentColor"
				strokeWidth="1.4"
			/>
			<path
				d="M5 12.5H8.2L10 8L13 16L14.8 12.5H19"
				stroke="currentColor"
				strokeWidth="1.6"
				strokeLinecap="round"
				strokeLinejoin="round"
				fill="none"
			/>
		</svg>
	);
}

function PulseLine({ className = "", animate = true }) {
	return (
		<svg
			className={`block w-full h-16 ${className}`}
			viewBox="0 0 1260 120"
			preserveAspectRatio="none"
			fill="none"
			aria-hidden="true"
		>
			<path
				className={animate ? "pulse-path animate-draw" : ""}
				d="M0,60 C60,20 120,20 180,60 C240,100 300,100 360,60 C420,20 480,20 540,60 C600,100 660,100 720,60 C780,20 840,20 900,60 C960,100 1020,100 1080,60 C1140,20 1200,20 1260,60"
				stroke="url(#wlPulseGradient)"
				strokeWidth="2.5"
				strokeLinecap="round"
			/>
			<defs>
				<linearGradient
					id="wlPulseGradient"
					x1="0"
					y1="0"
					x2="1260"
					y2="0"
					gradientUnits="userSpaceOnUse"
				>
					<stop
						offset="0%"
						stopColor="#1C4A40"
						stopOpacity="0"
					/>
					<stop
						offset="12%"
						stopColor="#1C4A40"
						stopOpacity="0.55"
					/>
					<stop
						offset="50%"
						stopColor="#E8583F"
						stopOpacity="0.75"
					/>
					<stop
						offset="88%"
						stopColor="#1C4A40"
						stopOpacity="0.55"
					/>
					<stop
						offset="100%"
						stopColor="#1C4A40"
						stopOpacity="0"
					/>
				</linearGradient>
			</defs>
		</svg>
	);
}

function ThemeToggle({ className = "" }) {
	const [dark, setDark] = useState(false);

	useEffect(() => {
		const stored = window.localStorage.getItem("wl-theme");
		const prefersDark = window.matchMedia(
			"(prefers-color-scheme: dark)",
		).matches;
		const isDark = stored ? stored === "dark" : prefersDark;
		setDark(isDark);
		document.documentElement.classList.toggle("dark", isDark);
	}, []);

	const toggle = () => {
		const next = !dark;
		setDark(next);
		document.documentElement.classList.toggle("dark", next);
		window.localStorage.setItem("wl-theme", next ? "dark" : "light");
	};

	return (
		<button
			type="button"
			onClick={toggle}
			aria-label={
				dark ? "Switch to light mode" : "Switch to dark mode"
			}
			className={`inline-flex items-center justify-center w-9 h-9 rounded-full border border-line-strong text-ink hover:border-brand transition-colors duration-150 ${className}`}
		>
			{dark ? <Sun size={16} /> : <Moon size={16} />}
		</button>
	);
}

/* ------------------------------------------------------------------ */
/* Main component                                                      */
/* ------------------------------------------------------------------ */

export default function Home() {
	const [menuOpen, setMenuOpen] = useState(false);
	const [scrolled, setScrolled] = useState(false);
	const [queue, setQueue] = useState(INITIAL_QUEUE);
	const reducedMotion = useRef(false);

	useEffect(() => {
		const onScroll = () => setScrolled(window.scrollY > 8);
		window.addEventListener("scroll", onScroll);
		return () => window.removeEventListener("scroll", onScroll);
	}, []);

	useEffect(() => {
		if (typeof window === "undefined" || !window.matchMedia) return;
		reducedMotion.current = window.matchMedia(
			"(prefers-reduced-motion: reduce)",
		).matches;
		if (reducedMotion.current) return;

		let i = 0;
		const id = setInterval(() => {
			setQueue((prev) => {
				const next = prev.map((row, idx) =>
					idx === i % prev.length
						? { ...row, status: nextStatus(row.status) }
						: row,
				);
				return next;
			});
			i += 1;
		}, 2600);
		return () => clearInterval(id);
	}, []);

	return (
		<div
			className="bg-bg text-ink font-sans antialiased min-h-screen"
			style={THEME_STYLES.page}
		>
			{/* ---------------- Nav ---------------- */}
			<header
				className={`sticky top-0 z-40 bg-bg/[0.82] backdrop-blur-md border-b transition-[border-color,box-shadow] duration-[250ms] ease-in-out ${
					scrolled
						? "border-line shadow-[0_1px_0_rgba(18,36,31,0.02)]"
						: "border-transparent"
				}`}
				style={THEME_STYLES.header}
			>
				<div className="max-w-[1180px] mx-auto px-6 flex items-center justify-between h-[72px]">
					<a
						href="#top"
						className="flex items-center gap-2 text-ink font-semibold text-[1.05rem]"
					>
						<Logomark />
						Wardline
					</a>
					<nav className="hidden min-[860px]:flex items-center gap-9">
						{NAV_LINKS.map((l) => (
							<a
								key={l.label}
								href={l.href}
								className="text-[0.92rem] text-ink-muted hover:text-ink transition-colors duration-150"
							>
								{l.label}
							</a>
						))}
					</nav>
					<div className="hidden min-[860px]:flex items-center gap-5">
						<ThemeToggle />
						<Link href={"/login"}>
							<span className="inline-flex items-center justify-center gap-2 text-[0.85rem] font-medium px-4 py-[9px] rounded-full border border-line-strong text-ink hover:border-brand transition-colors duration-150">
								Log in
							</span>
						</Link>
						<a
							href="#pricing"
							className="inline-flex items-center justify-center gap-2 text-[0.85rem] font-medium px-4 py-[9px] rounded-full bg-brand text-chip hover:bg-brand-deep transition-colors duration-150"
						>
							Book a demo
						</a>
					</div>
					<div className="flex min-[860px]:hidden items-center gap-2">
						<ThemeToggle />
						<button
							className="flex bg-transparent border-0 text-ink p-2 cursor-pointer"
							aria-label={
								menuOpen
									? "Close menu"
									: "Open menu"
							}
							aria-expanded={menuOpen}
							onClick={() => setMenuOpen((v) => !v)}
						>
							{menuOpen ? (
								<X size={22} />
							) : (
								<Menu size={22} />
							)}
						</button>
					</div>
				</div>
				{menuOpen && (
					<div className="border-t border-line bg-bg px-6 pt-4 pb-6 flex flex-col gap-1">
						{NAV_LINKS.map((l) => (
							<a
								key={l.label}
								href={l.href}
								onClick={() =>
									setMenuOpen(false)
								}
								className="px-1 py-3 text-[0.98rem] text-ink"
							>
								{l.label}
							</a>
						))}
						<Link href={"/login"}> 
							<span
								onClick={() => setMenuOpen(false)}
								className="px-1 py-3 text-[0.98rem] text-ink"
							>
								Log in
							</span>
						</Link>
						<Link href={"/"}>
							<span
								onClick={() => setMenuOpen(false)}
								className="px-1 py-3 text-[0.98rem] text-brand font-semibold"
							>
								Book a demo →
							</span>
						</Link>
					</div>
				)}
			</header>

			{/* ---------------- Hero ---------------- */}
			<section
				className="relative pt-16 pb-[88px] overflow-hidden"
				id="top"
			>
				<div className="grid-texture absolute -inset-x-[5%] -top-[10%] bottom-auto h-[620px] pointer-events-none" />
				<div className="max-w-[1180px] mx-auto px-6 grid grid-cols-1 gap-12 items-center min-[960px]:grid-cols-[1.05fr_0.95fr] min-[960px]:gap-10">
					<div>
						<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand mb-[18px] flex items-center gap-[10px]">
							<span
								className="inline-block w-[18px] h-px bg-brand"
								aria-hidden="true"
							/>
							Clinic operating system
						</p>
						<h1 className="font-serif font-normal tracking-[-0.01em] text-[clamp(2.4rem,5vw,3.6rem)] leading-[1.05] mb-[22px] text-ink">
							Run your clinic on{" "}
							<em className="italic text-brand">
								one calm
							</em>{" "}
							schedule.
						</h1>
						<p className="text-[1.08rem] leading-[1.65] text-ink-muted max-w-[46ch] mb-8">
							Wardline brings booking, charts,
							billing, and reminders onto a single
							screen — so your front desk stops
							juggling three systems and starts
							finishing on time.
						</p>
						<div className="flex flex-wrap items-center gap-4 mb-4">
							<a
								href="#pricing"
								className="inline-flex items-center justify-center gap-2 text-[0.92rem] font-medium px-[22px] py-3 rounded-full bg-brand text-chip hover:bg-brand-deep transition-colors duration-150 active:translate-y-px"
							>
								Start free trial{" "}
								<ArrowRight size={16} />
							</a>
							<a
								href="#how-it-works"
								className="inline-flex items-center justify-center gap-2 text-[0.92rem] font-medium px-[22px] py-3 rounded-full border border-line-strong text-ink hover:border-brand hover:text-brand-deep transition-colors duration-150 active:translate-y-px"
							>
								Watch a 2-minute tour
							</a>
						</div>
						<p className="text-[0.85rem] text-ink-faint">
							No credit card required. Set up in an
							afternoon.
						</p>
					</div>

					<div className="relative">
						<div
							className="absolute z-[1] -bottom-[18px] left-6 -right-[18px] h-[90%] rounded-[20px] bg-surface-2"
							aria-hidden="true"
						/>
						<div
							className="relative z-[2] bg-surface border border-line rounded-[20px] p-[22px] shadow-[0_24px_60px_-30px_rgba(15,51,43,0.35)]"
							style={THEME_STYLES.panel}
						>
							<div className="flex items-baseline justify-between mb-4 pb-[14px] border-b border-line">
								<span className="text-[0.95rem] font-semibold">
									Today · Tue 11 Aug
								</span>
								<span className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-ink-faint">
									Dr. Mohamed
								</span>
							</div>
							{queue.map((row) => (
								<div
									className="flex items-center gap-[14px] py-[11px] border-b border-line last:border-b-0"
									key={row.time}
								>
									<span className="font-mono text-[0.8rem] text-ink-faint w-[46px] shrink-0">
										{row.time}
									</span>
									<span className="flex-1 text-[0.92rem] font-medium">
										{row.name}
									</span>
									<span className="flex items-center gap-[7px] text-[0.78rem] text-ink-muted">
										<span
											className={`w-[7px] h-[7px] rounded-full shrink-0 ${STATUS_META[row.status].dot}`}
										/>
										{
											STATUS_META[
												row
													.status
											].label
										}
									</span>
								</div>
							))}
						</div>
					</div>
				</div>
				<div className="max-w-[1180px] mx-auto px-6 mt-14">
					<PulseLine />
				</div>
			</section>

			{/* ---------------- Trust strip ---------------- */}
			<section className="py-[30px] pb-[54px]">
				<div className="max-w-[1180px] mx-auto px-6">
					<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-center text-ink-faint mb-[22px]">
						Running the front desk for clinics like
					</p>
					<div className="flex flex-wrap justify-center gap-x-11 gap-y-8">
						{TRUST_NAMES.map((n) => (
							<span
								key={n}
								className="font-mono text-[0.85rem] text-ink-faint"
							>
								{n}
							</span>
						))}
					</div>
				</div>
			</section>

			{/* ---------------- Problem / comparison ---------------- */}
			<section className="py-[84px]">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="max-w-[640px] mb-12">
						<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand">
							The front desk, today
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.9rem,3.4vw,2.5rem)] mt-3 leading-[1.15]">
							Your day is scattered across four
							tabs.
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-5 min-[800px]:grid-cols-2 min-[800px]:gap-6">
						<div className="rounded-2xl p-7 border border-line bg-surface-2">
							<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium mb-[18px] text-ink-faint">
								Without Wardline
							</p>
							<ul className="list-none m-0 p-0 flex flex-col gap-[14px]">
								{BEFORE.map((t) => (
									<li
										key={t}
										className="flex gap-[10px] text-[0.95rem] leading-[1.5] text-ink-muted"
									>
										<span className="text-ink-faint shrink-0">
											—
										</span>
										{t}
									</li>
								))}
							</ul>
						</div>
						<div className="rounded-2xl p-7 border border-brand-deep bg-brand-deep text-onbrand">
							<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium mb-[18px] text-onbrand-muted">
								With Wardline
							</p>
							<ul className="list-none m-0 p-0 flex flex-col gap-[14px]">
								{AFTER.map((t) => (
									<li
										key={t}
										className="flex gap-[10px] text-[0.95rem] leading-[1.5]"
									>
										<Check
											size={16}
											className="shrink-0 mt-[3px] text-onbrand-accent"
										/>
										{t}
									</li>
								))}
							</ul>
						</div>
					</div>
				</div>
			</section>

			{/* ---------------- Features ---------------- */}
			<section className="pt-0 pb-[84px]" id="features">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="max-w-[640px] mb-12">
						<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand">
							Everything at the front desk
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.9rem,3.4vw,2.5rem)] mt-3 leading-[1.15]">
							Six systems. One record.
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-px bg-line border border-line rounded-2xl overflow-hidden min-[700px]:grid-cols-2 min-[1000px]:grid-cols-3">
						{FEATURES.map((f) => {
							const Icon = f.icon;
							return (
								<div
									className="bg-surface py-[30px] px-[26px]"
									key={f.title}
								>
									<div className="text-brand mb-[18px]">
										<Icon
											size={22}
											strokeWidth={
												1.6
											}
										/>
									</div>
									<h3 className="text-[1.02rem] font-semibold mb-2">
										{f.title}
									</h3>
									<p className="text-[0.9rem] text-ink-muted leading-[1.55] m-0">
										{f.desc}
									</p>
								</div>
							);
						})}
					</div>
				</div>
			</section>

			{/* ---------------- How it works ---------------- */}
			<section className="py-[84px]" id="how-it-works">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="max-w-[640px] mb-12 mx-auto text-center">
						<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand">
							One patient, start to finish
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.9rem,3.4vw,2.5rem)] mt-3 leading-[1.15]">
							Five steps. No dropped threads.
						</h2>
					</div>
					<div className="flex flex-col gap-0 min-[900px]:flex-row min-[900px]:items-start min-[900px]:relative">
						<div
							className="hidden min-[900px]:block absolute top-[15px] left-[4%] right-[4%] h-px bg-line-strong"
							aria-hidden="true"
						/>
						{STEPS.map((s) => (
							<div
								className="flex-1 py-[22px] border-t border-line relative min-[900px]:border-t-0 min-[900px]:py-0 min-[900px]:pr-[18px]"
								key={s.n}
							>
								<div className="font-mono text-[0.8rem] text-accent-strong flex items-center gap-[10px] mb-[14px]">
									<span className="w-[9px] h-[9px] rounded-full bg-surface border-2 border-accent relative z-[1]" />
									{s.n}
								</div>
								<h3 className="text-[1.02rem] font-semibold mb-2">
									{s.title}
								</h3>
								<p className="text-[0.88rem] text-ink-muted leading-[1.55] max-w-[32ch] m-0">
									{s.desc}
								</p>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---------------- Stats ---------------- */}
			<section className="pt-0 pb-[84px]">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="bg-brand-deep rounded-3xl px-8 py-[52px]">
						<div className="grid grid-cols-2 gap-8 min-[800px]:grid-cols-4">
							{STATS.map((s) => (
								<div
									className="text-left"
									key={s.label}
								>
									<div className="font-mono text-[clamp(1.7rem,3.2vw,2.3rem)] text-onbrand font-medium">
										{s.value}
									</div>
									<div className="text-onbrand-muted text-[0.85rem] mt-[6px] leading-[1.4]">
										{s.label}
									</div>
								</div>
							))}
						</div>
					</div>
				</div>
			</section>

			{/* ---------------- Testimonial ---------------- */}
			<section className="py-[84px]">
				<div className="max-w-[760px] mx-auto px-6 text-center">
					<div
						className="flex justify-center gap-1 text-gold mb-6"
						aria-hidden="true"
					>
						{Array.from({ length: 5 }).map((_, i) => (
							<Star
								key={i}
								size={16}
								fill="currentColor"
								stroke="none"
							/>
						))}
					</div>
					<blockquote className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.5rem,3vw,2rem)] leading-[1.4] mb-[26px] text-ink">
						"We closed at 5:04 instead of 6:30 most
						nights within the first month. The schedule
						just doesn't fall apart anymore."
					</blockquote>
					<cite className="not-italic text-[0.88rem] text-ink-muted">
						Dana Whitfield — Practice Manager, Birchwood
						Family Health
					</cite>
				</div>
			</section>

			{/* ---------------- Pricing ---------------- */}
			<section className="py-[84px]" id="pricing">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="max-w-[640px] mb-12 mx-auto text-center">
						<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand">
							Pricing
						</p>
						<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(1.9rem,3.4vw,2.5rem)] mt-3 leading-[1.15]">
							Priced by provider, not by promise.
						</h2>
					</div>
					<div className="grid grid-cols-1 gap-[22px] min-[860px]:grid-cols-3 min-[860px]:items-stretch">
						{PRICING.map((p) => (
							<div
								className={`rounded-2xl px-[26px] py-[30px] flex flex-col ${
									p.featured
										? "bg-brand-deep border border-brand-deep text-onbrand relative min-[860px]:-translate-y-[14px]"
										: "bg-surface border border-line"
								}`}
								key={p.name}
							>
								{p.featured && (
									<span className="absolute -top-[13px] right-[26px] bg-accent-strong text-white font-mono text-[0.68rem] tracking-[0.08em] uppercase px-[10px] py-[5px] rounded-full">
										Most common
									</span>
								)}
								<h3 className="text-[1.1rem] font-semibold mb-[6px]">
									{p.name}
								</h3>
								<p
									className={`text-[0.87rem] mb-[22px] ${p.featured ? "text-onbrand-muted" : "text-ink-muted"}`}
								>
									{p.desc}
								</p>
								<div className="flex items-baseline gap-1 mb-6">
									<span className="font-mono text-[2.1rem] font-medium">
										{p.price}
									</span>
									{p.period && (
										<span className="text-[0.85rem] opacity-70">
											{p.period}
										</span>
									)}
								</div>
								<ul className="list-none m-0 mb-7 p-0 flex flex-col gap-3 flex-1">
									{p.features.map((f) => (
										<li
											key={f}
											className="flex gap-[10px] text-[0.88rem] items-start"
										>
											<Check
												size={
													15
												}
												className="shrink-0 mt-[2px] text-accent"
											/>
											{f}
										</li>
									))}
								</ul>
								<a
									href="#"
									className={`inline-flex items-center justify-center gap-2 text-[0.92rem] font-medium px-[22px] py-3 rounded-full w-full transition-colors duration-150 active:translate-y-px ${
										p.featured
											? "bg-chip text-brand-deep hover:opacity-90"
											: "border border-line-strong text-ink hover:border-brand hover:text-brand-deep"
									}`}
								>
									{p.cta}
								</a>
							</div>
						))}
					</div>
				</div>
			</section>

			{/* ---------------- Final CTA ---------------- */}
			<section className="text-center relative pt-[90px] pb-[70px]">
				<div className="max-w-[1180px] mx-auto px-6">
					<p className="font-mono tracking-[0.08em] uppercase text-[0.72rem] font-medium text-brand justify-center flex">
						Ready when you are
					</p>
					<h2 className="font-serif font-normal tracking-[-0.01em] text-[clamp(2rem,4vw,2.9rem)] mb-[18px]">
						Give your front desk its afternoons back.
					</h2>
					<p className="text-ink-muted text-[1.02rem] mx-auto mb-[34px] max-w-[44ch]">
						Set up your first schedule today. Cancel any
						time, no hard feelings.
					</p>
					<div className="flex justify-center gap-4 flex-wrap">
						<a
							href="#"
							className="inline-flex items-center justify-center gap-2 text-[0.92rem] font-medium px-[22px] py-3 rounded-full bg-brand text-chip hover:bg-brand-deep transition-colors duration-150 active:translate-y-px"
						>
							Start free trial{" "}
							<ArrowRight size={16} />
						</a>
						<a
							href="#"
							className="inline-flex items-center justify-center gap-2 text-[0.92rem] font-medium px-[22px] py-3 rounded-full border border-line-strong text-ink hover:border-brand hover:text-brand-deep transition-colors duration-150 active:translate-y-px"
						>
							Talk to sales
						</a>
					</div>
				</div>
			</section>

			{/* ---------------- Footer ---------------- */}
			<footer className="border-t border-line pt-14 pb-8">
				<div className="max-w-[1180px] mx-auto px-6">
					<div className="grid grid-cols-1 gap-10 mb-12 min-[760px]:grid-cols-[1.4fr_repeat(3,1fr)]">
						<div>
							<a
								href="#top"
								className="flex items-center gap-2 text-brand-deep font-semibold text-[1.05rem]"
							>
								<Logomark /> Wardline
							</a>
							<p className="text-ink-muted text-[0.88rem] max-w-[30ch] mt-3 leading-[1.55]">
								The operating system for clinics
								that would rather run on time
								than catch up.
							</p>
						</div>
						<div>
							<h4 className="font-mono tracking-[0.08em] uppercase text-[0.7rem] text-ink-faint mb-4">
								Product
							</h4>
							<ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
								<li>
									<a
										href="#features"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Scheduling
									</a>
								</li>
								<li>
									<a
										href="#features"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Patient records
									</a>
								</li>
								<li>
									<a
										href="#features"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Billing
									</a>
								</li>
								<li>
									<a
										href="#pricing"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Pricing
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-mono tracking-[0.08em] uppercase text-[0.7rem] text-ink-faint mb-4">
								Company
							</h4>
							<ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										About
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Careers
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Contact
									</a>
								</li>
							</ul>
						</div>
						<div>
							<h4 className="font-mono tracking-[0.08em] uppercase text-[0.7rem] text-ink-faint mb-4">
								Legal
							</h4>
							<ul className="list-none m-0 p-0 flex flex-col gap-[11px]">
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Privacy
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										Terms
									</a>
								</li>
								<li>
									<a
										href="#"
										className="text-[0.88rem] text-ink-muted hover:text-ink"
									>
										HIPAA
									</a>
								</li>
							</ul>
						</div>
					</div>
					<div className="flex flex-wrap justify-between gap-3 pt-6 border-t border-line text-ink-faint text-[0.8rem]">
						<span>© 2026 Wardline, Inc.</span>
						<span>
							Made for clinics, not spreadsheets.
						</span>
					</div>
				</div>
			</footer>
		</div>
	);
}
