import { apiRequest } from './client';
import type { AuditLogEntry } from '$lib/types';

const BASE = '/api/audit-logs';

export interface AuditLogListOptions {
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
 * Audit entries are persisted in MongoDB by the backend; there is no
 * PostgreSQL audit table. The frontend mirrors new entries into the local
 * store so the UI updates immediately, then syncs them through this client.
 */
export const auditApi = {
	list(options: AuditLogListOptions = {}) {
		const params = new URLSearchParams();
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
	create(entry: AuditLogEntry) {
		return apiRequest<AuditLogEntry>(BASE, { method: 'POST', body: entry });
	},
	delete(id: string) {
		return apiRequest<null>(`${BASE}/${encodeURIComponent(id)}`, { method: 'DELETE' });
	},
	deleteForEntity(entityType: string, entityId: string) {
		return apiRequest<{ deleted: number }>(
			`${BASE}/entity/${encodeURIComponent(entityType)}/${encodeURIComponent(entityId)}`,
			{ method: 'DELETE' }
		);
	}
};
