import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreateMedicalRecordDto } from "./DTOs/createMedicalRecord.dto.ts";
import type { UpdateMedicalRecordDto } from "./DTOs/updateMedicalRecord.dto.ts";

const medicalRecordFields = [
	"id",
	"clinicId",
	"patientId",
	"doctorId",
	"appointmentId",
	"diagnosis",
	"symptoms",
	"examination",
	"treatment",
	"notes",
	"createdAt",
	"updatedAt",
] as const;

type MedicalRecordId = FieldOutputTypes["public"]["MedicalRecord"]["id"];
type PatientId = FieldOutputTypes["public"]["Patient"]["id"];
type DoctorId = FieldOutputTypes["public"]["Doctor"]["id"];
type AppointmentId = FieldOutputTypes["public"]["Appointment"]["id"];
type UserId = FieldOutputTypes["public"]["User"]["id"];

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
	return db.orm.public.MedicalRecord.select(...medicalRecordFields)
		.where({ clinicId })
		.include("patient", (patient) =>
			patient.select("id", "firstName", "lastName"),
		)
		.include("doctor", (doctor) =>
			doctor
				.select("id", "specialty")
				.include("user", (user) =>
					user.select("firstName", "lastName"),
				),
		);
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
	const [medicalRecords, totalResult] = await Promise.all([
		db.orm.public.MedicalRecord.select(...medicalRecordFields)
			.where(filters)
			.include("patient", (patient) =>
				patient.select("id", "firstName", "lastName"),
			)
			.include("doctor", (doctor) =>
				doctor
					.select("id", "specialty")
					.include("user", (user) =>
						user.select("firstName", "lastName"),
					),
			)
			.orderBy((record) => record.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.MedicalRecord.where(filters).aggregate(
			(aggregate) => ({
				total: aggregate.count(),
			}),
		),
	]);

	return {
		medicalRecords,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: totalResult.total,
			totalPages: Math.ceil(totalResult.total / pagination.limit),
		},
	};
}

export function findMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	doctorId?: string,
) {
	return medicalRecordQuery(clinicId).first({
		id: medicalRecordId as MedicalRecordId,
		...(doctorId && { doctorId: doctorId as DoctorId }),
	});
}

export function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	return db.orm.public.Doctor.select("id").first({
		userId: userId as UserId,
		clinicId,
	});
}

export function findPatientInClinic(clinicId: ClinicId, patientId: string) {
	return db.orm.public.Patient.select("id").first({
		id: patientId as PatientId,
		clinicId,
	});
}

export function findDoctorInClinic(clinicId: ClinicId, doctorId: string) {
	return db.orm.public.Doctor.select("id").first({
		id: doctorId as DoctorId,
		clinicId,
	});
}

export function findAppointmentForMedicalRecord(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.orm.public.Appointment.select(
		"id",
		"patientId",
		"doctorId",
	).first({
		id: appointmentId as AppointmentId,
		clinicId,
	});
}

export function createMedicalRecord(
	input: CreateMedicalRecordDto,
	clinicId: ClinicId,
) {
	return db.orm.public.MedicalRecord.select(...medicalRecordFields).create({
		clinicId,
		patientId: input.patientId as PatientId,
		doctorId: input.doctorId as DoctorId,
		appointmentId: input.appointmentId as AppointmentId,
		diagnosis: input.diagnosis,
		symptoms: input.symptoms,
		examination: input.examination,
		treatment: input.treatment,
		notes: input.notes,
	});
}

export function updateMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	input: UpdateMedicalRecordDto,
	doctorId?: string,
) {
	return db.orm.public.MedicalRecord.where({
		id: medicalRecordId as MedicalRecordId,
		clinicId,
		...(doctorId && { doctorId: doctorId as DoctorId }),
	})
		.select(...medicalRecordFields)
		.update({
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
		});
}

export function deleteMedicalRecordById(
	clinicId: ClinicId,
	medicalRecordId: string,
	doctorId?: string,
) {
	return db.orm.public.MedicalRecord.where({
		id: medicalRecordId as MedicalRecordId,
		clinicId,
		...(doctorId && { doctorId: doctorId as DoctorId }),
	}).delete();
}
