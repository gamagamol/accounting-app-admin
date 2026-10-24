<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { journalEntries, journalActions, chartOfAccounts } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Journal Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'reference', label: 'Reference', sortable: true },
		{ key: 'description', label: 'Description' },
		{ key: 'debitAccount', label: 'Debit Account' },
		{ key: 'creditAccount', label: 'Credit Account' },
		{ key: 'amount', label: 'Amount', align: 'right', sortable: true, format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	$: accountOptions = $chartOfAccounts.map((account) => ({
		value: `${account.code} ${account.name}`,
		label: `${account.code} — ${account.name}`
	}));

	$: fields = [
		{ key: 'date', label: 'Journal Date', type: 'date', required: true },
		{ key: 'reference', label: 'Reference', type: 'text', placeholder: 'JE/2024/001' },
		{ key: 'description', label: 'Description', type: 'textarea', colSpan: 'full' },
		{ key: 'debitAccount', label: 'Debit Account', type: 'select', options: accountOptions, required: true },
		{ key: 'creditAccount', label: 'Credit Account', type: 'select', options: accountOptions, required: true },
		{ key: 'amount', label: 'Amount', type: 'currency', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			defaultValue: 'draft',
			badgeLabels: Object.fromEntries(
				transactionStatusOptions.map((option) => [option.value, option.label])
			),
			options: transactionStatusOptions
		}
	] as FieldDef[];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) journalActions.update(id, payload);
		else journalActions.add(payload as any);
	}
</script>

<EntityManager
	title="Manual Journal Entry"
	description="Create balanced double-entry journals for adjustments, accruals and other manual postings."
	entityName="journal entry"
	{columns}
	{fields}
	data={$journalEntries}
	searchKeys={['reference', 'description', 'debitAccount', 'creditAccount', 'status']}
	searchPlaceholder="Search journal entries..."
	createLabel="New Journal Entry"
	displayKey="reference"
	pendingType="journal_entry"
	pendingNumberKey="reference"
	onSave={handleSave}
	onDelete={(id) => journalActions.delete(id)}
/>
