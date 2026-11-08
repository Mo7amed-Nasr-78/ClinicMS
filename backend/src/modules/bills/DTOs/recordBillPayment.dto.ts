import { IsEnum } from "class-validator";
import { Payment_Method } from "../../../../prisma/enums.ts";

export class RecordBillPaymentDto {
	@IsEnum(Payment_Method)
	method!: Payment_Method;
}
