import type { AnnualBudget, BudgetAllocation, BudgetRevision } from '$lib/types';
import { apiRequest } from './client';
import type {
	BudgetDecisionPayload,
	CreateAnnualBudgetPayload,
	CreateBudgetAllocationPayload,
	CreateBudgetRevisionPayload,
	UpdateAnnualBudgetPayload,
	UpdateBudgetAllocationPayload,
	UpdateBudgetRevisionPayload
} from './types';

const BASE = '/api/budgeting';

export const budgetingEndpoints = {
	budgets: `${BASE}/budgets`,
	budget: (id: string) => `${BASE}/budgets/${id}`,
	submitBudget: (id: string) => `${BASE}/budgets/${id}/submit`,
	approveBudget: (id: string) => `${BASE}/budgets/${id}/approve`,
	rejectBudget: (id: string) => `${BASE}/budgets/${id}/reject`,
	closeBudget: (id: string) => `${BASE}/budgets/${id}/close`,
	allocations: `${BASE}/allocations`,
	allocation: (id: string) => `${BASE}/allocations/${id}`,
	revisions: `${BASE}/revisions`,
	revision: (id: string) => `${BASE}/revisions/${id}`,
	approveRevision: (id: string) => `${BASE}/revisions/${id}/approve`,
	rejectRevision: (id: string) => `${BASE}/revisions/${id}/reject`,
	budgetVsActual: `${BASE}/budget-vs-actual`
} as const;

export const budgetingApi = {
	listBudgets() {
		return apiRequest<AnnualBudget[]>(budgetingEndpoints.budgets);
	},
	createBudget(payload: CreateAnnualBudgetPayload) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.budgets, {
			method: 'POST',
			body: payload
		});
	},
	updateBudget(id: string, payload: UpdateAnnualBudgetPayload) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.budget(id), {
			method: 'PUT',
			body: payload
		});
	},
	deleteBudget(id: string) {
		return apiRequest<null>(budgetingEndpoints.budget(id), { method: 'DELETE' });
	},
	submitBudget(id: string) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.submitBudget(id), {
			method: 'POST'
		});
	},
	approveBudget(id: string, payload: BudgetDecisionPayload = {}) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.approveBudget(id), {
			method: 'POST',
			body: payload
		});
	},
	rejectBudget(id: string, payload: BudgetDecisionPayload = {}) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.rejectBudget(id), {
			method: 'POST',
			body: payload
		});
	},
	closeBudget(id: string) {
		return apiRequest<AnnualBudget>(budgetingEndpoints.closeBudget(id), {
			method: 'POST'
		});
	},
	listAllocations() {
		return apiRequest<BudgetAllocation[]>(budgetingEndpoints.allocations);
	},
	createAllocation(payload: CreateBudgetAllocationPayload) {
		return apiRequest<BudgetAllocation>(budgetingEndpoints.allocations, {
			method: 'POST',
			body: payload
		});
	},
	updateAllocation(id: string, payload: UpdateBudgetAllocationPayload) {
		return apiRequest<BudgetAllocation>(budgetingEndpoints.allocation(id), {
			method: 'PUT',
			body: payload
		});
	},
	deleteAllocation(id: string) {
		return apiRequest<null>(budgetingEndpoints.allocation(id), { method: 'DELETE' });
	},
	listRevisions() {
		return apiRequest<BudgetRevision[]>(budgetingEndpoints.revisions);
	},
	createRevision(payload: CreateBudgetRevisionPayload) {
		return apiRequest<BudgetRevision>(budgetingEndpoints.revisions, {
			method: 'POST',
			body: payload
		});
	},
	updateRevision(id: string, payload: UpdateBudgetRevisionPayload) {
		return apiRequest<BudgetRevision>(budgetingEndpoints.revision(id), {
			method: 'PUT',
			body: payload
		});
	},
	deleteRevision(id: string) {
		return apiRequest<null>(budgetingEndpoints.revision(id), { method: 'DELETE' });
	},
	approveRevision(id: string) {
		return apiRequest<BudgetRevision>(budgetingEndpoints.approveRevision(id), {
			method: 'POST'
		});
	},
	rejectRevision(id: string) {
		return apiRequest<BudgetRevision>(budgetingEndpoints.rejectRevision(id), {
			method: 'POST'
		});
	},
	budgetVsActual() {
		return apiRequest<unknown>(budgetingEndpoints.budgetVsActual);
	}
};
