import { db } from "../../../prisma/db.ts";
import { buildDoctorWhere } from "../doctors/doctor-filters.ts";
import type { DoctorFilters } from "../doctors/doctor-filters.ts";
import { Status } from "../../../prisma/enums.ts";
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

const patientSelect = {
	id: true,
	firstName: true,
	lastName: true,
	dateOfBirth: true,
	gender: true,
	bloodType: true,
	phone: true,
	email: true,
	address: true,
	emergencyContact: true,
	allergies: true,
	clinicId: true,
	createdAt: true,
	updatedAt: true,
} as const;

const clinicSelect = {
	id: true,
	name: true,
	email: true,
	phone: true,
	address: true,
	logo: true,
	ownerId: true,
	status: true,
	createdAt: true,
	updatedAt: true,
} as const;

const userSummarySelect = {
	id: true,
	firstName: true,
	lastName: true,
	email: true,
	phone: true,
	role: true,
	avatar: true,
	status: true,
} as const;

export function findClinicByOwnerId(ownerId: string) {
	return db.clinic.findUnique({
		where: { ownerId },
		select: { ...clinicSelect, user: { select: userSummarySelect } },
	});
}

export function findClinicById(clinicId: string) {
	return db.clinic.findUnique({
		where: { id: clinicId },
		select: { ...clinicSelect, user: { select: userSummarySelect } },
	});
}

export function findAllClinics() {
	return db.clinic.findMany({
		select: clinicSelect,
		orderBy: { createdAt: "desc" },
	});
}

export async function findClinicIdByOwnerId(ownerId: string) {
	return db.clinic.findUnique({ where: { ownerId }, select: { id: true } });
}

export type ClinicId = string;
type UserId = string;

export async function findClinicIdForUser(userId: string) {
	const ownedClinic = await findClinicIdByOwnerId(userId);
	if (ownedClinic) return ownedClinic;

	const doctor = await db.doctor.findFirst({
		where: { userId: userId as UserId },
		select: { clinicId: true },
	});
	if (doctor) return { id: doctor.clinicId };

	const receptionist = await db.receptionist.findUnique({
		where: { userId: userId as UserId },
		select: { clinicId: true },
	});
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
	filters: DoctorFilters = {},
) {
	const pagination = normalizePagination(page, limit);
	const where = buildDoctorWhere(clinicId, filters);
	const [doctors, doctorCount] = await Promise.all([
		db.doctor.findMany({
			where,
			select: {
				id: true,
				specialty: true,
				licenseNumber: true,
				bio: true,
				consultationDuration: true,
				consultationFee: true,
				status: true,
				userId: true,
				clinicId: true,
				createdAt: true,
				updatedAt: true,
				user: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
						email: true,
						phone: true,
						avatar: true,
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.doctor.count({ where }),
	]);

	return {
		doctors,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: doctorCount,
			totalPages: Math.ceil(doctorCount / pagination.limit),
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
		db.patient.findMany({
			where: { clinicId },
			select: patientSelect,
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.patient.count({ where: { clinicId } }),
	]);

	return {
		patients: patients.map((patient) => ({
			...patient,
			dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
		})),
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: patientCount,
			totalPages: Math.ceil(patientCount / pagination.limit),
		},
	};
}

export function createClinic(ownerId: string, input: CreateClinicDto) {
	return db.clinic.create({
		data: {
			name: input.name,
			email: input.email,
			phone: input.phone,
			address: input.address,
			logo: input.logo ?? "",
			ownerId: ownerId as ClinicId,
			status: Status.active,
		},
		select: clinicSelect,
	});
}

export function updateClinicById(clinicId: ClinicId, input: UpdateClinicDto) {
	return db.clinic.update({
		where: { id: clinicId },
		data: input,
		select: clinicSelect,
	});
}

export function deleteClinic(ownerId: string) {
	return db.clinic.delete({ where: { ownerId } });
}
