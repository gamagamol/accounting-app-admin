<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import { periodClosings } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';

	const SLUG = 'profit-loss';
	const AUTO_REFRESH_MS = 30000;
	const COGS_CODES = ['500'];

	let rows: ReportRow[] = [];
	let loading = true;
	let refreshing = false;
	let error = '';
	let lastUpdated: Date | null = null;
	let search = '';
	let showZero = false;
	let mounted = false;
	let requestId = 0;
	let refreshTimer: ReturnType<typeof setInterval> | undefined;

	// ---------- Fiscal year & status ----------
	$: fiscalYear = String($selectedFiscalYear || currentFiscalYear);
	$: yearPeriods = $periodClosings.filter(
		(item) => String(item.startDate).slice(0, 4) === fiscalYear
	);
	$: isFinal = yearPeriods.length > 0 && yearPeriods.every((item) => item.status === 'completed');

	// ---------- Data ----------
	async function load(year: string, silent = false) {
		const current = ++requestId;
		if (!silent) loading = true;
		refreshing = true;
		error = '';

		try {
			const result = await getReport(SLUG, year || undefined);
			if (current !== requestId) return;
			rows = Array.isArray(result.data) ? result.data : [];
			lastUpdated = new Date();
		} catch (err) {
			if (current !== requestId) return;
			error = err instanceof Error ? err.message : 'Failed to load report';
		} finally {
			if (current === requestId) {
				loading = false;
				refreshing = false;
			}
		}
	}

	$: if (mounted) void load(fiscalYear);

	onMount(() => {
		mounted = true;
		refreshTimer = setInterval(() => void load(fiscalYear, true), AUTO_REFRESH_MS);
	});

	onDestroy(() => {
		if (refreshTimer) clearInterval(refreshTimer);
	});

	// ---------- Profit & Loss ----------
	const amountOf = (row: ReportRow) => Number(row.amount ?? 0);
	const byCode = (a: ReportRow, b: ReportRow) =>
		String(a.account_code).localeCompare(String(b.account_code), undefined, { numeric: true });
	const isCogs = (r: ReportRow) =>
		COGS_CODES.includes(String(r.account_code)) || /cost of goods/i.test(String(r.account_name));
	const matches = (row: ReportRow, q: string) =>
		!q ||
		[row.account_code, row.account_name].some((v) =>
			String(v ?? '').toLowerCase().includes(q.toLowerCase())
		);
	const sum = (list: ReportRow[]) => list.reduce((s, r) => s + amountOf(r), 0);
	const pct = (v: number, base: number) => (base > 0 ? `${((v / base) * 100).toFixed(1)}%` : '–');
	const money = (v: number, negative = false) =>
		negative && v !== 0 ? `(${formatCurrency(v)})` : formatCurrency(v);

	// grup data lengkap (untuk total, tidak terpengaruh filter)
	$: revenueAll = rows.filter((r) => r.account_type === 'revenue');
	$: cogsAll = rows.filter((r) => r.account_type === 'expense' && isCogs(r));
	$: opexAll = rows.filter((r) => r.account_type === 'expense' && !isCogs(r));

	$: totalRevenue = sum(revenueAll);
	$: totalCogs = sum(cogsAll);
	$: totalOpex = sum(opexAll);
	$: grossProfit = totalRevenue - totalCogs;
	$: net = grossProfit - totalOpex;
	$: grossMargin = totalRevenue > 0 ? (grossProfit / totalRevenue) * 100 : 0;
	$: netMargin = totalRevenue > 0 ? (net / totalRevenue) * 100 : 0;

	// baris yang ditampilkan (kena pencarian & filter nol)
	const visible = (list: ReportRow[], q: string, zero: boolean) =>
		list.filter((r) => matches(r, q) && (zero || amountOf(r) !== 0)).sort(byCode);

	$: sections = [
		{
			key: 'revenue',
			title: 'Revenue',
			totalLabel: 'Total Revenue',
			rows: visible(revenueAll, search, showZero),
			total: totalRevenue,
			negative: false,
			tone: 'text-blue-700 dark:text-blue-400',
			empty: 'No revenue recorded.'
		},
		{
			key: 'cogs',
			title: 'Cost of Goods Sold',
			totalLabel: 'Total Cost of Goods Sold',
			rows: visible(cogsAll, search, showZero),
			total: totalCogs,
			negative: true,
			tone: 'text-orange-700 dark:text-orange-400',
			empty: 'No cost of goods sold recorded.'
		},
		{
			key: 'opex',
			title: 'Operating Expenses',
			totalLabel: 'Total Operating Expenses',
			rows: visible(opexAll, search, showZero),
			total: totalOpex,
			negative: true,
			tone: 'text-amber-700 dark:text-amber-400',
			empty: 'No operating expenses recorded.'
		}
	];

	$: toneOf = (v: number) =>
		v >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400';
</script>

