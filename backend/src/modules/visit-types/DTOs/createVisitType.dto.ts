import {
	IsBoolean,
	IsInt,
	IsNumber,
	IsOptional,
	IsString,
	Matches,
	Min,
	MinLength,
	ValidateIf,
} from "class-validator";

export class CreateVisitTypeDto {
	@ValidateIf((_object, value) => value !== undefined)
	@IsString()
	@MinLength(1)
	@Matches(/\S/)
	name!: string;

	@ValidateIf((_object, value) => value !== undefined)
	@IsInt()
	@Min(1)
	defaultDurationMin!: number;

	@IsOptional()
	@IsNumber({ maxDecimalPlaces: 2 })
	@Min(0)
	price?: number | null;

	@IsOptional()
	@IsString()
	color?: string | null;

	@ValidateIf((_object, value) => value !== undefined)
	@IsBoolean()
	isFollowUp?: boolean;

	@ValidateIf((_object, value) => value !== undefined)
	@IsBoolean()
	isActive?: boolean;
}
