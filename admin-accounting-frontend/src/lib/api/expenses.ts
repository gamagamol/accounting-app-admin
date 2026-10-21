import type { ExpenseEntry } from '$lib/types';
import { apiRequest } from './client';
import type {
	CreateExpensePayload,
	ExpenseDecisionPayload,
	PostExpensePayload,
	UpdateExpensePayload
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

export const expensesApi = {
	list() {
		return apiRequest<ExpenseEntry[]>(expenseEndpoints.expenses);
	},
	create(payload: CreateExpensePayload) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.expenses, {
			method: 'POST',
			body: payload
		});
	},
	update(id: string, payload: UpdateExpensePayload) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.expense(id), {
			method: 'PUT',
			body: payload
		});
	},
	delete(id: string) {
		return apiRequest<null>(expenseEndpoints.expense(id), { method: 'DELETE' });
	},
	submit(id: string, submittedBy: string) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.submit(id), {
			method: 'POST',
			body: { submittedBy }
		});
	},
	approve(id: string, payload: ExpenseDecisionPayload = {}) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.approve(id), {
			method: 'POST',
			body: payload
		});
	},
	reject(id: string, payload: ExpenseDecisionPayload = {}) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.reject(id), {
			method: 'POST',
			body: payload
		});
	},
	post(id: string, payload: PostExpensePayload = {}) {
		return apiRequest<ExpenseEntry>(expenseEndpoints.post(id), {
			method: 'POST',
			body: payload
		});
	},
	listPosted() {
		return apiRequest<ExpenseEntry[]>(expenseEndpoints.posted);
	}
};
