import type { Department } from '$lib/types';
import { apiRequest } from './client';
import type {
	CreateDepartmentPayload,
	InventoryAdjustmentPayload,
	UpdateDepartmentPayload
} from './types';

const BASE = '/api';

export const masterEndpoints = {
	departments: `${BASE}/master/departments`,
	department: (id: string) => `${BASE}/master/departments/${id}`,
	inventoryValuation: `${BASE}/inventory/valuation`,
	inventoryAdjustment: `${BASE}/inventory/adjustments`
} as const;

export const departmentsApi = {
	list() {
		return apiRequest<Department[]>(masterEndpoints.departments);
	},
	create(payload: CreateDepartmentPayload) {
		return apiRequest<Department>(masterEndpoints.departments, {
			method: 'POST',
			body: payload
		});
	},
	update(id: string, payload: UpdateDepartmentPayload) {
		return apiRequest<Department>(masterEndpoints.department(id), {
			method: 'PUT',
			body: payload
		});
	},
	delete(id: string) {
		return apiRequest<null>(masterEndpoints.department(id), { method: 'DELETE' });
	}
};

export const inventoryApi = {
	valuation() {
		return apiRequest<unknown>(masterEndpoints.inventoryValuation);
	},
	createAdjustment(payload: InventoryAdjustmentPayload) {
		return apiRequest<unknown>(masterEndpoints.inventoryAdjustment, {
			method: 'POST',
			body: payload
		});
	}
};
