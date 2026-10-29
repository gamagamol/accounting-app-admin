import type { Department } from '$lib/types';
import { apiRequest } from './client';
import type {
	CreateDepartmentPayload,
	InventoryAdjustmentPayload,
	UpdateDepartmentPayload
} from './types';

const BASE = '/api';

export type MasterDataEntity =
	| 'products'
	| 'customers'
	| 'suppliers'
	| 'employees'
	| 'departments'
	| 'cost-centers'
	| 'coa'
	| 'warehouses'
	| 'tax-rates'
	| 'payment-terms'
	| 'bank-accounts'
	| 'uoms'
	| 'product-categories'
	| 'payroll-components'
	| 'app-configs'
	| 'product-account-mappings'
	| 'company-profile';

export const masterDataApi = {
	list<T>(entity: MasterDataEntity) {
		return apiRequest<T[]>(`${BASE}/master-data/${entity}`);
	},
	get<T>(entity: MasterDataEntity, id: string | number) {
		return apiRequest<T>(`${BASE}/master-data/${entity}/${id}`);
	},
	create<T>(entity: MasterDataEntity, payload: Record<string, unknown>) {
		return apiRequest<T>(`${BASE}/master-data/${entity}`, {
			method: 'POST',
			body: payload
		});
	},
	update<T>(entity: MasterDataEntity, id: string | number, payload: Record<string, unknown>) {
		return apiRequest<T>(`${BASE}/master-data/${entity}/${id}`, {
			method: 'PUT',
			body: payload
		});
	},
	delete(entity: MasterDataEntity, id: string | number) {
		return apiRequest<{ id: number }>(`${BASE}/master-data/${entity}/${id}`, {
			method: 'DELETE'
		});
	}
};

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
