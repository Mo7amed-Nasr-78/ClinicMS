import { httpClient } from "@/api/httpClient";

export type VisitType = {
	id: string;
	name: string;
	defaultDurationMin: number;
	price: number | string | null;
	color: string | null;
	isFollowUp: boolean;
	isActive: boolean;
	createdAt: string;
	updatedAt: string;
};

export type VisitTypePayload = {
	name: string;
	defaultDurationMin: number;
	price: number | null;
	color: string | null;
	isFollowUp: boolean;
	isActive: boolean;
};

export async function getVisitTypes(
	signal?: AbortSignal,
): Promise<VisitType[]> {
	const { data } = await httpClient.get<VisitType[]>("/visit-types", {
		signal,
	});
	return data;
}

export async function createVisitType(
	payload: VisitTypePayload,
): Promise<VisitType> {
	const { data } = await httpClient.post<VisitType>(
		"/visit-types",
		payload,
	);
	return data;
}

export async function updateVisitType(
	id: string,
	payload: VisitTypePayload,
): Promise<VisitType> {
	const { data } = await httpClient.patch<VisitType>(
		`/visit-types/${id}`,
		payload,
	);
	return data;
}

export async function deactivateVisitType(id: string): Promise<VisitType> {
	const { data } = await httpClient.delete<VisitType>(`/visit-types/${id}`);
	return data;
}
