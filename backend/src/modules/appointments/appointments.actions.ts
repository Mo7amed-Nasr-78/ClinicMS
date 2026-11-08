import { db, type PrismaTransaction } from "../../../prisma/db.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateAppointmentDto } from "./DTOs/createAppointment.dto.ts";
import type { UpdateAppointmentDto } from "./DTOs/updateAppointment.dto.ts";
import { Temporal } from "temporal-polyfill";
import {
	Appointment_Source,
	appointment_Status,
	type AppointmentStatus,
} from "../../../prisma/enums.ts";

const appointmentSelect = {
	id: true,
	clinicId: true,
	doctorId: true,
	patientId: true,
	visitTypeId: true,
	appointmentDate: true,
	startAt: true,
	endAt: true,
	status: true,
	source: true,
	reason: true,
	notes: true,
	checkedInAt: true,
	startedAt: true,
	completedAt: true,
	cancelledAt: true,
	cancelReason: true,
	cancelledBy: true,
	rescheduledFromId: true,
	createdBy: true,
	createdAt: true,
	updatedAt: true,
} as const;

export type AppointmentId = string;
export type { AppointmentStatus };
export type DoctorId = string;
export type PatientId = string;
export type VisitTypeId = string;
type UserId = string;
type OrmContext = Pick<PrismaTransaction, "appointment">;

function toDatabaseDate(value: string) {
	return new Date(`${value}T00:00:00.000Z`);
}

function appointmentWithDateOnly<T extends { appointmentDate: Date }>(
	appointment: T,
) {
	return {
		...appointment,
		appointmentDate: appointment.appointmentDate
			.toISOString()
			.slice(0, 10),
	};
}

function dateFromInstant(value: Temporal.Instant, timeZone: string) {
	return value.toZonedDateTimeISO(timeZone).toPlainDate().toString();
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

export async function findAppointmentsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: DoctorId,
	appointmentDateRange?: {
		start: string;
		end: string;
	},
	status?: AppointmentStatus,
	patientId?: PatientId,
) {
	const pagination = normalizePagination(page, limit);
	const where = {
		clinicId,
		...(doctorId && { doctorId }),
		...(patientId && { patientId }),
		...(status && { status }),
		...(appointmentDateRange && {
			appointmentDate: {
				gte: toDatabaseDate(appointmentDateRange.start),
				lt: toDatabaseDate(appointmentDateRange.end),
			},
		}),
	};
	const [appointments, appointmentCount] = await Promise.all([
		db.appointment.findMany({
			where,
			select: {
				...appointmentSelect,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						status: true,
					},
				},
				doctor: {
					select: {
						id: true,
						specialty: true,
						user: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
				visitType: {
					select: {
						id: true,
						name: true,
						defaultDurationMin: true,
						price: true,
						color: true,
						isFollowUp: true,
					},
				},
			},
			orderBy: { startAt: "asc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.appointment.count({ where }),
	]);

	return {
		appointments: appointments.map(appointmentWithDateOnly),
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: appointmentCount,
			totalPages: Math.ceil(appointmentCount / pagination.limit),
		},
	};
}

export function findAppointmentsForDate(
	clinicId: ClinicId,
	appointmentDate: string,
	doctorId?: DoctorId,
) {
	return db.appointment
		.findMany({
			where: {
				clinicId,
				...(doctorId && { doctorId }),
				appointmentDate: toDatabaseDate(appointmentDate),
			},
			select: {
				...appointmentSelect,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						status: true,
					},
				},
				doctor: {
					select: {
						id: true,
						specialty: true,
						user: {
							select: {
								firstName: true,
								lastName: true,
								email: true,
							},
						},
					},
				},
			},
			orderBy: { startAt: "asc" },
		})
		.then((appointments) => appointments.map(appointmentWithDateOnly));
}

export async function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	const doctor = await db.doctor.findFirst({
		where: { userId: userId as UserId, clinicId },
		select: { id: true },
	});
	return doctor?.id;
}

export function findAppointmentById(clinicId: ClinicId, appointmentId: string) {
	return db.appointment
		.findFirst({
			where: { id: appointmentId as AppointmentId, clinicId },
			select: appointmentSelect,
		})
		.then((appointment) =>
			appointment ? appointmentWithDateOnly(appointment) : null,
		);
}

