import { Injectable, NotFoundException } from "@nestjs/common";
import { Temporal } from "temporal-polyfill";

import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions";
import { findAllDoctors } from "../doctors/doctors.actions";
import { findAllPatientsByClinicId } from "../patients/patients.actions";
import { Role } from "../../authorization/enums/role.enum.ts";
import {
	findAppointmentsForDate,
	findDoctorIdByUserId,
	findClinicTimezone,
} from "../appointments/appointments.actions";

type DoctorFilters = {
	status?: string;
	specialty?: string;
	query?: string;
};

type PatientFilters = {
	status?: string;
	gender?: string;
	query?: string;
};

@Injectable()
export class ReportsService {
	async findTodaysAppointments(userId: string, role: string) {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		const clinicSettings = await findClinicTimezone(clinic.id);
		if (!clinicSettings?.timezone) {
			throw new NotFoundException("Clinic timezone is unavailable");
		}
		const today = Temporal.Instant.fromEpochMilliseconds(Date.now())
			.toZonedDateTimeISO(clinicSettings.timezone)
			.toPlainDate()
			.toString();

		let doctorId: string | undefined;
		if (role === Role.DOCTOR) {
			const doctor = await findDoctorIdByUserId(userId, clinic.id);
			if (!doctor) {
				throw new NotFoundException("Doctor not found");
			}
			doctorId = doctor;
		}

		return findAppointmentsForDate(
			clinic.id as ClinicId,
			today,
			doctorId,
		);
	}

	async findDoctors(userId: string, filters: DoctorFilters) {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		const doctors = await findAllDoctors(clinic.id as ClinicId);
		const query = filters.query?.trim().toLocaleLowerCase();

		return doctors.filter((doctor) => {
			if (filters.status && doctor.status !== filters.status)
				return false;
			if (
				filters.specialty &&
				doctor.specialty !== filters.specialty
			) {
				return false;
			}
			if (!query) return true;

			const searchableFields = [
				doctor.user.firstName,
				doctor.user.lastName,
				doctor.user.email,
				doctor.specialty,
				doctor.licenseNumber,
			];
			return searchableFields.some((field) =>
				field?.toLocaleLowerCase().includes(query),
			);
		});
	}

	async findPatients(userId: string, filters: PatientFilters) {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		const patients = await findAllPatientsByClinicId(
			clinic.id as ClinicId,
		);
		const query = filters.query?.trim().toLocaleLowerCase();

		return patients.filter((patient) => {
			if (filters.status && patient.status !== filters.status) {
				return false;
			}
			if (filters.gender && patient.gender !== filters.gender) {
				return false;
			}
			if (!query) return true;

			return [
				patient.firstName,
				patient.lastName,
				patient.email,
				patient.phone,
			].some((field) => field?.toLocaleLowerCase().includes(query));
		});
	}
}
