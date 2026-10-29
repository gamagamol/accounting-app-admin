<script lang="ts">
	import LiveReport from '$lib/live/LiveReport.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { sumBy } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'document_number', label: 'Invoice No', sortable: true },
		{ key: 'customer_name', label: 'Customer', sortable: true },
		{ key: 'due_date', label: 'Due Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'outstanding_amount', label: 'Outstanding', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'days_overdue', label: 'Days Overdue', align: 'center', sortable: true },
		{ key: 'aging_bucket', label: 'Aging Bucket', align: 'center', sortable: true }
	];

	const summary = (rows: Record<string, any>[]) => {
		const overdue = rows.filter((row) => Number(row.days_overdue ?? 0) > 0);
		const over90 = rows.filter((row) => Number(row.days_overdue ?? 0) > 90);
		return [
			{ label: 'Total Receivables', value: formatCurrency(sumBy(rows, 'outstanding_amount')), tone: 'text-gray-900 dark:text-white' },
			{ label: 'Overdue Invoices', value: String(overdue.length), tone: 'text-amber-700 dark:text-amber-400' },
			{ label: 'Over 90 Days', value: formatCurrency(sumBy(over90, 'outstanding_amount')), tone: 'text-rose-700 dark:text-rose-400' },
			{ label: 'Current', value: formatCurrency(sumBy(rows.filter((row) => Number(row.days_overdue ?? 0) <= 0), 'outstanding_amount')), tone: 'text-emerald-700 dark:text-emerald-400' }
		];
	};
</script>

<LiveReport
	slug="aging-schedule"
	{columns}
	{summary}
	searchPlaceholder="Search invoice or customer..."
	searchKeys={['document_number', 'customer_name', 'aging_bucket']}
	emptyMessage="No outstanding receivables."
>
	<svelte:fragment slot="cell" let:column let:value let:row>
		{#if column.key === 'document_number'}
			<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
				{value}
			</span>
		{:else if column.key === 'outstanding_amount'}
			<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
		{:else if column.key === 'days_overdue' && Number(value) > 0}
			<span class="font-mono font-bold text-rose-600 dark:text-rose-400">{value}</span>
		{:else if column.key === 'aging_bucket'}
			<Badge status={value === 'current' ? 'completed' : 'pending'} label={value} />
		{:else}
			{column.format ? column.format(value, row) : value ?? '-'}
		{/if}
	</svelte:fragment>
</LiveReport>
