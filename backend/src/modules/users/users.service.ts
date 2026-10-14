import { HttpException, HttpStatus, Inject, Injectable } from "@nestjs/common";
import { findClinicIdForUser } from "../clinics/clinics.actions.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import {
	findUserById,
	findUserForClinic,
	listUsersForClinic,
} from "./users.actions";
import { AuthorizationService } from "../../authorization/authorization.service.ts";

@Injectable()
export class UsersService {
	constructor(@Inject(AuthorizationService) private readonly authorizationService: AuthorizationService) { };

	async findAll(userId: string) {
		const clinicId = await this.getClinicId(userId);
		const users = await listUsersForClinic(clinicId);
		if (!users)
			throw new HttpException(
				"No users found",
				HttpStatus.NO_CONTENT,
			);

		return users;
	}

	async findUser(requesterId: string, userId: string) {
		const clinicId = await this.getClinicId(requesterId);
		const user = await findUserForClinic(userId, clinicId);
		if (!user)
			throw new HttpException(
				"No user found",
				HttpStatus.NO_CONTENT,
			);

		return user;
	}

	async getCurrentUser(userId: string) {
		const user = await findUserById(userId);
		if (!user)
			throw new HttpException(
				"No user found",
				HttpStatus.NO_CONTENT,
			);
		return {
			...user,
			permissions: this.authorizationService.getPermissionsForRole(user.role),
		};
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new HttpException("Clinic not found", HttpStatus.NOT_FOUND);
		}
		return clinic.id;
	}
}
