import {
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";

import { findClinicIdForUser } from "../clinics/clinics.actions.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import {
	createReceptionist,
	deactivateReceptionist,
	findAllReceptionists,
	findReceptionistById,
	findReceptionistUserByEmail,
	updateReceptionist,
} from "./receptionists.actions.ts";
import type { CreateReceptionistDto } from "./DTOs/createReceptionist.dto.ts";
import type { UpdateReceptionistDto } from "./DTOs/updateReceptionist.dto.ts";

@Injectable()
export class ReceptionistsService {
	async findAll(userId: string) {
		const clinicId = await this.getClinicId(userId);
		return findAllReceptionists(clinicId);
	}

	async findOne(userId: string, receptionistId: string) {
		const clinicId = await this.getClinicId(userId);
		const receptionist = await findReceptionistById(
			clinicId,
			receptionistId,
		);
		if (!receptionist) {
			throw new NotFoundException("Receptionist not found");
		}

		return receptionist;
	}

	async create(userId: string, input: CreateReceptionistDto) {
		const clinicId = await this.getClinicId(userId);
		if (await findReceptionistUserByEmail(input.email)) {
			throw new ConflictException("Email already registered");
		}

		return createReceptionist(input, clinicId);
	}

	async update(
		userId: string,
		receptionistId: string,
		input: UpdateReceptionistDto,
	) {
		const clinicId = await this.getClinicId(userId);
		const receptionist = await findReceptionistById(
			clinicId,
			receptionistId,
		);
		if (!receptionist) {
			throw new NotFoundException("Receptionist not found");
		}

		return updateReceptionist(
			clinicId,
			receptionistId,
			receptionist.userId,
			input,
		);
	}

	async remove(userId: string, receptionistId: string) {
		const clinicId = await this.getClinicId(userId);
		const receptionist = await findReceptionistById(
			clinicId,
			receptionistId,
		);
		if (!receptionist) {
			throw new NotFoundException("Receptionist not found");
		}

		return deactivateReceptionist(
			clinicId,
			receptionistId,
			receptionist.userId,
		);
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		return clinic.id;
	}
}
