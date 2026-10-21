import { c as apiRequest } from "./client.js";
const BASE = "/api/budgeting";
const budgetingEndpoints = {
  budgets: `${BASE}/budgets`,
  budget: (id) => `${BASE}/budgets/${id}`,
  submitBudget: (id) => `${BASE}/budgets/${id}/submit`,
  approveBudget: (id) => `${BASE}/budgets/${id}/approve`,
  rejectBudget: (id) => `${BASE}/budgets/${id}/reject`,
  closeBudget: (id) => `${BASE}/budgets/${id}/close`,
  allocations: `${BASE}/allocations`,
  allocation: (id) => `${BASE}/allocations/${id}`,
  revisions: `${BASE}/revisions`,
  revision: (id) => `${BASE}/revisions/${id}`,
  approveRevision: (id) => `${BASE}/revisions/${id}/approve`,
  rejectRevision: (id) => `${BASE}/revisions/${id}/reject`,
  budgetVsActual: `${BASE}/budget-vs-actual`
};
const budgetingApi = {
  listBudgets() {
    return apiRequest(budgetingEndpoints.budgets);
  },
  createBudget(payload) {
    return apiRequest(budgetingEndpoints.budgets, {
      method: "POST",
      body: payload
    });
  },
  updateBudget(id, payload) {
    return apiRequest(budgetingEndpoints.budget(id), {
      method: "PUT",
      body: payload
    });
  },
  deleteBudget(id) {
    return apiRequest(budgetingEndpoints.budget(id), { method: "DELETE" });
  },
  submitBudget(id) {
    return apiRequest(budgetingEndpoints.submitBudget(id), {
      method: "POST"
    });
  },
  approveBudget(id, payload = {}) {
    return apiRequest(budgetingEndpoints.approveBudget(id), {
      method: "POST",
      body: payload
    });
  },
  rejectBudget(id, payload = {}) {
    return apiRequest(budgetingEndpoints.rejectBudget(id), {
      method: "POST",
      body: payload
    });
  },
  closeBudget(id) {
    return apiRequest(budgetingEndpoints.closeBudget(id), {
      method: "POST"
    });
  },
  listAllocations() {
    return apiRequest(budgetingEndpoints.allocations);
  },
  createAllocation(payload) {
    return apiRequest(budgetingEndpoints.allocations, {
      method: "POST",
      body: payload
    });
  },
  updateAllocation(id, payload) {
    return apiRequest(budgetingEndpoints.allocation(id), {
      method: "PUT",
      body: payload
    });
  },
  deleteAllocation(id) {
    return apiRequest(budgetingEndpoints.allocation(id), { method: "DELETE" });
  },
  listRevisions() {
    return apiRequest(budgetingEndpoints.revisions);
  },
  createRevision(payload) {
    return apiRequest(budgetingEndpoints.revisions, {
      method: "POST",
      body: payload
    });
  },
  updateRevision(id, payload) {
    return apiRequest(budgetingEndpoints.revision(id), {
      method: "PUT",
      body: payload
    });
  },
  deleteRevision(id) {
    return apiRequest(budgetingEndpoints.revision(id), { method: "DELETE" });
  },
  approveRevision(id) {
    return apiRequest(budgetingEndpoints.approveRevision(id), {
      method: "POST"
    });
  },
  rejectRevision(id) {
    return apiRequest(budgetingEndpoints.rejectRevision(id), {
      method: "POST"
    });
  },
  budgetVsActual() {
    return apiRequest(budgetingEndpoints.budgetVsActual);
  }
};
export {
  budgetingApi as b
};
