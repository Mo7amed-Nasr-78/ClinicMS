import {
	IsEmail,
	IsInt,
	IsNotEmpty,
	IsNumber,
	IsOptional,
	IsString,
	Min,
} from "class-validator";

export class CreateDoctorDto {
	@IsOptional()
	@IsString()
	firstName?: string;

	@IsOptional()
	@IsString()
	lastName?: string;

	@IsEmail()
	email!: string;

	@IsNotEmpty()
	@IsString()
	password!: string;

	@IsNotEmpty()
	@IsString()
	phone!: string;

	@IsNotEmpty()
	@IsString()
	specialty!: string;

	@IsNotEmpty()
	@IsString()
	licenseNumber!: string;

	@IsInt()
	@Min(1)
	consultationDuration!: number;

	@IsNumber()
	@Min(0)
	consultationFee!: number;
}
