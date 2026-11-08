import { IsNotEmpty, IsString, Matches, MaxLength } from "class-validator";

export class CancelAppointmentDto {
	@IsString()
	@IsNotEmpty()
	@Matches(/\S/)
	@MaxLength(500)
	cancelReason!: string;
}
