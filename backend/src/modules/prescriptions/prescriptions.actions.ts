import { db } from "../../../prisma/db.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import type { CreatePrescriptionDto } from "./DTOs/createPrescription.dto.ts";
import type { UpdatePrescriptionDto } from "./DTOs/updatePrescription.dto.ts";

const prescriptionSelect = {
	id: true,
	clinicId: true,
	patientId: true,
	doctorId: true,
	appointmentId: true,
	medications: true,
	notes: true,
	createdAt: true,
	updatedAt: true,
} as const;

type PrescriptionId = string;
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

function prescriptionClinicFilter(
	clinicId: ClinicId,
	doctorId?: string,
	patientId?: string,
) {
	return {
		clinicId,
		...(doctorId && { doctorId: doctorId as DoctorId }),
		...(patientId && { patientId: patientId as PatientId }),
	};
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
	const [prescriptions, total] = await Promise.all([
		db.prescription.findMany({
			where: filter,
			select: {
				...prescriptionSelect,
				patient: {
					select: {
						id: true,
						firstName: true,
						lastName: true,
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
							},
						},
					},
				},
			},
			orderBy: { createdAt: "desc" },
			skip: pagination.offset,
			take: pagination.limit,
		}),
		db.prescription.count({ where: filter }),
	]);

	return {
		prescriptions,
		pagination: {
			page: pagination.page,
			limit: pagination.limit,
			total,
			totalPages: Math.ceil(total / pagination.limit),
		},
	};
}

export function findPrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	doctorId?: string,
) {
	const where = prescriptionClinicFilter(clinicId, doctorId);
	return db.prescription.findFirst({
		where: { ...where, id: prescriptionId as PrescriptionId },
		select: {
			...prescriptionSelect,
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

export function findAppointmentForPrescription(
	clinicId: ClinicId,
	appointmentId: string,
) {
	return db.appointment.findFirst({
		where: { id: appointmentId as AppointmentId, clinicId },
		select: { id: true, patientId: true, doctorId: true },
	});
}

export function createPrescription(
	input: CreatePrescriptionDto,
	clinicId: ClinicId,
) {
	return db.prescription.create({
		data: {
			clinicId,
			patientId: input.patientId as PatientId,
			doctorId: input.doctorId as DoctorId,
			appointmentId: input.appointmentId as AppointmentId,
			medications: input.medications,
			notes: input.notes,
		},
		select: prescriptionSelect,
	});
}

export function updatePrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	input: UpdatePrescriptionDto,
	doctorId?: string,
) {
	return db.prescription.update({
		where: {
			id: prescriptionId as PrescriptionId,
			...prescriptionClinicFilter(clinicId, doctorId),
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
			...(input.medications !== undefined && {
				medications: input.medications,
			}),
			...(input.notes !== undefined && { notes: input.notes }),
		},
		select: prescriptionSelect,
	});
}

export function deletePrescriptionById(
	clinicId: ClinicId,
	prescriptionId: string,
	doctorId?: string,
) {
	return db.prescription.delete({
		where: {
			id: prescriptionId as PrescriptionId,
			...prescriptionClinicFilter(clinicId, doctorId),
		},
	});
}
