import { Module } from "@nestjs/common";
import { AppController } from "./app.controller";

import { AuthModule } from "./modules/auth/auth.module";
import { UsersModule } from "./modules/users/users.module";
import { DoctorsModule } from "./modules/doctors/doctors.module";
import { ClinicsModule } from "./modules/clinics/clinics.module";
import { DoctorSchedulesModule } from "./modules/doctor-schedules/doctor-schedules.module";
import { PatientsModule } from "./modules/patients/patients.module";
import { AppointmentsModule } from "./modules/appointments/appointments.module";
import { MedicalRecordsModule } from "./modules/medical-records/medical-records.module";
import { PrescriptionsModule } from "./modules/prescriptions/prescriptions.module";
import { ReportsModule } from "./modules/reports/reports.module";
import { ReceptionistsModule } from "./modules/receptionists/receptionists.module";

@Module({
	imports: [
		AuthModule,
		UsersModule,
		DoctorsModule,
		ClinicsModule,
		DoctorSchedulesModule,
		PatientsModule,
		AppointmentsModule,
		MedicalRecordsModule,
		PrescriptionsModule,
		ReportsModule,
		ReceptionistsModule,
	],
	controllers: [AppController],
})
export class AppModule {}
