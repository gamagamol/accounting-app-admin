<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import DetailStat from '$lib/components/ui/DetailStat.svelte';
	import DetailField from '$lib/components/ui/DetailField.svelte';
	import ApprovalActions from '$lib/components/ui/ApprovalActions.svelte';
	import { annualBudgets, budgetAllocations, budgetingActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { formatCurrency, formatDate, formatPercent } from '$lib/utils/formatters';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { AnnualBudget } from '$lib/types';

	export let isOpen = false;
	export let budget: AnnualBudget | null = null;

	let working = false;
	let errorMessage = '';

	$: current = budget ? $annualBudgets.find((item) => item.id === budget.id) ?? budget : null;
	$: allocations = current
		? $budgetAllocations.filter((allocation) => allocation.budgetId === current.id)
		: [];
	$: allocated = allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
	$: used = allocations.reduce((sum, line) => sum + line.usedAmount, 0);
	$: remaining = allocated - used;
	$: utilization = allocated > 0 ? (used / allocated) * 100 : 0;

	$: payload = current
		? {
				budgetNo: current.budgetNo,
				fiscalYear: current.fiscalYear,
				name: current.name,
				departmentCode: current.departmentCode,
				departmentName: current.departmentName,
				totalAmount: current.totalAmount,
				status: current.status,
				preparedBy: current.preparedBy,
				notes: current.notes
			}
		: null;

	async function runAction(action: 'submit' | 'approve' | 'reject' | 'close') {
		if (!current) return;
		working = true;
		errorMessage = '';
		try {
			if (action === 'submit') {
				await budgetingApi.submitBudget(current.id);
				budgetingActions.submitBudget(current.id);
			} else if (action === 'approve') {
				await budgetingApi.approveBudget(current.id, { approvedBy: $user?.name });
				budgetingActions.approveBudget(current.id, $user?.name);
			} else if (action === 'reject') {
				await budgetingApi.rejectBudget(current.id, { approvedBy: $user?.name });
				budgetingActions.rejectBudget(current.id);
			} else {
				await budgetingApi.closeBudget(current.id);
				budgetingActions.closeBudget(current.id);
			}
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Action failed.');
		} finally {
			working = false;
		}
	}
</script>

<Modal bind:isOpen title="Annual Budget Details" size="4xl">
	{#if current}
		<div class="space-y-5">
			<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
				<div>
					<p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
						{current.budgetNo}
					</p>
					<h3 class="text-xl font-black text-gray-900 dark:text-white">{current.name}</h3>
					<p class="text-sm text-gray-500 dark:text-slate-400">
						{current.departmentName} · Fiscal Year {current.fiscalYear}
					</p>
				</div>
				<Badge status={current.status} />
			</div>

			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<DetailStat label="Total Budget" value={formatCurrency(current.totalAmount)} />
				<DetailStat label="Allocated" value={formatCurrency(allocated)} tone="blue" />
				<DetailStat label="Used" value={formatCurrency(used)} tone="amber" />
				<DetailStat label="Remaining" value={formatCurrency(remaining)} tone="emerald" />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
				<DetailField label="Prepared By" value={current.preparedBy || '—'} />
				<DetailField label="Approved By" value={current.approvedBy || '—'} />
				<DetailField label="Created At" value={formatDate(current.createdAt)} />
				<DetailField label="Utilization" value={formatPercent(utilization)} />
			</div>

			{#if current.notes}
				<div class="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-3">
					<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Notes</p>
					<p class="mt-1 text-sm text-gray-700 dark:text-slate-300">{current.notes}</p>
				</div>
			{/if}

			<div>
				<div class="flex items-center justify-between mb-2">
					<h4 class="text-sm font-bold text-gray-900 dark:text-white">Budget Allocation Lines</h4>
					<a href="/budget-allocation" class="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline">
						Manage allocations →
					</a>
				</div>
				<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
					<table class="min-w-full text-sm">
						<thead class="bg-slate-50 dark:bg-slate-950/60 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">
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
									<td colspan="6" class="px-3 py-6 text-center text-gray-500 dark:text-slate-400">
										No allocation lines yet.
									</td>
								</tr>
							{/each}
						</tbody>
					</table>
				</div>
			</div>

			{#if errorMessage}
				<p class="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
			{/if}

			<details class="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-3">
				<summary class="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
					API payload preview — POST /api/budgeting/budgets
				</summary>
				<pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-emerald-300 text-[11px] p-3">{JSON.stringify(payload, null, 2)}</pre>
			</details>
		</div>
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">Budget not found.</p>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
		{#if current}
			{#if current.status === 'draft' || current.status === 'rejected' || current.status === 'reopen'}
				<Button variant="primary" on:click={() => runAction('submit')} disabled={working}>
					Submit for Approval
				</Button>
			{/if}
			{#if current.status === 'pending'}
				<ApprovalActions
					rejectFirst
					disabled={working}
					onApprove={() => runAction('approve')}
					onReject={() => runAction('reject')}
				/>
			{/if}
			{#if current.status === 'approved'}
				<Button variant="secondary" on:click={() => runAction('close')} disabled={working}>Close Budget</Button>
			{/if}
		{/if}
	</svelte:fragment>
</Modal>
