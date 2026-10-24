<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import DetailStat from '$lib/components/ui/DetailStat.svelte';
	import DetailField from '$lib/components/ui/DetailField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { annualBudgets, budgetAllocations, budgetingActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { formatCurrency, formatDate, formatPercent } from '$lib/utils/formatters';
	import { getErrorMessage } from '$lib/utils/errors';

	export let budgetId: string;

	let working = false;
	let errorMessage = '';

	$: current = $annualBudgets.find((item) => item.id === budgetId) ?? null;
	$: allocations = current
		? $budgetAllocations.filter((allocation) => allocation.budgetId === current.id)
		: [];
	$: allocated = allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
	$: used = allocations.reduce((sum, line) => sum + line.usedAmount, 0);
	$: remaining = allocated - used;
	$: utilization = allocated > 0 ? (used / allocated) * 100 : 0;

	async function runAction(action: 'submit' | 'approve' | 'reject' | 'close') {
		if (!current) return;
		working = true;
		errorMessage = '';
		const before = current as unknown as Record<string, unknown>;
		const actor = $user?.name || 'Budget Approver';
		try {
			if (action === 'submit') {
				await budgetingApi.submitBudget(current.id);
				budgetingActions.submitBudget(current.id);
			} else if (action === 'approve') {
				await budgetingApi.approveBudget(current.id, { approvedBy: actor });
				budgetingActions.approveBudget(current.id, actor);
			} else if (action === 'reject') {
				await budgetingApi.rejectBudget(current.id, { approvedBy: actor });
				budgetingActions.rejectBudget(current.id);
			} else {
				await budgetingApi.closeBudget(current.id);
				budgetingActions.closeBudget(current.id);
			}

			const nextStatus = action === 'submit' ? 'pending' : action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed';
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'annual_budget',
				entityId: current.id,
				documentNumber: current.budgetNo,
				action: action === 'submit' ? 'submit' : action === 'close' ? 'close' : action,
				actor,
				summary: `${action === 'submit' ? 'Submitted' : action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Closed'} annual budget ${current.budgetNo}.`,
				description: current.description ?? current.message ?? `Budget ${current.budgetNo} ${action === 'submit' ? 'submitted for approval' : action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'closed'}.`,
				before,
				after: { ...current, status: nextStatus } as unknown as Record<string, unknown>
			});
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Action failed.');
		} finally {
			working = false;
		}
	}

	async function handleDelete() {
		if (!current) return;
		if (!confirm(`Delete budget "${current.name}"? Its allocations and revisions will also be removed.`)) return;
		const currentBudget = current;
		try {
			await budgetingApi.deleteBudget(currentBudget.id);
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'annual_budget',
				entityId: currentBudget.id,
				documentNumber: currentBudget.budgetNo,
				action: 'delete',
				actor: $user?.name || 'Budget Owner',
				summary: `Deleted annual budget ${currentBudget.budgetNo}.`,
				description: currentBudget.description ?? currentBudget.message,
				before: currentBudget as unknown as Record<string, unknown>
			});
			budgetingActions.deleteBudget(currentBudget.id);
			goto('/budgets');
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Failed to delete budget.');
		}
	}
</script>

<TransactionPageShell
	title="Annual Budget Details"
	description="Review the annual budget, its allocation lines, approval state, and audit trail."
	backHref="/budgets"
	backLabel="Back to annual budgets"
	eyebrow="Budgeting / Annual Budget"
	documentNumber={current?.budgetNo ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/budgets/${current.id}/edit`}>Edit</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="space-y-5">
			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">{current.budgetNo}</p>
						<h3 class="text-xl font-black text-gray-900 dark:text-white">{current.name}</h3>
						<p class="text-sm text-gray-500 dark:text-slate-400">
							{current.departmentName} · Fiscal Year {current.fiscalYear}
						</p>
					</div>
					<Badge status={current.status} />
				</div>

				<div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
					<DetailStat label="Total Budget" value={formatCurrency(current.totalAmount)} />
					<DetailStat label="Allocated" value={formatCurrency(allocated)} tone="blue" />
					<DetailStat label="Used" value={formatCurrency(used)} tone="amber" />
					<DetailStat label="Remaining" value={formatCurrency(remaining)} tone="emerald" />
				</div>

				<div class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
					<DetailField label="Prepared By" value={current.preparedBy || '—'} />
					<DetailField label="Approved By" value={current.approvedBy || '—'} />
					<DetailField label="Created At" value={formatDate(current.createdAt)} />
					<DetailField label="Utilization" value={formatPercent(utilization)} />
				</div>

				{#if current.description || current.message}
					<div class="mt-4 rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-500/30 dark:bg-blue-500/10">
						<p class="text-[11px] uppercase tracking-wider text-blue-700 dark:text-blue-200">Description / Message</p>
						<p class="mt-1 whitespace-pre-line text-sm text-blue-900 dark:text-blue-100">{current.description || current.message}</p>
					</div>
				{/if}

				{#if current.notes}
					<div class="mt-4 rounded-lg border border-gray-200 bg-slate-50 p-3 dark:border-slate-800 dark:bg-slate-950/60">
						<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Notes</p>
						<p class="mt-1 text-sm text-gray-700 dark:text-slate-300">{current.notes}</p>
					</div>
				{/if}

				{#if errorMessage}
					<p class="mt-3 text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
				{/if}
			</div>

			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="mb-2 flex items-center justify-between">
					<h4 class="text-sm font-bold text-gray-900 dark:text-white">Budget Allocation Lines</h4>
					<a href="/budget-allocation" class="text-xs font-semibold text-blue-600 hover:underline dark:text-blue-300">
						Manage allocations →
					</a>
				</div>
				<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
					<table class="min-w-full text-sm">
						<thead class="bg-slate-50 text-[11px] uppercase tracking-wider text-gray-500 dark:bg-slate-950/60 dark:text-slate-400">
							<tr>
								<th class="px-3 py-2 text-left">COA</th>
								<th class="px-3 py-2 text-left">Account</th>
								<th class="px-3 py-2 text-left">Department</th>
								<th class="px-3 py-2 text-right">Allocated</th>
								<th class="px-3 py-2 text-right">Used</th>
								<th class="px-3 py-2 text-right">Remaining</th>
							</tr>
						</thead>
						<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
							{#each allocations as line}
								<tr>
									<td class="px-3 py-2 font-mono text-xs">{line.accountCode}</td>
									<td class="px-3 py-2">{line.accountName}</td>
									<td class="px-3 py-2">{line.departmentName}</td>
									<td class="px-3 py-2 text-right">{formatCurrency(line.allocatedAmount)}</td>
									<td class="px-3 py-2 text-right">{formatCurrency(line.usedAmount)}</td>
									<td class="px-3 py-2 text-right">{formatCurrency(line.allocatedAmount - line.usedAmount)}</td>
								</tr>
							{:else}
								<tr>
									<td colspan="6" class="px-3 py-6 text-center text-gray-500 dark:text-slate-400">No allocation lines yet.</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			{#if current.status === 'approved'}
				<div class="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<Button variant="secondary" on:click={() => runAction('close')} disabled={working}>Close Budget</Button>
				</div>
			{/if}
		</div>

		<PendingApprovalPanel
			transactionType="annual_budget"
			transactionId={current.id}
			transactionNumber={current.budgetNo}
			status={current.status}
		/>

		<AuditLogPanel entityType="annual_budget" entityId={current.id} />
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Budget not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
