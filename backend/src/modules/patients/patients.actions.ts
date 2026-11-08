import { db } from "../../../prisma/db.ts";
import type { CreatePatientDto } from "./DTOs/createPatient.dto.ts";
import type { UpdatePatientDto } from "./DTOs/updatePatient.dto.ts";
import { Patient_Status } from "../../../prisma/enums.ts";
import type { PatientStatus } from "../../../prisma/enums.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";

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
	relativeName: true,
	relativePhone: true,
	relativeRelation: true,
	status: true,
	allergies: true,
	clinicId: true,
	createdAt: true,
	updatedAt: true,
} as const;

export type PatientId = string;
type DoctorId = string;
type UserId = string;

function patientWithDateOnly<T extends { dateOfBirth: Date }>(patient: T) {
	return {
		...patient,
		dateOfBirth: patient.dateOfBirth.toISOString().slice(0, 10),
	};
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

export async function findPatientsByClinicId(
	clinicId: ClinicId,
	page = 1,
	limit = 20,
	doctorId?: DoctorId,
	status?: PatientStatus,
) {
	const pagination = normalizePagination(page, limit);
	const filters = {
		clinicId,
		...(status ? { status } : {}),
		...(doctorId
			? { appointments: { some: { doctorId, clinicId } } }
			: {}),
	};
	const [patients, patientCount] = await Promise.all([
		db.patient.findMany({
			where: filters,
			select: patientSelect,
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.patient.count({ where: filters }),
	]);

	return {
		patients: patients.map(patientWithDateOnly),
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total: patientCount,
			totalPages: Math.ceil(patientCount / pagination.limit),
		},
	};
}

export async function findDoctorIdByUserId(userId: string, clinicId: ClinicId) {
	const doctor = await db.doctor.findFirst({
		where: { userId: userId as UserId, clinicId },
		select: { id: true },
	});
	return doctor?.id;
}

export function findAllPatientsByClinicId(clinicId: ClinicId) {
	return db.patient
		.findMany({
			where: { clinicId },
			select: patientSelect,
			orderBy: { createdAt: "desc" },
		})
		.then((patients) => patients.map(patientWithDateOnly));
}

export function findPatientById(clinicId: ClinicId, patientId: string) {
	return db.patient
		.findFirst({
			where: { id: patientId as PatientId, clinicId },
			select: {
				...patientSelect,
				appointments: true,
				medicalRecords: {
					include: {
						doctor: {
							select: {
								id: true,
								specialty: true,
								user: {
									select: {
										firstName: true,
										lastName: true,
									},
								},
							},
						},
					},
				},
				prescriptions: {
					include: {
						doctor: {
							select: {
								id: true,
								specialty: true,
								user: {
									select: {
										firstName: true,
										lastName: true,
									},
								},
							},
						},
					},
				},
				files: true,
			},
		})
		.then((patient) => (patient ? patientWithDateOnly(patient) : null));
}

export function findMedicalRecordsForPatient(
	clinicId: ClinicId,
	patientId: string,
) {
	return db.medicalRecord.findMany({
		where: { clinicId, patientId: patientId as PatientId },
		select: {
			id: true,
			diagnosis: true,
			symptoms: true,
			examination: true,
			treatment: true,
			notes: true,
			createdAt: true,
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
		orderBy: { createdAt: "desc" },
	});
}

export function findPrescriptionsForPatient(patientId: string) {
	return db.prescription.findMany({
		where: { patientId: patientId as PatientId },
		select: {
			id: true,
			medications: true,
			notes: true,
			createdAt: true,
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
		orderBy: { createdAt: "desc" },
	});
}

export function findPatientByEmail(email: string) {
	return db.patient.findFirst({ where: { email }, select: { id: true } });
}

export function createPatient(input: CreatePatientDto, clinicId: ClinicId) {
	return db.patient
		.create({
			data: {
				firstName: input.firstName,
				lastName: input.lastName,
				dateOfBirth: new Date(input.dateOfBirth),
				gender: input.gender,
				bloodType: input.bloodType,
				phone: input.phone,
				email: input.email ?? null,
				address: input.address,
				emergencyContact: input.emergencyContact ?? "",
				relativeName: input.relativeName ?? null,
				relativePhone: input.relativePhone ?? null,
				relativeRelation: input.relativeRelation ?? null,
				status: Patient_Status.new,
				allergies: input.allergies ?? "",
				clinicId,
			},
			select: patientSelect,
		})
		.then(patientWithDateOnly);
}

export function updatePatientById(
	clinicId: ClinicId,
	patientId: string,
	input: UpdatePatientDto,
) {
	const updateData = {
		...input,
		...(input.dateOfBirth !== undefined && {
			dateOfBirth: new Date(input.dateOfBirth),
		}),
	};

	return db.patient
		.update({
			where: { id: patientId as PatientId, clinicId },
			data: updateData,
			select: patientSelect,
		})
		.then(patientWithDateOnly);
}

export function deletePatientById(clinicId: ClinicId, patientId: string) {
	return db.patient.delete({
		where: { id: patientId as PatientId, clinicId },
	});
}
