import {
	IsDateString,
	IsNumber,
	IsOptional,
	IsString,
	IsUUID,
	Min,
	Matches,
	MinLength,
} from "class-validator";

export class CreateBillDto {
	@IsUUID()
	patientId!: string;

	@IsOptional()
	@IsUUID()
	appointmentId?: string;

	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0.01)
	amount!: number;

	@IsString()
	@MinLength(1)
	description!: string;

	@IsOptional()
	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	dueDate?: string;

	@IsOptional()
	@IsString()
	notes?: string;
}
