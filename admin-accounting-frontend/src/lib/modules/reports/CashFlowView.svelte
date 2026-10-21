<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { payments, debtPayments, expenses } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface CashFlowRow {
		date: string;
		reference: string;
		description: string;
		category: 'Operating' | 'Investing' | 'Financing';
		inflow: number;
		outflow: number;
	}

	$: cashRows = [
		...$payments
			.filter((p) => p.status === 'paid')
			.map((p) => ({
				date: p.date,
				reference: p.paymentNo,
				description: `Customer receipt from ${p.customerName}`,
				category: 'Operating' as const,
				inflow: p.amount,
				outflow: 0
			})),
		...$debtPayments
			.filter((p) => p.status === 'paid')
			.map((p) => ({
				date: p.date,
				reference: p.paymentNo,
				description: `Vendor payment to ${p.supplierName}`,
				category: 'Operating' as const,
				inflow: 0,
				outflow: p.amount
			})),
		...$expenses.map((e) => ({
			date: e.date,
			reference: e.expenseNo,
			description: `${e.category}: ${e.description}`,
			category: 'Operating' as const,
			inflow: 0,
			outflow: e.amount
		}))
	].sort((a, b) => b.date.localeCompare(a.date));

	$: totalInflow = cashRows.reduce((s, r) => s + r.inflow, 0);
	$: totalOutflow = cashRows.reduce((s, r) => s + r.outflow, 0);
	$: netCashFlow = totalInflow - totalOutflow;

	$: operatingNet = cashRows
		.filter((r) => r.category === 'Operating')
		.reduce((s, r) => s + r.inflow - r.outflow, 0);

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'reference', label: 'Reference' },
		{ key: 'description', label: 'Description', sortable: true },
		{ key: 'category', label: 'Activity', align: 'center' },
		{ key: 'inflow', label: 'Cash In', align: 'right', sortable: true, format: (v) => (v > 0 ? formatCurrency(v) : '-') },
		{ key: 'outflow', label: 'Cash Out', align: 'right', sortable: true, format: (v) => (v > 0 ? formatCurrency(v) : '-') }
	];

	$: metrics = [
		{ label: 'Total Cash In', value: formatCurrency(totalInflow), tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Total Cash Out', value: formatCurrency(totalOutflow), tone: 'text-rose-700 dark:text-rose-400' },
		{ label: 'Net Cash Flow', value: formatCurrency(netCashFlow), tone: netCashFlow >= 0 ? 'text-blue-700 dark:text-blue-400' : 'text-rose-700 dark:text-rose-400' },
		{ label: 'Operating Cash Flow', value: formatCurrency(operatingNet), tone: operatingNet >= 0 ? 'text-indigo-700 dark:text-indigo-400' : 'text-rose-700 dark:text-rose-400' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
		{#each metrics as metric}
			<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
				<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{metric.label}</span>
				<p class="text-xl font-bold {metric.tone} mt-1 font-mono">{metric.value}</p>
			</div>
		{/each}
	</div>

	<div class="flex justify-between items-center gap-3 flex-wrap">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			Cash flow derived from customer receipts, vendor payments and operating expenses.
		</p>
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Cash Flow</Button>
	</div>

	<DataTable {columns} data={cashRows} searchPlaceholder="Search reference or description..." searchKeys={['reference', 'description', 'category']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'inflow' && value > 0}
				<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">+{formatCurrency(value)}</span>
			{:else if column.key === 'outflow' && value > 0}
				<span class="font-mono font-bold text-rose-700 dark:text-rose-400">-{formatCurrency(value)}</span>
			{:else if column.key === 'category'}
				<span class="px-2 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
