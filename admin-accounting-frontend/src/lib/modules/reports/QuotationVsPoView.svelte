<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { quotations, salesOrders } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface QuotationVsPoRow {
		quotationNo: string;
		customerName: string;
		quotationDate: string;
		quotationTotal: number;
		salesNo: string;
		salesDate: string;
		salesTotal: number;
		variance: number;
		status: string;
	}

	$: reportData = $quotations.map((q) => {
		const matchedSO = $salesOrders.find(
			(s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId
		);
		const salesTotal = matchedSO ? matchedSO.total : 0;
		const variance = salesTotal - q.total;

		return {
			quotationNo: q.quotationNo,
			customerName: q.customerName,
			quotationDate: q.date,
			quotationTotal: q.total,
			salesNo: matchedSO ? matchedSO.salesNo : '-',
			salesDate: matchedSO ? matchedSO.date : '-',
			salesTotal,
			variance,
			status: matchedSO ? 'Won (SO Issued)' : 'Pending Quotation'
		};
	});

	$: totalQuotation = reportData.reduce((sum, r) => sum + r.quotationTotal, 0);
	$: totalSales = reportData.reduce((sum, r) => sum + r.salesTotal, 0);
	$: conversionRate = totalQuotation > 0 ? Math.round((totalSales / totalQuotation) * 100) : 0;

	const columns: TableColumn[] = [
		{ key: 'quotationNo', label: 'Quotation No', sortable: true },
		{ key: 'customerName', label: 'Customer Name', sortable: true },
		{ key: 'quotationDate', label: 'Quotation Date' },
		{ key: 'quotationTotal', label: 'Quotation Value', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'salesNo', label: 'SO No (Actual)' },
		{ key: 'salesTotal', label: 'SO Value', align: 'right', sortable: true, format: (v) => (v > 0 ? formatCurrency(v) : '-') },
		{ key: 'status', label: 'Deal Status', align: 'center', sortable: true }
	];

	$: metrics = [
		{ label: 'Total Quotation Value', value: formatCurrency(totalQuotation), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Total Sales Order Realization', value: formatCurrency(totalSales), tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Sales Conversion Rate', value: `${conversionRate}%`, tone: 'text-indigo-700 dark:text-indigo-400' }
	];
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		{#each metrics as metric}
			<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
				<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">{metric.label}</span>
				<p class="text-xl font-bold {metric.tone} mt-1 font-mono">{metric.value}</p>
			</div>
		{/each}
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Report</Button>
	</div>

	<DataTable
		{columns}
		data={reportData}
		searchPlaceholder="Search by quotation number or customer..."
		searchKeys={['quotationNo', 'customerName', 'salesNo']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'quotationNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'salesNo' && value !== '-'}
				<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge status={value.includes('Won') ? 'completed' : 'pending'} label={value} />
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
