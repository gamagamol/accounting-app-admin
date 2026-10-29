<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { formatCurrency } from '$lib/utils/formatters';
	import { periodClosings } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';

	const SLUG = 'balance-sheet';
	const AUTO_REFRESH_MS = 30000;

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

	// ---------- Balance Sheet ----------
	const balanceOf = (row: ReportRow) => Number(row.balance ?? 0);
	const byCode = (a: ReportRow, b: ReportRow) =>
		String(a.account_code).localeCompare(String(b.account_code), undefined, { numeric: true });
	const matches = (row: ReportRow, q: string) =>
		!q ||
		[row.account_code, row.account_name].some((v) =>
			String(v ?? '').toLowerCase().includes(q.toLowerCase())
		);
	const sum = (list: ReportRow[]) => list.reduce((s, r) => s + balanceOf(r), 0);
	const money = (v: number) => (v < 0 ? `(${formatCurrency(Math.abs(v))})` : formatCurrency(v));
	const visible = (list: ReportRow[], q: string, zero: boolean) =>
		list.filter((r) => matches(r, q) && (zero || balanceOf(r) !== 0)).sort(byCode);

	// grup data lengkap (untuk total, tidak terpengaruh pencarian)
	$: assetsAll = rows.filter((r) => r.account_type === 'asset');
	$: liabilitiesAll = rows.filter((r) => r.account_type === 'liability');
	$: equityAll = rows.filter((r) => r.account_type === 'equity');

	$: totalAssets = sum(assetsAll);
	$: totalLiabilities = sum(liabilitiesAll);
	$: totalEquity = sum(equityAll);
	$: totalLiabEquity = totalLiabilities + totalEquity;
	$: difference = totalAssets - totalLiabEquity;
	$: isBalanced = Math.abs(difference) < 0.005;

	$: groups = [
		{
			key: 'asset',
			title: 'Assets',
			totalLabel: 'Total Assets',
			rows: visible(assetsAll, search, showZero),
			total: totalAssets,
			tone: 'text-blue-700 dark:text-blue-400',
			empty: 'No asset accounts recorded.'
		},
		{
			key: 'liability',
			title: 'Liabilities',
			totalLabel: 'Total Liabilities',
			rows: visible(liabilitiesAll, search, showZero),
			total: totalLiabilities,
			tone: 'text-amber-700 dark:text-amber-400',
			empty: 'No liability accounts recorded.'
		},
		{
			key: 'equity',
			title: 'Equity',
			totalLabel: 'Total Equity',
			rows: visible(equityAll, search, showZero),
			total: totalEquity,
			tone: 'text-emerald-700 dark:text-emerald-400',
			empty: 'No equity accounts recorded.'
		}
	];
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
			No balance sheet activity yet.
		</div>
	{:else}
		<div class="mx-auto max-w-4xl rounded-xl border border-slate-200 bg-white shadow-sm dark:border-slate-700 dark:bg-slate-900">
			<div class="border-b border-slate-200 px-6 py-5 text-center dark:border-slate-700">
				<h2 class="text-lg font-bold tracking-wide text-slate-900 uppercase dark:text-slate-100">
					Balance Sheet
				</h2>
				<p class="mt-1 text-sm text-slate-500 dark:text-slate-400">{$fiscalYearLabel}</p>
			</div>

			<div class="overflow-x-auto px-6 py-4">
				<table class="w-full text-sm">
					<thead>
						<tr class="text-xs tracking-wider text-slate-500 uppercase dark:text-slate-400">
							<th class="w-28 pb-2 text-left font-semibold">Code</th>
							<th class="pb-2 text-left font-semibold">Account</th>
							<th class="w-48 pb-2 text-right font-semibold">Balance</th>
						</tr>
					</thead>

					{#each groups as group (group.key)}
						<tbody>
							<tr>
								<td colspan="3" class="pt-5 pb-1 text-xs font-bold tracking-wider uppercase {group.tone}">
									{group.title}
								</td>
							</tr>
							{#each group.rows as row (row.account_code)}
								<tr class="hover:bg-slate-50 dark:hover:bg-slate-800/50">
									<td class="py-1.5 pl-3 font-mono text-slate-500 dark:text-slate-400">{row.account_code}</td>
									<td class="py-1.5 pl-3 text-slate-800 dark:text-slate-200">{row.account_name}</td>
									<td class="py-1.5 text-right font-mono text-slate-800 dark:text-slate-200">
										{money(balanceOf(row))}
									</td>
								</tr>
							{:else}
								<tr>
									<td colspan="3" class="py-2 pl-3 text-slate-400 italic">
										{search ? 'No matching account.' : group.empty}
									</td>
								</tr>
							{/each}
							<tr class="border-t border-slate-300 font-semibold dark:border-slate-600">
								<td colspan="2" class="py-2 text-slate-900 dark:text-slate-100">{group.totalLabel}</td>
								<td class="py-2 text-right font-mono {group.tone}">{money(group.total)}</td>
							</tr>

							{#if group.key === 'asset'}
								<tr><td colspan="3" class="py-2"></td></tr>
								<tr class="border-t-2 border-double border-slate-800 bg-slate-50 dark:border-slate-300 dark:bg-slate-800/60">
									<td colspan="2" class="px-3 py-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
										TOTAL ASSETS
									</td>
									<td class="py-2.5 text-right font-mono text-base font-bold text-blue-700 dark:text-blue-400">
										{money(totalAssets)}
									</td>
								</tr>
							{/if}
						</tbody>
					{/each}

					<!-- LIABILITIES + EQUITY -->
					<tfoot>
						<tr class="border-t-2 border-double border-slate-800 bg-slate-50 dark:border-slate-300 dark:bg-slate-800/60">
							<td colspan="2" class="px-3 py-2.5 text-base font-bold text-slate-900 dark:text-slate-100">
								TOTAL LIABILITIES + EQUITY
							</td>
							<td class="py-2.5 text-right font-mono text-base font-bold text-indigo-700 dark:text-indigo-400">
								{money(totalLiabEquity)}
							</td>
						</tr>
						<tr>
							<td colspan="3" class="pt-3 text-right">
								{#if isBalanced}
									<span class="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-emerald-800 uppercase dark:bg-emerald-500/15 dark:text-emerald-200">
										<span class="h-1.5 w-1.5 rounded-full bg-emerald-500"></span>
										Balanced
									</span>
								{:else}
									<span class="inline-flex items-center gap-1.5 rounded-full bg-rose-100 px-2.5 py-1 text-[11px] font-bold tracking-wide text-rose-800 uppercase dark:bg-rose-500/15 dark:text-rose-200">
										<span class="h-1.5 w-1.5 rounded-full bg-rose-500"></span>
										Out of balance: {money(difference)}
									</span>
								{/if}
							</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	{/if}
</div>