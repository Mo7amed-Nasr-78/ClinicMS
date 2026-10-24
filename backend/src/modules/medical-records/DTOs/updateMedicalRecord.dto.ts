import { PartialType } from "@nestjs/mapped-types";
import { CreateMedicalRecordDto } from "./createMedicalRecord.dto";

export class UpdateMedicalRecordDto extends PartialType(
	CreateMedicalRecordDto,
) {}
