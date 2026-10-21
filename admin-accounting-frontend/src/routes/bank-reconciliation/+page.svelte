<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { bankReconciliations, bankReconciliationActions, bankAccounts } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Statement Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'bankAccount', label: 'Bank Account', sortable: true },
		{
			key: 'statementBalance',
			label: 'Statement Balance',
			align: 'right',
			sortable: true,
			format: (v) => formatCurrency(Number(v) || 0)
		},
		{
			key: 'glBalance',
			label: 'GL Balance',
			align: 'right',
			sortable: true,
			format: (v) => formatCurrency(Number(v) || 0)
		},
		{
			key: 'difference',
			label: 'Difference',
			align: 'right',
			sortable: true,
			format: (v) => formatCurrency(Number(v) || 0)
		},
		{ key: 'status', label: 'Status', align: 'center' }
	];

	$: bankOptions = $bankAccounts.map((account) => ({
		value: `${account.bankName} ${account.accountNumber}`,
		label: `${account.bankName} — ${account.accountNumber}`
	}));

	$: fields = [
		{ key: 'date', label: 'Statement Date', type: 'date', required: true },
		{ key: 'bankAccount', label: 'Bank Account', type: 'select', options: bankOptions },
		{ key: 'statementBalance', label: 'Statement Balance', type: 'currency', required: true },
		{ key: 'glBalance', label: 'GL Balance', type: 'currency', required: true },
		{ key: 'difference', label: 'Difference', type: 'currency' },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { reconciled: 'Reconciled', discrepancy: 'Discrepancy' },
			options: [
				{ value: 'reconciled', label: 'Reconciled' },
				{ value: 'discrepancy', label: 'Discrepancy' }
			]
		}
	] as FieldDef[];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) bankReconciliationActions.update(id, payload);
		else bankReconciliationActions.add(payload as any);
	}
</script>

<EntityManager
	title="Bank Reconciliation"
	description="Compare bank statement balances with the general ledger and resolve differences."
	entityName="reconciliation"
	{columns}
	{fields}
	data={$bankReconciliations}
	searchKeys={['bankAccount', 'status']}
	searchPlaceholder="Search reconciliations..."
	createLabel="Add Reconciliation"
	displayKey="bankAccount"
	onSave={handleSave}
	onDelete={(id) => bankReconciliationActions.delete(id)}
>
	<svelte:fragment slot="extra-actions" let:row>
		{#if row.status === 'discrepancy'}
			<button
				type="button"
				class="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200"
				title="Mark as reconciled"
				on:click={() => bankReconciliationActions.reconcile(row.id)}
			>
				Reconcile
			</button>
		{/if}
	</svelte:fragment>
</EntityManager>
