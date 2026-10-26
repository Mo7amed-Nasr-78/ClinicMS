import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { Temporal } from "temporal-polyfill";

import { db } from "../../prisma/db.ts";
import { appointment_Status } from "../../prisma/enums.ts";
import { Role } from "../../authorization/enums/role.enum.ts";
import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions";
import {
	listDoctorSchedules,
	type DoctorId,
} from "../doctor-schedules/doctor-schedules.actions.ts";
import {
	getUtcDayBounds,
	isAppointmentBlocking,
	isAppointmentSlotAvailable,
	parseTimeMinutes,
} from "../doctors/availability.ts";
import {
	createAppointment,
	deleteAppointmentById,
	findAppointmentById,
	findAppointmentsByClinicId,
	findDoctorAppointmentsForDate,
	findDoctorIdByUserId,
	findDoctorInClinic,
	findPatientInClinic,
	updateAppointmentById,
} from "./appointments.actions";
import type { AppointmentStatus, PatientId } from "./appointments.actions";
import type { CreateAppointmentDto } from "./DTOs/createAppointment.dto";
import type { UpdateAppointmentDto } from "./DTOs/updateAppointment.dto";
import { createBillForAppointment } from "../bills/bills.actions.ts";

@Injectable()
export class AppointmentsService {
	async findAll(
		userId: string,
		role: string,
		page = 1,
		limit = 20,
		appointmentDate?: string,
		status?: string,
		patientId?: string,
	) {
		const clinicId = await this.getClinicId(userId);
		if (
			patientId &&
			!(await findPatientInClinic(clinicId, patientId))
		) {
			throw new NotFoundException("Patient not found");
		}
		const dayBounds = appointmentDate
			? getUtcDayBounds(appointmentDate)
			: undefined;
		if (appointmentDate && !dayBounds) {
			throw new BadRequestException(
				"appointmentDate must be a valid YYYY-MM-DD date",
			);
		}

		if (
			status &&
			!Object.values(appointment_Status).some(
				(allowedStatus) => allowedStatus === status,
			)
		) {
			throw new BadRequestException("Invalid appointment status");
		}
		const appointmentStatus = status as AppointmentStatus | undefined;

		if (role === Role.DOCTOR) {
			const doctorId = await findDoctorIdByUserId(userId, clinicId);
			if (!doctorId) {
				throw new NotFoundException("Doctor not found");
			}
			return findAppointmentsByClinicId(
				clinicId,
				page,
				limit,
				doctorId,
				dayBounds?.start,
				appointmentStatus,
				patientId as PatientId | undefined,
			);
		}

		return findAppointmentsByClinicId(
			clinicId,
			page,
			limit,
			undefined,
			dayBounds?.start,
			appointmentStatus,
			patientId as PatientId | undefined,
		);
	}

	async findOne(ownerId: string, appointmentId: string) {
		const clinicId = await this.getClinicId(ownerId);
		const appointment = await findAppointmentById(
			clinicId,
			appointmentId,
		);
		if (!appointment) {
			throw new NotFoundException("Appointment not found");
		}

		return appointment;
	}

	async create(ownerId: string, input: CreateAppointmentDto) {
		const clinicId = await this.getClinicId(ownerId);
		const doctor = await this.ensureRelatedRecordsBelongToClinic(
			clinicId,
			input.doctorId,
			input.patientId,
		);
		const date = input.appointmentDate;
		const startTime = input.startTime;
		const endTime = input.endTime;
		const startMinute = parseTimeMinutes(startTime);
		const endMinute = parseTimeMinutes(endTime);
		const bounds = getUtcDayBounds(date);

		if (
			!bounds ||
			startMinute === undefined ||
			endMinute === undefined ||
			endMinute === startMinute
		) {
			throw new ConflictException(
				"Appointment time range is invalid",
			);
		}

		return db.transaction(async (tx) => {
			await this.lockDoctorSchedule(tx, input.doctorId);
			const [schedules, appointments] = await Promise.all([
				listDoctorSchedules(
					clinicId,
					input.doctorId as DoctorId,
					tx,
				),
				findDoctorAppointmentsForDate(
					clinicId,
					input.doctorId,
					bounds.start,
					bounds.end,
					tx,
				),
			]);

			if (
				this.hasPatientAppointmentOnDate(
					input.patientId,
					appointments,
				)
			) {
				throw new ConflictException(
					"Patient already has an appointment with this doctor on this date",
				);
			}

			if (
				!this.isBookableSlot(
					date,
					startTime,
					endTime,
					schedules,
					appointments,
				)
			) {
				throw new ConflictException(
					"Appointment slot is no longer available",
				);
			}

			const appointment = await createAppointment(
				input,
				clinicId,
				ownerId,
				tx,
			);
			await createBillForAppointment(
				clinicId,
				appointment.patientId,
				appointment.id,
				String(doctor.consultationFee),
				tx,
			);
			return appointment;
		});
	}

