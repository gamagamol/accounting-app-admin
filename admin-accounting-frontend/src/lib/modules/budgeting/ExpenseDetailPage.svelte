<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import DetailStat from '$lib/components/ui/DetailStat.svelte';
	import DetailField from '$lib/components/ui/DetailField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { expenses, expenseActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import { expenseTypeLabel } from '$lib/data/accounting-options';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { getErrorMessage } from '$lib/utils/errors';

	export let expenseId: string;

	let working = false;
	let errorMessage = '';

	$: current = $expenses.find((item) => item.id === expenseId) ?? null;

	async function runAction(action: 'submit' | 'approve' | 'reject' | 'post') {
		if (!current) return;
		working = true;
		errorMessage = '';
		const before = current as unknown as Record<string, unknown>;
		const actor = $user?.name || 'Expense Approver';
		try {
			if (action === 'submit') {
				await expensesApi.submit(current.id, actor);
				expenseActions.submit(current.id, actor);
			} else if (action === 'approve') {
				await expensesApi.approve(current.id, { approvedBy: actor });
				expenseActions.approve(current.id, actor);
			} else if (action === 'reject') {
				await expensesApi.reject(current.id, { approvedBy: actor });
				expenseActions.reject(current.id, actor);
			} else {
				await expensesApi.post(current.id, { postedBy: actor });
				expenseActions.post(current.id);
			}

			const nextStatus =
				action === 'submit' ? 'pending' : action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'completed';
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'expense_entry',
				entityId: current.id,
				documentNumber: current.expenseNo,
				action,
				actor,
				summary: `${action === 'submit' ? 'Submitted' : action === 'approve' ? 'Approved' : action === 'reject' ? 'Rejected' : 'Posted'} expense ${current.expenseNo}.`,
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
		if (!confirm(`Delete expense ${current.expenseNo}? This action cannot be undone.`)) return;
		try {
			await expensesApi.delete(current.id);
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'expense_entry',
				entityId: current.id,
				documentNumber: current.expenseNo,
				action: 'delete',
				actor: $user?.name || 'Expense Owner',
				summary: `Deleted expense ${current.expenseNo}.`,
				before: current as unknown as Record<string, unknown>
			});
			expenseActions.delete(current.id);
			goto('/expenses');
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Failed to delete expense.');
		}
	}
</script>

<TransactionPageShell
	title="Expense Entry Details"
	description="Review the expense, continue its approval workflow, and inspect the audit trail."
	backHref="/expenses"
	backLabel="Back to expense entries"
	eyebrow="Budgeting / Expense Entry"
	documentNumber={current?.expenseNo ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/expenses/${current.id}/edit`}>Edit</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if current}
		<div class="space-y-5">
			<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
					<div>
						<p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">{current.expenseNo}</p>
						<h3 class="text-xl font-black text-gray-900 dark:text-white">{expenseTypeLabel(current.expenseType)}</h3>
						<p class="text-sm text-gray-500 dark:text-slate-400">{current.departmentName} · {formatDate(current.date)}</p>
					</div>
					<Badge status={current.status} />
				</div>

				<div class="mt-5 grid grid-cols-2 gap-3 lg:grid-cols-4">
					<DetailStat label="Amount" value={formatCurrency(current.amount)} />
					<DetailStat label="Tax" value={formatCurrency(current.taxAmount)} />
					<DetailStat label="Total" value={formatCurrency(current.totalAmount)} tone="blue" />
					<DetailStat label="Budget" value={current.budgetNo || '—'} />
				</div>

				<div class="mt-4 grid grid-cols-1 gap-3 text-sm sm:grid-cols-2">
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
					{#if current.status === 'completed'}
						<DetailField label="Posted At" value={formatDate(current.postedAt)} />
						<DetailField label="GL Reference" value={current.glReference} mono />
					{/if}
				</div>

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

			{#if current.status === 'approved'}
				<div class="flex flex-wrap items-center justify-end gap-2 rounded-2xl border border-gray-200 bg-white p-4 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<Button variant="success" on:click={() => runAction('post')} disabled={working}>Post to GL</Button>
				</div>
			{/if}
		</div>

		<PendingApprovalPanel
			transactionType="expense"
			transactionId={current.id}
			transactionNumber={current.expenseNo}
			status={current.status}
		/>

		<AuditLogPanel entityType="expense_entry" entityId={current.id} />
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Expense not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
