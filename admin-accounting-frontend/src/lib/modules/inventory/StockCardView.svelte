<script lang="ts">
	import { onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	interface Layer {
		qty: number;
		cost: number;
	}
	interface Line extends Layer {
		total: number;
	}
	interface CardRow {
		row: ReportRow;
		ins: Line | null;
		outs: Line[];
		balance: Line[];
		balQty: number;
		balValue: number;
		short: boolean;
	}

	const sourceRoutes: Record<string, string> = {
		sales_order: 'sales',
		purchase_order: 'purchase',
		delivery: 'delivery',
		goods_receipt: 'goods',
		stock_adjustment: 'stock-adjustment'
	};

	let rows: ReportRow[] = [];
	let loading = true;
	let error = '';
	let selectedProduct = '';

	function referenceLabel(row: ReportRow): string {
		const type = String(row.reference_type ?? '');
		if (!type) return '-';
		return type.replace(/_/g, ' ').replace(/\b\w/g, (char) => char.toUpperCase());
	}

	function referenceHref(row: ReportRow): string | null {
		const type = String(row.reference_type ?? '');
		const id = row.reference_id;
		const route = sourceRoutes[type];
		return route && id ? `/${route}/${id}` : null;
	}

	// Unit cost of incoming stock. Adjust field names to match your API response.
	function costOf(row: ReportRow): number {
		const r = row as Record<string, unknown>;
		return Number(r.unit_cost ?? r.cost_price ?? r.unit_price ?? r.cost ?? r.price ?? 0) || 0;
	}

	const line = (qty: number, cost: number): Line => ({ qty, cost, total: qty * cost });

	function buildCard(list: ReportRow[]): CardRow[] {
		const layers: Layer[] = [];
		let lastCost = 0;
		const result: CardRow[] = [];

		for (const row of list) {
			const qty = Math.abs(Number(row.quantity ?? 0));
			let ins: Line | null = null;
			const outs: Line[] = [];
			let short = false;

			if (row.movement_type === 'IN') {
				const cost = costOf(row);
				lastCost = cost;
				ins = line(qty, cost);
				layers.push({ qty, cost });
			} else {
				// FIFO: consume the oldest layers first
				let remaining = qty;
				while (remaining > 0 && layers.length > 0) {
					const take = Math.min(remaining, layers[0].qty);
					outs.push(line(take, layers[0].cost));
					layers[0].qty -= take;
					remaining -= take;
					if (layers[0].qty <= 0) layers.shift();
				}
				if (remaining > 0) {
					// not enough stock (negative): fall back to the last known cost
					short = true;
					outs.push(line(remaining, lastCost));
				}
			}

			const balance = layers.map((l) => line(l.qty, l.cost));
			result.push({
				row,
				ins,
				outs,
				balance,
				balQty: balance.reduce((s, l) => s + l.qty, 0),
				balValue: balance.reduce((s, l) => s + l.total, 0),
				short
			});
		}
		return result;
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await getReport('stock-card');
			rows = Array.isArray(result.data) ? result.data : [];
			if (!selectedProduct && rows.length > 0) {
				selectedProduct = String(rows[0].product_name ?? '');
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load stock card report';
		} finally {
			loading = false;
		}
	}

	$: productNames = Array.from(
		new Set(rows.map((row) => String(row.product_name ?? '')).filter(Boolean))
	).sort();

	// Oldest first; on the same date, IN is processed before OUT to avoid false negative stock
	$: chronological = rows
		.map((row, index) => ({ row, index }))
		.filter(({ row }) => String(row.product_name ?? '') === selectedProduct)
		.sort((a, b) => {
			const d = String(a.row.document_date ?? '').localeCompare(String(b.row.document_date ?? ''));
			if (d !== 0) return d;
			const ai = a.row.movement_type === 'IN' ? 0 : 1;
			const bi = b.row.movement_type === 'IN' ? 0 : 1;
			return ai - bi || a.index - b.index;
		})
		.map(({ row }) => row);

	$: card = buildCard(chronological);
	$: last = card[card.length - 1];
	$: unit = String(chronological[0]?.uom_name ?? '');
	$: totalInQty = card.reduce((s, c) => s + (c.ins?.qty ?? 0), 0);
	$: totalInValue = card.reduce((s, c) => s + (c.ins?.total ?? 0), 0);
	$: totalOutQty = card.reduce((s, c) => s + c.outs.reduce((a, l) => a + l.qty, 0), 0);
	$: totalOutValue = card.reduce((s, c) => s + c.outs.reduce((a, l) => a + l.total, 0), 0);
	$: onHand = last?.balQty ?? 0;
	$: stockValue = last?.balValue ?? 0;
	$: hasCost = card.some((c) => (c.ins?.cost ?? 0) > 0);

	onMount(load);
</script>

<div class="space-y-6">
	<div class="flex flex-wrap items-center justify-between gap-3">
		<p class="text-xs text-gray-500 dark:text-slate-400">
			Stock card using the FIFO (First In, First Out) method, based on inventory movements.
		</p>
		<Button size="sm" variant="secondary" on:click={load} disabled={loading}>
			{loading ? 'Refreshing...' : 'Refresh'}
		</Button>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if !loading && rows.length > 0 && !hasCost}
		<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-xs text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
			The API does not return a unit cost for incoming stock (<code>unit_cost</code>), so all price and amount columns show 0.
		</div>
	{/if}

	<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
		<div class="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
			<div class="w-full lg:w-96">
				<label for="product" class="mb-1 block text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">Product</label>
				<select
					id="product"
					bind:value={selectedProduct}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-gray-100"
				>
					{#each productNames as name}
						<option value={name}>{name}</option>
					{/each}
				</select>
			</div>
			<div class="flex flex-wrap items-center gap-6 text-sm">
				<div>
					<span class="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">On Hand</span>
					<p class="font-mono font-bold text-gray-900 dark:text-white">{onHand} {unit}</p>
				</div>
				<div>
					<span class="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">Inventory Value</span>
					<p class="font-mono font-bold text-blue-700 dark:text-blue-300">{formatCurrency(stockValue)}</p>
				</div>
				<div>
					<span class="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">Total COGS</span>
					<p class="font-mono font-bold text-rose-700 dark:text-rose-400">{formatCurrency(totalOutValue)}</p>
				</div>
				<div>
					<span class="text-[11px] font-semibold uppercase text-gray-500 dark:text-slate-400">Movements</span>
					<p class="font-mono font-bold text-gray-900 dark:text-white">{card.length}</p>
				</div>
			</div>
		</div>
	</div>

	{#if loading && rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading stock card...
		</div>
	{:else if card.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			No inventory movements for this product.
		</div>
	{:else}
		<div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
			<table class="min-w-full border-collapse text-sm">
				<thead class="bg-gray-50 text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:bg-slate-800/60 dark:text-slate-400">
					<tr>
						<th rowspan="2" class="w-28 border-b border-gray-200 px-3 py-2 text-left dark:border-slate-700">Date</th>
						<th rowspan="2" class="min-w-[14rem] border-b border-gray-200 px-3 py-2 text-left dark:border-slate-700">Description</th>
						<th colspan="3" class="border-l border-gray-200 px-3 py-2 text-center text-emerald-700 dark:border-slate-700 dark:text-emerald-400">In</th>
						<th colspan="3" class="border-l border-gray-200 px-3 py-2 text-center text-rose-700 dark:border-slate-700 dark:text-rose-400">Out</th>
						<th colspan="3" class="border-l border-gray-200 px-3 py-2 text-center text-blue-700 dark:border-slate-700 dark:text-blue-300">Balance</th>
					</tr>
					<tr class="border-b border-gray-200 dark:border-slate-700">
						{#each [0, 1, 2] as _}
							<th class="border-l border-gray-200 px-3 py-1.5 text-right dark:border-slate-700">Qty</th>
							<th class="px-3 py-1.5 text-right">Unit Cost</th>
							<th class="px-3 py-1.5 text-right">Amount</th>
						{/each}
					</tr>
				</thead>

				<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
					{#each card as c}
						<tr class="align-top hover:bg-gray-50 dark:hover:bg-slate-800/30">
							<td class="px-3 py-2 text-gray-900 dark:text-white">{formatDate(c.row.document_date)}</td>

							<td class="px-3 py-2">
								<div class="flex flex-wrap items-center gap-2">
									<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
										{c.row.document_number}
									</span>
									<Badge status={c.row.movement_type === 'IN' ? 'in' : 'out'} label={String(c.row.movement_type)} />
								</div>
								<div class="mt-1 text-xs text-gray-500 dark:text-slate-400">
									{#if referenceHref(c.row)}
										<a href={referenceHref(c.row)} class="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
											{referenceLabel(c.row)}
										</a>
									{:else}
										{referenceLabel(c.row)}
									{/if}
									{#if c.row.warehouse_name}
										<span class="opacity-60"> • </span>{c.row.warehouse_name}
									{/if}
									{#if c.short}
										<span class="ml-1 font-semibold text-rose-600 dark:text-rose-300">(insufficient stock)</span>
									{/if}
								</div>
							</td>

							<!-- In -->
							<td class="border-l border-gray-100 px-3 py-2 text-right font-mono text-emerald-700 dark:border-slate-800 dark:text-emerald-400">
								{c.ins ? c.ins.qty : ''}
							</td>
							<td class="px-3 py-2 text-right font-mono text-gray-700 dark:text-slate-200">
								{c.ins ? formatCurrency(c.ins.cost) : ''}
							</td>
							<td class="px-3 py-2 text-right font-mono text-gray-800 dark:text-slate-100">
								{c.ins ? formatCurrency(c.ins.total) : ''}
							</td>

							<!-- Out (may span several FIFO layers) -->
							<td class="border-l border-gray-100 px-3 py-2 text-right font-mono text-rose-700 dark:border-slate-800 dark:text-rose-400">
								{#each c.outs as l}<div>{l.qty}</div>{/each}
							</td>
							<td class="px-3 py-2 text-right font-mono text-gray-700 dark:text-slate-200">
								{#each c.outs as l}<div>{formatCurrency(l.cost)}</div>{/each}
							</td>
							<td class="px-3 py-2 text-right font-mono text-gray-800 dark:text-slate-100">
								{#each c.outs as l}<div>{formatCurrency(l.total)}</div>{/each}
							</td>

							<!-- Balance (remaining FIFO layers) -->
							<td class="border-l border-gray-100 px-3 py-2 text-right font-mono font-bold text-gray-900 dark:border-slate-800 dark:text-gray-100">
								{#each c.balance as l}<div>{l.qty}</div>{:else}<div>0</div>{/each}
							</td>
							<td class="px-3 py-2 text-right font-mono text-gray-700 dark:text-slate-200">
								{#each c.balance as l}<div>{formatCurrency(l.cost)}</div>{/each}
							</td>
							<td class="px-3 py-2 text-right font-mono font-bold text-gray-900 dark:text-gray-100">
								{#each c.balance as l}<div>{formatCurrency(l.total)}</div>{:else}<div>{formatCurrency(0)}</div>{/each}
							</td>
						</tr>
					{/each}
				</tbody>

				<tfoot class="bg-gray-50 text-sm font-bold dark:bg-slate-800/60">
					<tr class="border-t-2 border-gray-300 dark:border-slate-600">
						<td colspan="2" class="px-3 py-2 text-right text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400">Total</td>
						<td class="border-l border-gray-200 px-3 py-2 text-right font-mono text-emerald-700 dark:border-slate-700 dark:text-emerald-400">{totalInQty}</td>
						<td></td>
						<td class="px-3 py-2 text-right font-mono">{formatCurrency(totalInValue)}</td>
						<td class="border-l border-gray-200 px-3 py-2 text-right font-mono text-rose-700 dark:border-slate-700 dark:text-rose-400">{totalOutQty}</td>
						<td></td>
						<td class="px-3 py-2 text-right font-mono">{formatCurrency(totalOutValue)}</td>
						<td class="border-l border-gray-200 px-3 py-2 text-right font-mono dark:border-slate-700">{onHand}</td>
						<td></td>
						<td class="px-3 py-2 text-right font-mono text-blue-700 dark:text-blue-300">{formatCurrency(stockValue)}</td>
					</tr>
				</tfoot>
			</table>
		</div>
	{/if}
</div>