	async update(
		ownerId: string,
		appointmentId: string,
		input: UpdateAppointmentDto,
	) {
		const clinicId = await this.getClinicId(ownerId);
		const appointment = await findAppointmentById(
			clinicId,
			appointmentId,
		);
		if (!appointment) {
			throw new NotFoundException("Appointment not found");
		}
		const schedulingFieldsChanged =
			input.doctorId !== undefined ||
			input.patientId !== undefined ||
			input.appointmentDate !== undefined ||
			input.startTime !== undefined ||
			input.endTime !== undefined;

		await this.ensureRelatedRecordsBelongToClinic(
			clinicId,
			input.doctorId ?? appointment.doctorId,
			input.patientId ?? appointment.patientId,
		);
		if (!schedulingFieldsChanged) {
			return updateAppointmentById(clinicId, appointmentId, input);
		}

		const doctorId = input.doctorId ?? appointment.doctorId;
		const date =
			input.appointmentDate ??
			appointment.appointmentDate.toString().slice(0, 10);
		const startTime = input.startTime ?? appointment.startTime;
		const endTime = input.endTime ?? appointment.endTime;
		const startMinute = parseTimeMinutes(startTime);
		const endMinute = parseTimeMinutes(endTime);
		const bounds = getUtcDayBounds(date);
		if (
			!bounds ||
			startMinute === undefined ||
			endMinute === undefined ||
			endMinute === startMinute
		) {
			throw new ConflictException(
				"Appointment time range is invalid",
			);
		}

		return db.transaction(async (tx) => {
			await this.lockDoctorSchedule(tx, doctorId);
			const [schedules, dayAppointments] = await Promise.all([
				listDoctorSchedules(clinicId, doctorId as DoctorId, tx),
				findDoctorAppointmentsForDate(
					clinicId,
					doctorId,
					bounds.start,
					bounds.end,
					tx,
				),
			]);
			const appointments = dayAppointments.filter(
				(item) => item.id !== appointmentId,
			);
			if (
				isAppointmentBlocking(input.status ?? appointment.status) &&
				this.hasPatientAppointmentOnDate(
					input.patientId ?? appointment.patientId,
					appointments,
				)
			) {
				throw new ConflictException(
					"Patient already has an appointment with this doctor on this date",
				);
			}

			if (
				!this.isBookableSlot(
					date,
					startTime,
					endTime,
					schedules,
					appointments,
				)
			) {
				throw new ConflictException(
					"Appointment slot is no longer available",
				);
			}

			return updateAppointmentById(
				clinicId,
				appointmentId,
				input,
				tx,
			);
		});
	}

	async remove(ownerId: string, appointmentId: string) {
		const clinicId = await this.getClinicId(ownerId);
		await this.ensureAppointmentExists(clinicId, appointmentId);
		return deleteAppointmentById(clinicId, appointmentId);
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) {
			throw new NotFoundException("Clinic not found");
		}

		return clinic.id;
	}

	private async ensureAppointmentExists(
		clinicId: ClinicId,
		appointmentId: string,
	) {
		const appointment = await findAppointmentById(
			clinicId,
			appointmentId,
		);
		if (!appointment) {
			throw new NotFoundException("Appointment not found");
		}
	}

	private async ensureRelatedRecordsBelongToClinic(
		clinicId: ClinicId,
		doctorId: string,
		patientId: string,
	) {
		const [doctor, patient] = await Promise.all([
			findDoctorInClinic(clinicId, doctorId),
			findPatientInClinic(clinicId, patientId),
		]);
		if (!doctor || doctor.status.toLowerCase() !== "active") {
			throw new NotFoundException(
				"Doctor not found in this clinic",
			);
		}
		if (!patient) {
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		}
		return doctor;
	}

	private async lockDoctorSchedule(
		transaction: Parameters<Parameters<typeof db.transaction>[0]>[0],
		doctorId: string,
	) {
		const lockPlan = db.raw.sql`
			SELECT pg_advisory_xact_lock(hashtextextended(${doctorId}, 0)) IS NULL AS locked
		`
			.returnsRow({ locked: { codecId: "pg/bool@1" } })
			.build();
		await transaction.query(lockPlan);
	}

	private isBookableSlot(
		date: string,
		startTime: string,
		endTime: string,
		schedules: Awaited<ReturnType<typeof listDoctorSchedules>>,
		appointments: Awaited<
			ReturnType<typeof findDoctorAppointmentsForDate>
		>,
	) {
		return isAppointmentSlotAvailable(
			date,
			startTime,
			endTime,
			schedules,
			appointments,
		);
	}

	private hasPatientAppointmentOnDate(
		patientId: string,
		appointments: Awaited<
			ReturnType<typeof findDoctorAppointmentsForDate>
		>,
	) {
		return appointments.some(
			(appointment) =>
				appointment.patientId === patientId &&
				isAppointmentBlocking(appointment.status),
		);
	}
}
