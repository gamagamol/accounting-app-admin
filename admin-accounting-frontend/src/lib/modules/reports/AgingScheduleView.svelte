<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { billPayments } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface AgingRow {
		invoiceNo: string;
		customerName: string;
		date: string;
		current: number;
		days1_30: number;
		days31_60: number;
		days61_90: number;
		daysOver90: number;
		total: number;
	}

	$: agingData = $billPayments.map((b, i) => {
		const amount = b.status === 'completed' ? 0 : b.amount;

		let current = 0;
		let days1_30 = 0;
		let days31_60 = 0;
		let days61_90 = 0;
		let daysOver90 = 0;

		if (i % 5 === 0) current = amount;
		else if (i % 5 === 1) days1_30 = amount;
		else if (i % 5 === 2) days31_60 = amount;
		else if (i % 5 === 3) days61_90 = amount;
		else daysOver90 = amount;

		return {
			invoiceNo: b.billNo,
			customerName: b.supplierName,
			date: b.date,
			current,
			days1_30,
			days31_60,
			days61_90,
			daysOver90,
			total: amount
		};
	});

	$: totalAll = agingData.reduce(
		(acc, row) => ({
			current: acc.current + row.current,
			days1_30: acc.days1_30 + row.days1_30,
			days31_60: acc.days31_60 + row.days31_60,
			days61_90: acc.days61_90 + row.days61_90,
			daysOver90: acc.daysOver90 + row.daysOver90,
			total: acc.total + row.total
		}),
		{ current: 0, days1_30: 0, days31_60: 0, days61_90: 0, daysOver90: 0, total: 0 }
	);

	const columns: TableColumn[] = [
		{ key: 'invoiceNo', label: 'Invoice No', sortable: true },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'date', label: 'Invoice Date', format: (v) => formatDate(v) },
		{ key: 'current', label: 'Not Yet Due', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'days1_30', label: '1 - 30 Days', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'days31_60', label: '31 - 60 Days', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'days61_90', label: '61 - 90 Days', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'daysOver90', label: '> 90 Days', align: 'right', format: (v) => formatCurrency(v) },
		{ key: 'total', label: 'Total Receivable', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	$: summaryCards = [
		{ key: 'current', label: 'Current', value: totalAll.current, tone: 'text-emerald-700 dark:text-emerald-400' },
		{ key: 'days1_30', label: '1 - 30 Days', value: totalAll.days1_30, tone: 'text-blue-700 dark:text-blue-400' },
		{ key: 'days31_60', label: '31 - 60 Days', value: totalAll.days31_60, tone: 'text-amber-700 dark:text-amber-400' },
		{ key: 'days61_90', label: '61 - 90 Days', value: totalAll.days61_90, tone: 'text-orange-700 dark:text-orange-400' },
		{ key: 'daysOver90', label: '> 90 Days (Doubtful)', value: totalAll.daysOver90, tone: 'text-rose-700 dark:text-rose-400' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
		{#each summaryCards as card}
			<div class="bg-white dark:bg-slate-900 p-3.5 rounded-xl border border-gray-200 dark:border-slate-800">
				<span class="text-[11px] font-semibold text-gray-500 dark:text-slate-400 uppercase">{card.label}</span>
				<p class="text-sm font-bold {card.tone} mt-1 font-mono">{formatCurrency(card.value)}</p>
			</div>
		{/each}
		<div class="bg-slate-900 dark:bg-slate-800 text-white p-3.5 rounded-xl border border-slate-900 dark:border-slate-700">
			<span class="text-[11px] font-semibold text-slate-400 uppercase">Total Receivables</span>
			<p class="text-sm font-bold text-white mt-1 font-mono">{formatCurrency(totalAll.total)}</p>
		</div>
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Aging Schedule</Button>
	</div>

	<DataTable
		{columns}
		data={agingData}
		searchPlaceholder="Search by invoice number or customer..."
		searchKeys={['invoiceNo', 'customerName']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'daysOver90' && value > 0}
				<span class="font-mono text-rose-600 dark:text-rose-400 font-bold bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded">
					{formatCurrency(value)}
				</span>
			{:else if column.key === 'total'}
				<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
