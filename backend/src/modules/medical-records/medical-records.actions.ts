import { db } from "../../../prisma/db.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateMedicalRecordDto } from "./DTOs/createMedicalRecord.dto.ts";
import type { UpdateMedicalRecordDto } from "./DTOs/updateMedicalRecord.dto.ts";

const medicalRecordSelect = {
	id: true,
	clinicId: true,
	patientId: true,
	doctorId: true,
	appointmentId: true,
	diagnosis: true,
	symptoms: true,
	examination: true,
	treatment: true,
	notes: true,
	createdAt: true,
	updatedAt: true,
} as const;

type MedicalRecordId = string;
type PatientId = string;
type DoctorId = string;
type AppointmentId = string;
type UserId = string;

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

function medicalRecordQuery(clinicId: ClinicId) {
	return {
		where: { clinicId },
		select: {
			...medicalRecordSelect,
			patient: {
				select: { id: true, firstName: true, lastName: true },
			},
			doctor: {
				select: {
					id: true,
					specialty: true,
					user: {
						select: { firstName: true, lastName: true },
					},
				},
			},
		},
	};
}

export async function findMedicalRecordsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: string,
	patientId?: string,
) {
	const pagination = normalizePagination(page, limit);
	const filters = {
		clinicId,
		...(doctorId && { doctorId: doctorId as DoctorId }),
		...(patientId && { patientId: patientId as PatientId }),
	};
	const [medicalRecords, total] = await Promise.all([
		db.medicalRecord.findMany({
			where: filters,
			select: medicalRecordQuery(clinicId).select,
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.medicalRecord.count({ where: filters }),
	]);

	return {
		medicalRecords,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: Math.ceil(total / pagination.limit),
		},
	};
}

export function findMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	doctorId?: string,
) {
	return db.medicalRecord.findFirst({
		...medicalRecordQuery(clinicId),
		where: {
			clinicId,
			id: medicalRecordId as MedicalRecordId,
			...(doctorId && { doctorId: doctorId as DoctorId }),
		},
	});
}

export function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	return db.doctor.findFirst({
		where: { userId: userId as UserId, clinicId },
		select: { id: true },
	});
}

export function findPatientInClinic(clinicId: ClinicId, patientId: string) {
	return db.patient.findFirst({
		where: { id: patientId as PatientId, clinicId },
		select: { id: true },
	});
}

export function findDoctorInClinic(clinicId: ClinicId, doctorId: string) {
	return db.doctor.findFirst({
		where: { id: doctorId as DoctorId, clinicId },
		select: { id: true },
	});
}

export function findAppointmentForMedicalRecord(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.appointment.findFirst({
		where: { id: appointmentId as AppointmentId, clinicId },
		select: { id: true, patientId: true, doctorId: true },
	});
}

export function createMedicalRecord(
	input: CreateMedicalRecordDto,
	clinicId: ClinicId,
) {
	return db.medicalRecord.create({
		data: {
			clinicId,
			patientId: input.patientId as PatientId,
			doctorId: input.doctorId as DoctorId,
			appointmentId: input.appointmentId as AppointmentId,
			diagnosis: input.diagnosis,
			symptoms: input.symptoms,
			examination: input.examination,
			treatment: input.treatment,
			notes: input.notes,
		},
		select: medicalRecordSelect,
	});
}

export function updateMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	input: UpdateMedicalRecordDto,
	doctorId?: string,
) {
	return db.medicalRecord.update({
		where: {
			id: medicalRecordId as MedicalRecordId,
			clinicId,
			...(doctorId && { doctorId: doctorId as DoctorId }),
		},
		data: {
			...(input.patientId !== undefined && {
				patientId: input.patientId as PatientId,
			}),
			...(input.doctorId !== undefined && {
				doctorId: input.doctorId as DoctorId,
			}),
			...(input.appointmentId !== undefined && {
				appointmentId: input.appointmentId as AppointmentId,
			}),
			...(input.diagnosis !== undefined && {
				diagnosis: input.diagnosis,
			}),
			...(input.symptoms !== undefined && {
				symptoms: input.symptoms,
			}),
			...(input.examination !== undefined && {
				examination: input.examination,
			}),
			...(input.treatment !== undefined && {
				treatment: input.treatment,
			}),
			...(input.notes !== undefined && { notes: input.notes }),
		},
		select: medicalRecordSelect,
	});
}

export function deleteMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	doctorId?: string,
) {
	return db.medicalRecord.delete({
		where: {
			id: medicalRecordId as MedicalRecordId,
			clinicId,
			...(doctorId && { doctorId: doctorId as DoctorId }),
		},
	});
}
