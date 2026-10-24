import type { TransactionStatus } from '$lib/types';

/**
 * Canonical transaction workflow statuses. Keep this list in sync with the
 * PostgreSQL transaction status checks and the audit trail in MongoDB.
 */
export const transactionStatusValues: TransactionStatus[] = [
	'draft',
	'created',
	'approved',
	'rejected',
	'pending',
	'completed',
	'reopen'
];

export const transactionStatusOptions: Array<{ value: TransactionStatus; label: string }> =
	transactionStatusValues.map((value) => ({
		value,
		label: transactionStatusLabel(value)
	}));

export function transactionStatusLabel(status: TransactionStatus): string {
	const labels: Record<TransactionStatus, string> = {
		draft: 'Draft',
		created: 'Created',
		approved: 'Approved',
		rejected: 'Rejected',
		pending: 'Pending',
		completed: 'Completed',
		reopen: 'Reopen'
	};
	return labels[status];
}

/**
 * Convert legacy workflow values into the canonical status set. This keeps
 * older mock data and API payloads readable while the backend is migrated.
 */
export function normalizeTransactionStatus(value: unknown): TransactionStatus | null {
	if (value === null || value === undefined || value === '') return null;
	const status = String(value).trim().toLowerCase().replace(/[\s-]+/g, '_');

	if (status === 'draft') return 'draft';
	if (['new', 'created', 'quotation', 'shipped'].includes(status)) return 'created';
	if (['approved', 'approve'].includes(status)) return 'approved';
	if (['rejected', 'reject', 'void', 'cancelled', 'canceled', 'inactive'].includes(status)) {
		return 'rejected';
	}
	if (
		[
			'pending',
			'submitted',
			'processing',
			'open',
			'partial',
			'overdue',
			'in_progress',
			'inprogress'
		].includes(status)
	) {
		return 'pending';
	}
	if (
		[
			'completed',
			'complete',
			'paid',
			'posted',
			'closed',
			'delivered',
			'received',
			'done',
			'sales',
			'reconciled'
		].includes(status)
	) {
		return 'completed';
	}
	if (['revised', 'discrepancy', 'reopen', 'reopened'].includes(status)) return 'reopen';

	return null;
}
