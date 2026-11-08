"use client";

import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { Printer } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { BillWithRelations } from "@/api/services/billsService";
import { formatAmount, formatBillStatus } from "./bill-utils";

type BillPrintButtonProps = {
	bill: BillWithRelations;
	compact?: boolean;
};

export function BillPrintButton({
	bill,
	compact = false,
}: BillPrintButtonProps) {
	const [printing, setPrinting] = useState(false);

	useEffect(() => {
		if (!printing) return;

		const handleAfterPrint = () => setPrinting(false);
		window.addEventListener("afterprint", handleAfterPrint);
		window.print();

		return () => {
			window.removeEventListener("afterprint", handleAfterPrint);
		};
	}, [printing]);

	return (
		<>
			<Button
				type="button"
				variant={compact ? "ghost" : "outline"}
				size={compact ? "icon" : "sm"}
				aria-label={`Print bill ${bill.invoiceNumber}`}
				title="Print bill"
				onClick={() => setPrinting(true)}
			>
				<Printer aria-hidden="true" />
				{!compact && <span>Print</span>}
			</Button>
			{printing &&
				createPortal(
					<article
						data-print-receipt
						className="mx-auto hidden w-full max-w-[80mm] bg-white p-4 text-sm text-black print:block"
					>
						<header className="mb-5 border-b border-dashed border-gray-400 pb-4 text-center">
							<h1 className="text-xl font-semibold">Bill</h1>
							<p>{bill.invoiceNumber}</p>
						</header>
						<section className="space-y-2 border-b border-dashed border-gray-400 pb-4">
							<p className="break-words">
								{bill.patient.firstName} {bill.patient.lastName}
							</p>
							{bill.patient.phone && (
								<p>Phone: {bill.patient.phone}</p>
							)}
							{bill.patient.email && (
								<p className="break-all">
									Email: {bill.patient.email}
								</p>
							)}
							<p>
								Date: {new Date(bill.createdAt).toLocaleDateString()}
							</p>
							{bill.appointment && (
								<p>
									Appointment:{" "}
									{bill.appointment.appointmentDate.slice(0, 10)}
								</p>
							)}
						</section>
						<section className="space-y-2 border-b border-dashed border-gray-400 py-4">
							<p className="font-medium">{bill.description}</p>
							{bill.dueDate && (
								<p>Due date: {bill.dueDate.slice(0, 10)}</p>
							)}
							<p>Status: {formatBillStatus(bill.status)}</p>
							{bill.notes && (
								<p className="break-words">Notes: {bill.notes}</p>
							)}
						</section>
						<footer className="flex justify-between py-4 text-base font-semibold">
							<span>Total</span>
							<span>{formatAmount(bill.amount)}</span>
						</footer>
					</article>,
					document.body,
				)}
		</>
	);
}
