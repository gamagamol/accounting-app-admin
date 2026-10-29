<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'company_name', label: 'Customer Company', sortable: true },
		{ key: 'city', label: 'City', sortable: true },
		{ key: 'invoice_count', label: 'Invoices', align: 'center', sortable: true },
		{ key: 'omzet', label: 'Total Revenue', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	const summary = (rows: Record<string, any>[]) => {
		const total = sumBy(rows, 'omzet');
		const top = [...rows].sort((a, b) => Number(b.omzet ?? 0) - Number(a.omzet ?? 0))[0];
		const active = rows.filter((row) => Number(row.omzet ?? 0) > 0);
		return [
			{ label: 'Total Company Revenue', value: formatCurrency(total), tone: 'text-blue-700 dark:text-blue-400' },
			{ label: 'Customers With Revenue', value: String(active.length), tone: 'text-indigo-700 dark:text-indigo-400' },
			{ label: 'Top Customer', value: top?.company_name ?? '-', tone: 'text-emerald-700 dark:text-emerald-400' },
			{ label: 'Top Customer Revenue', value: formatCurrency(Number(top?.omzet ?? 0)), tone: 'text-emerald-700 dark:text-emerald-400' }
		];
	};
</script>

<LiveReport
	slug="customer-omzet"
	{columns}
	{summary}
	searchPlaceholder="Search customer or city..."
	searchKeys={['company_name', 'city']}
	emptyMessage="No customer revenue yet."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'omzet'}
			<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
		{:else if column.key === 'company_name'}
			<span class="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
