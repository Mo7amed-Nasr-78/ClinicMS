import { PartialType } from "@nestjs/mapped-types";

import { CreateAppointmentDto } from "./createAppointment.dto";

export class UpdateAppointmentDto extends PartialType(CreateAppointmentDto) {}
