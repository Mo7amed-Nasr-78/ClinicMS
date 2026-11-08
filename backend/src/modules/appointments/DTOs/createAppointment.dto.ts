import {
	IsDateString,
	IsIn,
	IsOptional,
	IsString,
	IsUUID,
	Matches,
} from "class-validator";
import {
	Appointment_Source,
	appointment_Status,
} from "../../../../prisma/enums.ts";

export class CreateAppointmentDto {
	@IsUUID()
	doctorId!: string;

	@IsUUID()
	patientId!: string;

	@IsOptional()
	@IsUUID()
	visitTypeId?: string;

	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	appointmentDate!: string;

	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	startTime!: string;

	@Matches(/^(?:[01]\d|2[0-3]):[0-5]\d$/)
	endTime!: string;

	@IsOptional()
	@IsString()
	@IsIn(Object.values(appointment_Status))
	status?: (typeof appointment_Status)[keyof typeof appointment_Status];

	@IsOptional()
	@IsString()
	@IsIn(Object.values(Appointment_Source))
	source?: (typeof Appointment_Source)[keyof typeof Appointment_Source];

	@IsOptional()
	@IsString()
	reason?: string;

	@IsOptional()
	@IsString()
	notes?: string;
}
