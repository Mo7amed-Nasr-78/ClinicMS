import "reflect-metadata";
import assert from "node:assert/strict";
import test from "node:test";
import { ForbiddenException } from "@nestjs/common";
import type { ExecutionContext } from "@nestjs/common";
import { Reflector } from "@nestjs/core";
import { AppointmentsController } from "../modules/appointments/appointments.controller.ts";
import { BillsController } from "../modules/bills/bills.controller.ts";
import { ClinicsController } from "../modules/clinics/clinics.controller.ts";
import { DoctorSchedulesController } from "../modules/doctor-schedules/doctor-schedules.controller.ts";
import { DoctorsController } from "../modules/doctors/doctors.controller.ts";
import { PatientsController } from "../modules/patients/patients.controller.ts";
import { UsersController } from "../modules/users/users.controller.ts";
import { AuthorizationService } from "./authorization.service.ts";
import { ROLE_PERMISSIONS } from "./constants/role-permissions.constant.ts";
import { PERMISSIONS_KEY } from "./decorators/require-permissions.decorator.ts";
import { PermissionGuard } from "./guards/permission.guard.ts";
import { Permission } from "./enums/permission.enum.ts";
import { Role } from "./enums/role.enum.ts";

const authorizationService = new AuthorizationService();
const reflector = new Reflector();
const guard = new PermissionGuard(reflector, authorizationService);
const handler = () => undefined;
const controller = class TestController {};

function executionContext(user?: {
	sub: string;
	email: string;
	role: string;
	tokenType: "access";
}): ExecutionContext {
	return {
		getHandler: () => handler,
		getClass: () => controller,
		switchToHttp: () => ({ getRequest: () => ({ user }) }),
	} as unknown as ExecutionContext;
}

test("role permission mapping contains the expected capabilities", async (t) => {
	await t.test("clinic owner", () => {
		assert.deepEqual(
			ROLE_PERMISSIONS[Role.CLINIC_OWNER],
			Object.values(Permission),
		);
	});

	await t.test("doctor", () => {
		assert.deepEqual(ROLE_PERMISSIONS[Role.DOCTOR], [
			Permission.VIEW_DOCTORS,
			Permission.VIEW_DOCTOR_DETAILS,
			Permission.VIEW_PATIENTS,
			Permission.VIEW_PATIENT_DETAILS,
			Permission.VIEW_APPOINTMENTS,
			Permission.VIEW_APPOINTMENT_DETAILS,
			Permission.CREATE_APPOINTMENTS,
			Permission.UPDATE_APPOINTMENTS,
			Permission.DELETE_APPOINTMENTS,
			Permission.VIEW_DOCTOR_SCHEDULES,
			Permission.VIEW_DOCTOR_SCHEDULE_DETAILS,
			Permission.CREATE_MEDICAL_RECORDS,
			Permission.VIEW_MEDICAL_RECORDS,
			Permission.VIEW_MEDICAL_RECORD_DETAILS,
			Permission.UPDATE_MEDICAL_RECORDS,
			Permission.DELETE_MEDICAL_RECORDS,
			Permission.CREATE_PRESCRIPTIONS,
			Permission.VIEW_PRESCRIPTIONS,
			Permission.VIEW_PRESCRIPTION_DETAILS,
			Permission.UPDATE_PRESCRIPTIONS,
			Permission.DELETE_PRESCRIPTIONS,
		]);
	});

	await t.test("receptionist", () => {
		assert.deepEqual(ROLE_PERMISSIONS[Role.RECEPTIONIST], [
			Permission.VIEW_DOCTORS,
			Permission.VIEW_DOCTOR_DETAILS,
			Permission.VIEW_DOCTOR_SCHEDULES,
			Permission.VIEW_DOCTOR_SCHEDULE_DETAILS,
			Permission.VIEW_RECEPTIONISTS,
			Permission.VIEW_RECEPTIONIST_DETAILS,
			Permission.VIEW_PATIENTS,
			Permission.VIEW_PATIENT_DETAILS,
			Permission.CREATE_PATIENTS,
			Permission.UPDATE_PATIENTS,
			Permission.DELETE_PATIENTS,
			Permission.VIEW_APPOINTMENTS,
			Permission.VIEW_APPOINTMENT_DETAILS,
			Permission.CREATE_APPOINTMENTS,
			Permission.UPDATE_APPOINTMENTS,
			Permission.DELETE_APPOINTMENTS,
			Permission.CREATE_BILLS,
			Permission.VIEW_BILLS,
			Permission.VIEW_BILL_DETAILS,
			Permission.UPDATE_BILLS,
			Permission.DELETE_BILLS,
		]);
	});
});

