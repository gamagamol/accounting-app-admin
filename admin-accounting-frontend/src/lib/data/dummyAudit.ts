import type { AuditAction, AuditLogEntry, AuditTransactionStatus } from '$lib/types';

/**
 * Sample audit trail used while the backend audit API is not wired yet.
 * These entries are deterministic per entity so every dedicated CRUD page
 * can render a meaningful audit section with dummy data.
 */
const ACTORS = ['Ahmad Fauzi', 'Rina Kusuma', 'Bambang Soepomo', 'Putri Anggraini'];

const MODULE_BY_ENTITY: Record<string, string> = {
	sales_order: 'sales',
	quotation: 'sales',
	delivery_order: 'sales',
	sales_invoice: 'sales',
	customer_receipt: 'sales',
	sales_return: 'sales',
	purchase_order: 'purchase',
	goods_receipt: 'purchase',
	purchase_invoice: 'purchase',
	vendor_payment: 'purchase',
	purchase_return: 'purchase',
	stock_movement: 'inventory',
	stock_adjustment: 'inventory',
	product_account_mapping: 'inventory',
	inventory_valuation: 'inventory',
	annual_budget: 'budgeting',
	budget_allocation: 'budgeting',
	budget_revision: 'budgeting',
	expense_entry: 'budgeting',
	expense_approval: 'budgeting',
	budget_approval: 'budgeting',
	posted_expense: 'budgeting'
};

function hash(value: string) {
	let result = 0;
	for (let index = 0; index < value.length; index += 1) {
		result = (result * 31 + value.charCodeAt(index)) >>> 0;
	}
	return result;
}

function humanize(value: string) {
	return value.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
}

function sampleEntries(entityType: string, entityId: string): AuditLogEntry[] {
	const seed = hash(`${entityType}:${entityId}`);
	const label = humanize(entityType).toLowerCase();
	const module = MODULE_BY_ENTITY[entityType] ?? 'system';
	const actor = (offset: number) => ACTORS[(seed + offset) % ACTORS.length];
	const now = Date.now();
	const stamp = (hoursAgo: number) => new Date(now - hoursAgo * 60 * 60 * 1000).toISOString();
	const documentNumber = `${entityType
		.split('_')
		.map((part) => part[0])
		.join('')
		.toUpperCase()}/SAMPLE/${String((seed % 900) + 100)}`;

	const entries: Array<{
		action: AuditAction;
		status: AuditTransactionStatus;
		hoursAgo: number;
		actor: string;
		summary: string;
		changes: AuditLogEntry['changes'];
	}> = [
		{
			action: 'create',
			status: 'draft',
			hoursAgo: 78,
			actor: actor(0),
			summary: `Created the ${label} record with initial draft values.`,
			changes: [
				{ field: 'status', before: '—', after: 'draft' },
				{ field: 'document_number', before: '—', after: documentNumber },
				{ field: 'created_by', before: '—', after: actor(0) }
			]
		},
		{
			action: 'update',
			status: 'created',
			hoursAgo: 52,
			actor: actor(1),
			summary: `Completed the ${label} details and issued the document.`,
			changes: [
				{ field: 'status', before: 'draft', after: 'created' },
				{ field: 'notes', before: 'Initial draft notes', after: 'Reviewed by the finance team' },
				{ field: 'updated_by', before: actor(0), after: actor(1) }
			]
		},
		{
			action: 'update',
			status: 'pending',
			hoursAgo: 31,
			actor: actor(1),
			summary: `Submitted the ${label} for review.`,
			changes: [
				{ field: 'status', before: 'created', after: 'pending' },
				{ field: 'submitted_by', before: '—', after: actor(1) }
			]
		},
		{
			action: 'reject',
			status: 'rejected',
			hoursAgo: 22,
			actor: actor(2),
			summary: `Rejected the ${label} and returned it to the requester for correction.`,
			changes: [
				{ field: 'status', before: 'pending', after: 'rejected' },
				{ field: 'rejection_reason', before: '—', after: 'Supporting document is incomplete' }
			]
		},
		{
			action: 'update',
			status: 'pending',
			hoursAgo: 16,
			actor: actor(1),
			summary: `Corrected the ${label} values and resubmitted it for approval.`,
			changes: [
				{ field: 'status', before: 'rejected', after: 'pending' },
				{ field: 'attachment', before: '—', after: 'invoice-supporting-document.pdf' }
			]
		},
		{
			action: 'approve',
			status: 'approved',
			hoursAgo: 10,
			actor: actor(2),
			summary: `Approved the ${label} after reviewing the corrected values.`,
			changes: [
				{ field: 'status', before: 'pending', after: 'approved' },
				{ field: 'approved_by', before: '—', after: actor(2) }
			]
		},
		{
			action: 'post',
			status: 'completed',
			hoursAgo: 4,
			actor: actor(3),
			summary: `Posted the ${label} to the general ledger and completed the workflow.`,
			changes: [
				{ field: 'status', before: 'approved', after: 'completed' },
				{ field: 'gl_reference', before: '—', after: `GL/${new Date().getFullYear()}/${String((seed % 90) + 10)}` }
			]
		},
		{
			action: 'reopen',
			status: 'reopen',
			hoursAgo: 1,
			actor: actor(2),
			summary: `Reopened the completed ${label} so a correction can be recorded.`,
			changes: [
				{ field: 'status', before: 'completed', after: 'reopen' },
				{ field: 'reopen_reason', before: '—', after: 'Correction requested by finance' }
			]
		}
	];

	return entries.map((entry, index) => ({
		id: `dummy-${entityType}-${entityId}-${index + 1}`,
		module,
		entityType,
		entityId,
		documentNumber,
		action: entry.action,
		status: entry.status,
		actor: entry.actor,
		timestamp: stamp(entry.hoursAgo),
		summary: entry.summary,
		description: entry.summary,
		changes: entry.changes
	}));
}

export function dummyAuditEntries(entityType: string, entityId: string): AuditLogEntry[] {
	if (!entityType || !entityId) return [];
	return sampleEntries(entityType, entityId);
}
