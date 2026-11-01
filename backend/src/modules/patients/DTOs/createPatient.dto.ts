import {
	IsDateString,
	IsEmail,
	IsIn,
	IsNotEmpty,
	IsOptional,
	IsString,
	Matches,
} from "class-validator";

import { Gender, Patient_Status } from "../../../prisma/enums.ts";

export class CreatePatientDto {
	@IsNotEmpty()
	@IsString()
	firstName!: string;

	@IsNotEmpty()
	@IsString()
	lastName!: string;

	@IsDateString()
	@Matches(/^\d{4}-\d{2}-\d{2}$/)
	dateOfBirth!: string;

	@IsIn(Object.values(Gender))
	gender!: (typeof Gender)[keyof typeof Gender];

	@IsNotEmpty()
	@IsString()
	bloodType!: string;

	@IsNotEmpty()
	@IsString()
	phone!: string;

	@IsOptional()
	@IsEmail()
	email?: string;

	@IsString()
	address!: string;

	@IsOptional()
	@IsString()
	emergencyContact?: string;

	@IsOptional()
	@IsString()
	allergies?: string;
}
