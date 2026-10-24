import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreatePrescriptionDto {
	@IsUUID()
	patientId!: string;

	@IsUUID()
	doctorId!: string;

	@IsUUID()
	appointmentId!: string;

	@IsString()
	@IsNotEmpty()
	medications!: string;

	@IsString()
	notes!: string;
}
