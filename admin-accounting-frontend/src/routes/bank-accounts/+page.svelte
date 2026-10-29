<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { bankAccounts, bankAccountActions } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Account Code', sortable: true },
		{ key: 'bankName', label: 'Bank / Cash Name', sortable: true },
		{ key: 'accountNumber', label: 'Account Number' },
		{ key: 'accountHolder', label: 'Account Holder' },
		{ key: 'currency', label: 'Currency', align: 'center' },
		{ key: 'balance', label: 'Balance', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Account Code', type: 'text', required: true, placeholder: 'BCA-001' },
		{ key: 'bankName', label: 'Bank / Cash Name', type: 'text', required: true },
		{ key: 'accountNumber', label: 'Account Number', type: 'text' },
		{ key: 'accountHolder', label: 'Account Holder', type: 'text' },
		{
			key: 'currency',
			label: 'Currency',
			type: 'select',
			options: [
				{ value: 'IDR', label: 'IDR - Indonesian Rupiah' },
				{ value: 'USD', label: 'USD - US Dollar' },
				{ value: 'SGD', label: 'SGD - Singapore Dollar' }
			]
		},
		{ key: 'balance', label: 'Current Balance', type: 'currency' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await bankAccountActions.update(id, payload);
			else await bankAccountActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save bank account.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await bankAccountActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete bank account.');
		}
	}
</script>

<EntityManager
	title="Bank & Cash Accounts"
	description="Manage company bank accounts and cash boxes used for receipts, payments and reconciliation."
	entityName="account"
	{columns}
	{fields}
	data={$bankAccounts}
	searchKeys={['code', 'bankName', 'accountNumber', 'accountHolder', 'currency']}
	searchPlaceholder="Search bank accounts..."
	createLabel="Add Account"
	displayKey="bankName"
	onSave={handleSave}
	onDelete={handleDelete}
/>
