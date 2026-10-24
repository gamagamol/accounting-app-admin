<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import { expenses, expenseActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import { expenseStatusOptions, expenseTypeOptions } from '$lib/data/accounting-options';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { FieldDef } from '$lib/types/entity';

	export let expenseId: string;

	let working = false;

	$: current = $expenses.find((item) => item.id === expenseId) ?? null;

	const fields: FieldDef[] = [
		{ key: 'expenseNo', label: 'Expense No' },
		{ key: 'date', label: 'Expense Date', type: 'date' },
		{
			key: 'expenseType',
			label: 'Expense Type',
			type: 'select',
			options: expenseTypeOptions.map((option) => ({ value: option.value, label: option.label }))
		},
		{ key: 'category', label: 'Category' },
		{ key: 'departmentName', label: 'Department' },
		{ key: 'budgetNo', label: 'Budget' },
		{ key: 'description', label: 'Description', colSpan: 'full' },
		{ key: 'accountCode', label: 'Expense Account Code' },
		{ key: 'accountName', label: 'Expense Account Name' },
		{ key: 'paidTo', label: 'Paid To' },
		{ key: 'amount', label: 'Amount', type: 'currency' },
		{ key: 'taxAmount', label: 'Tax / PPN', type: 'currency' },
		{ key: 'totalAmount', label: 'Total', type: 'currency' },
		{ key: 'paymentMethod', label: 'Payment Method' },
		{ key: 'bankAccount', label: 'Bank / Cash Account' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			options: expenseStatusOptions.map((option) => ({ value: option.value, label: option.label })),
			badgeLabels: Object.fromEntries(expenseStatusOptions.map((option) => [option.value, option.label]))
		},
		{ key: 'submittedBy', label: 'Submitted By' },
		{ key: 'approvedBy', label: 'Approved By' },
		{ key: 'postedAt', label: 'Posted At', type: 'date' },
		{ key: 'glReference', label: 'GL Reference' },
		{ key: 'notes', label: 'Notes', colSpan: 'full' }
	];

	async function decide(decision: 'approve' | 'reject' | 'post') {
		if (!current) return;
		const before = { ...current } as unknown as Record<string, unknown>;
		working = true;
		try {
			if (decision === 'approve') {
				await expensesApi.approve(current.id, { approvedBy: $user?.name });
				expenseActions.approve(current.id, $user?.name);
			} else if (decision === 'reject') {
				await expensesApi.reject(current.id, { approvedBy: $user?.name });
				expenseActions.reject(current.id, $user?.name);
			} else {
				await expensesApi.post(current.id, { postedBy: $user?.name });
				expenseActions.post(current.id);
			}
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'expense_entry',
				entityId: current.id,
				documentNumber: current.expenseNo,
				action: decision,
				actor: $user?.name || 'Finance Approver',
				summary: `${decision === 'approve' ? 'Approved' : decision === 'reject' ? 'Rejected' : 'Posted'} expense ${current.expenseNo}.`,
				before,
				after: { ...current, status: decision === 'approve' ? 'approved' : decision === 'reject' ? 'rejected' : 'completed' } as unknown as Record<string, unknown>
			});
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to update expense status.'));
		} finally {
			working = false;
		}
	}
</script>

<EntityDetailPage
	title="Expense Approval Detail"
	description="Review the submitted expense, take an approval decision, and inspect its audit trail on this dedicated page."
	backHref="/expense-approval"
	backLabel="Back to expense approval"
	eyebrow="Budgeting / Expense Approval"
	{fields}
	row={current}
	documentNumber={current?.expenseNo ?? ''}
	auditEntityType="expense_entry"
	auditEntityId={current?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/expenses/${current.id}`}>Open Expense</Button>
			{#if current.status === 'approved'}
				<Button variant="primary" disabled={working} on:click={() => decide('post')}>Post to GL</Button>
			{/if}
			<Button variant="secondary" on:click={() => goto('/expense-approval')}>Close</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
