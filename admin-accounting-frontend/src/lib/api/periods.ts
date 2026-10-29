import { apiRequest } from './client';

export type PeriodStatus = 'open' | 'closed';
export type ClosingStatus = 'open' | 'closed' | 'completed' | 'reopen';

export interface AccountingPeriod {
	id: number;
	period: string;
	startDate: string;
	endDate: string;
	status: PeriodStatus;
	closedById?: number | null;
	closedBy?: string;
	closedAt?: string | null;
	notes?: string;
	closingId?: number | null;
	documentNumber?: string;
	closingStatus?: ClosingStatus;
	fiscalYear: number;
	createdAt?: string;
	updatedAt?: string;
}

export interface PeriodListQuery {
	search?: string;
	fiscalYear?: number;
}

export interface PeriodPayload {
	period?: string;
	startDate: string;
	endDate: string;
	status?: PeriodStatus;
	notes?: string;
}

export interface PeriodActionPayload {
	closedBy?: number;
	actor?: string;
	notes?: string;
}

const BASE = '/api/v1/periods';

export const periodsApi = {
	list(query: PeriodListQuery = {}) {
		const params = new URLSearchParams();
		if (query.search) params.set('search', query.search);
		if (query.fiscalYear) params.set('fiscalYear', String(query.fiscalYear));
		const suffix = params.toString();
		return apiRequest<AccountingPeriod[]>(`${BASE}${suffix ? `?${suffix}` : ''}`);
	},
	get(id: number) {
		return apiRequest<AccountingPeriod>(`${BASE}/${id}`);
	},
	create(payload: PeriodPayload) {
		return apiRequest<AccountingPeriod>(BASE, { method: 'POST', body: payload });
	},
	update(id: number, payload: Partial<PeriodPayload>) {
		return apiRequest<AccountingPeriod>(`${BASE}/${id}`, { method: 'PUT', body: payload });
	},
	delete(id: number) {
		return apiRequest<null>(`${BASE}/${id}`, { method: 'DELETE' });
	},
	close(id: number, payload: PeriodActionPayload = {}) {
		return apiRequest<AccountingPeriod>(`${BASE}/${id}/close`, {
			method: 'POST',
			body: payload
		});
	},
	reopen(id: number, payload: PeriodActionPayload = {}) {
		return apiRequest<AccountingPeriod>(`${BASE}/${id}/reopen`, {
			method: 'POST',
			body: payload
		});
	}
};
