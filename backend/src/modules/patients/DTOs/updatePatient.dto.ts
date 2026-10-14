import { PartialType } from "@nestjs/mapped-types";

import { CreatePatientDto } from "./createPatient.dto";

export class UpdatePatientDto extends PartialType(CreatePatientDto) {}
