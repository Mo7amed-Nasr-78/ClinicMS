import {
	BadRequestException,
	ConflictException,
	Injectable,
	NotFoundException,
} from "@nestjs/common";
import { bill_Status } from "../../../prisma/enums.ts";
import { findClinicIdForUser } from "../clinics/clinics.actions.ts";
import type { ClinicId } from "../clinics/clinics.actions.ts";
import {
	createBill,
	deleteBillById,
	findAppointmentForBill,
	findBillById,
	findBillsByClinicId,
	findPatientForBill,
	recordBillPayment,
	updateBillById,
} from "./bills.actions.ts";
import type { BillStatus, PatientId } from "./bills.actions.ts";
import type { CreateBillDto } from "./DTOs/createBill.dto.ts";
import type { UpdateBillDto } from "./DTOs/updateBill.dto.ts";
import type { RecordBillPaymentDto } from "./DTOs/recordBillPayment.dto.ts";

@Injectable()
export class BillsService {
	async findAll(
		userId: string,
		page = 1,
		limit = 20,
		status?: string,
		patientId?: string,
	) {
		const clinicId = await this.getClinicId(userId);
		const validStatus = this.parseStatus(status);
		if (patientId && !(await findPatientForBill(clinicId, patientId))) {
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		}

		return findBillsByClinicId(
			clinicId,
			page,
			limit,
			validStatus,
			patientId as PatientId | undefined,
		);
	}

	async findOne(userId: string, billId: string) {
		const clinicId = await this.getClinicId(userId);
		const bill = await findBillById(clinicId, billId);
		if (!bill) throw new NotFoundException("Bill not found");
		return bill;
	}

	async create(userId: string, input: CreateBillDto) {
		const clinicId = await this.getClinicId(userId);
		await this.ensureRelatedRecords(
			clinicId,
			input.patientId,
			input.appointmentId,
		);
		return createBill(input, clinicId, userId);
	}

	async update(userId: string, billId: string, input: UpdateBillDto) {
		const clinicId = await this.getClinicId(userId);
		const bill = await findBillById(clinicId, billId);
		if (!bill) throw new NotFoundException("Bill not found");

		await this.ensureRelatedRecords(
			clinicId,
			input.patientId ?? bill.patientId,
			input.appointmentId ?? bill.appointmentId ?? undefined,
		);
		return updateBillById(clinicId, billId, input);
	}

	async remove(userId: string, billId: string) {
		const clinicId = await this.getClinicId(userId);
		if (!(await findBillById(clinicId, billId))) {
			throw new NotFoundException("Bill not found");
		}
		return deleteBillById(clinicId, billId);
	}

	async recordPayment(
		userId: string,
		billId: string,
		input: RecordBillPaymentDto,
	) {
		const clinicId = await this.getClinicId(userId);
		const result = await recordBillPayment(
			clinicId,
			billId,
			input.method,
			userId,
		);
		if (result.status === "not_found") {
			throw new NotFoundException("Bill not found");
		}
		if (result.status === "not_unpaid") {
			throw new ConflictException(
				"Only an unpaid bill can be paid",
			);
		}
		return result.payment;
	}

	private async getClinicId(userId: string): Promise<ClinicId> {
		const clinic = await findClinicIdForUser(userId);
		if (!clinic) throw new NotFoundException("Clinic not found");
		return clinic.id;
	}

	private parseStatus(status?: string): BillStatus | undefined {
		if (!status) return undefined;
		const validStatus = Object.values(bill_Status).find(
			(value) => value === status,
		);
		if (!validStatus)
			throw new BadRequestException("Invalid bill status");
		return validStatus as BillStatus;
	}

	private async ensureRelatedRecords(
		clinicId: ClinicId,
		patientId: string,
		appointmentId?: string,
	) {
		const patient = await findPatientForBill(clinicId, patientId);
		if (!patient) {
			throw new NotFoundException(
				"Patient not found in this clinic",
			);
		}
		if (!appointmentId) return;

		const appointment = await findAppointmentForBill(
			clinicId,
			appointmentId,
		);
		if (!appointment) {
			throw new NotFoundException(
				"Appointment not found in this clinic",
			);
		}
		if (appointment.patientId !== patientId) {
			throw new BadRequestException(
				"Bill patient must match the appointment patient",
			);
		}
	}
}
