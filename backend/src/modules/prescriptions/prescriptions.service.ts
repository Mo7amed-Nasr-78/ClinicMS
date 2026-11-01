import {
	BadRequestException,
	ForbiddenException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Role } from "../../authorization/enums/role.enum.ts";
import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions";
import {
	createPrescription,
	deletePrescriptionById,
	findAppointmentForPrescription,
	findDoctorIdByUserId,
	findDoctorInClinic,
	findPatientInClinic,
	findPrescriptionById,
	findPrescriptionsByClinicId,
	updatePrescriptionById,
} from "./prescriptions.actions";
import type { CreatePrescriptionDto } from "./DTOs/createPrescription.dto";
import type { UpdatePrescriptionDto } from "./DTOs/updatePrescription.dto";

@Injectable()
export class PrescriptionsService {
	async findAll(
		userId: string,
		role: string,
		page = 1,
		limit = 20,
		patientId?: string,
	) {
		const clinicId = await this.getClinicId(userId);
		if (patientId) await this.ensurePatientExists(clinicId, patientId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		return findPrescriptionsByClinicId(
			clinicId,
			page,
			limit,
			doctorId,
			patientId,
		);
	}

	async findOne(userId: string, role: string, prescriptionId: string) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const prescription = await findPrescriptionById(
			clinicId,
			prescriptionId,
			doctorId,
		);
		if (!prescription)
			throw new NotFoundException("Prescription not found");
		return prescription;
	}

	async create(userId: string, role: string, input: CreatePrescriptionDto) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		if (doctorId && input.doctorId !== doctorId) {
			throw new ForbiddenException(
				"Doctors can only create their own prescriptions",
			);
		}
		await this.ensureRelatedRecords(
			clinicId,
			input.patientId,
			input.doctorId,
			input.appointmentId,
		);
		return createPrescription(input, clinicId);
	}

	async update(
		userId: string,
		role: string,
		prescriptionId: string,
		input: UpdatePrescriptionDto,
	) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const currentPrescription = await findPrescriptionById(
			clinicId,
			prescriptionId,
			doctorId,
		);
		if (!currentPrescription) {
			throw new NotFoundException("Prescription not found");
		}

		const patientId = input.patientId ?? currentPrescription.patientId;
		const recordDoctorId =
			input.doctorId ?? currentPrescription.doctorId;
		const appointmentId =
			input.appointmentId ?? currentPrescription.appointmentId;
		if (doctorId && recordDoctorId !== doctorId) {
			throw new ForbiddenException(
				"Doctors can only update their own prescriptions",
			);
		}
		await this.ensureRelatedRecords(
			clinicId,
			patientId,
			recordDoctorId,
			appointmentId,
		);
		return updatePrescriptionById(
			clinicId,
			prescriptionId,
			input,
			doctorId,
		);
	}

	async remove(userId: string, role: string, prescriptionId: string) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const prescription = await findPrescriptionById(
			clinicId,
			prescriptionId,
			doctorId,
		);
		if (!prescription)
			throw new NotFoundException("Prescription not found");
		return deletePrescriptionById(clinicId, prescriptionId, doctorId);
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");
		return clinic.id;
	}

	private async getDoctorScope(
		userId: string,
		role: string,
		clinicId: ClinicId,
	) {
		if (role !== Role.DOCTOR) return undefined;
		const doctor = await findDoctorIdByUserId(userId, clinicId);
		if (!doctor) throw new NotFoundException("Doctor not found");
		return doctor.id;
	}

	private async ensurePatientExists(clinicId: ClinicId, patientId: string) {
		if (!(await findPatientInClinic(clinicId, patientId))) {
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		}
	}

	private async ensureRelatedRecords(
		clinicId: ClinicId,
		patientId: string,
		doctorId: string,
		appointmentId?: string | null,
	) {
		const [patient, doctor, appointment] = await Promise.all([
			findPatientInClinic(clinicId, patientId),
			findDoctorInClinic(clinicId, doctorId),
			appointmentId
				? findAppointmentForPrescription(
						clinicId,
						appointmentId,
					)
				: Promise.resolve(null),
		]);
		if (!patient) {
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		}
		if (!doctor) {
			throw new NotFoundException(
				"Doctor not found in this clinic",
			);
		}
		if (appointmentId && !appointment) {
			throw new NotFoundException(
				"Appointment not found in this clinic",
			);
		}
		if (
			appointment &&
			(appointment.patientId !== patientId ||
				appointment.doctorId !== doctorId)
		) {
			throw new BadRequestException(
				"Prescription patient and doctor must match the appointment",
			);
		}
	}
}
