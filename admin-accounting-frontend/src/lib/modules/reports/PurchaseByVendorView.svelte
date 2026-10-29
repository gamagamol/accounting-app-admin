<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'company_name', label: 'Vendor / Supplier', sortable: true },
		{ key: 'order_count', label: 'PO Count', align: 'center', sortable: true },
		{ key: 'total_purchase', label: 'Total Purchases', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'invoiced', label: 'Invoiced', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'paid', label: 'Paid', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'outstanding', label: 'Outstanding', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => [
		{ label: 'Total Purchases', value: formatCurrency(sumBy(rows, 'total_purchase')), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Total Invoiced', value: formatCurrency(sumBy(rows, 'invoiced')), tone: 'text-indigo-700 dark:text-indigo-400' },
		{ label: 'Total Paid', value: formatCurrency(sumBy(rows, 'paid')), tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Outstanding Payables', value: formatCurrency(sumBy(rows, 'outstanding')), tone: 'text-rose-700 dark:text-rose-400' }
	];
</script>

<LiveReport
	slug="purchase-by-vendor"
	{columns}
	{summary}
	searchPlaceholder="Search vendor..."
	searchKeys={['company_name', 'supplier_code']}
	emptyMessage="No purchase data yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'company_name'}
			<span class="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
		{:else if column.key === 'outstanding'}
			<span class="font-mono font-bold {Number(value) > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-gray-500 dark:text-slate-400'}">
				{formatCurrency(value)}
			</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
