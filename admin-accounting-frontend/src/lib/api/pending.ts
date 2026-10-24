import { apiRequest } from './client';
import type { PendingRequest, PendingStatus, PendingTransactionType } from '$lib/types';

const BASE = '/api/pending';

export interface PendingListOptions {
	transactionType: PendingTransactionType;
	transactionId?: string;
	status?: PendingStatus;
	page?: number;
	limit?: number;
}

export interface CreatePendingInput {
	transactionType: PendingTransactionType;
	transactionId: string;
	transactionNumber: string;
	requestedBy: string;
	pendingMessage: string;
	actorRole?: string;
}

export interface PendingDecisionInput {
	actor: string;
	actorRole: string;
	decisionMessage: string;
}

/**
 * Pending approval API.
 *
 * Each transaction type is stored in its own PostgreSQL
 * `transaction_<type>_pending` table. The backend maps the type through a
 * static allowlist, so the table name never comes from the request body.
 */
export const pendingApi = {
	list(options: PendingListOptions) {
		const params = new URLSearchParams({ transactionType: options.transactionType });
		if (options.transactionId) params.set('transactionId', options.transactionId);
		if (options.status) params.set('status', options.status);
		if (options.page) params.set('page', String(options.page));
		if (options.limit) params.set('limit', String(options.limit));
		return apiRequest<PendingRequest[]>(`${BASE}?${params.toString()}`);
	},

	get(transactionType: PendingTransactionType, id: string) {
		return apiRequest<PendingRequest>(
			`${BASE}/${encodeURIComponent(transactionType)}/${encodeURIComponent(id)}`
		);
	},

	create(input: CreatePendingInput) {
		return apiRequest<PendingRequest>(BASE, { method: 'POST', body: input });
	},

	approve(transactionType: PendingTransactionType, id: string, input: PendingDecisionInput) {
		return apiRequest<PendingRequest>(
			`${BASE}/${encodeURIComponent(transactionType)}/${encodeURIComponent(id)}/approve`,
			{ method: 'POST', body: input }
		);
	},

	reject(transactionType: PendingTransactionType, id: string, input: PendingDecisionInput) {
		return apiRequest<PendingRequest>(
			`${BASE}/${encodeURIComponent(transactionType)}/${encodeURIComponent(id)}/reject`,
			{ method: 'POST', body: input }
		);
	}
};
