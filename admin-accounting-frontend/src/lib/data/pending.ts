import type { PendingTransactionType, UserRole } from '$lib/types';

/**
 * Transaction types that have a `transaction_<type>_pending` table in
 * PostgreSQL. Keep this list in sync with the backend allowlist.
 */
export const pendingTransactionTypes: PendingTransactionType[] = [
	'quotation',
	'sales_order',
	'purchase_order',
	'delivery_order',
	'goods_receipt',
	'sales_invoice',
	'customer_receipt',
	'vendor_payment',
	'debt_payment',
	'purchase_invoice',
	'sales_return',
	'purchase_return',
	'stock_movement',
	'stock_adjustment',
	'annual_budget',
	'budget_revision',
	'expense',
	'journal_entry',
	'bank_reconciliation',
	'period_closing'
];

/**
 * Roles allowed to approve or reject a pending request. This mirrors the
 * backend `APPROVER_ROLES` allowlist.
 */
export const approverRoles: UserRole[] = ['SUPER_ADMIN', 'OWNER', 'ACCOUNTING_ADMIN'];

export function isPendingTransactionType(value: unknown): value is PendingTransactionType {
	return typeof value === 'string' && pendingTransactionTypes.includes(value as PendingTransactionType);
}

/**
 * Maps the audit entity type to the pending table type. Expenses are stored as
 * `expense` in the pending tables while the audit trail uses `expense_entry`.
 */
export function pendingTransactionTypeFor(entityType: unknown): PendingTransactionType | null {
	if (isPendingTransactionType(entityType)) return entityType;
	if (entityType === 'expense_entry') return 'expense';
	return null;
}

/**
 * Maps the pending table type back to the audit entity type. Expenses use
 * `expense` for the pending table but `expense_entry` in the audit trail.
 */
export function pendingAuditEntityType(type: PendingTransactionType): string {
	return type === 'expense' ? 'expense_entry' : type;
}

export function canApproveTransactions(role: UserRole | null | undefined): boolean {
	return Boolean(role && approverRoles.includes(role));
}

export function pendingTransactionModule(type: PendingTransactionType): string {
	switch (type) {
		case 'quotation':
		case 'sales_order':
		case 'delivery_order':
		case 'sales_invoice':
		case 'customer_receipt':
		case 'sales_return':
			return 'sales';
		case 'purchase_order':
		case 'goods_receipt':
		case 'purchase_invoice':
		case 'vendor_payment':
		case 'debt_payment':
		case 'purchase_return':
			return 'purchase';
		case 'stock_movement':
		case 'stock_adjustment':
			return 'inventory';
		case 'annual_budget':
		case 'budget_revision':
		case 'expense':
			return 'budgeting';
		case 'journal_entry':
		case 'bank_reconciliation':
		case 'period_closing':
			return 'accounting';
		default:
			return 'accounting';
	}
}

export function pendingTransactionLabel(type: PendingTransactionType): string {
	const labels: Record<PendingTransactionType, string> = {
		quotation: 'Quotation',
		sales_order: 'Sales Order',
		purchase_order: 'Purchase Order',
		delivery_order: 'Delivery Order',
		goods_receipt: 'Goods Receipt',
		sales_invoice: 'Sales Invoice',
		customer_receipt: 'Customer Receipt',
		vendor_payment: 'Vendor Payment',
		debt_payment: 'Debt Payment',
		purchase_invoice: 'Purchase Invoice',
		sales_return: 'Sales Return',
		purchase_return: 'Purchase Return',
		stock_movement: 'Stock Movement',
		stock_adjustment: 'Stock Adjustment',
		annual_budget: 'Annual Budget',
		budget_revision: 'Budget Revision',
		expense: 'Expense',
		journal_entry: 'Journal Entry',
		bank_reconciliation: 'Bank Reconciliation',
		period_closing: 'Period Closing'
	};
	return labels[type];
}
