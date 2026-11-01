import {
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import {
	createVisitType,
	deactivateVisitType,
	findVisitTypeById,
	listVisitTypes,
	updateVisitType,
} from "./visit-types.actions.ts";
import type { CreateVisitTypeDto } from "./DTOs/createVisitType.dto";
import type { UpdateVisitTypeDto } from "./DTOs/updateVisitType.dto";

@Injectable()
export class VisitTypesService {
	async findAll(userId: string) {
		const clinicId = await this.getClinicId(userId);
		return listVisitTypes(clinicId);
	}

	async findOne(userId: string, visitTypeId: string) {
		const clinicId = await this.getClinicId(userId);
		const visitType = await findVisitTypeById(clinicId, visitTypeId);
		if (!visitType) {
			throw new NotFoundException("Visit type not found");
		}
		return visitType;
	}

	async create(userId: string, input: CreateVisitTypeDto) {
		const clinicId = await this.getClinicId(userId);
		return createVisitType(clinicId, input);
	}

	async update(
		userId: string,
		visitTypeId: string,
		input: UpdateVisitTypeDto,
	) {
		const clinicId = await this.getClinicId(userId);
		await this.ensureVisitTypeExists(clinicId, visitTypeId);
		return updateVisitType(clinicId, visitTypeId, input);
	}

	async remove(userId: string, visitTypeId: string) {
		const clinicId = await this.getClinicId(userId);
		const visitType = await this.ensureVisitTypeExists(
			clinicId,
			visitTypeId,
		);
		if (!visitType.isActive) {
			return visitType;
		}
		return deactivateVisitType(clinicId, visitTypeId);
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}
		return clinic.id;
	}

	private async ensureVisitTypeExists(
		clinicId: ClinicId,
		visitTypeId: string,
	) {
		const visitType = await findVisitTypeById(clinicId, visitTypeId);
		if (!visitType) {
			throw new NotFoundException("Visit type not found");
		}
		return visitType;
	}
}
