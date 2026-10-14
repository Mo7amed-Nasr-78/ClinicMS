import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateAppointmentDto } from "./DTOs/createAppointment.dto.ts";
import type { UpdateAppointmentDto } from "./DTOs/updateAppointment.dto.ts";
import { Temporal } from "temporal-polyfill";
import { and } from "@prisma/orm-postgres/orm-client";

const appointmentFields = [
	"id",
	"clinicId",
	"doctorId",
	"patientId",
	"appointmentDate",
	"startTime",
	"endTime",
	"status",
	"reason",
	"notes",
	"createdBy",
	"createdAt",
	"updatedAt",
] as const;

export type AppointmentId = FieldOutputTypes["public"]["Appointment"]["id"];
export type AppointmentStatus =
	FieldOutputTypes["public"]["Appointment"]["status"];
export type DoctorId = FieldOutputTypes["public"]["Doctor"]["id"];
export type PatientId = FieldOutputTypes["public"]["Patient"]["id"];
type UserId = FieldOutputTypes["public"]["User"]["id"];
type OrmContext = Pick<typeof db, "orm">;

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

export async function findAppointmentsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: DoctorId,
	appointmentDate?: Temporal.Instant,
	status?: AppointmentStatus,
) {
	const pagination = normalizePagination(page, limit);
	const filters = {
		clinicId,
		...(doctorId && { doctorId }),
		...(appointmentDate && { appointmentDate }),
		...(status && { status }),
	};
	const [appointments, appointmentCount] = await Promise.all([
		db.orm.public.Appointment.select(...appointmentFields)
			.where(filters)
			.include("patient", (patient) =>
				patient.select("id", "firstName", "lastName", "email", "status"),
			)
			.include("doctor", (doctor) =>
				doctor
					.select("id", "specialty")
					.include("user", (user) =>
						user.select(
							"firstName",
							"lastName",
							"email",
						),
					),
			)
			.orderBy((appointment) => appointment.appointmentDate.asc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.Appointment.where(filters).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	return {
		appointments,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: appointmentCount.total,
			totalPages: Math.ceil(
				appointmentCount.total / pagination.limit,
			),
		},
	};
}

export async function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	const doctor = await db.orm.public.Doctor.select("id").first({
		userId: userId as UserId,
		clinicId,
	});
	return doctor?.id;
}

export function findAppointmentById(clinicId: ClinicId, appointmentId: string) {
	return db.orm.public.Appointment.select(...appointmentFields).first({
		id: appointmentId as AppointmentId,
		clinicId,
	});
}

export function findDoctorAppointmentsForDate(
	clinicId: ClinicId,
	doctorId: string,
	startOfDate: Temporal.Instant,
	startOfNextDate: Temporal.Instant,
	client: OrmContext = db,
) {
	return client.orm.public.Appointment.select(
		"id",
		"status",
		"startTime",
		"endTime",
	)
		.where((appointment) =>
			and(
				appointment.clinicId.eq(clinicId),
				appointment.doctorId.eq(doctorId as DoctorId),
				appointment.appointmentDate.gte(startOfDate),
				appointment.appointmentDate.lt(startOfNextDate),
			),
		)
		.all();
}

export function findDoctorInClinic(clinicId: ClinicId, doctorId: string) {
	return db.orm.public.Doctor.select("id", "status").first({
		id: doctorId as DoctorId,
		clinicId,
	});
}

export function findPatientInClinic(clinicId: ClinicId, patientId: string) {
	return db.orm.public.Patient.select("id").first({
		id: patientId as PatientId,
		clinicId,
	});
}

export function createAppointment(
	input: CreateAppointmentDto,
	clinicId: ClinicId,
	createdBy: string,
	client: OrmContext = db,
) {
	return client.orm.public.Appointment.select(...appointmentFields).create({
		clinicId,
		doctorId: input.doctorId as DoctorId,
		patientId: input.patientId as PatientId,
		appointmentDate: Temporal.Instant.from(
			`${input.appointmentDate}T00:00:00Z`,
		),
		startTime: input.startTime,
		endTime: input.endTime,
		status: input.status,
		reason: input.reason,
		notes: input.notes,
		createdBy,
	});
}

export function updateAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
	input: UpdateAppointmentDto,
	client: OrmContext = db,
) {
	const updateData = {
		...(input.doctorId !== undefined && {
			doctorId: input.doctorId as DoctorId,
		}),
		...(input.patientId !== undefined && {
			patientId: input.patientId as PatientId,
		}),
		...(input.appointmentDate !== undefined && {
			appointmentDate: Temporal.Instant.from(
				`${input.appointmentDate}T00:00:00Z`,
			),
		}),
		...(input.startTime !== undefined && {
			startTime: input.startTime,
		}),
		...(input.endTime !== undefined && {
			endTime: input.endTime,
		}),
		...(input.status !== undefined && { status: input.status }),
		...(input.reason !== undefined && { reason: input.reason }),
		...(input.notes !== undefined && { notes: input.notes }),
	};

	return client.orm.public.Appointment.where({
		id: appointmentId as AppointmentId,
		clinicId,
	})
		.select(...appointmentFields)
		.update(updateData);
}

export function deleteAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.orm.public.Appointment.where({
		id: appointmentId as AppointmentId,
		clinicId,
	}).delete();
}
