<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'quotation_number', label: 'Quotation No', sortable: true },
		{ key: 'customer_name', label: 'Customer Name', sortable: true },
		{ key: 'quotation_date', label: 'Quotation Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'quotation_total', label: 'Quotation Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'sales_order_number', label: 'SO No (Actual)' },
		{ key: 'sales_order_total', label: 'SO Value', align: 'right', sortable: true, format: (v) => (Number(v) > 0 ? formatCurrency(v) : '-') },
		{ key: 'variance', label: 'Variance', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'quotation_status', label: 'Deal Status', align: 'center', sortable: true }
	];

	const summary = (rows: Record<string, any>[]) => {
		const quotationTotal = sumBy(rows, 'quotation_total');
		const salesTotal = sumBy(rows, 'sales_order_total');
		const won = rows.filter((row) => row.sales_order_number).length;
		return [
			{ label: 'Total Quotation Value', value: formatCurrency(quotationTotal), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Sales Order Realization', value: formatCurrency(salesTotal), tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Sales Conversion Rate', value: quotationTotal > 0 ? `${Math.round((salesTotal / quotationTotal) * 100)}%` : '0%', tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Quotations Won', value: `${won} / ${rows.length}`, tone: 'text-cyan-700 dark:text-cyan-400' }
		];
	};
</script>

<LiveReport
	slug="quotation-vs-po"
	{columns}
	{summary}
	searchPlaceholder="Search by quotation number or customer..."
	searchKeys={['quotation_number', 'customer_name', 'sales_order_number']}
	emptyMessage="No quotations yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'quotation_number'}
			<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
				{value}
			</span>
		{:else if column.key === 'sales_order_number' && value}
			<span class="rounded border border-indigo-200 bg-indigo-50 px-2 py-0.5 font-mono font-bold text-indigo-700 dark:border-indigo-500/20 dark:bg-indigo-500/10 dark:text-indigo-300">
				{value}
			</span>
		{:else if column.key === 'quotation_status'}
			<Badge status={value} />
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
