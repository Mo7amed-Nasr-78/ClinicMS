import { and } from "@prisma/orm-postgres/orm-client";
import { db } from "../../prisma/db.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { CreatePatientDto } from "./DTOs/createPatient.dto.ts";
import type { UpdatePatientDto } from "./DTOs/updatePatient.dto.ts";
import { Patient_Status } from "../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

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
) {
	const pagination = normalizePagination(page, limit);
	const patientQuery = db.orm.public.Patient.select(...patientFields).where(
		{
			clinicId,
		},
	);
	const patientCountQuery = db.orm.public.Patient.where({ clinicId });
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
	return db.orm.public.Patient.select(...patientFields).first({
		id: patientId as PatientId,
		clinicId,
	});
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
