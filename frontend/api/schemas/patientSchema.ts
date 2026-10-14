import { z } from "zod";

export const patientSchema = z.object({
	firstName: z.string().trim().min(1, "First name is required."),
	lastName: z.string().trim().min(1, "Last name is required."),
	dateOfBirth: z
		.string()
		.refine(
			(value) =>
				/^\d{4}-\d{2}-\d{2}$/.test(value) &&
				!Number.isNaN(Date.parse(`${value}T00:00:00.000Z`)) &&
				new Date(`${value}T00:00:00.000Z`)
					.toISOString()
					.startsWith(value),
			"Enter a valid date of birth.",
		),
	gender: z.enum(["male", "female"]),
	bloodType: z.string().trim().min(1, "Blood type is required."),
	phone: z.string().trim().min(1, "Phone number is required."),
	email: z.email("Enter a valid email address."),
	address: z.string(),
	emergencyContact: z.string(),
	allergies: z.string(),
});
