<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { stockMovements, products } from '$lib/stores/dataStore';
	import { formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface StockCardRow {
		id: string;
		date: string;
		docNo: string;
		type: string;
		reference: string;
		warehouse: string;
		inQty: number;
		outQty: number;
		balance: number;
		unit: string;
	}

	const productNames = Array.from(new Set($stockMovements.map((m) => m.productName)));
	let selectedProduct = productNames[0] || '';

	$: rows = (() => {
		const filtered = $stockMovements
			.filter((m) => m.productName === selectedProduct)
			.sort((a, b) => a.date.localeCompare(b.date));

		let running = 0;
		const result: StockCardRow[] = filtered.map((m) => {
			const inQty = m.type === 'IN' || (m.type === 'ADJUST' && m.quantity > 0) ? m.quantity : 0;
			const outQty = m.type === 'OUT' || m.type === 'ADJUST' ? Math.abs(Math.min(m.quantity, 0)) : 0;
			running += inQty - outQty;
			return {
				id: m.id,
				date: m.date,
				docNo: m.docNo,
				type: m.type,
				reference: m.reference,
				warehouse: m.warehouse,
				inQty,
				outQty,
				balance: running,
				unit: m.unit
			};
		});
		return result.reverse();
	})();

	$: totalIn = rows.reduce((s, r) => s + r.inQty, 0);
	$: totalOut = rows.reduce((s, r) => s + r.outQty, 0);
	$: currentProduct = $products.find((p) => p.name === selectedProduct);

	const columns: TableColumn[] = [
		{ key: 'date', label: 'Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'docNo', label: 'Document No', sortable: true },
		{ key: 'type', label: 'Type', align: 'center' },
		{ key: 'reference', label: 'Reference' },
		{ key: 'warehouse', label: 'Warehouse' },
		{ key: 'inQty', label: 'In', align: 'right', format: (v) => (v > 0 ? v : '-') },
		{ key: 'outQty', label: 'Out', align: 'right', format: (v) => (v > 0 ? v : '-') },
		{ key: 'balance', label: 'Balance', align: 'right', sortable: true }
	];
</script>

<div class="space-y-6">
	<div
		class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"
	>
		<div class="w-full sm:w-96">
			<label for="product" class="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1">Product</label>
			<select
				id="product"
				bind:value={selectedProduct}
				class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			>
				{#each productNames as name}
					<option value={name}>{name}</option>
				{/each}
			</select>
		</div>
		<div class="flex items-center gap-6 text-sm">
			<div>
				<span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">On Hand</span>
				<p class="font-mono font-bold text-gray-900 dark:text-white">{currentProduct?.stock ?? 0} {currentProduct?.unit ?? ''}</p>
			</div>
			<div>
				<span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Total In</span>
				<p class="font-mono font-bold text-emerald-700 dark:text-emerald-400">{totalIn}</p>
			</div>
			<div>
				<span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold">Total Out</span>
				<p class="font-mono font-bold text-rose-700 dark:text-rose-400">{totalOut}</p>
			</div>
			<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print</Button>
		</div>
	</div>

	<DataTable {columns} data={rows} searchPlaceholder="Search document or reference..." searchKeys={['docNo', 'reference', 'warehouse']}>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'docNo'}
				<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
					{value}
				</span>
			{:else if column.key === 'type'}
				<Badge status={value === 'IN' ? 'in' : value === 'OUT' ? 'out' : value === 'ADJUST' ? 'adjustment' : 'open'} label={value} />
			{:else if column.key === 'balance'}
				<span class="font-mono font-bold text-gray-900 dark:text-gray-100">{value} {row.unit}</span>
			{:else if column.key === 'inQty'}
				<span class="font-mono text-emerald-700 dark:text-emerald-400">{column.format ? column.format(value, row) : value}</span>
			{:else if column.key === 'outQty'}
				<span class="font-mono text-rose-700 dark:text-rose-400">{column.format ? column.format(value, row) : value}</span>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>
	</DataTable>
</div>
