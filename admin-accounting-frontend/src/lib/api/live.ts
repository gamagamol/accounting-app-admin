import { apiRequest } from './client';

export interface SelectOption {
	id: number;
	code: string;
	name: string;
}

export interface CustomerOption extends SelectOption {
	paymentTermId?: number | null;
}

export interface ProductOption extends SelectOption {
	uomId: number;
	uomName?: string | null;
	sellingPrice: number;
	costPrice: number;
	categoryId?: number | null;
}

export interface TaxRateOption extends SelectOption {
	rate: number;
	taxType: string;
}

export interface PaymentTermOption extends SelectOption {
	days: number;
}

export interface BankAccountOption extends SelectOption {
	coaId: number;
}

export interface CostCenterOption extends SelectOption {
	departmentId?: number | null;
}

export interface CoaOption extends SelectOption {
	accountType: string;
}

export interface MasterDataOptions {
	customers: CustomerOption[];
	suppliers: SelectOption[];
	products: ProductOption[];
	warehouses: SelectOption[];
	uoms: SelectOption[];
	taxRates: TaxRateOption[];
	paymentTerms: PaymentTermOption[];
	bankAccounts: BankAccountOption[];
	departments: SelectOption[];
	costCenters: CostCenterOption[];
	coa: CoaOption[];
	users: SelectOption[];
}

export interface TransactionResponse {
	documentType: string;
	header: Record<string, any>;
	lines: Record<string, any>[];
}

export interface TransactionListQuery {
	search?: string;
	status?: string;
	page?: number;
	limit?: number;
}

const BASE = '/api/transactions';

function queryString(query: TransactionListQuery = {}): string {
	const params = new URLSearchParams();
	if (query.search) params.set('search', query.search);
	if (query.status) params.set('status', query.status);
	params.set('page', String(query.page ?? 1));
	params.set('limit', String(query.limit ?? 100));
	return params.toString();
}

export const liveApi = {
	options() {
		return apiRequest<MasterDataOptions>('/api/master-data/options');
	},
	list(type: string, query: TransactionListQuery = {}) {
		return apiRequest<Record<string, any>[]>(`${BASE}/${type}?${queryString(query)}`);
	},
	get(type: string, id: number | string) {
		return apiRequest<TransactionResponse>(`${BASE}/${type}/${id}`);
	},
	create(type: string, payload: Record<string, unknown>) {
		return apiRequest<TransactionResponse>(`${BASE}/${type}`, {
			method: 'POST',
			body: payload
		});
	},
	approve(type: string, id: number | string, actor = 'Frontend User', actorId = 1) {
		return apiRequest<TransactionResponse>(`${BASE}/${type}/${id}/approve`, {
			method: 'POST',
			body: { actor, actor_id: actorId }
		});
	}
};
