<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { quotations } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface QuotationDetailItem {
		quotationNo: string;
		date: string;
		customerName: string;
		productName: string;
		quantity: number;
		unit: string;
		unitPrice: number;
		discount: number;
		total: number;
	}

	$: detailRows = $quotations.flatMap((q) =>
		q.items.map((item) => ({
			quotationNo: q.quotationNo,
			date: q.date,
			customerName: q.customerName,
			productName: item.productName,
			quantity: item.quantity,
			unit: item.unit,
			unitPrice: item.unitPrice,
			discount: item.discount,
			total: item.total
		}))
	);

	const columns: TableColumn[] = [
		{ key: 'quotationNo', label: 'Quotation No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'productName', label: 'Item Name', sortable: true },
		{ key: 'quantity', label: 'Qty', align: 'center', sortable: true },
		{ key: 'unit', label: 'Unit', align: 'center' },
		{ key: 'unitPrice', label: 'Unit Price', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'discount', label: 'Discount', align: 'center', format: (v) => (v ? `${v}%` : '-') },
		{ key: 'total', label: 'Total Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center gap-3 flex-wrap">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			Line-item breakdown of every quotation issued.
		</p>
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Detail Report</Button>
	</div>

	<DataTable
		{columns}
		data={detailRows}
		searchPlaceholder="Search by quotation, product, or customer..."
		searchKeys={['quotationNo', 'customerName', 'productName']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'quotationNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
