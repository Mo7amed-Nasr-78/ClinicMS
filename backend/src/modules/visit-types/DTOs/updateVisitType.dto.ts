import { PartialType } from "@nestjs/mapped-types";
import { CreateVisitTypeDto } from "./createVisitType.dto";

export class UpdateVisitTypeDto extends PartialType(CreateVisitTypeDto) {}
