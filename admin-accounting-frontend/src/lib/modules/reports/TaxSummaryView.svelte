<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { salesOrders, purchaseOrders, taxRates } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface TaxRow {
		docNo: string;
		date: string;
		type: 'Output VAT' | 'Input VAT';
		counterparty: string;
		base: number;
		rate: number;
		tax: number;
		total: number;
	}

	const vatRate = ($taxRates.find((t) => t.type === 'sales')?.rate ?? 11) / 100;

	$: taxRows = [
		...$salesOrders.map((so) => ({
			docNo: so.salesNo,
			date: so.date,
			type: 'Output VAT' as const,
			counterparty: so.customerName,
			base: so.subtotal,
			rate: so.subtotal > 0 ? Math.round((so.tax / so.subtotal) * 1000) / 10 : vatRate * 100,
			tax: so.tax,
			total: so.total
		})),
		...$purchaseOrders.map((po) => ({
			docNo: po.purchaseNo,
			date: po.date,
			type: 'Input VAT' as const,
			counterparty: po.supplierName,
			base: po.subtotal,
			rate: po.subtotal > 0 ? Math.round((po.tax / po.subtotal) * 1000) / 10 : vatRate * 100,
			tax: po.tax,
			total: po.total
		}))
	].sort((a, b) => b.date.localeCompare(a.date));

	$: outputVat = taxRows.filter((r) => r.type === 'Output VAT').reduce((s, r) => s + r.tax, 0);
	$: inputVat = taxRows.filter((r) => r.type === 'Input VAT').reduce((s, r) => s + r.tax, 0);
	$: netVat = outputVat - inputVat;
	$: totalBase = taxRows.reduce((s, r) => s + r.base, 0);

	const columns: TableColumn[] = [
		{ key: 'docNo', label: 'Document No', sortable: true },
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'type', label: 'Tax Type', align: 'center', sortable: true },
		{ key: 'counterparty', label: 'Counterparty', sortable: true },
		{ key: 'base', label: 'Tax Base (DPP)', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'rate', label: 'Rate', align: 'center', format: (v) => `${v}%` },
		{ key: 'tax', label: 'VAT Amount', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	$: metrics = [
		{ label: 'Total Tax Base (DPP)', value: formatCurrency(totalBase), tone: 'text-gray-900 dark:text-white' },
		{ label: 'Output VAT (Sales)', value: formatCurrency(outputVat), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Input VAT (Purchases)', value: formatCurrency(inputVat), tone: 'text-amber-700 dark:text-amber-400' },
		{ label: netVat >= 0 ? 'Net VAT Payable' : 'Net VAT Creditable', value: formatCurrency(Math.abs(netVat)), tone: netVat >= 0 ? 'text-rose-700 dark:text-rose-400' : 'text-emerald-700 dark:text-emerald-400' }
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

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Tax Summary</Button>
	</div>

	<DataTable {columns} data={taxRows} searchPlaceholder="Search document or counterparty..." searchKeys={['docNo', 'counterparty', 'type']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'docNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'type'}
				<span class="px-2 py-0.5 rounded-full text-xs font-semibold border {value === 'Output VAT' ? 'bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20' : 'bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20'}">
					{value}
				</span>
			{:else if column.key === 'tax'}
				<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(value)}</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
