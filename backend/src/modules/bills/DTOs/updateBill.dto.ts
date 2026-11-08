import { PartialType } from "@nestjs/mapped-types";
import { IsIn, IsOptional } from "class-validator";
import { bill_Status } from "../../../../prisma/enums.ts";
import { CreateBillDto } from "./createBill.dto";

export class UpdateBillDto extends PartialType(CreateBillDto) {
	@IsOptional()
	@IsIn(Object.values(bill_Status))
	status?: (typeof bill_Status)[keyof typeof bill_Status];
}
