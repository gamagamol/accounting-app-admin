import type { FieldDef } from '$lib/types/entity';
import type { AnnualBudget, BudgetRevision } from '$lib/types';
import type { CreateBudgetRevisionPayload } from '$lib/api/types';

export function buildBudgetRevisionFields(
	budgets: AnnualBudget[],
	actor: string,
	nextRevisionNo: string = 'REV/2024/001'
): FieldDef[] {
	return [
		{
			key: 'revisionNo',
			label: 'Revision No',
			type: 'text',
			required: true,
			defaultValue: nextRevisionNo
		},
		{
			key: 'budgetNo',
			label: 'Budget',
			type: 'select',
			required: true,
			options: budgets.map((budget) => ({
				value: budget.budgetNo,
				label: `${budget.budgetNo} — ${budget.name}`
			}))
		},
		{
			key: 'date',
			label: 'Request Date',
			type: 'date',
			required: true,
			defaultValue: new Date().toISOString().split('T')[0]
		},
		{
			key: 'requestedBy',
			label: 'Requested By',
			type: 'text',
			required: true,
			defaultValue: actor
		},
		{ key: 'requestedAmount', label: 'Requested Amount (IDR)', type: 'currency', required: true },
		{ key: 'reason', label: 'Revision Reason', type: 'textarea', required: true, colSpan: 'full' }
	];
}

export function buildBudgetRevisionPayload(
	payload: Record<string, any>,
	budgets: AnnualBudget[],
	status: BudgetRevision['status'] = 'pending'
): CreateBudgetRevisionPayload {
	const budget = budgets.find((item) => item.budgetNo === payload.budgetNo);
	const currentAmount = budget?.totalAmount ?? 0;
	const requestedAmount = Number(payload.requestedAmount) || 0;

	return {
		revisionNo: String(payload.revisionNo ?? ''),
		budgetId: budget?.id ?? '',
		budgetNo: String(payload.budgetNo ?? ''),
		date: String(payload.date ?? ''),
		requestedBy: String(payload.requestedBy ?? ''),
		currentAmount,
		requestedAmount,
		difference: requestedAmount - currentAmount,
		reason: String(payload.reason ?? ''),
		status,
		description: String(payload.description ?? '')
	};
}

export function budgetRevisionValues(revision: BudgetRevision): Record<string, any> {
	return {
		revisionNo: revision.revisionNo,
		budgetNo: revision.budgetNo,
		date: revision.date,
		requestedBy: revision.requestedBy,
		requestedAmount: revision.requestedAmount,
		reason: revision.reason,
		description: revision.description ?? revision.message ?? ''
	};
}

export const budgetRevisionDetailFields: FieldDef[] = [
	{ key: 'revisionNo', label: 'Revision No', type: 'text' },
	{ key: 'budgetNo', label: 'Budget No', type: 'text' },
	{ key: 'date', label: 'Request Date', type: 'date' },
	{ key: 'requestedBy', label: 'Requested By', type: 'text' },
	{ key: 'currentAmount', label: 'Current Budget', type: 'currency' },
	{ key: 'requestedAmount', label: 'Requested Amount', type: 'currency' },
	{ key: 'difference', label: 'Difference', type: 'currency' },
	{
		key: 'status',
		label: 'Status',
		type: 'select',
		badge: true,
		options: [
			{ value: 'pending', label: 'Pending' },
			{ value: 'approved', label: 'Approved' },
			{ value: 'rejected', label: 'Rejected' }
		]
	},
	{ key: 'reason', label: 'Revision Reason', type: 'textarea', colSpan: 'full' }
];
