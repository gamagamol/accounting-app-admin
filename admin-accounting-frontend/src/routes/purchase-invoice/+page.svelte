<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { purchaseInvoices, purchaseInvoiceActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'invoiceNo', label: 'Invoice No', sortable: true },
		{ key: 'date', label: 'Invoice Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'purchaseNo', label: 'PO Reference', sortable: true },
		{ key: 'supplierName', label: 'Vendor', sortable: true },
		{ key: 'dueDate', label: 'Due Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'amount', label: 'Amount', align: 'right', sortable: true, format: (v) => formatCurrency(Number(v) || 0) },
		{ key: 'status', label: 'Status', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'invoiceNo', label: 'Vendor Invoice No', type: 'text', required: true, placeholder: 'PI/2024/001' },
		{ key: 'date', label: 'Invoice Date', type: 'date', required: true },
		{ key: 'purchaseNo', label: 'Purchase Order Reference', type: 'text' },
		{ key: 'supplierName', label: 'Vendor Name', type: 'text', required: true },
		{ key: 'dueDate', label: 'Due Date', type: 'date', required: true },
		{ key: 'amount', label: 'Invoice Amount', type: 'currency', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { pending: 'Pending', paid: 'Paid', overdue: 'Overdue' },
			options: [
				{ value: 'pending', label: 'Pending' },
				{ value: 'paid', label: 'Paid' },
				{ value: 'overdue', label: 'Overdue' }
			]
		},
		{ key: 'preparedBy', label: 'Prepared By', type: 'text' }
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) purchaseInvoiceActions.update(id, payload);
		else purchaseInvoiceActions.add(payload as any);
	}
</script>

<EntityManager
	title="Purchase Invoice"
	description="Record vendor invoices, monitor due dates and track payable settlement status."
	entityName="purchase invoice"
	{columns}
	{fields}
	data={$purchaseInvoices}
	searchKeys={['invoiceNo', 'purchaseNo', 'supplierName', 'status', 'preparedBy']}
	searchPlaceholder="Search purchase invoices..."
	createLabel="Add Purchase Invoice"
	displayKey="invoiceNo"
	onSave={handleSave}
	onDelete={(id) => purchaseInvoiceActions.delete(id)}
>
	<svelte:fragment slot="extra-actions" let:row>
		{#if row.status !== 'paid'}
			<button
				type="button"
				class="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200"
				title="Mark invoice as paid"
				on:click={() => purchaseInvoiceActions.markPaid(row.id)}
			>
				Mark Paid
			</button>
		{/if}
	</svelte:fragment>
</EntityManager>
