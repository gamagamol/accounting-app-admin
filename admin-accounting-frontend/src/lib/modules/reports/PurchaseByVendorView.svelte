<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { purchaseOrders, purchaseInvoices } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface VendorRow {
		supplierName: string;
		orderCount: number;
		totalPurchase: number;
		invoiced: number;
		paid: number;
		outstanding: number;
	}

	$: vendorData = (() => {
		const map = new Map<string, VendorRow>();

		$purchaseOrders.forEach((po) => {
			const existing = map.get(po.supplierName) || {
				supplierName: po.supplierName,
				orderCount: 0,
				totalPurchase: 0,
				invoiced: 0,
				paid: 0,
				outstanding: 0
			};
			existing.orderCount += 1;
			existing.totalPurchase += po.total;
			map.set(po.supplierName, existing);
		});

		$purchaseInvoices.forEach((inv) => {
			const existing = map.get(inv.supplierName);
			if (!existing) return;
			existing.invoiced += inv.amount;
			if (inv.status === 'paid') existing.paid += inv.amount;
			else existing.outstanding += inv.amount;
		});

		return Array.from(map.values()).sort((a, b) => b.totalPurchase - a.totalPurchase);
	})();

	$: totalPurchase = vendorData.reduce((s, v) => s + v.totalPurchase, 0);
	$: totalInvoiced = vendorData.reduce((s, v) => s + v.invoiced, 0);
	$: totalPaid = vendorData.reduce((s, v) => s + v.paid, 0);
	$: totalOutstanding = vendorData.reduce((s, v) => s + v.outstanding, 0);

	const columns: TableColumn[] = [
		{ key: 'supplierName', label: 'Vendor / Supplier', sortable: true },
		{ key: 'orderCount', label: 'PO Count', align: 'center', sortable: true },
		{ key: 'totalPurchase', label: 'Total Purchases', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'invoiced', label: 'Invoiced', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'paid', label: 'Paid', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
		{ key: 'outstanding', label: 'Outstanding', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
	];

	$: metrics = [
		{ label: 'Total Purchases', value: formatCurrency(totalPurchase), tone: 'text-blue-700 dark:text-blue-400' },
		{ label: 'Total Invoiced', value: formatCurrency(totalInvoiced), tone: 'text-indigo-700 dark:text-indigo-400' },
		{ label: 'Total Paid', value: formatCurrency(totalPaid), tone: 'text-emerald-700 dark:text-emerald-400' },
		{ label: 'Outstanding Payables', value: formatCurrency(totalOutstanding), tone: 'text-rose-700 dark:text-rose-400' }
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
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Purchase by Vendor</Button>
	</div>

	<DataTable {columns} data={vendorData} searchPlaceholder="Search vendor..." searchKeys={['supplierName']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'supplierName'}
				<span class="font-semibold text-gray-900 dark:text-gray-100">{value}</span>
			{:else if column.key === 'outstanding'}
				<span class="font-mono font-bold {value > 0 ? 'text-rose-700 dark:text-rose-400' : 'text-gray-500 dark:text-slate-400'}">
					{formatCurrency(value)}
				</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
