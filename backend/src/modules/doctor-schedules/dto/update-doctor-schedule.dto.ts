// import { PartialType } from "@nestjs/mapped-types";
// import { CreateDoctorScheduleDto } from "./create-doctor-schedule.dto";
import {
	IsBoolean,
	IsDateString,
	IsInt,
	IsOptional,
	Matches,
	Max,
	Min,
} from "class-validator";

export class UpdateDoctorScheduleDto {
	@IsOptional()
	@IsInt()
	@Min(0)
	@Max(6)
	dayOfWeek?: number;

	@IsOptional()
	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	startTime?: string;

	@IsOptional()
	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	endTime?: string;

	@IsOptional()
	@IsBoolean()
	isAvailable?: boolean;

	@IsOptional()
	@IsBoolean()
	isActive?: boolean;

	@IsOptional()
	@IsInt()
	@Min(1)
	slotDuration?: number;

	@IsOptional()
	@IsDateString()
	effectiveFrom?: string;

	@IsOptional()
	@IsDateString()
	effectiveTo?: string;
}
