import { db } from "../../prisma/db.ts";
import { bill_Status } from "../../prisma/enums.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateBillDto } from "./DTOs/createBill.dto.ts";
import type { UpdateBillDto } from "./DTOs/updateBill.dto.ts";

type OrmContext = Pick<typeof db, "orm">;

const billFields = [
	"id",
	"clinicId",
	"patientId",
	"appointmentId",
	"amount",
	"description",
	"status",
	"dueDate",
	"notes",
	"createdAt",
	"updatedAt",
] as const;

type BillId = FieldOutputTypes["public"]["Bill"]["id"];
export type PatientId = FieldOutputTypes["public"]["Patient"]["id"];
type AppointmentId = FieldOutputTypes["public"]["Appointment"]["id"];
export type BillStatus = FieldOutputTypes["public"]["Bill"]["status"];

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

function billQuery(clinicId: ClinicId) {
	return db.orm.public.Bill.select(...billFields)
		.where({ clinicId })
		.include("patient", (patient) =>
			patient.select("id", "firstName", "lastName", "phone", "email"),
		)
		.include("appointment", (appointment) =>
			appointment.select("id", "appointmentDate", "status"),
		);
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
		db.orm.public.Bill.select(...billFields)
			.where(filters)
			.include("patient", (patient) =>
				patient.select("id", "firstName", "lastName", "phone", "email"),
			)
			.include("appointment", (appointment) =>
				appointment.select("id", "appointmentDate", "status"),
			)
			.orderBy((bill) => bill.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.Bill.where(filters).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	return {
		bills,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: count.total,
			totalPages: Math.ceil(count.total / pagination.limit),
		},
	};
}

export function findBillById(clinicId: ClinicId, billId: string) {
	return billQuery(clinicId).first({ id: billId as BillId });
}

export function findPatientForBill(clinicId: ClinicId, patientId: string) {
	return db.orm.public.Patient.select("id").first({
		id: patientId as PatientId,
		clinicId,
	});
}

export function findAppointmentForBill(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.orm.public.Appointment.select("id", "patientId").first({
		id: appointmentId as AppointmentId,
		clinicId,
	});
}

export function createBill(input: CreateBillDto, clinicId: ClinicId) {
	return db.orm.public.Bill.select(...billFields).create({
		clinicId,
		patientId: input.patientId as PatientId,
		...(input.appointmentId && {
			appointmentId: input.appointmentId as AppointmentId,
		}),
		amount: String(input.amount),
		description: input.description,
		...(input.dueDate && { dueDate: input.dueDate }),
		...(input.notes !== undefined && { notes: input.notes }),
	});
}

export function createBillForAppointment(
	clinicId: ClinicId,
	patientId: string,
	appointmentId: string,
	amount: string,
	client: OrmContext = db,
) {
	return client.orm.public.Bill.select(...billFields).create({
		clinicId,
		patientId: patientId as PatientId,
		appointmentId: appointmentId as AppointmentId,
		amount,
		description: "Appointment consultation fee",
		status: bill_Status.UNPAID,
	});
}

export function updateBillById(
	clinicId: ClinicId,
	billId: string,
	input: UpdateBillDto,
) {
	return db.orm.public.Bill.where({
		id: billId as BillId,
		clinicId,
	})
		.select(...billFields)
		.update({
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
			...(input.dueDate !== undefined && { dueDate: input.dueDate }),
			...(input.notes !== undefined && { notes: input.notes }),
		});
}

export function deleteBillById(clinicId: ClinicId, billId: string) {
	return db.orm.public.Bill.where({
		id: billId as BillId,
		clinicId,
	}).delete();
}
