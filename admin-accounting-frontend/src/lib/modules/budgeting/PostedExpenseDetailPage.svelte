<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import { expenses } from '$lib/stores/dataStore';
	import { expenseStatusOptions, expenseTypeOptions } from '$lib/data/accounting-options';
	import type { FieldDef } from '$lib/types/entity';

	export let expenseId: string;

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
</script>

<EntityDetailPage
	title="Posted Expense Detail"
	description="Review the expense that has been posted to the general ledger and inspect its audit trail on this dedicated page."
	backHref="/posted-expenses"
	backLabel="Back to posted expenses"
	eyebrow="Budgeting / Posted Expenses"
	{fields}
	row={current}
	documentNumber={current?.expenseNo ?? ''}
	auditEntityType="expense_entry"
	auditEntityId={current?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if current}
			<Button variant="secondary" href={`/expenses/${current.id}`}>Open Expense</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
