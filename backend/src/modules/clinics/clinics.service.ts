import {
	ConflictException,
	ForbiddenException,
	Inject,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { ClinicLogoStorageService } from "./clinic-logo-storage.service";
import { Temporal } from "temporal-polyfill";
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
	findClinicTimezone,
} from "../appointments/appointments.actions";
import { findUserById } from "../users/users.actions";
import { parseDoctorFilters } from "../doctors/doctor-filters";
import type { DoctorFiltersQuery } from "../doctors/doctor-filters";

function getClinicDateRange(date: Temporal.PlainDate, timeZone: string) {
	const start = date.toZonedDateTime({
		timeZone,
		plainTime: Temporal.PlainTime.from("00:00"),
	});
	const end = date.add({ days: 1 }).toZonedDateTime({
		timeZone,
		plainTime: Temporal.PlainTime.from("00:00"),
	});
	return { start: start.toInstant(), end: end.toInstant() };
}

@Injectable()
export class ClinicsService {
	constructor(
		@Inject(AuthorizationService)
		private readonly authorizationService: AuthorizationService,
		@Inject(ClinicLogoStorageService)
		private readonly clinicLogoStorage: ClinicLogoStorageService,
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

		const clinicSettings = await findClinicTimezone(clinic.id);
		if (!clinicSettings?.timezone) {
			throw new NotFoundException("Clinic timezone is unavailable");
		}
		const now = Temporal.Instant.fromEpochMilliseconds(Date.now());
		const todayDate = now
			.toZonedDateTimeISO(clinicSettings.timezone)
			.toPlainDate();
		const today = getClinicDateRange(
			todayDate,
			clinicSettings.timezone,
		);
		const monthStart = getClinicDateRange(
			todayDate.with({ day: 1 }),
			clinicSettings.timezone,
		);
		const nextMonthStart = getClinicDateRange(
			todayDate.with({ day: 1 }).add({ months: 1 }),
			clinicSettings.timezone,
		);

		return findDoctorDashboardStats(
			clinic.id as ClinicId,
			doctorId,
			today.start,
			today.end,
			monthStart.start,
			nextMonthStart.start,
			clinicSettings.timezone,
		);
	}

	async findDoctors(
		ownerId: string,
		clinicId: string,
		page = 1,
		limit = 20,
		query: DoctorFiltersQuery = {},
	) {
		const ownedClinicId = await this.getClinicIdForRequest(
			ownerId,
			clinicId,
		);
		return findDoctorsByClinicId(
			ownedClinicId,
			page,
			limit,
			parseDoctorFilters(query),
		);
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

	async create(
		ownerId: string,
		input: CreateClinicDto,
		uploadedLogo?: { buffer: Buffer; mimetype: string },
	) {
		// console.log(ownerId);
		const existingClinic = await findClinicByOwnerId(ownerId);
		if (existingClinic) {
			throw new ConflictException("User already owns a clinic");
		}

		const logoUrl = uploadedLogo
			? await this.clinicLogoStorage.upload(uploadedLogo)
			: input.logo;
		return createClinic(ownerId, { ...input, logo: logoUrl });
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
