"use client";

import { X, LogOut } from "lucide-react";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { signOut } from "next-auth/react";
import { useState } from "react";
import { PermissionGate } from "@/components/auth/PermissionGate";
import { Logomark } from "../shared/Logomark";
import { useClinicStore } from "@/stores/clinicStore";
import { NAV_ITEMS } from "./data";

function ClinicBrand() {
	const clinic = useClinicStore((state) => state.clinic);
	const logo = clinic?.logo || clinic?.logoUrl;

	return (
		<div className="flex min-w-0 items-center gap-3">
			<div className="flex size-10 shrink-0 items-center justify-center overflow-hidden rounded-lg bg-surface-2 text-brand-deep">
				{logo ? (
					<Image
						src={logo}
						alt={`${clinic?.name ?? "Clinic"} logo`}
						width={40}
						height={40}
						unoptimized
						className="size-full object-cover"
					/>
				) : (
					<Logomark size={26} />
				)}
			</div>
			<div className="min-w-0">
				<p className="truncate text-sm font-semibold leading-tight text-brand-deep">
					{clinic?.name || "Clinic"}
				</p>
				<p className="truncate text-xs font-normal leading-tight text-ink-muted">
					Wardline
				</p>
			</div>
		</div>
	);
}

function NavList({ onNavigate, activeItem }) {
	const activeReport = [
		"Doctors report",
		"Patients report",
		"Appointments report",
	].includes(activeItem);
	const [reportsOpen, setReportsOpen] = useState(activeReport);

	return (
		<nav className="flex-1 px-3 py-4 flex flex-col gap-1">
			{NAV_ITEMS.map((item) => {
				const Icon = item.icon;
				const isActive =
					item.label === activeItem ||
					(item.children && activeReport);
				if (item.children) {
					const groupPermissions = item.children.map(
						(child) => child.permission,
					);
					return (
						<PermissionGate
							key={item.label}
							permissions={groupPermissions}
							mode="any"
						>
							<div>
								<button
									type="button"
									aria-expanded={
										reportsOpen
									}
									onClick={() =>
										setReportsOpen(
											(open) =>
												!open,
										)
									}
									className={`flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-left text-[0.9rem] transition-colors duration-150 ${isActive ? "bg-surface-2 font-medium text-brand-deep" : "text-ink-muted hover:bg-surface-2 hover:text-ink"}`}
								>
									<Icon
										size={17}
										strokeWidth={1.8}
									/>
									<span className="flex-1">
										{item.label}
									</span>
									<ChevronDown
										size={15}
										className={`transition-transform ${reportsOpen ? "rotate-180" : ""}`}
									/>
								</button>
								{reportsOpen && (
									<div className="ml-5 mt-1 flex flex-col gap-1 border-l border-line pl-3">
										{item.children.map(
											(child) => {
												const childActive =
													child.key ===
													activeItem;
												return (
													<PermissionGate
														key={
															child.key
														}
														permissions={[
															child.permission,
														]}
													>
														<Link
															key={
																child.key
															}
															href={
																child.href
															}
															onClick={
																onNavigate
															}
															aria-current={
																childActive
																	? "page"
																	: undefined
															}
															className={`rounded-md px-3 py-2 text-sm transition-colors ${childActive ? "font-medium text-brand-deep" : "text-ink-muted hover:bg-surface-2 hover:text-ink"}`}
														>
															{
																child.label
															}
														</Link>
													</PermissionGate>
												);
											},
										)}
									</div>
								)}
							</div>
						</PermissionGate>
					);
				}
				return (
					<PermissionGate
						key={item.label}
						permissions={
							item.permission
								? [item.permission]
								: []
						}
					>
						<Link
							key={item.label}
							href={item.href ?? ""}
							onClick={onNavigate}
							className={`flex items-center gap-3 px-3 py-2.5 rounded-lg text-[0.9rem] transition-colors duration-150 ${
								isActive
									? "bg-surface-2 text-brand-deep font-medium"
									: "text-ink-muted hover:bg-surface-2 hover:text-ink"
							}`}
						>
							<Icon size={17} strokeWidth={1.8} />
							{item.label}
						</Link>
					</PermissionGate>
				);
			})}
		</nav>
	);
}

function UserCard() {
	const user = useClinicStore((state) => state.user);
	const fullName =
		[user?.firstName, user?.lastName].filter(Boolean).join(" ") ||
		user?.email ||
		"Account";
	const initials =
		`${user?.firstName?.[0] ?? ""}${user?.lastName?.[0] ?? ""}`.toUpperCase() ||
		user?.email?.[0]?.toUpperCase() ||
		"U";

	return (
		<div className="flex items-center gap-3 px-3 py-4 border-t border-line">
			<div className="w-9 h-9 rounded-full bg-brand text-chip flex items-center justify-center text-[0.8rem] font-medium shrink-0">
				{user?.avatar ? (
					<Image
						src={user.avatar}
						alt={fullName}
						width={36}
						height={36}
						unoptimized
						className="w-full h-full rounded-full object-cover"
					/>
				) : (
					initials
				)}
			</div>
			<div className="flex-1 min-w-0">
				<p className="text-[0.88rem] font-medium text-ink truncate">
					{fullName}
				</p>
				<p className="text-[0.78rem] text-ink-faint truncate">
					{user?.role ?? "User"}
				</p>
			</div>
			<button
				aria-label="Log out"
				onClick={() => signOut({ redirectTo: "/login" })}
				className="p-1.5 text-ink-faint hover:text-ink shrink-0"
			>
				<LogOut size={16} />
			</button>
		</div>
	);
}

export function Sidebar({ open, onClose, activeItem = "Dashboard" }) {
	return (
		<>
			{/* Desktop */}
			<aside className="hidden h-screen lg:flex lg:flex-col lg:w-60 lg:shrink-0 border-r border-line bg-surface rounded-tr-4xl rounded-br-4xl">
				<div className="flex h-16 items-center border-b border-line px-3">
					<ClinicBrand />
				</div>
				<NavList activeItem={activeItem} />
				<UserCard />
			</aside>

			{/* Mobile overlay */}
			{open && (
				<div className="fixed inset-0 z-50 lg:hidden">
					<div
						className="absolute inset-0 bg-ink/40"
						onClick={onClose}
						aria-hidden="true"
					/>
					<aside className="absolute left-0 top-0 bottom-0 w-72 max-w-[80%] bg-surface border-r border-line flex flex-col">
						<div className="flex items-center justify-between px-5 h-16 border-b border-line">
							<a
								href="/dashboard"
								onClick={onClose}
								className="min-w-0"
							>
								<ClinicBrand />
							</a>
							<button
								onClick={onClose}
								aria-label="Close menu"
								className="p-2 -mr-2 text-ink-faint hover:text-ink"
							>
								<X size={20} />
							</button>
						</div>
						<NavList
							onNavigate={onClose}
							activeItem={activeItem}
						/>
						<UserCard />
					</aside>
				</div>
			)}
		</>
	);
}
