"use client";

import { useState } from "react";
import {
	Banknote,
	ChevronLeft,
	ChevronRight,
	CreditCard,
	LoaderCircle,
} from "lucide-react";
import { toast } from "sonner";
import { useSession } from "next-auth/react";
import { useRecordBillPayment, useBills } from "@/api/hooks/Bills";
import {
	type BillWithRelations,
	type PaymentMethod,
} from "@/api/services/billsService";
import { getApiErrorMessage } from "@/api/services/clinicService";
import { BillPrintButton } from "@/components/bills/BillPrintButton";
import { formatAmount } from "@/components/bills/bill-utils";
import { Button } from "@/components/ui/button";
import {
	Dialog,
	DialogContent,
	DialogDescription,
	DialogFooter,
	DialogHeader,
	DialogTitle,
} from "@/components/ui/dialog";
import {
	Select,
	SelectContent,
	SelectItem,
	SelectTrigger,
	SelectValue,
} from "@/components/ui/select";
import { hasPermission } from "@/lib/permissions";

const paymentMethods: { value: PaymentMethod; label: string }[] = [
	{ value: "cash", label: "Cash" },
	{ value: "card", label: "Card" },
	{ value: "insurance", label: "Insurance" },
	{ value: "other", label: "Other" },
];

export function UnpaidBillsCard() {
	const [page, setPage] = useState(1);
	const { data: session } = useSession();
	const canRecordPayment = hasPermission(
		session?.user?.permissions,
		"create:payments",
	);
	const { bills, pagination, loading, error, refetch } = useBills(
		page,
		3,
		"unpaid",
	);
	const { mutate: recordPayment, isPending } = useRecordBillPayment();
	const [selectedBill, setSelectedBill] =
		useState<BillWithRelations | null>(null);
	const [method, setMethod] = useState<PaymentMethod>("cash");

	const submitPayment = () => {
		if (!selectedBill) return;

		recordPayment(
			{ billId: selectedBill.id, method },
			{
				onSuccess: () => {
					setSelectedBill(null);
					if (bills.length === 1 && page > 1) {
						setPage((current) => Math.max(1, current - 1));
					}
					toast.success("Payment recorded and bill marked as paid.");
				},
				onError: (paymentError) => {
					toast.error(getApiErrorMessage(paymentError));
				},
			},
		);
	};

	return (
		<>
			<section className="rounded-2xl border border-line bg-surface p-5">
				<header className="mb-4 flex items-center justify-between gap-3">
					<div>
						<h2 className="text-base font-semibold text-ink">
							Unpaid bills
						</h2>
						<p className="mt-1 text-xs text-ink-muted">
							{pagination.total} outstanding{" "}
							{pagination.total === 1 ? "bill" : "bills"}
						</p>
					</div>
					<Banknote
						className="size-5 text-brand"
						aria-hidden="true"
					/>
				</header>

				{loading ? (
					<div className="flex min-h-24 items-center justify-center text-sm text-ink-muted">
						<LoaderCircle className="mr-2 size-4 animate-spin" />
						Loading unpaid bills...
					</div>
				) : error ? (
					<div className="rounded-lg bg-accent/10 p-4 text-center">
						<p role="alert" className="text-sm text-accent-strong">
							{error}
						</p>
						<Button
							className="mt-3"
							type="button"
							variant="outline"
							size="sm"
							onClick={() => void refetch()}
						>
							Try again
						</Button>
					</div>
				) : bills.length === 0 ? (
					<p className="rounded-lg bg-surface-2 px-4 py-6 text-center text-sm text-ink-muted">
						No unpaid bills.
					</p>
				) : (
					<ul className="divide-y divide-line">
						{bills.map((bill) => (
							<li
								key={bill.id}
								className="flex items-center justify-between gap-3 py-3 first:pt-0 last:pb-0"
							>
								<div className="min-w-0">
									<p className="truncate text-sm font-medium text-ink">
										{bill.patient.firstName}{" "}
										{bill.patient.lastName}
									</p>
									<p className="truncate text-xs text-ink-muted">
										{bill.description} · {bill.invoiceNumber}
									</p>
									<p className="mt-1 text-sm font-semibold text-ink">
										{formatAmount(bill.amount)}
									</p>
								</div>
								<div className="flex shrink-0 items-center gap-1">
									<BillPrintButton bill={bill} compact />
									{canRecordPayment && (
										<Button
											type="button"
											size="sm"
											disabled={isPending}
											onClick={() => {
												setMethod("cash");
												setSelectedBill(bill);
											}}
										>
											<CreditCard aria-hidden="true" />
											Pay
										</Button>
									)}
								</div>
							</li>
						))}
					</ul>
				)}

				{!loading && !error && pagination.totalPages > 1 && (
					<footer className="mt-4 flex items-center justify-between border-t border-line pt-3">
						<p
							className="text-xs text-ink-muted"
							aria-live="polite"
						>
							Page {pagination.page} of {pagination.totalPages}
						</p>
						<div className="flex gap-2">
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={page <= 1}
								onClick={() =>
									setPage((current) => Math.max(1, current - 1))
								}
							>
								<ChevronLeft aria-hidden="true" />
								Previous
							</Button>
							<Button
								type="button"
								variant="outline"
								size="sm"
								disabled={page >= pagination.totalPages}
								onClick={() =>
									setPage((current) =>
										Math.min(pagination.totalPages, current + 1),
									)
								}
							>
								Next
								<ChevronRight aria-hidden="true" />
							</Button>
						</div>
					</footer>
				)}
			</section>

			<Dialog
				open={selectedBill !== null}
				onOpenChange={(open) => {
					if (!open && !isPending) setSelectedBill(null);
				}}
			>
				<DialogContent>
					<DialogHeader>
						<DialogTitle>Record bill payment</DialogTitle>
						<DialogDescription>
							Record the full bill amount for{" "}
							{selectedBill?.invoiceNumber}. This will mark the bill
							as paid.
						</DialogDescription>
					</DialogHeader>
					<div className="space-y-2">
						<p className="text-sm font-medium text-ink">
							Amount:{" "}
							{selectedBill
								? formatAmount(selectedBill.amount)
								: ""}
						</p>
						<label
							htmlFor="payment-method"
							className="text-sm font-medium text-ink"
						>
							Payment method
						</label>
						<Select
							value={method}
							onValueChange={(value) =>
								setMethod(value as PaymentMethod)
							}
						>
							<SelectTrigger
								id="payment-method"
								className="w-full"
							>
								<SelectValue />
							</SelectTrigger>
							<SelectContent>
								{paymentMethods.map((paymentMethod) => (
									<SelectItem
										key={paymentMethod.value}
										value={paymentMethod.value}
									>
										{paymentMethod.label}
									</SelectItem>
								))}
							</SelectContent>
						</Select>
					</div>
					<DialogFooter>
						<Button
							type="button"
							variant="outline"
							disabled={isPending}
							onClick={() => setSelectedBill(null)}
						>
							Cancel
						</Button>
						<Button
							type="button"
							disabled={isPending || !selectedBill}
							onClick={submitPayment}
						>
							{isPending ? "Recording..." : "Confirm payment"}
						</Button>
					</DialogFooter>
				</DialogContent>
			</Dialog>
		</>
	);
}
