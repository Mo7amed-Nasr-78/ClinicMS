import { BadRequestException } from "@nestjs/common";
import { Status } from "../../../prisma/enums.ts";

export type DoctorFiltersQuery = {
	specialty?: string;
	licenseNumber?: string;
	bio?: string;
	consultationDuration?: string;
	consultationFee?: string;
	status?: string;
};

export type DoctorFilters = {
	specialty?: string;
	licenseNumber?: string;
	bio?: string;
	consultationDuration?: number;
	consultationFee?: string;
	status?: Status;
};

function parseTextFilter(value: string | undefined, field: string) {
	if (value === undefined) return undefined;
	if (typeof value !== "string") {
		throw new BadRequestException(`Invalid doctor ${field}`);
	}

	return value.trim() || undefined;
}

function parseNumericFilter(
	value: string | undefined,
	field: string,
	isValid: (number: number) => boolean,
) {
	if (value === undefined) return undefined;
	if (typeof value !== "string") {
		throw new BadRequestException(`Invalid doctor ${field}`);
	}

	const normalizedValue = value.trim();
	if (!normalizedValue) return undefined;

	const number = Number(normalizedValue);
	if (!Number.isFinite(number) || !isValid(number)) {
		throw new BadRequestException(`Invalid doctor ${field}`);
	}

	return normalizedValue;
}

export function parseDoctorFilters(
	query: DoctorFiltersQuery = {},
): DoctorFilters {
	const status = query.status
		? Object.values(Status).find((allowedStatus) => allowedStatus === query.status)
		: undefined;
	if (query.status && !status) {
		throw new BadRequestException("Invalid doctor status");
	}

	const duration = parseNumericFilter(
		query.consultationDuration,
		"consultation duration",
		Number.isInteger,
	);
	const fee = parseNumericFilter(
		query.consultationFee,
		"consultation fee",
		() => true,
	);
	const specialty = parseTextFilter(query.specialty, "specialty");
	const licenseNumber = parseTextFilter(
		query.licenseNumber,
		"license number",
	);
	const bio = parseTextFilter(query.bio, "bio");

	return {
		...(status && { status }),
		...(specialty && { specialty }),
		...(licenseNumber && { licenseNumber }),
		...(bio && { bio }),
		...(duration !== undefined && {
			consultationDuration: Number(duration),
		}),
		...(fee !== undefined && { consultationFee: fee }),
	};
}

export function buildDoctorWhere(
	clinicId: string,
	filters: DoctorFilters = {},
) {
	return {
		clinicId,
		...(filters.status && { status: filters.status }),
		...(filters.specialty && {
			specialty: { contains: filters.specialty, mode: "insensitive" as const },
		}),
		...(filters.licenseNumber && {
			licenseNumber: {
				contains: filters.licenseNumber,
				mode: "insensitive" as const,
			},
		}),
		...(filters.bio && {
			bio: { contains: filters.bio, mode: "insensitive" as const },
		}),
		...(filters.consultationDuration !== undefined && {
			consultationDuration: filters.consultationDuration,
		}),
		...(filters.consultationFee !== undefined && {
			consultationFee: filters.consultationFee,
		}),
	};
}
