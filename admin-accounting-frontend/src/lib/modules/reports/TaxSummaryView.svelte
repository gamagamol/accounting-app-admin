<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'source', label: 'Source', align: 'center', sortable: true },
		{ key: 'tax_code', label: 'Tax Code', sortable: true },
		{ key: 'tax_name', label: 'Tax Name', sortable: true },
		{ key: 'tax_amount', label: 'VAT Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => {
		const output = rows
			.filter((row) => row.source === 'sales')
			.reduce((sum, row) => sum + Number(row.tax_amount ?? 0), 0);
		const input = rows
			.filter((row) => row.source === 'purchase')
			.reduce((sum, row) => sum + Number(row.tax_amount ?? 0), 0);
		const net = output - input;
		return [
			{ label: 'Output VAT (Sales)', value: formatCurrency(output), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Input VAT (Purchases)', value: formatCurrency(input), tone: 'text-amber-700 dark:text-amber-400' },
			{ label: net >= 0 ? 'Net VAT Payable' : 'Net VAT Creditable', value: formatCurrency(Math.abs(net)), tone: net >= 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Tax Lines', value: String(rows.length), tone: 'text-gray-900 dark:text-white' }
		];
	};
</script>

<LiveReport
	slug="tax-summary"
	{columns}
	{summary}
	searchPlaceholder="Search tax code or name..."
	searchKeys={['source', 'tax_code', 'tax_name']}
	emptyMessage="No tax transactions yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'source'}
			<span class="rounded-full border px-2 py-0.5 text-xs font-semibold {value === 'sales' ? 'border-blue-200 bg-blue-50 text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300' : 'border-amber-200 bg-amber-50 text-amber-700 dark:border-amber-500/20 dark:bg-amber-500/10 dark:text-amber-300'}">
				{value === 'sales' ? 'Output VAT' : 'Input VAT'}
			</span>
		{:else if column.key === 'tax_amount'}
			<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
