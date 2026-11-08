import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";

import { Patient_Status } from "../../../prisma/enums.ts";
import { Role } from "../../authorization/enums/role.enum.ts";
import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions";
import {
	createPatient,
	deletePatientById,
	findDoctorIdByUserId,
	findMedicalRecordsForPatient,
	findPatientByEmail,
	findPatientById,
	findPatientsByClinicId,
	findPrescriptionsForPatient,
	updatePatientById,
} from "./patients.actions";
import type { CreatePatientDto } from "./DTOs/createPatient.dto";
import type { UpdatePatientDto } from "./DTOs/updatePatient.dto";

@Injectable()
export class PatientsService {
	async findAll(
		userId: string,
		role: string,
		page = 1,
		limit = 20,
		status?: string,
	) {
		const clinicId = await this.getClinicId(userId);
		const patientStatus = status
			? Object.values(Patient_Status).find(
					(allowedStatus) => allowedStatus === status,
				)
			: undefined;
		if (status && !patientStatus) {
			throw new BadRequestException("Invalid patient status");
		}

		if (role === Role.DOCTOR) {
			const doctorId = await findDoctorIdByUserId(userId, clinicId);
			if (!doctorId) {
				throw new NotFoundException("Doctor not found");
			}
			return findPatientsByClinicId(
				clinicId,
				page,
				limit,
				doctorId,
				patientStatus,
			);
		}

		return findPatientsByClinicId(
			clinicId,
			page,
			limit,
			undefined,
			patientStatus,
		);
	}

	async findOne(ownerId: string, patientId: string) {
		const clinicId = await this.getClinicId(ownerId);
		const patient = await findPatientById(clinicId, patientId);
		if (!patient) {
			throw new NotFoundException("Patient not found");
		}

		return patient;
	}

	async findMedicalRecords(ownerId: string, patientId: string) {
		const clinicId = await this.getClinicId(ownerId);
		await this.ensurePatientExists(clinicId, patientId);
		return findMedicalRecordsForPatient(clinicId, patientId);
	}

	async findPrescriptions(ownerId: string, patientId: string) {
		const clinicId = await this.getClinicId(ownerId);
		await this.ensurePatientExists(clinicId, patientId);
		return findPrescriptionsForPatient(patientId);
	}

	async create(ownerId: string, input: CreatePatientDto) {
		const clinicId = await this.getClinicId(ownerId);
		if (input.email && (await findPatientByEmail(input.email))) {
			throw new ConflictException("Patient email already exists");
		}

		return createPatient(input, clinicId);
	}

	async update(
		ownerId: string,
		patientId: string,
		input: UpdatePatientDto,
	) {
		const clinicId = await this.getClinicId(ownerId);
		await this.ensurePatientExists(clinicId, patientId);
		return updatePatientById(clinicId, patientId, input);
	}

	async remove(ownerId: string, patientId: string) {
		const clinicId = await this.getClinicId(ownerId);
		await this.ensurePatientExists(clinicId, patientId);
		return deletePatientById(clinicId, patientId);
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		return clinic.id;
	}

	private async ensurePatientExists(clinicId: ClinicId, patientId: string) {
		const patient = await findPatientById(clinicId, patientId);
		if (!patient) {
			throw new NotFoundException("Patient not found");
		}
	}
}
