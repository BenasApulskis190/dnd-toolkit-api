import { ParsedQs } from "qs";

export interface PaginationParams {
	page: number;
	limit: number;
	from: number;
}

export function parsePagination(query: ParsedQs): PaginationParams {
	const page = Math.max(parseInt(query.page as string) || 1, 1);
	const limit = Math.min(Math.max(parseInt(query.limit as string) || 20, 1), 100);
	return { page, limit, from: (page - 1) * limit };
}

export function paginatedResponse<T>(data: T[], total: number, params: PaginationParams) {
	return {
		data,
		pagination: {
			page: params.page,
			limit: params.limit,
			total,
			totalPages: Math.ceil(total / params.limit),
		},
	};
}
