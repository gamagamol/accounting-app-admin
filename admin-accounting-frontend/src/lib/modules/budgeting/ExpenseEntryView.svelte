<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import ExpenseFormModal from './ExpenseFormModal.svelte';
	import ExpenseDetailModal from './ExpenseDetailModal.svelte';
	import { expenses, expenseActions } from '$lib/stores/dataStore';
	import { expensesApi } from '$lib/api';
	import {
		expenseStatusOptions,
		expenseTypeLabel,
		expenseTypeMap,
		expenseTypeOptions
	} from '$lib/data/accounting-options';
	import { formatCurrency } from '$lib/utils/formatters';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { ExpenseEntry, ExpenseType, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let editingExpense: ExpenseEntry | null = null;
	let isDetailOpen = false;
	let detailExpense: ExpenseEntry | null = null;
	let typeFilter = 'all';
	let statusFilter = 'all';

	const columns: TableColumn[] = [
		dateColumn('date', 'Date'),
		{ key: 'expenseNo', label: 'Expense No', sortable: true },
		{
			key: 'expenseType',
			label: 'Expense Type',
			sortable: true,
			format: (value) => `${typeIcon(value as ExpenseType)} ${expenseTypeLabel(value as ExpenseType)}`
		},
		{
			key: 'description',
			label: 'Description',
			format: (value) => {
				const text = String(value ?? '');
				return text.length > 34 ? `${text.slice(0, 34)}…` : text;
			}
		},
		{ key: 'departmentName', label: 'Department', sortable: true },
		{ key: 'budgetNo', label: 'Budget No' },
		currencyColumn('totalAmount', 'Total'),
		statusColumn()
	];

	function typeIcon(type: string) {
		return expenseTypeMap[type as ExpenseType]?.icon ?? '🧾';
	}

	$: typeSummary = $expenses.reduce<Record<string, { total: number; count: number }>>(
		(summary, expense) => {
			const item = summary[expense.expenseType] ?? { total: 0, count: 0 };
			item.total += expense.totalAmount;
			item.count += 1;
			summary[expense.expenseType] = item;
			return summary;
		},
		{}
	);
	$: salarySummary = typeSummary.salary ?? { total: 0, count: 0 };
	$: purchaseSummary = typeSummary.purchase ?? { total: 0, count: 0 };
	$: officeSummary = typeSummary.office_supplies ?? { total: 0, count: 0 };
	$: otherSummary = Object.entries(typeSummary)
		.filter(([type]) => !['salary', 'purchase', 'office_supplies'].includes(type))
		.reduce(
			(summary, [, item]) => ({
				total: summary.total + item.total,
				count: summary.count + item.count
			}),
			{ total: 0, count: 0 }
		);

	$: rows = $expenses.filter((expense) => {
		const matchesType = typeFilter === 'all' || expense.expenseType === typeFilter;
		const matchesStatus = statusFilter === 'all' || expense.status === statusFilter;
		return matchesType && matchesStatus;
	});

	function openCreate() {
		editingExpense = null;
		isFormOpen = true;
	}

	function openEdit(expense: ExpenseEntry) {
		editingExpense = expense;
		isFormOpen = true;
	}

	function openDetail(expense: ExpenseEntry) {
		detailExpense = expense;
		isDetailOpen = true;
	}

	async function deleteExpense(expense: ExpenseEntry) {
		if (!confirm(`Delete expense "${expense.expenseNo}"? This action cannot be undone.`)) return;
		try {
			await expensesApi.delete(expense.id);
			expenseActions.delete(expense.id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete expense.'));
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Expense Entry"
			description="Record employee salaries, purchase expenses, office supplies (ATK), utilities and other operating expenses."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			New Expense
		</Button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<StatCard
			title="Employee Salary"
			value={formatCurrency(salarySummary.total)}
			icon="👔"
			color="blue"
			hint={`${salarySummary.count} salary entries`}
		/>
		<StatCard
			title="Purchase Expense"
			value={formatCurrency(purchaseSummary.total)}
			icon="📦"
			color="purple"
			hint={`${purchaseSummary.count} purchase entries`}
		/>
		<StatCard
			title="Office Supplies (ATK)"
			value={formatCurrency(officeSummary.total)}
			icon="✏️"
			color="yellow"
			hint={`${officeSummary.count} ATK entries`}
		/>
		<StatCard
			title="Other Operating"
			value={formatCurrency(otherSummary.total)}
			icon="🧾"
			color="green"
			hint={`${otherSummary.count} other expense entries`}
		/>
	</div>

	<div class="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200">
		<strong>Special expense workflow:</strong> salary, purchase, ATK and other operating expenses are
		recorded here, then submitted for approval and posted to the general ledger. HRMIS remains a
		separate application; this menu only records the accounting expense.
	</div>

	<DataTable
		columns={columns}
		data={rows}
		searchKeys={['expenseNo', 'category', 'description', 'departmentName', 'budgetNo', 'paidTo', 'status']}
		searchPlaceholder="Search expense number, description or payee..."
		emptyMessage="No expense entries found"
	>
		<div slot="controls" class="flex flex-wrap items-center gap-2">
			<FilterSelect
				id="expense-type-filter"
				bind:value={typeFilter}
				allLabel="All types"
				options={expenseTypeOptions}
			/>
			<FilterSelect
				id="expense-status-filter"
				bind:value={statusFilter}
				allLabel="All statuses"
				options={expenseStatusOptions}
			/>
		</div>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				onEdit={() => openEdit(row)}
				onDelete={() => deleteExpense(row)}
				viewTitle="View expense"
				editTitle="Edit expense"
				deleteTitle="Delete expense"
			/>
		</svelte:fragment>
	</DataTable>
</div>

<ExpenseFormModal bind:isOpen={isFormOpen} expense={editingExpense} />
<ExpenseDetailModal bind:isOpen={isDetailOpen} expense={detailExpense} />
