import type {
  AnnualBudget,
  BudgetAllocation,
  BudgetRevision,
} from "$lib/types";
import { apiRequest } from "./client";
import {
  mapAllocationDocument,
  mapAllocationRow,
  mapBudgetDocument,
  mapBudgetHeader,
  type ApiDocument,
} from "./mappers";
import type {
  BudgetDecisionPayload,
  CreateAllocationApiRequest,
  CreateBudgetApiRequest,
  CreateBudgetRevisionPayload,
  UpdateBudgetRevisionPayload,
} from "./types";

const BASE = "/api/budgeting";

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
  budgetVsActual: `${BASE}/budget-vs-actual`,
} as const;

async function mapBudgetDocumentRequest(
  request: Promise<{ data?: ApiDocument }>,
): Promise<{ data: AnnualBudget }> {
  const result = await request;
  if (!result.data) {
    throw new Error("The budgeting API returned an empty response.");
  }
  return { data: mapBudgetDocument(result.data) };
}

async function mapAllocationDocumentRequest(
  request: Promise<{ data?: ApiDocument }>,
): Promise<{ data: BudgetAllocation }> {
  const result = await request;
  if (!result.data) {
    throw new Error("The budgeting API returned an empty response.");
  }
  return { data: mapAllocationDocument(result.data) };
}

export const budgetingApi = {
  async listBudgets() {
    const result = await apiRequest<Record<string, any>[]>(
      budgetingEndpoints.budgets,
    );
    return { ...result, data: (result.data ?? []).map(mapBudgetHeader) };
  },

  async getBudget(id: string) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.budget(id)),
    );
  },

  async createBudget(payload: CreateBudgetApiRequest) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.budgets, {
        method: "POST",
        body: payload,
      }),
    );
  },

  async updateBudget(id: string, payload: CreateBudgetApiRequest) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.budget(id), {
        method: "PUT",
        body: payload,
      }),
    );
  },

  deleteBudget(id: string) {
    return apiRequest<null>(budgetingEndpoints.budget(id), {
      method: "DELETE",
    });
  },

  async submitBudget(id: string, actor?: string) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.submitBudget(id), {
        method: "POST",
        body: { actor },
      }),
    );
  },

  async approveBudget(id: string, payload: BudgetDecisionPayload = {}) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.approveBudget(id), {
        method: "POST",
        body: { actor: payload.approvedBy, reason: payload.reason },
      }),
    );
  },

  async rejectBudget(id: string, payload: BudgetDecisionPayload = {}) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.rejectBudget(id), {
        method: "POST",
        body: { actor: payload.approvedBy, reason: payload.reason },
      }),
    );
  },

  async closeBudget(id: string, actor?: string) {
    return mapBudgetDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.closeBudget(id), {
        method: "POST",
        body: { actor },
      }),
    );
  },

  async listAllocations() {
    const result = await apiRequest<Record<string, any>[]>(
      budgetingEndpoints.allocations,
    );
    return { ...result, data: (result.data ?? []).map(mapAllocationRow) };
  },

  async getAllocation(id: string) {
    return mapAllocationDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.allocation(id)),
    );
  },

  async createAllocation(payload: CreateAllocationApiRequest) {
    return mapAllocationDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.allocations, {
        method: "POST",
        body: payload,
      }),
    );
  },

  async updateAllocation(id: string, payload: CreateAllocationApiRequest) {
    return mapAllocationDocumentRequest(
      apiRequest<ApiDocument>(budgetingEndpoints.allocation(id), {
        method: "PUT",
        body: payload,
      }),
    );
  },

  deleteAllocation(id: string) {
    return apiRequest<null>(budgetingEndpoints.allocation(id), {
      method: "DELETE",
    });
  },

  // Budget revisions are not exposed by the current backend yet. The methods
  // are kept so existing screens fail with a clear API error instead of a
  // compile error.
  listRevisions() {
    return apiRequest<BudgetRevision[]>(budgetingEndpoints.revisions);
  },
  createRevision(payload: CreateBudgetRevisionPayload) {
    return apiRequest<BudgetRevision>(budgetingEndpoints.revisions, {
      method: "POST",
      body: payload,
    });
  },
  updateRevision(id: string, payload: UpdateBudgetRevisionPayload) {
    return apiRequest<BudgetRevision>(budgetingEndpoints.revision(id), {
      method: "PUT",
      body: payload,
    });
  },
  deleteRevision(id: string) {
    return apiRequest<null>(budgetingEndpoints.revision(id), {
      method: "DELETE",
    });
  },
  approveRevision(id: string) {
    return apiRequest<BudgetRevision>(budgetingEndpoints.approveRevision(id), {
      method: "POST",
    });
  },
  rejectRevision(id: string) {
    return apiRequest<BudgetRevision>(budgetingEndpoints.rejectRevision(id), {
      method: "POST",
    });
  },
  budgetVsActual() {
    return apiRequest<unknown>(budgetingEndpoints.budgetVsActual);
  },
};
