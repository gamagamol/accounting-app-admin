import { apiRequest } from './client';

export interface JournalLineInput {
	coa_id: number;
	description?: string;
	debit: number;
	credit: number;
	department_id?: number | null;
	cost_center_id?: number | null;
	employee_id?: number | null;
	tax_rate_id?: number | null;
}

export interface JournalLine extends JournalLineInput {
	id: number;
	line_number: number;
	account_code?: string;
	account_name?: string;
	account_type?: string;
}

export interface JournalHeader {
	id: number;
	journal_number: string;
	journal_date: string;
	journal_type: string;
	reference_type?: string | null;
	reference_id?: number | null;
	description?: string | null;
	total_debit: number;
	total_credit: number;
	status: string;
	posted_by?: number | null;
	posted_at?: string | null;
	created_by?: number | null;
	created_at?: string;
	updated_at?: string;
	line_count?: number;
}

export interface JournalDocument {
	header: JournalHeader;
	lines: JournalLine[];
}

export interface JournalListQuery {
	search?: string;
	status?: string;
	period?: string;
	page?: number;
	limit?: number;
}

export interface CreateJournalPayload {
	journal_number?: string;
	journal_date: string;
	description?: string;
	reference_type?: string;
	reference_id?: number;
	created_by?: number;
	actor?: string;
	lines: JournalLineInput[];
}

export interface JournalActionPayload {
	actor?: string;
	actor_id?: number;
}

function queryString(query: JournalListQuery = {}): string {
	const params = new URLSearchParams();
	if (query.search) params.set('search', query.search);
	if (query.status) params.set('status', query.status);
	if (query.period) params.set('period', query.period);
	params.set('page', String(query.page ?? 1));
	params.set('limit', String(query.limit ?? 100));
	return params.toString();
}

export const journalApi = {
	list(query: JournalListQuery = {}) {
		return apiRequest<JournalHeader[]>(`/api/journals?${queryString(query)}`);
	},
	get(id: number | string) {
		return apiRequest<JournalDocument>(`/api/journals/${id}`);
	},
	create(payload: CreateJournalPayload) {
		return apiRequest<JournalDocument>('/api/journals', {
			method: 'POST',
			body: payload
		});
	},
	update(id: number | string, payload: CreateJournalPayload) {
		return apiRequest<JournalDocument>(`/api/journals/${id}`, {
			method: 'PUT',
			body: payload
		});
	},
	delete(id: number | string, actor = 'Frontend User') {
		const params = new URLSearchParams({ actor });
		return apiRequest<null>(`/api/journals/${id}?${params.toString()}`, {
			method: 'DELETE'
		});
	},
	post(id: number | string, payload: JournalActionPayload = {}) {
		return apiRequest<JournalDocument>(`/api/journals/${id}/post`, {
			method: 'POST',
			body: { actor: payload.actor ?? 'Frontend User', actor_id: payload.actor_id ?? 1 }
		});
	},
	unpost(id: number | string, payload: JournalActionPayload = {}) {
		return apiRequest<JournalDocument>(`/api/journals/${id}/unpost`, {
			method: 'POST',
			body: { actor: payload.actor ?? 'Frontend User', actor_id: payload.actor_id ?? 1 }
		});
	}
};
