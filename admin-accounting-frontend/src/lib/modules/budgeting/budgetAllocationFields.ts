import type { FieldDef } from '$lib/types/entity';
import type { AnnualBudget, BudgetAllocation, ChartOfAccount, Department } from '$lib/types';
import type { CreateBudgetAllocationPayload } from '$lib/api/types';

export function buildBudgetAllocationFields(
	budgets: AnnualBudget[],
	accounts: ChartOfAccount[],
	departments: Department[]
): FieldDef[] {
	const expenseAccounts = accounts.filter((account) => account.category === 'Expense');
	return [
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
			key: 'accountCode',
			label: 'Expense Account (COA)',
			type: 'select',
			required: true,
			options: expenseAccounts.map((account) => ({
				value: account.code,
				label: `${account.code} — ${account.name}`
			}))
		},
		{
			key: 'departmentCode',
			label: 'Department',
			type: 'select',
			required: true,
			options: departments.map((department) => ({
				value: department.code,
				label: `${department.code} — ${department.name}`
			}))
		},
		{ key: 'allocatedAmount', label: 'Allocated Amount (IDR)', type: 'currency', required: true },
		{ key: 'usedAmount', label: 'Used Amount (IDR)', type: 'currency' },
		{ key: 'notes', label: 'Notes', type: 'textarea', colSpan: 'full' }
	];
}

export function buildBudgetAllocationPayload(
	payload: Record<string, any>,
	budgets: AnnualBudget[],
	accounts: ChartOfAccount[],
	departments: Department[]
): CreateBudgetAllocationPayload {
	const budget = budgets.find((item) => item.budgetNo === payload.budgetNo);
	const account = accounts.find((item) => item.code === payload.accountCode);
	const department = departments.find((item) => item.code === payload.departmentCode);

	return {
		budgetId: budget?.id ?? '',
		budgetNo: String(payload.budgetNo ?? ''),
		fiscalYear: budget?.fiscalYear ?? 2024,
		accountCode: String(payload.accountCode ?? ''),
		accountName: account?.name ?? '',
		departmentCode: String(payload.departmentCode ?? ''),
		departmentName: department?.name ?? '',
		allocatedAmount: Number(payload.allocatedAmount) || 0,
		usedAmount: Number(payload.usedAmount) || 0,
		notes: String(payload.notes ?? ''),
		description: String(payload.description ?? '')
	};
}

export function budgetAllocationValues(allocation: BudgetAllocation): Record<string, any> {
	return {
		budgetNo: allocation.budgetNo,
		accountCode: allocation.accountCode,
		departmentCode: allocation.departmentCode,
		allocatedAmount: allocation.allocatedAmount,
		usedAmount: allocation.usedAmount,
		notes: allocation.notes,
		description: allocation.description ?? allocation.message ?? ''
	};
}
