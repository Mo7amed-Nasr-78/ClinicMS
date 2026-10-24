import { IsNotEmpty, IsString, IsUUID } from "class-validator";

export class CreateMedicalRecordDto {
	@IsUUID()
	patientId!: string;

	@IsUUID()
	doctorId!: string;

	@IsUUID()
	appointmentId!: string;

	@IsString()
	@IsNotEmpty()
	diagnosis!: string;

	@IsString()
	symptoms!: string;

	@IsString()
	examination!: string;

	@IsString()
	treatment!: string;

	@IsString()
	notes!: string;
}
