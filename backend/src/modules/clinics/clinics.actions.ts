import { db } from "../../prisma/db.ts";
import { Status } from "../../prisma/enums.ts";
import type { FieldOutputTypes } from "../../prisma/generated/contract.d.ts";
import type { CreateClinicDto } from "./DTOs/createClinic.dto.ts";
import type { UpdateClinicDto } from "./DTOs/updateClinic.dto.ts";

const clinicFields = [
	"id",
	"name",
	"email",
	"phone",
	"address",
	"logo",
	"ownerId",
	"status",
	"createdAt",
	"updatedAt",
] as const;

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
	"allergies",
	"clinicId",
	"createdAt",
	"updatedAt",
] as const;

export function findClinicByOwnerId(ownerId: string) {
	return db.orm.public.Clinic.select(...clinicFields)
		.include("user")
		.first({
			ownerId: ownerId as ClinicId,
		});
}

export function findClinicById(clinicId: string) {
	return db.orm.public.Clinic.select(...clinicFields)
		.include("user")
		.first({ id: clinicId as ClinicId });
}

export function findAllClinics() {
	return db.orm.public.Clinic.select(...clinicFields)
		.orderBy((clinic) => clinic.createdAt.desc())
		.all();
}

export async function findClinicIdByOwnerId(ownerId: string) {
	return db.orm.public.Clinic.select("id").first({
		ownerId: ownerId as ClinicId,
	});
}

export type ClinicId = FieldOutputTypes["public"]["Clinic"]["id"];
type UserId = FieldOutputTypes["public"]["User"]["id"];

export async function findClinicIdForUser(userId: string) {
	const ownedClinic = await findClinicIdByOwnerId(userId);
	if (ownedClinic) return ownedClinic;

	const doctor = await db.orm.public.Doctor.select("clinicId").first({
		userId: userId as UserId,
	});
	if (doctor) return { id: doctor.clinicId };

	const receptionist = await db.orm.public.Receptionist.select(
		"clinicId",
	).first({ userId: userId as UserId });
	return receptionist ? { id: receptionist.clinicId } : null;
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

export async function findDoctorsByClinicId(
	clinicId: string,
	page = 1,
	limit = 20,
) {
	const pagination = normalizePagination(page, limit);
	const [doctors, doctorCount] = await Promise.all([
		db.orm.public.Doctor.select(
			"id",
			"specialty",
			"licenseNumber",
			"bio",
			"consultationDuration",
			"consultationFee",
			"status",
			"userId",
			"clinicId",
			"createdAt",
			"updatedAt",
		)
			.where({ clinicId: clinicId as ClinicId })
			.include("user", (user) =>
				user.select(
					"id",
					"firstName",
					"lastName",
					"email",
					"phone",
					"avatar",
				),
			)
			.orderBy((doctor) => doctor.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.Doctor.where({
			clinicId: clinicId as ClinicId,
		}).aggregate((aggregate) => ({ total: aggregate.count() })),
	]);

	return {
		doctors,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: doctorCount.total,
			totalPages: Math.ceil(doctorCount.total / pagination.limit),
		},
	};
}

export async function findPatientsByClinicId(
	clinicId: string,
	page = 1,
	limit = 20,
) {
	const pagination = normalizePagination(page, limit);
	const [patients, patientCount] = await Promise.all([
		db.orm.public.Patient.select(...patientFields)
			.where({ clinicId: clinicId as ClinicId })
			.orderBy((patient) => patient.createdAt.desc())
			.offset(pagination.offset)
			.limit(pagination.limit)
			.all(),
		db.orm.public.Patient.where({
			clinicId: clinicId as ClinicId,
		}).aggregate((aggregate) => ({ total: aggregate.count() })),
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

export function createClinic(ownerId: string, input: CreateClinicDto) {
	return db.orm.public.Clinic.select(...clinicFields).create({
		name: input.name,
		email: input.email,
		phone: input.phone,
		address: input.address,
		logo: input.logo ?? "",
		ownerId: ownerId as ClinicId,
		status: Status.ACTIVE,
	});
}

export function updateClinicById(clinicId: ClinicId, input: UpdateClinicDto) {
	return db.orm.public.Clinic.select(...clinicFields).update(
		{ id: clinicId },
		input,
	);
}

export function deleteClinic(ownerId: string) {
	return db.orm.public.Clinic.delete({ ownerId: ownerId as ClinicId });
}
