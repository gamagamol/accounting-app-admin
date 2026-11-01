import { apiRequest } from './client';
import type { AuditLogEntry } from '$lib/types';

const BASE = '/api/audit-logs';

export interface AuditLogListOptions {
	rootTransactionId?: string;
	module?: string;
	entityType?: string;
	entityId?: string;
	search?: string;
	page?: number;
	limit?: number;
}

/**
 * Audit trail API.
 *
 * Audit entries are written by the backend and are append-only. The frontend
 * never posts audit entries itself; it only reads the activity feed or the
 * chronological lifecycle for a root transaction.
 */
export const auditApi = {
	list(options: AuditLogListOptions = {}) {
		const params = new URLSearchParams();
		if (options.rootTransactionId) params.set('rootTransactionId', options.rootTransactionId);
		if (options.module) params.set('module', options.module);
		if (options.entityType) params.set('entityType', options.entityType);
		if (options.entityId) params.set('entityId', options.entityId);
		if (options.search) params.set('search', options.search);
		if (options.page) params.set('page', String(options.page));
		if (options.limit) params.set('limit', String(options.limit));

		const query = params.toString();
		return apiRequest<AuditLogEntry[]>(query ? `${BASE}?${query}` : BASE);
	},
	get(id: string) {
		return apiRequest<AuditLogEntry>(`${BASE}/${encodeURIComponent(id)}`);
	},
	/**
	 * Full chronological lifecycle for one root transaction. The backend sorts
	 * oldest-first so the chain reads QT -> SO -> DO -> Invoice -> Payment.
	 */
	timeline(rootTransactionId: string) {
		return apiRequest<AuditLogEntry[]>(
			`${BASE}/timeline/${encodeURIComponent(rootTransactionId)}`
		);
	}
};
