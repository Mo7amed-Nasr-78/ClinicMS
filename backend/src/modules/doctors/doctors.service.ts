import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Role } from "../../authorization/enums/role.enum.ts";

import {
	findClinicByOwnerId,
	findClinicIdForUser,
} from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions";
import {
	createDoctor,
	deactivateDoctor,
	findDoctorById,
	findAllDoctors,
	findDoctorAvailabilityProfile,
	findUserByEmail,
	updateDoctor,
} from "./doctors.actions";
import { findDoctorAppointmentsForDate } from "../appointments/appointments.actions.ts";
import {
	findDoctorIdByUserId,
	listDoctorSchedules,
} from "../doctor-schedules/doctor-schedules.actions.ts";
import { calculateAvailabilitySlots, getUtcDayBounds } from "./availability.ts";
import { parseDoctorFilters } from "./doctor-filters";
import type { DoctorFiltersQuery } from "./doctor-filters";
import type { CreateDoctorDto } from "./DTOs/createDoctor.dto";
import type { UpdateDoctorDto } from "./DTOs/updateDoctor.dto";

@Injectable()
export class DoctorsService {
	async findAll(userId: string, filters: DoctorFiltersQuery = {}) {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");
		return findAllDoctors(
			clinic.id as ClinicId,
			parseDoctorFilters(filters),
		);
	}

	async getAvailability(
		userId: string,
		role: string,
		doctorId: string,
		date: string,
	) {
		const bounds = getUtcDayBounds(date);
		if (!bounds) {
			throw new BadRequestException(
				"date must be a valid YYYY-MM-DD date",
			);
		}

		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");
		const clinicId = clinic.id as ClinicId;

		if (role === Role.DOCTOR) {
			const ownDoctorId = await findDoctorIdByUserId(
				userId,
				clinicId,
			);
			if (ownDoctorId !== doctorId)
				throw new NotFoundException("Doctor not found");
		}

		const doctor = await findDoctorAvailabilityProfile(
			clinicId,
			doctorId,
		);
		if (!doctor) throw new NotFoundException("Doctor not found");
		if (doctor.status.toLowerCase() !== "active") {
			return { doctorId: doctor.id, date, slots: [] };
		}
		const [schedules, appointments] = await Promise.all([
			listDoctorSchedules(clinicId, doctor.id),
			findDoctorAppointmentsForDate(clinicId, doctor.id, date),
		]);

		return {
			doctorId: doctor.id,
			date,
			slots: calculateAvailabilitySlots(
				date,
				schedules,
				appointments,
			),
		};
	}

	async getSchedules(userId: string, doctorId: string) {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");

		const doctor = await findDoctorAvailabilityProfile(
			clinic.id as ClinicId,
			doctorId,
		);
		if (!doctor) throw new NotFoundException("Doctor not found");

		return listDoctorSchedules(clinic.id as ClinicId, doctor.id);
	}

	async createDoctor(ownerId: string, input: CreateDoctorDto) {
		const existingUser = await findUserByEmail(input.email);

		if (existingUser) {
			throw new ConflictException("Email already registered");
		}

		const clinic = await findClinicByOwnerId(ownerId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		return createDoctor(input, clinic.id);
	}

	async updateDoctor(
		ownerId: string,
		doctorId: string,
		input: UpdateDoctorDto,
	) {
		const clinic = await findClinicByOwnerId(ownerId);
		if (!clinic) throw new NotFoundException("Clinic not found");

		const doctor = await findDoctorById(
			clinic.id as ClinicId,
			doctorId,
		);
		if (!doctor) throw new NotFoundException("Doctor not found");

		return updateDoctor(
			clinic.id as ClinicId,
			doctorId,
			doctor.userId,
			input,
		);
	}

	async deactivateDoctor(ownerId: string, doctorId: string) {
		const clinic = await findClinicByOwnerId(ownerId);
		if (!clinic) throw new NotFoundException("Clinic not found");

		const doctor = await findDoctorById(
			clinic.id as ClinicId,
			doctorId,
		);
		if (!doctor) throw new NotFoundException("Doctor not found");

		return deactivateDoctor(
			clinic.id as ClinicId,
			doctorId,
			doctor.userId,
		);
	}
}
