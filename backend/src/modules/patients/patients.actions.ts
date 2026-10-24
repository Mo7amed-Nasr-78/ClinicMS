import { and } from "@prisma/orm-postgres/orm-client";
import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { CreatePatientDto } from "./DTOs/createPatient.dto.ts";
import type { UpdatePatientDto } from "./DTOs/updatePatient.dto.ts";
import { Patient_Status } from "../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { Temporal } from "temporal-polyfill";

const patientFields = [
	"id",
	"firstName",
	"lastName",
	"dateOfBirth",
	"gender",
	"bloodType",
	"phone",
	"email",
	"address",
	"emergencyContact",
	"status",
	"allergies",
	"clinicId",
	"createdAt",
	"updatedAt",
] as const;

export type PatientId = FieldOutputTypes["public"]["Patient"]["id"];
type DoctorId = FieldOutputTypes["public"]["Doctor"]["id"];
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

export async function findPatientsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: DoctorId,
	status?: string,
) {
	const pagination = normalizePagination(page, limit);
	const filters = { clinicId, ...(status ? { status } : {}) };
	const patientQuery = db.orm.public.Patient.select(...patientFields).where(
		filters,
	);
	const patientCountQuery = db.orm.public.Patient.where(filters);
	const scopedPatientQuery = doctorId
		? patientQuery.where((patient) =>
				patient.appointments.some((appointment) =>
					and(
						appointment.doctorId.eq(doctorId),
						appointment.clinicId.eq(clinicId),
					),
				),
			)
		: patientQuery;
	const scopedPatientCountQuery = doctorId
		? patientCountQuery.where((patient) =>
				patient.appointments.some((appointment) =>
					and(
						appointment.doctorId.eq(doctorId),
						appointment.clinicId.eq(clinicId),
					),
				),
			)
		: patientCountQuery;
	const [patients, patientCount] = await Promise.all([
		scopedPatientQuery
			.orderBy((patient) => patient.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		scopedPatientCountQuery.aggregate((aggregate) => ({
			total: aggregate.count(),
		})),
	]);

	return {
		patients,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: patientCount.total,
			totalPages: Math.ceil(patientCount.total / pagination.limit),
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

export function findAllPatientsByClinicId(clinicId: ClinicId) {
	return db.orm.public.Patient.select(...patientFields)
		.where({ clinicId })
		.orderBy((patient) => patient.createdAt.desc())
		.all();
}

export function findPatientById(clinicId: ClinicId, patientId: string) {
	return db.orm.public.Patient.select(...patientFields)
		.include("appointments")
		.include("medicalRecords", (record) =>
			record.include("doctor", (doctor) =>
				doctor
					.select("id", "specialty")
					.include("user", (user) =>
						user.select("firstName", "lastName"),
					),
			),
		)
		.include("prescriptions", (record) =>
			record.include("doctor", (doctor) =>
				doctor
					.select("id", "specialty")
					.include("user", (user) =>
						user.select("firstName", "lastName"),
					),
			),
		)
		.include("files")
		.first({
			id: patientId as PatientId,
			clinicId,
		});
}

export function findMedicalRecordsForPatient(
	clinicId: ClinicId,
	patientId: string,
) {
	return db.orm.public.MedicalRecord.select(
		"id",
		"diagnosis",
		"symptoms",
		"examination",
		"treatment",
		"notes",
		"createdAt",
	)
		.where({ clinicId, patientId: patientId as PatientId })
		.include("doctor", (doctor) =>
			doctor
				.select("id", "specialty")
				.include("user", (user) =>
					user.select("firstName", "lastName"),
				),
		)
		.orderBy((record) => record.createdAt.desc())
		.all();
}

export function findPrescriptionsForPatient(patientId: string) {
	return db.orm.public.Prescription.select(
		"id",
		"medications",
		"notes",
		"createdAt",
	)
		.where({ patientId: patientId as PatientId })
		.include("doctor", (doctor) =>
			doctor
				.select("id", "specialty")
				.include("user", (user) =>
					user.select("firstName", "lastName"),
				),
		)
		.orderBy((prescription) => prescription.createdAt.desc())
		.all();
}

export function findPatientByEmail(email: string) {
	return db.orm.public.Patient.select("id").first({ email });
}

export function createPatient(input: CreatePatientDto, clinicId: ClinicId) {
	return db.orm.public.Patient.select(...patientFields).create({
		firstName: input.firstName,
		lastName: input.lastName,
		dateOfBirth: input.dateOfBirth,
		gender: input.gender,
		bloodType: input.bloodType,
		phone: input.phone,
		email: input.email ?? null,
		address: input.address,
		emergencyContact: input.emergencyContact ?? "",
		status: Patient_Status.UPCOMING,
		allergies: input.allergies ?? "",
		clinicId,
	});
}

export function updatePatientById(
	clinicId: ClinicId,
	patientId: string,
	input: UpdatePatientDto,
) {
	return db.orm.public.Patient.select(...patientFields).update(
		{ id: patientId as PatientId, clinicId },
		input,
	);
}

export function deletePatientById(clinicId: ClinicId, patientId: string) {
	return db.orm.public.Patient.where({
		id: patientId as PatientId,
		clinicId,
	}).delete();
}
