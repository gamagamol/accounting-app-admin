import type { ExpenseEntry } from '$lib/types';
import { apiRequest } from './client';
import {
	mapExpenseDocument,
	mapExpenseHeader,
	type ApiDocument
} from './mappers';
import type {
	CreateExpenseApiRequest,
	ExpenseDecisionPayload,
	PostExpensePayload
} from './types';

const BASE = '/api/expenses';

export const expenseEndpoints = {
	expenses: BASE,
	expense: (id: string) => `${BASE}/${id}`,
	submit: (id: string) => `${BASE}/${id}/submit`,
	approve: (id: string) => `${BASE}/${id}/approve`,
	reject: (id: string) => `${BASE}/${id}/reject`,
	post: (id: string) => `${BASE}/${id}/post`,
	posted: `${BASE}/posted`
} as const;

function mapList(result: { data?: Record<string, any>[] }) {
	return (result.data ?? []).map(mapExpenseHeader);
}

async function mapDocument(
	request: Promise<{ data?: ApiDocument }>
): Promise<{ data: ExpenseEntry }> {
	const result = await request;
	if (!result.data) {
		throw new Error('The expense API returned an empty response.');
	}
	return { data: mapExpenseDocument(result.data) };
}

export const expensesApi = {
	async list() {
		const result = await apiRequest<Record<string, any>[]>(expenseEndpoints.expenses);
		return { ...result, data: mapList(result) };
	},

	async listPosted() {
		const result = await apiRequest<Record<string, any>[]>(expenseEndpoints.posted);
		return { ...result, data: mapList(result) };
	},

	async get(id: string) {
		return mapDocument(apiRequest<ApiDocument>(expenseEndpoints.expense(id)));
	},

	async create(payload: CreateExpenseApiRequest) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.expenses, {
				method: 'POST',
				body: payload
			})
		);
	},

	async update(id: string, payload: CreateExpenseApiRequest) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.expense(id), {
				method: 'PUT',
				body: payload
			})
		);
	},

	delete(id: string) {
		return apiRequest<null>(expenseEndpoints.expense(id), {
			method: 'DELETE'
		});
	},

	async submit(id: string, actor: string) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.submit(id), {
				method: 'POST',
				body: { actor }
			})
		);
	},

	async approve(id: string, payload: ExpenseDecisionPayload = {}) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.approve(id), {
				method: 'POST',
				body: { actor: payload.approvedBy, reason: payload.reason }
			})
		);
	},

	async reject(id: string, payload: ExpenseDecisionPayload = {}) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.reject(id), {
				method: 'POST',
				body: { actor: payload.approvedBy, reason: payload.reason }
			})
		);
	},

	async post(id: string, payload: PostExpensePayload = {}) {
		return mapDocument(
			apiRequest<ApiDocument>(expenseEndpoints.post(id), {
				method: 'POST',
				body: { actor: payload.postedBy }
			})
		);
	}
};
