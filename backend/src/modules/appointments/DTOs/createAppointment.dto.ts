import {
	IsDateString,
	IsIn,
	IsNotEmpty,
	IsString,
	IsUUID,
	Matches,
} from "class-validator";
import { appointment_Status } from "../../../prisma/enums.ts";

export class CreateAppointmentDto {
	@IsUUID()
	doctorId!: string;

	@IsUUID()
	patientId!: string;

	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	appointmentDate!: string;

	@Matches(
		/^(?:[01]\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i,
	)
	startTime!: string;

	@Matches(
		/^(?:[01]\d|2[0-3]):[0-5]\d$|^(?:0?[1-9]|1[0-2]):[0-5]\d\s*(?:AM|PM)$/i,
	)
	endTime!: string;

	@IsNotEmpty()
	@IsString()
	@IsIn(Object.values(appointment_Status))
	status!: string;

	@IsNotEmpty()
	@IsString()
	reason!: string;

	@IsNotEmpty()
	@IsString()
	notes!: string;
}
