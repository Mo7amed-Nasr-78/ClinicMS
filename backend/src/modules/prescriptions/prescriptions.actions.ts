import { and } from "@prisma/orm-postgres/orm-client";
import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreatePrescriptionDto } from "./DTOs/createPrescription.dto.ts";
import type { UpdatePrescriptionDto } from "./DTOs/updatePrescription.dto.ts";

const prescriptionFields = [
	"id",
	"patientId",
	"doctorId",
	"appointmentId",
	"medications",
	"notes",
	"createdAt",
	"updatedAt",
] as const;

type PrescriptionId = FieldOutputTypes["public"]["Prescription"]["id"];
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

function prescriptionClinicFilter(
	clinicId: ClinicId,
	doctorId?: string,
	patientId?: string,
) {
	return (
		prescription: Parameters<
			Parameters<typeof db.orm.public.Prescription.where>[0]
		>[0],
	) => {
		const patientClinic = prescription.patient.clinicId.eq(clinicId);
		if (doctorId && patientId) {
			return and(
				patientClinic,
				prescription.doctorId.eq(doctorId as DoctorId),
				prescription.patientId.eq(patientId as PatientId),
			);
		}
		if (doctorId) {
			return and(
				patientClinic,
				prescription.doctorId.eq(doctorId as DoctorId),
			);
		}
		if (patientId) {
			return and(
				patientClinic,
				prescription.patientId.eq(patientId as PatientId),
			);
		}
		return patientClinic;
	};
}

function prescriptionQuery(clinicId: ClinicId, doctorId?: string) {
	return db.orm.public.Prescription.select(...prescriptionFields)
		.where(prescriptionClinicFilter(clinicId, doctorId))
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

export async function findPrescriptionsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: string,
	patientId?: string,
) {
	const pagination = normalizePagination(page, limit);
	const filter = prescriptionClinicFilter(clinicId, doctorId, patientId);
	const [prescriptions, totalResult] = await Promise.all([
		db.orm.public.Prescription.select(...prescriptionFields)
			.where(filter)
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
			.orderBy((prescription) => prescription.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.Prescription.where(filter).aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	return {
		prescriptions,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: totalResult.total,
			totalPages: Math.ceil(totalResult.total / pagination.limit),
		},
	};
}

export function findPrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	doctorId?: string,
) {
	return prescriptionQuery(clinicId, doctorId).first({
		id: prescriptionId as PrescriptionId,
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

export function findAppointmentForPrescription(
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

export function createPrescription(input: CreatePrescriptionDto) {
	return db.orm.public.Prescription.select(...prescriptionFields).create({
		patientId: input.patientId as PatientId,
		doctorId: input.doctorId as DoctorId,
		appointmentId: input.appointmentId as AppointmentId,
		medications: input.medications,
		notes: input.notes,
	});
}

export function updatePrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	input: UpdatePrescriptionDto,
	doctorId?: string,
) {
	return db.orm.public.Prescription.where({
		id: prescriptionId as PrescriptionId,
	})
		.where(prescriptionClinicFilter(clinicId, doctorId))
		.select(...prescriptionFields)
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
			...(input.medications !== undefined && {
				medications: input.medications,
			}),
			...(input.notes !== undefined && { notes: input.notes }),
		});
}

export function deletePrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	doctorId?: string,
) {
	return db.orm.public.Prescription.where({
		id: prescriptionId as PrescriptionId,
	})
		.where(prescriptionClinicFilter(clinicId, doctorId))
		.delete();
}
