import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";

import { db } from "../../prisma/db.ts";
import { Role } from "../../authorization/enums/role.enum.ts";
import { findClinicIdForUser } from "../clinics/clinics.actions";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import { scheduleTimeRangesOverlap } from "../doctors/availability.ts";
import {
	createDoctorSchedule,
	deleteDoctorSchedule,
	findDoctorIdByUserId,
	findDoctorScheduleById,
	listDoctorSchedules,
	updateDoctorSchedule,
} from "./doctor-schedules.actions.ts";
import type { DoctorId } from "./doctor-schedules.actions.ts";
import { CreateDoctorScheduleDto } from "./dto/create-doctor-schedule.dto";
import { UpdateDoctorScheduleDto } from "./dto/update-doctor-schedule.dto";

function validateScheduleValues(
	startTime: string,
	endTime: string,
	slotDuration: number,
	effectiveFrom: string,
	effectiveTo?: string,
) {
	if (startTime >= endTime) {
		throw new BadRequestException(
			"Schedule end time must be after start time",
		);
	}
	if (!Number.isInteger(slotDuration) || slotDuration < 1) {
		throw new BadRequestException(
			"Slot duration must be a positive integer",
		);
	}
	const from = Date.parse(effectiveFrom);
	const to = effectiveTo
		? Date.parse(effectiveTo)
		: Number.POSITIVE_INFINITY;
	if (
		!Number.isFinite(from) ||
		(effectiveTo && !Number.isFinite(to)) ||
		from > to
	) {
		throw new BadRequestException(
			"Effective end date must not precede start date",
		);
	}
}

@Injectable()
export class DoctorSchedulesService {
	async create(
		ownerId: string,
		createDoctorScheduleDto: CreateDoctorScheduleDto,
	) {
		validateScheduleValues(
			createDoctorScheduleDto.startTime,
			createDoctorScheduleDto.endTime,
			createDoctorScheduleDto.slotDuration,
			createDoctorScheduleDto.effectiveFrom,
			createDoctorScheduleDto.effectiveTo,
		);
		const clinic = await this.getClinicId(ownerId);
		const doctor = await db.doctor.findFirst({
			where: {
				id: createDoctorScheduleDto.doctorId as DoctorId,
				clinicId: clinic,
			},
			select: { id: true, clinicId: true },
		});

		if (!doctor) {
			throw new NotFoundException(
				`Doctor with id ${createDoctorScheduleDto.doctorId} not found`,
			);
		}

		if (doctor.clinicId !== clinic) {
			throw new NotFoundException(
				"Doctor not found in your clinic",
			);
		}

		const existingSchedules = await listDoctorSchedules(
			clinic,
			doctor.id,
		);
		const overlappingSchedule = existingSchedules.some(
			(schedule) =>
				schedule.dayOfWeek ===
					createDoctorScheduleDto.dayOfWeek &&
				scheduleTimeRangesOverlap(
					createDoctorScheduleDto.startTime,
					createDoctorScheduleDto.endTime,
					schedule.startTime,
					schedule.endTime,
				),
		);
		if (overlappingSchedule) {
			throw new ConflictException(
				"Doctor already has an overlapping schedule for this weekday and time range",
			);
		}

		return createDoctorSchedule(createDoctorScheduleDto, clinic);
	}

	async findAll(userId: string, role: string) {
		const clinicId = await this.getClinicId(userId);
		if (role === Role.DOCTOR) {
			const doctorId = await findDoctorIdByUserId(userId, clinicId);
			if (!doctorId) return [];
			return listDoctorSchedules(clinicId, doctorId);
		}

		return listDoctorSchedules(clinicId);
	}

	async findOne(userId: string, id: string) {
		const clinicId = await this.getClinicId(userId);
		const schedule = await findDoctorScheduleById(id);

		if (!schedule) {
			throw new NotFoundException(
				`Doctor schedule with id ${id} not found`,
			);
		}
		await this.ensureDoctorBelongsToClinic(clinicId, schedule.doctorId);

		return schedule;
	}

	async update(
		userId: string,
		id: string,
		updateDoctorScheduleDto: UpdateDoctorScheduleDto,
	) {
		const existingSchedule = await this.findOne(userId, id);
		if (!existingSchedule) {
			throw new BadRequestException("Invalid doctor schedule");
		}
		validateScheduleValues(
			updateDoctorScheduleDto.startTime ??
				existingSchedule.startTime,
			updateDoctorScheduleDto.endTime ?? existingSchedule.endTime,
			updateDoctorScheduleDto.slotDuration ??
				existingSchedule.slotDuration,
			updateDoctorScheduleDto.effectiveFrom ??
				existingSchedule.effectiveFrom.toISOString(),
			updateDoctorScheduleDto.effectiveTo ??
				existingSchedule.effectiveTo?.toISOString(),
		);

		return updateDoctorSchedule(id, updateDoctorScheduleDto);
	}

	async remove(userId: string, id: string) {
		const schedule = await this.findOne(userId, id);
		await deleteDoctorSchedule(id);
		return {
			message: "Doctor schedule deleted successfully",
			schedule,
		};
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");
		return clinic.id;
	}

	private async ensureDoctorBelongsToClinic(
		clinicId: ClinicId,
		doctorId: string,
	) {
		const doctor = await db.doctor.findFirst({
			where: { id: doctorId as DoctorId, clinicId },
			select: { id: true },
		});
		if (!doctor) {
			throw new NotFoundException("Doctor schedule not found");
		}
	}
}
