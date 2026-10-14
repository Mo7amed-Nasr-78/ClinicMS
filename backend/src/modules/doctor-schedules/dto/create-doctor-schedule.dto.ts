import {
	IsBoolean,
	IsDateString,
	IsInt,
	Matches,
	Max,
	Min,
	IsUUID,
} from "class-validator";

export class CreateDoctorScheduleDto {
	@IsUUID()
	doctorId!: string;

	@IsInt()
	@Min(0)
	@Max(6)
	dayOfWeek!: number;

	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	startTime!: string;

	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	endTime!: string;

	@IsBoolean()
	isAvailable!: boolean;

	@IsBoolean()
	isActive!: boolean;

	@IsInt()
	@Min(1)
	slotDuration!: number;

	@IsDateString()
	effectiveFrom!: string;

	@IsDateString()
	effectiveTo!: string;
}