export function findDoctorAppointmentsForDate(
	clinicId: ClinicId,
	doctorId: string,
	appointmentDate: string,
	client: OrmContext = db,
) {
	return client.appointment
		.findMany({
			where: {
				clinicId,
				doctorId: doctorId as DoctorId,
				appointmentDate: toDatabaseDate(appointmentDate),
			},
			select: {
				id: true,
				patientId: true,
				status: true,
				startAt: true,
				endAt: true,
			},
		})
		.then((appointments) =>
			appointments.map((appointment) => ({
				id: appointment.id,
				patientId: appointment.patientId,
				status: appointment.status,
				startTime: appointment.startAt,
				endTime: appointment.endAt,
			})),
		);
}

export function findPatientAppointmentsForDate(
	clinicId: ClinicId,
	patientId: string,
	appointmentDate: string,
	client: OrmContext = db,
) {
	return client.appointment.findMany({
		where: {
			clinicId,
			patientId: patientId as PatientId,
			appointmentDate: toDatabaseDate(appointmentDate),
			status: { not: appointment_Status.cancelled },
		},
		select: {
			doctorId: true,
			startAt: true,
			endAt: true,
		},
	});
}

export async function findDoctorDashboardStats(
	clinicId: ClinicId,
	doctorId: DoctorId,
	todayStart: Temporal.Instant,
	tomorrowStart: Temporal.Instant,
	monthStart: Temporal.Instant,
	nextMonthStart: Temporal.Instant,
	timeZone: string,
) {
	const [
		todayAppointmentCount,
		monthlyAppointmentCount,
		monthlyNoShowCount,
	] = await Promise.all([
		db.appointment.count({
			where: {
				clinicId,
				doctorId,
				appointmentDate: {
					gte: toDatabaseDate(
						dateFromInstant(todayStart, timeZone),
					),
					lt: toDatabaseDate(
						dateFromInstant(tomorrowStart, timeZone),
					),
				},
			},
		}),
		db.appointment.count({
			where: {
				clinicId,
				doctorId,
				appointmentDate: {
					gte: toDatabaseDate(
						dateFromInstant(monthStart, timeZone),
					),
					lt: toDatabaseDate(
						dateFromInstant(nextMonthStart, timeZone),
					),
				},
			},
		}),
		db.appointment.count({
			where: {
				clinicId,
				doctorId,
				appointmentDate: {
					gte: toDatabaseDate(
						dateFromInstant(monthStart, timeZone),
					),
					lt: toDatabaseDate(
						dateFromInstant(nextMonthStart, timeZone),
					),
				},
				status: appointment_Status.noShow,
			},
		}),
	]);
	const todayWaitlist = await db.appointment
		.findMany({
			where: {
				clinicId,
				doctorId,
				appointmentDate: {
					gte: toDatabaseDate(
						dateFromInstant(todayStart, timeZone),
					),
					lt: toDatabaseDate(
						dateFromInstant(tomorrowStart, timeZone),
					),
				},
				status: appointment_Status.checkedIn,
			},
			select: {
				id: true,
				appointmentDate: true,
				startAt: true,
				endAt: true,
				status: true,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
					},
				},
			},
			orderBy: { startAt: "asc" },
		})
		.then((appointments) =>
			appointments.map((appointment) => ({
				id: appointment.id,
				status: appointment.status,
				patient: appointment.patient,
				startTime: appointment.startAt,
				endTime: appointment.endAt,
			})),
		);

	return {
		todayAppointments: todayAppointmentCount,
		monthlyNoShowRate:
			monthlyAppointmentCount === 0
				? 0
				: Number(
						(
							(monthlyNoShowCount /
								monthlyAppointmentCount) *
							100
						).toFixed(1),
					),
		revenue: 0,
		todayWaitlist,
	};
}

export function findDoctorInClinic(clinicId: ClinicId, doctorId: string) {
	return db.doctor.findFirst({
		where: { id: doctorId as DoctorId, clinicId },
		select: { id: true, status: true, consultationFee: true },
	});
}

