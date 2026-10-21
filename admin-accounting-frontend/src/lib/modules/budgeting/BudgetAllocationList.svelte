<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import {
		annualBudgets,
		budgetAllocations,
		budgetingActions,
		chartOfAccounts,
		departments
	} from '$lib/stores/dataStore';
	import { budgetingApi } from '$lib/api';
	import { formatCurrency } from '$lib/utils/formatters';
	import { currencyColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { TableColumn } from '$lib/types';
	import type { FieldDef } from '$lib/types/entity';
	import type { CreateBudgetAllocationPayload } from '$lib/api/types';

	$: budgetOptions = $annualBudgets.map((budget) => ({
		value: budget.budgetNo,
		label: `${budget.budgetNo} — ${budget.name}`
	}));

	$: expenseAccounts = $chartOfAccounts.filter((account) => account.category === 'Expense');

	$: accountOptions = expenseAccounts.map((account) => ({
		value: account.code,
		label: `${account.code} — ${account.name}`
	}));

	$: departmentOptions = $departments.map((department) => ({
		value: department.code,
		label: `${department.code} — ${department.name}`
	}));

	const columns: TableColumn[] = [
		{ key: 'budgetNo', label: 'Budget No', sortable: true },
		{
			key: 'account',
			label: 'Account (COA)',
			format: (_value, row) => `${row.accountCode} — ${row.accountName}`
		},
		{ key: 'departmentName', label: 'Department', sortable: true },
		currencyColumn('allocatedAmount', 'Allocated'),
		currencyColumn('usedAmount', 'Used'),
		{
			key: 'remaining',
			label: 'Remaining',
			align: 'right',
			format: (_value, row) => formatCurrency((row.allocatedAmount || 0) - (row.usedAmount || 0))
		}
	];

	$: fields = [
		{ key: 'budgetNo', label: 'Budget', type: 'select', required: true, options: budgetOptions },
		{ key: 'accountCode', label: 'Expense Account (COA)', type: 'select', required: true, options: accountOptions },
		{ key: 'departmentCode', label: 'Department', type: 'select', required: true, options: departmentOptions },
		{ key: 'allocatedAmount', label: 'Allocated Amount (IDR)', type: 'currency', required: true },
		{ key: 'usedAmount', label: 'Used Amount (IDR)', type: 'currency' },
		{ key: 'notes', label: 'Notes', type: 'textarea', colSpan: 'full' }
	] satisfies FieldDef[];

	async function saveAllocation(payload: Record<string, any>, id?: string) {
		const budget = $annualBudgets.find((item) => item.budgetNo === payload.budgetNo);
		const account = expenseAccounts.find((item) => item.code === payload.accountCode);
		const department = $departments.find((item) => item.code === payload.departmentCode);

		const fullPayload: CreateBudgetAllocationPayload = {
			budgetId: budget?.id ?? '',
			budgetNo: String(payload.budgetNo),
			fiscalYear: budget?.fiscalYear ?? 2024,
			accountCode: String(payload.accountCode),
			accountName: account?.name ?? '',
			departmentCode: String(payload.departmentCode),
			departmentName: department?.name ?? '',
			allocatedAmount: Number(payload.allocatedAmount) || 0,
			usedAmount: Number(payload.usedAmount) || 0,
			notes: String(payload.notes ?? '')
		};

		try {
			if (id) {
				await budgetingApi.updateAllocation(id, fullPayload);
				budgetingActions.updateAllocation(id, fullPayload);
			} else {
				await budgetingApi.createAllocation(fullPayload);
				budgetingActions.addAllocation(fullPayload);
			}
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to save budget allocation.'));
		}
	}

	async function deleteAllocation(id: string) {
		try {
			await budgetingApi.deleteAllocation(id);
			budgetingActions.deleteAllocation(id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete budget allocation.'));
		}
	}
</script>

<EntityManager
	title="Budget Allocation"
	description="Allocate annual budget to expense accounts and departments. Each line is the basis for budget vs actual control."
	entityName="budget allocation"
	createLabel="Add Allocation"
	columns={columns}
	data={$budgetAllocations}
	fields={fields}
	searchKeys={['budgetNo', 'accountCode', 'accountName', 'departmentName', 'notes']}
	searchPlaceholder="Search budget, COA or department..."
	displayKey="budgetNo"
	formSize="2xl"
	onSave={saveAllocation}
	onDelete={deleteAllocation}
/>
