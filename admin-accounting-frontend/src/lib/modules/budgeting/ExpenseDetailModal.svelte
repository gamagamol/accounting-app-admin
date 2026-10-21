<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import DetailStat from '$lib/components/ui/DetailStat.svelte';
	import DetailField from '$lib/components/ui/DetailField.svelte';
	import ApprovalActions from '$lib/components/ui/ApprovalActions.svelte';
	import { expenses, expenseActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import { expenseTypeLabel } from '$lib/data/accounting-options';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { ExpenseEntry } from '$lib/types';

	export let isOpen = false;
	export let expense: ExpenseEntry | null = null;

	let working = false;
	let errorMessage = '';

	$: current = expense ? $expenses.find((item) => item.id === expense.id) ?? expense : null;

	async function runAction(action: 'submit' | 'approve' | 'reject' | 'post') {
		if (!current) return;
		working = true;
		errorMessage = '';
		try {
			if (action === 'submit') {
				await expensesApi.submit(current.id, $user?.name ?? '');
				expenseActions.submit(current.id, $user?.name ?? '');
			} else if (action === 'approve') {
				await expensesApi.approve(current.id, { approvedBy: $user?.name });
				expenseActions.approve(current.id, $user?.name);
			} else if (action === 'reject') {
				await expensesApi.reject(current.id, { approvedBy: $user?.name });
				expenseActions.reject(current.id, $user?.name);
			} else {
				await expensesApi.post(current.id, { postedBy: $user?.name });
				expenseActions.post(current.id);
			}
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Action failed.');
		} finally {
			working = false;
		}
	}

	$: payload = current
		? {
				date: current.date,
				expenseNo: current.expenseNo,
				expenseType: current.expenseType,
				category: current.category,
				accountCode: current.accountCode,
				accountName: current.accountName,
				departmentCode: current.departmentCode,
				departmentName: current.departmentName,
				budgetId: current.budgetId,
				budgetNo: current.budgetNo,
				employeeId: current.employeeId,
				employeeName: current.employeeName,
				supplierName: current.supplierName,
				description: current.description,
				amount: current.amount,
				taxAmount: current.taxAmount,
				totalAmount: current.totalAmount,
				paymentMethod: current.paymentMethod,
				bankAccount: current.bankAccount,
				paidTo: current.paidTo,
				status: current.status,
				attachmentUrl: current.attachmentUrl,
				notes: current.notes,
				submittedBy: current.submittedBy,
				approvedBy: current.approvedBy,
				postedAt: current.postedAt,
				glReference: current.glReference
			}
		: null;
</script>

<Modal bind:isOpen title="Expense Entry Details" size="3xl">
	{#if current}
		<div class="space-y-5">
			<div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
				<div>
					<p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">
						{current.expenseNo}
					</p>
					<h3 class="text-xl font-black text-gray-900 dark:text-white">
						{expenseTypeLabel(current.expenseType)}
					</h3>
					<p class="text-sm text-gray-500 dark:text-slate-400">
						{current.departmentName} · {formatDate(current.date)}
					</p>
				</div>
				<Badge status={current.status} />
			</div>

			<div class="grid grid-cols-2 lg:grid-cols-4 gap-3">
				<DetailStat label="Amount" value={formatCurrency(current.amount)} />
				<DetailStat label="Tax" value={formatCurrency(current.taxAmount)} />
				<DetailStat label="Total" value={formatCurrency(current.totalAmount)} tone="blue" />
				<DetailStat label="Budget" value={current.budgetNo || '—'} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
				<DetailField label="Description" value={current.description} />
				<DetailField label="Category" value={current.category} />
				<DetailField label="Expense Account" value={`${current.accountCode} — ${current.accountName}`} />
				<DetailField label="Paid To" value={current.paidTo || '—'} />
				{#if current.employeeName}
					<DetailField label="Employee" value={current.employeeName} />
				{/if}
				{#if current.supplierName}
					<DetailField label="Supplier / Vendor" value={current.supplierName} />
				{/if}
				<DetailField label="Payment" value={`${current.paymentMethod} · ${current.bankAccount}`} />
				<DetailField label="Attachment" value={current.attachmentUrl || '—'} />
				<DetailField label="Submitted By" value={current.submittedBy || '—'} />
				<DetailField label="Approved By" value={current.approvedBy || '—'} />
				{#if current.status === 'posted'}
					<DetailField label="Posted At" value={formatDate(current.postedAt)} />
					<DetailField label="GL Reference" value={current.glReference} mono />
				{/if}
			</div>

			{#if current.notes}
				<div class="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-3">
					<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Notes</p>
					<p class="mt-1 text-sm text-gray-700 dark:text-slate-300">{current.notes}</p>
				</div>
			{/if}

			{#if errorMessage}
				<p class="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
			{/if}

			<details class="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-3">
				<summary class="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">
					API payload preview — POST /api/expenses
				</summary>
				<pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-emerald-300 text-[11px] p-3">{JSON.stringify(payload, null, 2)}</pre>
			</details>
		</div>
	{:else}
		<p class="text-sm text-gray-500 dark:text-slate-400">Expense not found.</p>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
		{#if current}
			{#if current.status === 'draft' || current.status === 'rejected'}
				<Button variant="primary" on:click={() => runAction('submit')} disabled={working}>
					Submit for Approval
				</Button>
			{/if}
			{#if current.status === 'submitted'}
				<ApprovalActions
					rejectFirst
					disabled={working}
					onApprove={() => runAction('approve')}
					onReject={() => runAction('reject')}
				/>
			{/if}
			{#if current.status === 'approved'}
				<Button variant="success" on:click={() => runAction('post')} disabled={working}>Post to GL</Button>
			{/if}
		{/if}
	</svelte:fragment>
</Modal>