test("permission guard handles metadata and authenticated roles", async (t) => {
	await t.test("allows endpoints without permission metadata", () => {
		assert.equal(guard.canActivate(executionContext()), true);
	});

	await t.test("allows an authenticated user with the permission", () => {
		Reflect.defineMetadata(
			PERMISSIONS_KEY,
			[Permission.CREATE_DOCTORS],
			handler,
		);
		assert.equal(
			guard.canActivate(
				executionContext({
					sub: "user-1",
					email: "owner@example.test",
					role: Role.CLINIC_OWNER,
					tokenType: "access",
				}),
			),
			true,
		);
		Reflect.deleteMetadata(PERMISSIONS_KEY, handler);
	});

	await t.test("forbids a user without the permission", () => {
		Reflect.defineMetadata(
			PERMISSIONS_KEY,
			[Permission.CREATE_DOCTORS],
			handler,
		);
		assert.throws(
			() =>
				guard.canActivate(
					executionContext({
						sub: "doctor-1",
						email: "doctor@example.test",
						role: Role.DOCTOR,
						tokenType: "access",
					}),
				),
			ForbiddenException,
		);
		Reflect.deleteMetadata(PERMISSIONS_KEY, handler);
	});

	await t.test("forbids an unknown role", () => {
		Reflect.defineMetadata(
			PERMISSIONS_KEY,
			[Permission.VIEW_DOCTORS],
			handler,
		);
		assert.throws(
			() =>
				guard.canActivate(
					executionContext({
						sub: "user-1",
						email: "unknown@example.test",
						role: "invalid-role",
						tokenType: "access",
					}),
				),
			ForbiddenException,
		);
		Reflect.deleteMetadata(PERMISSIONS_KEY, handler);
	});

	await t.test("requires all listed permissions", () => {
		Reflect.defineMetadata(
			PERMISSIONS_KEY,
			[Permission.VIEW_PATIENTS, Permission.UPDATE_PATIENTS],
			handler,
		);
		assert.equal(
			guard.canActivate(
				executionContext({
					sub: "receptionist-1",
					email: "receptionist@example.test",
					role: Role.RECEPTIONIST,
					tokenType: "access",
				}),
			),
			true,
		);
		assert.throws(() =>
			(() => {
				Reflect.defineMetadata(
					PERMISSIONS_KEY,
					[
						Permission.VIEW_PATIENTS,
						Permission.CREATE_DOCTORS,
					],
					handler,
				);
				guard.canActivate(
					executionContext({
						sub: "receptionist-1",
						email: "receptionist@example.test",
						role: Role.RECEPTIONIST,
						tokenType: "access",
					}),
				);
			})(),
		);
		Reflect.deleteMetadata(PERMISSIONS_KEY, handler);
	});

	await t.test("does not authorize a missing user", () => {
		Reflect.defineMetadata(
			PERMISSIONS_KEY,
			[Permission.VIEW_DOCTORS],
			handler,
		);
		assert.equal(guard.canActivate(executionContext()), false);
		Reflect.deleteMetadata(PERMISSIONS_KEY, handler);
	});
});

test("resource controllers declare the requested permissions", () => {
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorsController.prototype.createDoctor,
		),
		[Permission.CREATE_DOCTORS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			PatientsController.prototype.findAll,
		),
		[Permission.VIEW_PATIENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			PatientsController.prototype.create,
		),
		[Permission.CREATE_PATIENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			AppointmentsController.prototype.findAll,
		),
		[Permission.VIEW_APPOINTMENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			BillsController.prototype.findAll,
		),
		[Permission.VIEW_BILLS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			BillsController.prototype.create,
		),
		[Permission.CREATE_BILLS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			PatientsController.prototype.findOne,
		),
		[Permission.VIEW_PATIENT_DETAILS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			PatientsController.prototype.update,
		),
		[Permission.UPDATE_PATIENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			PatientsController.prototype.remove,
		),
		[Permission.DELETE_PATIENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			AppointmentsController.prototype.findOne,
		),
		[Permission.VIEW_APPOINTMENT_DETAILS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			AppointmentsController.prototype.create,
		),
		[Permission.CREATE_APPOINTMENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			AppointmentsController.prototype.update,
		),
		[Permission.UPDATE_APPOINTMENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			AppointmentsController.prototype.remove,
		),
		[Permission.DELETE_APPOINTMENTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			ClinicsController.prototype.findAll,
		),
		[Permission.VIEW_CLINICS],
	);
	assert.equal(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			ClinicsController.prototype.findMine,
		),
		undefined,
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			ClinicsController.prototype.create,
		),
		[Permission.CREATE_CLINICS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			ClinicsController.prototype.updateById,
		),
		[Permission.UPDATE_CLINICS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			ClinicsController.prototype.remove,
		),
		[Permission.DELETE_CLINICS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorSchedulesController.prototype.findAll,
		),
		[Permission.VIEW_DOCTOR_SCHEDULES],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorSchedulesController.prototype.findOne,
		),
		[Permission.VIEW_DOCTOR_SCHEDULE_DETAILS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorSchedulesController.prototype.create,
		),
		[Permission.CREATE_DOCTOR_SCHEDULES],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorSchedulesController.prototype.update,
		),
		[Permission.UPDATE_DOCTOR_SCHEDULES],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			DoctorSchedulesController.prototype.remove,
		),
		[Permission.DELETE_DOCTOR_SCHEDULES],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			UsersController.prototype.findAll,
		),
		[Permission.VIEW_RECEPTIONISTS],
	);
	assert.deepEqual(
		Reflect.getMetadata(
			PERMISSIONS_KEY,
			UsersController.prototype.findUser,
		),
		[Permission.VIEW_RECEPTIONIST_DETAILS],
	);
});
