<script lang="ts">
	import { goto } from '$app/navigation';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import { expenses, expenseActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import { expenseTypeLabel } from '$lib/data/accounting-options';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { ExpenseEntry, ExpenseType, TableColumn } from '$lib/types';

	let statusFilter = 'pending';
	let workingId = '';

	const stageOptions = [
		{ value: 'pending', label: 'Pending' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'completed', label: 'Completed' }
	];

	const columns: TableColumn[] = [
		dateColumn('date', 'Date'),
		{ key: 'expenseNo', label: 'Expense No', sortable: true },
		{ key: 'expenseType', label: 'Type', sortable: true, format: (value) => expenseTypeLabel(value as ExpenseType) },
		{ key: 'departmentName', label: 'Department', sortable: true },
		{ key: 'paidTo', label: 'Paid To' },
		currencyColumn('totalAmount', 'Total'),
		{ key: 'submittedBy', label: 'Submitted By' },
		statusColumn()
	];

	$: statusCounts = $expenses.reduce<Record<string, number>>((counts, expense) => {
		counts[expense.status] = (counts[expense.status] ?? 0) + 1;
		return counts;
	}, {});
	$: pendingCount = statusCounts.pending ?? 0;
	$: approvedCount = statusCounts.approved ?? 0;
	$: postedCount = statusCounts.completed ?? 0;
	$: rows =
		statusFilter === 'all'
			? $expenses
			: $expenses.filter((expense) => expense.status === statusFilter);

	function openDetail(expense: ExpenseEntry) {
		goto(`/expense-approval/${expense.id}`);
	}

	async function postExpense(expense: ExpenseEntry) {
		const before = { ...expense } as unknown as Record<string, unknown>;
		workingId = expense.id;
		try {
			await expensesApi.post(expense.id, { postedBy: $user?.name });
			expenseActions.post(expense.id);

			auditLogActions.record({
				module: 'budgeting',
				entityType: 'expense_entry',
				entityId: expense.id,
				documentNumber: expense.expenseNo,
				action: 'post',
				actor: $user?.name || 'Finance Approver',
				summary: `Posted expense ${expense.expenseNo} to the general ledger.`,
				before,
				after: { ...expense, status: 'completed' } as unknown as Record<string, unknown>
			});
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to post expense.'));
		} finally {
			workingId = '';
		}
	}
</script>

<div class="space-y-6">
	<PageHeader
		title="Expense Approval"
		description="Review submitted expenses, approve or reject them, then post approved expenses to the general ledger."
	/>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<StatCard title="Pending Approval" value={String(pendingCount)} icon="⏳" color="yellow" hint="Submitted expenses" />
		<StatCard title="Approved" value={String(approvedCount)} icon="✅" color="green" hint="Ready to post to GL" />
		<StatCard title="Posted to GL" value={String(postedCount)} icon="📘" color="blue" hint="Journal entries created" />
	</div>

	<DataTable
		columns={columns}
		data={rows}
		searchKeys={['expenseNo', 'expenseType', 'departmentName', 'paidTo', 'submittedBy', 'status']}
		searchPlaceholder="Search submitted expense..."
		emptyMessage="No expense in this approval stage"
	>
		<div slot="controls" class="flex items-center gap-2">
			<FilterSelect
				id="expense-approval-filter"
				label="Stage"
				bind:value={statusFilter}
				allLabel="All"
				options={stageOptions}
			/>
		</div>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View expense"
				gap="normal"
			>
				{#if row.status === 'approved'}
					<Button
						size="sm"
						variant="primary"
						disabled={workingId === row.id}
						on:click={() => postExpense(row)}
					>
						Post to GL
					</Button>
				{/if}
			</RowActions>
		</svelte:fragment>
	</DataTable>
</div>
