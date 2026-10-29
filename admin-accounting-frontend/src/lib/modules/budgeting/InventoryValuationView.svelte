<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import LiveReport from '$lib/live/LiveReport.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'product_code', label: 'Product Code', sortable: true },
		{ key: 'product_name', label: 'Product', sortable: true },
		{ key: 'category_name', label: 'Category', sortable: true },
		{ key: 'uom_name', label: 'Unit', align: 'center' },
		{ key: 'stock', label: 'On Hand', align: 'right', sortable: true, format: (v) => formatNumber(v) },
		{ key: 'unit_cost', label: 'Unit Cost', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'inventory_value', label: 'Inventory Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => {
		const categories = new Set(rows.map((row) => row.category_name).filter(Boolean));
		return [
			{ label: 'Inventory Value', value: formatCurrency(sumBy(rows, 'inventory_value')), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Total Units', value: formatNumber(sumBy(rows, 'stock')), tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Product Categories', value: String(categories.size), tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Zero / Negative Stock', value: String(rows.filter((row) => Number(row.stock ?? 0) <= 0).length), tone: 'text-rose-700 dark:text-rose-400' }
		];
	};
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<PageHeader
			title="Inventory Valuation / Adjustment"
			description="Weighted-average inventory value by product. Use Stock Adjustment to correct quantity and valuation differences."
		/>
		<Button variant="secondary" href="/stock-adjustment">Open Stock Adjustment</Button>
	</div>

	<LiveReport
		slug="inventory-valuation"
		{columns}
		{summary}
		searchPlaceholder="Search product or category..."
		searchKeys={['product_code', 'product_name', 'category_name']}
		emptyMessage="No inventory valuation records found."
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'inventory_value'}
				<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
			{:else if column.key === 'stock' && Number(value) <= 0}
				<span class="font-mono font-bold text-rose-700 dark:text-rose-400">{formatNumber(value)}</span>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>
	</LiveReport>
</div>
