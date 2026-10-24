<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import { annualBudgets, budgetAllocations, budgetingActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { FieldDef } from '$lib/types/entity';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';

	export let budgetId: string;

	let working = false;

	$: current = $annualBudgets.find((item) => item.id === budgetId) ?? null;
	$: allocations = current
		? $budgetAllocations.filter((allocation) => allocation.budgetId === current.id)
		: [];
	$: allocated = allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);

	const fields: FieldDef[] = [
		{ key: 'budgetNo', label: 'Budget No' },
		{ key: 'name', label: 'Budget Name' },
		{ key: 'fiscalYear', label: 'Fiscal Year', type: 'number' },
		{ key: 'departmentName', label: 'Department' },
		{ key: 'totalAmount', label: 'Total Budget', type: 'currency' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			options: transactionStatusOptions,
			badgeLabels: Object.fromEntries(
				transactionStatusOptions.map((option) => [option.value, option.label])
			)
		},
		{ key: 'preparedBy', label: 'Prepared By' },
		{ key: 'approvedBy', label: 'Approved By' },
		{ key: 'createdAt', label: 'Submitted At', type: 'date' },
		{ key: 'notes', label: 'Notes', colSpan: 'full' }
	];

	async function decide(decision: 'approve' | 'reject' | 'close') {
		if (!current) return;
		const before = { ...current } as unknown as Record<string, unknown>;
		working = true;
		try {
			if (decision === 'approve') {
				await budgetingApi.approveBudget(current.id, { approvedBy: $user?.name });
				budgetingActions.approveBudget(current.id, $user?.name);
			} else if (decision === 'reject') {
				await budgetingApi.rejectBudget(current.id, { approvedBy: $user?.name });
				budgetingActions.rejectBudget(current.id);
			} else {
				await budgetingApi.closeBudget(current.id);
				budgetingActions.closeBudget(current.id);
			}
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'annual_budget',
				entityId: current.id,
				documentNumber: current.budgetNo,
				action: decision,
				actor: $user?.name || 'Budget Approver',
				summary: `${decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Rejected' : 'Closed'} budget ${current.budgetNo} — ${current.name}.`,
				before,
				after: { ...current, status: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'completed' } as unknown as Record<string, unknown>
			});
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to update budget status.'));
		} finally {
			working = false;
		}
	}
</script>

<EntityDetailPage
	title="Budget Approval Detail"
	description="Review the submitted annual budget, take an approval decision, and inspect its audit trail on this dedicated page."
	backHref="/budget-approval"
	backLabel="Back to budget approval"
	eyebrow="Budgeting / Budget Approval"
	{fields}
	row={current}
	documentNumber={current?.budgetNo ?? ''}
	auditEntityType="annual_budget"
	auditEntityId={current?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/budgets/${current.id}`}>Open Budget</Button>
			{#if current.status === 'approved'}
				<Button variant="primary" disabled={working} on:click={() => decide('close')}>Close Budget</Button>
			{/if}
			<Button variant="secondary" on:click={() => goto('/budget-approval')}>Close</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div class="flex flex-wrap items-center justify-between gap-2">
				<div>
					<h3 class="text-sm font-bold text-gray-900 dark:text-white">Allocation Summary</h3>
					<p class="text-xs text-gray-500 dark:text-slate-400">{allocations.length} allocation line(s) registered for this budget.</p>
				</div>
				<span class="font-mono text-sm font-bold text-blue-700 dark:text-blue-300">{allocated.toLocaleString('id-ID')}</span>
			</div>
		</div>
	{/if}
</EntityDetailPage>
