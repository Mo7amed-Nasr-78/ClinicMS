import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import {
	createClinic,
	deleteClinic,
	findClinicById,
	findClinicIdForUser,
	findClinicByOwnerId,
	findDoctorsByClinicId,
	findPatientsByClinicId,
	updateClinicById,
} from "./clinics.actions";
import type { ClinicId } from "./clinics.actions";
import type { CreateClinicDto } from "./DTOs/createClinic.dto";
import type { UpdateClinicDto } from "./DTOs/updateClinic.dto";
import { Role } from "../../authorization/enums/role.enum.ts";
import { AuthorizationService } from "../../authorization/authorization.service.ts";
import {
	findDoctorDashboardStats,
	findDoctorIdByUserId,
} from "../appointments/appointments.actions";
import { getUtcDayBounds } from "../doctors/availability.ts";
import { findUserById } from "../users/users.actions";

@Injectable()
export class ClinicsService {
	constructor(
		@Inject(AuthorizationService)
		private readonly authorizationService: AuthorizationService,
	) {}

	async findAll(ownerId: string) {
		const clinic = await findClinicByOwnerId(ownerId);
		return clinic ? [clinic] : [];
	}

	async findMine(userId: string) {
		const clinicMembership = await findClinicIdForUser(userId);
		if (!clinicMembership) {
			throw new NotFoundException("Clinic not found");
		}

		const [result, currentUser] = await Promise.all([
			findClinicById(clinicMembership.id),
			findUserById(userId),
		]);
		if (!result || !currentUser) {
			throw new NotFoundException("Clinic not found");
		}

		return {
			...result,
			user: {
				id: currentUser.id,
				firstName: currentUser.firstName,
				lastName: currentUser.lastName,
				email: currentUser.email,
				phone: currentUser.phone,
				role: currentUser.role,
				avatar: currentUser.avatar,
				status: currentUser.status,
				lastLoginAt: currentUser.lastLoginAt,
				createdAt: currentUser.createdAt,
				updatedAt: currentUser.updatedAt,
				permissions:
					this.authorizationService.getPermissionsForRole(
						currentUser.role,
					),
			},
		};
	}

	async findStats(userId: string, role: string) {
		if (role !== Role.DOCTOR) {
			throw new ForbiddenException(
				"Stats are not available for this role yet",
			);
		}

		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}
		const doctorId = await findDoctorIdByUserId(userId, clinic.id);
		if (!doctorId) {
			throw new NotFoundException("Doctor not found");
		}

		const now = new Date();
		const today = getUtcDayBounds(now.toISOString().slice(0, 10));
		const monthStart = getUtcDayBounds(
			new Date(
				Date.UTC(now.getUTCFullYear(), now.getUTCMonth(), 1),
			)
				.toISOString()
				.slice(0, 10),
		);
		const nextMonthStart = getUtcDayBounds(
			new Date(
				Date.UTC(now.getUTCFullYear(), now.getUTCMonth() + 1, 1),
			)
				.toISOString()
				.slice(0, 10),
		);
		if (!today || !monthStart || !nextMonthStart) {
			throw new NotFoundException("Current date is unavailable");
		}

		return findDoctorDashboardStats(
			clinic.id as ClinicId,
			doctorId,
			today.start,
			today.end,
			monthStart.start,
			nextMonthStart.start,
		);
	}

	async findDoctors(
		ownerId: string,
		clinicId: string,
		page = 1,
		limit = 20,
	) {
		const ownedClinicId = await this.getClinicIdForRequest(
			ownerId,
			clinicId,
		);
		return findDoctorsByClinicId(ownedClinicId, page, limit);
	}

	async findPatients(
		ownerId: string,
		clinicId: string,
		page = 1,
		limit = 20,
	) {
		const ownedClinicId = await this.getClinicIdForRequest(
			ownerId,
			clinicId,
		);
		return findPatientsByClinicId(ownedClinicId, page, limit);
	}

	async create(ownerId: string, input: CreateClinicDto) {
		// console.log(ownerId);
		const existingClinic = await findClinicByOwnerId(ownerId);
		if (existingClinic) {
			throw new ConflictException("User already owns a clinic");
		}

		return createClinic(ownerId, input);
	}

	async updateById(
		ownerId: string,
		clinicId: string,
		input: UpdateClinicDto,
	) {
		const ownedClinicId = await this.getClinicIdForRequest(
			ownerId,
			clinicId,
		);
		return updateClinicById(ownedClinicId, input);
	}

	async remove(ownerId: string) {
		await this.findMine(ownerId);
		return deleteClinic(ownerId);
	}

	private async getClinicIdForRequest(
		userId: string,
		clinicId: string,
	): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic || clinic.id !== clinicId) {
			throw new NotFoundException("Clinic not found");
		}

		return clinic.id;
	}
}
