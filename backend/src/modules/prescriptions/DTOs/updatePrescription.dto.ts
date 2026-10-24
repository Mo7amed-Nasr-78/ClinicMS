import { PartialType } from "@nestjs/mapped-types";
import { CreatePrescriptionDto } from "./createPrescription.dto";

export class UpdatePrescriptionDto extends PartialType(CreatePrescriptionDto) {}