<div class="space-y-4">
	<!-- Toolbar -->
	<div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 sm:flex-row sm:items-center sm:justify-between dark:border-slate-800 dark:bg-slate-900">
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold tracking-wide uppercase
					{isFinal
					? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
					: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'}"
			>
				<span class="h-1.5 w-1.5 rounded-full {isFinal ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
				{isFinal ? 'Final' : 'Provisional (realtime)'}
			</span>
			<span class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
				{$fiscalYearLabel}
			</span>
			<input
				type="search"
				bind:value={search}
				placeholder="Search account..."
				class="rounded-lg border border-gray-300 bg-white px-3 py-1.5 text-xs text-gray-900 focus:ring-2 focus:ring-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-950 dark:text-white"
			/>
			<label class="flex items-center gap-1.5 text-xs font-medium text-gray-600 dark:text-slate-300">
				<input type="checkbox" bind:checked={showZero} class="rounded border-gray-300" />
				Show zero accounts
			</label>
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<p class="text-xs text-gray-500 dark:text-slate-400">
				{isFinal
					? 'Final figures for the selected fiscal year.'
					: 'Provisional figures from completed transactions. Final after period closing.'}
				{#if lastUpdated}Last refreshed {lastUpdated.toLocaleTimeString()}.{/if}
				<span class="block text-[11px] text-gray-400 dark:text-slate-500">
					Auto-refresh every {AUTO_REFRESH_MS / 1000}s.
				</span>
			</p>
			<Button size="sm" variant="secondary" on:click={() => load(fiscalYear)} disabled={refreshing}>
				{refreshing ? 'Refreshing...' : 'Refresh'}
			</Button>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading && rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading report data...
		</div>
	{:else if rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			No revenue or expense activity yet.
		</div>
	{:else}
		<div class="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
			<div class="border-b border-slate-200 px-6 py-5 text-center dark:border-slate-700">
				<h2 class="text-lg font-bold tracking-wide text-slate-900 uppercase dark:text-slate-100">
					Profit &amp; Loss Statement
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{$fiscalYearLabel}</p>
			</div>

			<div class="overflow-x-auto px-6 py-4">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
							<th class="w-28 pb-2 text-left font-semibold">Code</th>
							<th class="pb-2 text-left font-semibold">Account</th>
							<th class="w-44 pb-2 text-right font-semibold">Amount</th>
							<th class="w-24 pb-2 text-right font-semibold">% Rev</th>
						</tr>
					</thead>

					{#each sections as section (section.key)}
						<tbody>
							<tr>
								<td colspan="4" class="pt-5 pb-1 text-xs font-bold tracking-wider uppercase {section.tone}">
									{section.title}
								</td>
							</tr>
							{#each section.rows as row (row.account_code)}
								<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
									<td class="py-1.5 pl-3 font-mono text-slate-500 dark:text-slate-400">{row.account_code}</td>
									<td class="py-1.5 pl-3 text-slate-800 dark:text-slate-200">{row.account_name}</td>
									<td class="py-1.5 text-right font-mono text-slate-800 dark:text-slate-200">
										{money(amountOf(row), section.negative)}
									</td>
									<td class="py-1.5 text-right text-slate-500 dark:text-slate-400">
										{pct(amountOf(row), totalRevenue)}
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="4" class="py-2 pl-3 text-slate-400 italic">
										{search ? 'No matching account.' : section.empty}
									</td>
								</tr>
							{/each}
							<tr class="border-t border-slate-300 font-semibold dark:border-slate-600">
								<td colspan="2" class="py-2 text-slate-900 dark:text-slate-100">{section.totalLabel}</td>
								<td class="py-2 text-right font-mono {section.tone}">{money(section.total, section.negative)}</td>
								<td class="py-2 text-right text-slate-500 dark:text-slate-400">{pct(section.total, totalRevenue)}</td>
							</tr>

							{#if section.key === 'cogs'}
								<tr class="bg-slate-50 font-bold dark:bg-slate-800/60">
									<td colspan="2" class="px-3 py-2.5 text-slate-900 dark:text-slate-100">Gross Profit</td>
									<td class="py-2.5 text-right font-mono {toneOf(grossProfit)}">
										{grossProfit < 0 ? `(${formatCurrency(Math.abs(grossProfit))})` : formatCurrency(grossProfit)}
									</td>
									<td class="py-2.5 text-right text-sm {toneOf(grossProfit)}">{grossMargin.toFixed(1)}%</td>
								</tr>
							{/if}
						</tbody>
					{/each}

					<!-- NET -->
					<tfoot>
						<tr class="border-t-2 border-double border-slate-800 dark:border-slate-300">
							<td colspan="2" class="pt-4 pb-1 text-base font-bold text-slate-900 dark:text-slate-100">
								{net >= 0 ? 'Net Profit' : 'Net Loss'}
							</td>
							<td class="pt-4 pb-1 text-right font-mono text-base font-bold {toneOf(net)}">
								{net >= 0 ? formatCurrency(net) : `(${formatCurrency(Math.abs(net))})`}
							</td>
							<td class="pt-4 pb-1 text-right text-sm font-semibold {toneOf(net)}">
								{netMargin.toFixed(1)}%
							</td>
						</tr>
						<tr>
							<td colspan="4" class="pt-1 text-right text-xs text-slate-400">
								% Rev = persentase terhadap Total Revenue
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	{/if}
</div>