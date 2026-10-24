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
	createMedicalRecord,
	deleteMedicalRecordById,
	findAppointmentForMedicalRecord,
	findDoctorIdByUserId,
	findDoctorInClinic,
	findMedicalRecordById,
	findMedicalRecordsByClinicId,
	findPatientInClinic,
	updateMedicalRecordById,
} from "./medical-records.actions";
import type { CreateMedicalRecordDto } from "./DTOs/createMedicalRecord.dto";
import type { UpdateMedicalRecordDto } from "./DTOs/updateMedicalRecord.dto";

@Injectable()
export class MedicalRecordsService {
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
		return findMedicalRecordsByClinicId(
			clinicId,
			page,
			limit,
			doctorId,
			patientId,
		);
	}

	async findOne(userId: string, role: string, medicalRecordId: string) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const record = await findMedicalRecordById(
			clinicId,
			medicalRecordId,
			doctorId,
		);
		if (!record)
			throw new NotFoundException("Medical record not found");
		return record;
	}

	async create(
		userId: string,
		role: string,
		input: CreateMedicalRecordDto,
	) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		if (doctorId && input.doctorId !== doctorId) {
			throw new ForbiddenException(
				"Doctors can only create their own medical records",
			);
		}
		await this.ensureRelatedRecords(
			clinicId,
			input.patientId,
			input.doctorId,
			input.appointmentId,
		);
		return createMedicalRecord(input, clinicId);
	}

	async update(
		userId: string,
		role: string,
		medicalRecordId: string,
		input: UpdateMedicalRecordDto,
	) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const currentRecord = await findMedicalRecordById(
			clinicId,
			medicalRecordId,
			doctorId,
		);
		if (!currentRecord) {
			throw new NotFoundException("Medical record not found");
		}

		const patientId = input.patientId ?? currentRecord.patientId;
		const recordDoctorId = input.doctorId ?? currentRecord.doctorId;
		const appointmentId =
			input.appointmentId ?? currentRecord.appointmentId;
		if (doctorId && recordDoctorId !== doctorId) {
			throw new ForbiddenException(
				"Doctors can only update their own medical records",
			);
		}
		await this.ensureRelatedRecords(
			clinicId,
			patientId,
			recordDoctorId,
			appointmentId,
		);
		return updateMedicalRecordById(
			clinicId,
			medicalRecordId,
			input,
			doctorId,
		);
	}

	async remove(userId: string, role: string, medicalRecordId: string) {
		const clinicId = await this.getClinicId(userId);
		const doctorId = await this.getDoctorScope(userId, role, clinicId);
		const record = await findMedicalRecordById(
			clinicId,
			medicalRecordId,
			doctorId,
		);
		if (!record)
			throw new NotFoundException("Medical record not found");
		return deleteMedicalRecordById(clinicId, medicalRecordId, doctorId);
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
		appointmentId: string,
	) {
		const [patient, doctor, appointment] = await Promise.all([
			findPatientInClinic(clinicId, patientId),
			findDoctorInClinic(clinicId, doctorId),
			findAppointmentForMedicalRecord(clinicId, appointmentId),
		]);
		if (!patient)
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		if (!doctor)
			throw new NotFoundException(
				"Doctor not found in this clinic",
			);
		if (!appointment) {
			throw new NotFoundException(
				"Appointment not found in this clinic",
			);
		}
		if (
			appointment.patientId !== patientId ||
			appointment.doctorId !== doctorId
		) {
			throw new BadRequestException(
				"Medical record patient and doctor must match the appointment",
			);
		}
	}
}
