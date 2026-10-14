import { IsInt, IsNumber, IsOptional, IsString, Min } from "class-validator";

export class UpdateDoctorDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsOptional()
	@IsString()
	phone?: string;

	@IsOptional()
	@IsString()
	specialty?: string;

	@IsOptional()
	@IsString()
	licenseNumber?: string;

	@IsOptional()
	@IsInt()
	@Min(1)
	consultationDuration?: number;

	@IsOptional()
	@IsNumber()
	@Min(0)
	consultationFee?: number;
}
