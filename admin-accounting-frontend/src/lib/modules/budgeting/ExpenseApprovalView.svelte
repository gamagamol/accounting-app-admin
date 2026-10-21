<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FilterSelect from '$lib/components/ui/FilterSelect.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import ApprovalActions from '$lib/components/ui/ApprovalActions.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import ExpenseDetailModal from './ExpenseDetailModal.svelte';
	import { expenses, expenseActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import { expenseTypeLabel } from '$lib/data/accounting-options';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { ExpenseEntry, ExpenseType, TableColumn } from '$lib/types';

	let statusFilter = 'submitted';
	let isDetailOpen = false;
	let detailExpense: ExpenseEntry | null = null;
	let workingId = '';

	const stageOptions = [
		{ value: 'submitted', label: 'Pending' },
		{ value: 'approved', label: 'Approved' },
		{ value: 'rejected', label: 'Rejected' },
		{ value: 'posted', label: 'Posted' }
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
	$: pendingCount = statusCounts.submitted ?? 0;
	$: approvedCount = statusCounts.approved ?? 0;
	$: postedCount = statusCounts.posted ?? 0;
	$: rows =
		statusFilter === 'all'
			? $expenses
			: $expenses.filter((expense) => expense.status === statusFilter);

	function openDetail(expense: ExpenseEntry) {
		detailExpense = expense;
		isDetailOpen = true;
	}

	async function decide(expense: ExpenseEntry, decision: 'approve' | 'reject' | 'post') {
		workingId = expense.id;
		try {
			if (decision === 'approve') {
				await expensesApi.approve(expense.id, { approvedBy: $user?.name });
				expenseActions.approve(expense.id, $user?.name);
			} else if (decision === 'reject') {
				await expensesApi.reject(expense.id, { approvedBy: $user?.name });
				expenseActions.reject(expense.id, $user?.name);
			} else {
				await expensesApi.post(expense.id, { postedBy: $user?.name });
				expenseActions.post(expense.id);
			}
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to update expense status.'));
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
				{#if row.status === 'submitted'}
					<ApprovalActions
						disabled={workingId === row.id}
						onApprove={() => decide(row, 'approve')}
						onReject={() => decide(row, 'reject')}
					/>
				{:else if row.status === 'approved'}
					<Button
						size="sm"
						variant="primary"
						disabled={workingId === row.id}
						on:click={() => decide(row, 'post')}
					>
						Post to GL
					</Button>
				{/if}
			</RowActions>
		</svelte:fragment>
	</DataTable>
</div>

<ExpenseDetailModal bind:isOpen={isDetailOpen} expense={detailExpense} />