export function findPatientInClinic(clinicId: ClinicId, patientId: string) {
	return db.patient.findFirst({
		where: { id: patientId as PatientId, clinicId },
		select: { id: true },
	});
}

export function findClinicTimezone(clinicId: ClinicId) {
	return db.clinic.findUnique({
		where: { id: clinicId },
		select: { timezone: true },
	});
}

export function findVisitTypeInClinic(clinicId: ClinicId, visitTypeId: string) {
	return db.visitType.findFirst({
		where: { id: visitTypeId as VisitTypeId, clinicId },
		select: { id: true, isActive: true, price: true },
	});
}

export function findDefaultVisitTypeInClinic(clinicId: ClinicId) {
	return db.visitType.findFirst({
		where: { clinicId, isActive: true, isFollowUp: false },
		select: { id: true, isActive: true, price: true },
		orderBy: { createdAt: "asc" },
	});
}

export function createAppointment(
	input: CreateAppointmentDto,
	clinicId: ClinicId,
	createdBy: string,
	visitTypeId: string,
	client: OrmContext = db,
) {
	return client.appointment
		.create({
			data: {
				clinicId,
				doctorId: input.doctorId as DoctorId,
				patientId: input.patientId as PatientId,
				visitTypeId: visitTypeId as VisitTypeId,
				appointmentDate: toDatabaseDate(input.appointmentDate),
				startAt: input.startTime,
				endAt: input.endTime,
				status: input.status ?? appointment_Status.scheduled,
				source: input.source ?? Appointment_Source.reception,
				reason: input.reason,
				notes: input.notes,
				createdBy: createdBy as UserId,
			},
			select: appointmentSelect,
		})
		.then(appointmentWithDateOnly);
}

export function updateAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
	input: UpdateAppointmentDto,
	updatedBy: string,
	client: OrmContext = db,
) {
	const updateData = {
		...(input.doctorId !== undefined && {
			doctorId: input.doctorId as DoctorId,
		}),
		...(input.patientId !== undefined && {
			patientId: input.patientId as PatientId,
		}),
		...(input.visitTypeId !== undefined && {
			visitTypeId: input.visitTypeId as VisitTypeId,
		}),
		...(input.appointmentDate !== undefined && {
			appointmentDate: toDatabaseDate(input.appointmentDate),
		}),
		...(input.startTime !== undefined && {
			startAt: input.startTime,
		}),
		...(input.endTime !== undefined && {
			endAt: input.endTime,
		}),
		...(input.status !== undefined && { status: input.status }),
		...(input.status === appointment_Status.checkedIn && {
			checkedInAt: new Date(),
		}),
		...(input.status === appointment_Status.inProgress && {
			startedAt: new Date(),
		}),
		...(input.status === appointment_Status.completed && {
			completedAt: new Date(),
		}),
		...(input.status === appointment_Status.cancelled && {
			cancelledAt: new Date(),
			cancelledBy: updatedBy as UserId,
			cancelReason: null,
		}),
		...(input.source !== undefined && { source: input.source }),
		...(input.reason !== undefined && { reason: input.reason }),
		...(input.notes !== undefined && { notes: input.notes }),
	};

	return client.appointment
		.update({
			where: { id: appointmentId as AppointmentId, clinicId },
			data: updateData,
			select: appointmentSelect,
		})
		.then(appointmentWithDateOnly);
}

export function cancelAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
	cancelReason: string,
	cancelledBy: string,
) {
	return db.appointment
		.update({
			where: { id: appointmentId as AppointmentId, clinicId },
			data: {
				status: appointment_Status.cancelled,
				cancelReason,
				cancelledAt: new Date(),
				cancelledBy: cancelledBy as UserId,
			},
			select: appointmentSelect,
		})
		.then(appointmentWithDateOnly);
}

export function completeAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.appointment.updateMany({
		where: {
			id: appointmentId as AppointmentId,
			clinicId,
			status: appointment_Status.inProgress,
		},
		data: {
			status: appointment_Status.completed,
			completedAt: new Date(),
		},
	});
}

export function deleteAppointmentById(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.appointment.delete({
		where: { id: appointmentId as AppointmentId, clinicId },
	});
}
