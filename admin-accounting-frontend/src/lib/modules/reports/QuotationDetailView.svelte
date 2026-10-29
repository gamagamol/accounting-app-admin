<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'quotation_number', label: 'Quotation No', sortable: true },
		{ key: 'document_date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customer_name', label: 'Customer', sortable: true },
		{ key: 'product_name', label: 'Item Name', sortable: true },
		{ key: 'quantity', label: 'Qty', align: 'center', sortable: true },
		{ key: 'uom_name', label: 'Unit', align: 'center' },
		{ key: 'unit_price', label: 'Unit Price', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'discount_percent', label: 'Discount', align: 'center', format: (v) => (Number(v) ? `${v}%` : '-') },
		{ key: 'total', label: 'Total Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => {
		const quotations = new Set(rows.map((row) => row.quotation_number));
		const products = new Set(rows.map((row) => row.product_name).filter(Boolean));
		return [
			{ label: 'Total Quotation Lines', value: formatCurrency(sumBy(rows, 'total')), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Quotations', value: String(quotations.size), tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Products', value: String(products.size), tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Line Items', value: String(rows.length), tone: 'text-gray-900 dark:text-white' }
		];
	};
</script>

<LiveReport
	slug="quotation-detail"
	{columns}
	{summary}
	searchPlaceholder="Search by quotation, product, or customer..."
	searchKeys={['quotation_number', 'customer_name', 'product_name']}
	emptyMessage="No quotations yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'quotation_number'}
			<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
				{value}
			</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
