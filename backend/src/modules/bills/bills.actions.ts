import { randomUUID } from "node:crypto";
import { db, type PrismaTransaction } from "../../prisma/db.ts";
import { bill_Status } from "../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateBillDto } from "./DTOs/createBill.dto.ts";
import type { UpdateBillDto } from "./DTOs/updateBill.dto.ts";

type OrmContext = Pick<PrismaTransaction, "bill">;

const billFields = [
	"id",
	"clinicId",
	"patientId",
	"appointmentId",
	"invoiceNumber",
	"amount",
	"description",
	"status",
	"dueDate",
	"notes",
	"createdAt",
	"updatedAt",
] as const;

const billSelect = {
	id: true,
	clinicId: true,
	patientId: true,
	appointmentId: true,
	invoiceNumber: true,
	amount: true,
	description: true,
	status: true,
	dueDate: true,
	notes: true,
	createdAt: true,
	updatedAt: true,
} as const;

type BillId = string;
export type PatientId = string;
type AppointmentId = string;
export type BillStatus = string;

function billWithAppointmentDateOnly<
	T extends {
		appointment: { appointmentDate: Date } | null;
	},
>(bill: T) {
	return {
		...bill,
		appointment: bill.appointment
			? {
					...bill.appointment,
					appointmentDate: bill.appointment.appointmentDate
						.toISOString()
						.slice(0, 10),
				}
			: null,
	};
}

function normalizePagination(page: number, limit: number) {
	const normalizedPage = Number.isFinite(page)
		? Math.max(1, Math.floor(page))
		: 1;
	const normalizedLimit = Number.isFinite(limit)
		? Math.min(100, Math.max(1, Math.floor(limit)))
		: 20;

	return {
		page: normalizedPage,
		limit: normalizedLimit,
		offset: (normalizedPage - 1) * normalizedLimit,
	};
}

export async function findBillsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	status?: BillStatus,
	patientId?: PatientId,
) {
	const pagination = normalizePagination(page, limit);
	const filters = {
		clinicId,
		...(status && { status }),
		...(patientId && { patientId }),
	};
	const [bills, count] = await Promise.all([
		db.bill.findMany({
			where: filters,
			select: {
				...billSelect,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						phone: true,
						email: true,
					},
				},
				appointment: {
					select: {
						id: true,
						appointmentDate: true,
						startAt: true,
						endAt: true,
						status: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.bill.count({ where: filters }),
	]);

	return {
		bills: bills.map(billWithAppointmentDateOnly),
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: count,
			totalPages: Math.ceil(count / pagination.limit),
		},
	};
}

export function findBillById(clinicId: ClinicId, billId: string) {
	return db.bill
		.findFirst({
			where: { id: billId as BillId, clinicId },
			select: {
				...billSelect,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						phone: true,
						email: true,
					},
				},
				appointment: {
					select: {
						id: true,
						appointmentDate: true,
						startAt: true,
						endAt: true,
						status: true,
					},
				},
			},
		})
		.then((bill) => (bill ? billWithAppointmentDateOnly(bill) : null));
}

export function findPatientForBill(clinicId: ClinicId, patientId: string) {
	return db.patient.findFirst({
		where: { id: patientId as PatientId, clinicId },
		select: { id: true },
	});
}

export function findAppointmentForBill(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.appointment.findFirst({
		where: { id: appointmentId as AppointmentId, clinicId },
		select: { id: true, patientId: true },
	});
}

export function createBill(
	input: CreateBillDto,
	clinicId: ClinicId,
	createdBy: string,
) {
	return db.bill.create({
		data: {
			clinicId,
			patientId: input.patientId as PatientId,
			...(input.appointmentId && {
				appointmentId: input.appointmentId as AppointmentId,
			}),
			invoiceNumber: `INV-${randomUUID()}`,
			amount: String(input.amount),
			description: input.description,
			...(input.dueDate && {
				dueDate: new Date(`${input.dueDate}T00:00:00.000Z`),
			}),
			...(input.notes !== undefined && { notes: input.notes }),
			createdBy,
		},
		select: billSelect,
	});
}

export function createBillForAppointment(
	clinicId: ClinicId,
	patientId: string,
	appointmentId: string,
	amount: string,
	createdBy: string,
	client: OrmContext = db,
) {
	return client.bill.create({
		data: {
			clinicId,
			patientId: patientId as PatientId,
			appointmentId: appointmentId as AppointmentId,
			invoiceNumber: `INV-${randomUUID()}`,
			amount,
			description: "Appointment consultation fee",
			status: bill_Status.UNPAID,
			createdBy,
		},
		select: billSelect,
	});
}

export function updateBillById(
	clinicId: ClinicId,
	billId: string,
	input: UpdateBillDto,
) {
	return db.bill.update({
		where: { id: billId as BillId, clinicId },
		data: {
			...(input.patientId !== undefined && {
				patientId: input.patientId as PatientId,
			}),
			...(input.appointmentId !== undefined && {
				appointmentId: input.appointmentId as AppointmentId,
			}),
			...(input.amount !== undefined && {
				amount: String(input.amount),
			}),
			...(input.description !== undefined && {
				description: input.description,
			}),
			...(input.status !== undefined && {
				status: input.status as BillStatus,
			}),
			...(input.dueDate !== undefined && {
				dueDate: input.dueDate
					? new Date(`${input.dueDate}T00:00:00.000Z`)
					: null,
			}),
			...(input.notes !== undefined && { notes: input.notes }),
		},
		select: billSelect,
	});
}

export function deleteBillById(clinicId: ClinicId, billId: string) {
	return db.bill.delete({ where: { id: billId as BillId, clinicId } });
}
