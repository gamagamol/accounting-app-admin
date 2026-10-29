<script lang="ts">
	import { onDestroy, onMount } from 'svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import {
		getReport,
		getReportLock,
		lockReport,
		unlockReport,
		type ReportLockInfo,
		type ReportRow
	} from '$lib/api/reports';
	import { formatDate } from '$lib/utils/formatters';
	import { periodClosings } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';
	import type { TableColumn } from '$lib/types';

	interface SummaryMetric {
		label: string;
		value: string;
		tone?: string;
		hint?: string;
	}

	function currentPeriod(): string {
		const now = new Date();
		return `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;
	}

	function endOfPeriod(period: string): string {
		const [year, month] = period.split('-').map(Number);
		const date = new Date(Date.UTC(year, month, 0));
		return date.toISOString().slice(0, 10);
	}

	function periodLabel(period: string): string {
		const [year, month] = period.split('-').map(Number);
		if (!year || !month) return period;
		return new Date(Date.UTC(year, month - 1, 1)).toLocaleDateString(undefined, {
			month: 'long',
			year: 'numeric',
			timeZone: 'UTC'
		});
	}

	export let slug: string;
	export let columns: TableColumn[] = [];
	export let searchPlaceholder = 'Search report...';
	export let searchKeys: string[] = [];
	export let emptyMessage = 'No data available yet.';
	export let pageSize = 10;
	export let summary: (rows: ReportRow[]) => SummaryMetric[] = () => [];
	export let transform: (rows: ReportRow[]) => ReportRow[] = (rows) => rows;
	export let lockable = false;
	export let autoRefreshMs = 0;
	export let defaultPeriod = '';
	export let fiscalYearMode = false;
	export let periodOverride = '';

	let period = defaultPeriod || currentPeriod();
	let rows: ReportRow[] = [];
	let loading = true;
	let refreshing = false;
	let lockBusy = false;
	let error = '';
	let success = '';
	let lastUpdated: Date | null = null;
	let lockInfo: ReportLockInfo | null = null;
	let refreshTimer: ReturnType<typeof setInterval> | undefined;
	let requestId = 0;

	$: displayRows = transform(rows);
	$: metrics = summary(displayRows);
	$: isLocked = Boolean(lockInfo);
	$: effectivePeriod =
		periodOverride || (fiscalYearMode ? String($selectedFiscalYear || currentFiscalYear) : period);
	$: fiscalYear = Number(effectivePeriod.slice(0, 4));
	$: yearPeriods = $periodClosings.filter(
		(item) => Number(String(item.startDate).slice(0, 4)) === fiscalYear
	);
	$: isFiscalYearClosed =
		yearPeriods.length > 0 && yearPeriods.every((item) => item.status === 'completed');
	$: isFinal = isLocked || isFiscalYearClosed;
	$: autoRefreshLabel =
		autoRefreshMs > 0 ? `Auto-refresh every ${Math.round(autoRefreshMs / 1000)}s.` : 'Manual refresh.';

	async function load(silent = false) {
		const currentRequest = ++requestId;
		if (!silent) loading = true;
		refreshing = true;
		error = '';

		try {
			const [reportResult, lockResult] = await Promise.all([
				getReport(slug, effectivePeriod || undefined),
				lockable && !fiscalYearMode
					? getReportLock(slug, period)
					: Promise.resolve(null)
			]);

			if (currentRequest !== requestId) return;

			rows = Array.isArray(reportResult.data) ? reportResult.data : [];
			lockInfo = lockResult?.data ?? null;
			lastUpdated = new Date();
		} catch (err) {
			if (currentRequest !== requestId) return;
			error = err instanceof Error ? err.message : 'Failed to load report';
		} finally {
			if (currentRequest === requestId) {
				loading = false;
				refreshing = false;
			}
		}
	}

	async function handleLock() {
		if (!lockable) return;
		error = '';
		success = '';
		if (!period) {
			error = 'Select a report period before locking.';
			return;
		}

		lockBusy = true;
		try {
			await lockReport(slug, {
				period,
				as_of_date: endOfPeriod(period),
				locked_by: 1,
				notes: `Locked from ${slug} report view`
			});
			success = `Report locked for ${periodLabel(period)}. Figures are now frozen.`;
			await load(true);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to lock report';
		} finally {
			lockBusy = false;
		}
	}

	async function handleUnlock() {
		if (!lockable) return;
		if (!confirm(`Unlock ${periodLabel(period)}? The report will return to realtime data.`)) {
			return;
		}

		error = '';
		success = '';
		lockBusy = true;
		try {
			await unlockReport(slug, period);
			success = `Report unlocked for ${periodLabel(period)}. It is realtime again.`;
			await load(true);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to unlock report';
		} finally {
			lockBusy = false;
		}
	}

	function handlePeriodChange() {
		success = '';
		void load();
	}

	onMount(() => {
		if (!fiscalYearMode) void load();
		if (autoRefreshMs > 0) {
			refreshTimer = setInterval(() => {
				void load(true);
			}, autoRefreshMs);
		}
	});

	let lastFiscalYear = 0;
	$: if (fiscalYearMode && $selectedFiscalYear !== lastFiscalYear) {
		lastFiscalYear = $selectedFiscalYear;
		void load();
	}

	onDestroy(() => {
		if (refreshTimer) clearInterval(refreshTimer);
	});
</script>

<div class="space-y-4">
	<div class="flex flex-col gap-3 rounded-xl border border-gray-200 bg-white p-3 dark:border-slate-800 dark:bg-slate-900 sm:flex-row sm:items-center sm:justify-between">
		<div class="flex flex-wrap items-center gap-2">
			<span
				class="inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-[11px] font-bold uppercase tracking-wide
					{isFinal
					? 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
					: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200'}"
			>
				<span class="h-1.5 w-1.5 rounded-full {isFinal ? 'bg-amber-500' : 'bg-emerald-500'}"></span>
				{isFinal ? 'Final' : 'Provisional (realtime)'}
			</span>

			{#if fiscalYearMode}
				<span class="rounded-full bg-blue-50 px-2.5 py-1 text-[11px] font-bold text-blue-700 dark:bg-blue-500/10 dark:text-blue-300">
					{$fiscalYearLabel}
				</span>
			{:else if lockable}
				<label class="flex items-center gap-2 text-xs font-semibold text-gray-600 dark:text-slate-300">
					<span>Period</span>
					<input
						type="month"
						bind:value={period}
						on:change={handlePeriodChange}
						class="rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-xs text-gray-900 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-950 dark:text-white"
					/>
				</label>

				{#if isLocked}
					<Button size="sm" variant="warning" on:click={handleUnlock} disabled={lockBusy || refreshing}>
						{lockBusy ? 'Unlocking...' : 'Unlock'}
					</Button>
				{:else}
					<Button size="sm" variant="primary" on:click={handleLock} disabled={lockBusy || refreshing}>
						{lockBusy ? 'Locking...' : 'Lock Report'}
					</Button>
				{/if}
			{/if}
		</div>

		<div class="flex flex-wrap items-center gap-3">
			<p class="text-xs text-gray-500 dark:text-slate-400">
				{isFinal
					? 'Final figures for the selected fiscal year.'
					: 'Provisional figures from completed transactions. Final after period closing.'}
				{#if lastUpdated}
					Last refreshed {lastUpdated.toLocaleTimeString()}.
				{/if}
				<span class="block text-[11px] text-gray-400 dark:text-slate-500">{autoRefreshLabel}</span>
			</p>
			<Button size="sm" variant="secondary" on:click={() => load()} disabled={refreshing}>
				{refreshing ? 'Refreshing...' : 'Refresh'}
			</Button>
		</div>
	</div>

	{#if isLocked && lockInfo}
		<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-800 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
			Report locked for <strong>{periodLabel(lockInfo.period)}</strong> as of {formatDate(lockInfo.as_of_date)}.
			Figures stay frozen until the period is unlocked. Journal changes for this period are blocked.
		</div>
	{:else if !isFiscalYearClosed}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
			<strong>Provisional figures.</strong> Every completed transaction affects this report in realtime.
			The values become final after the accounting period is closed.
		</div>
	{/if}

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if success}
		<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
			{success}
		</div>
	{/if}

	{#if loading && rows.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading report data...
		</div>
	{:else}
		{#if metrics.length > 0}
			<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
				{#each metrics as metric}
					<div class="rounded-xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
						<span class="text-xs font-semibold uppercase text-gray-500 dark:text-slate-400">{metric.label}</span>
						<p class="mt-1 font-mono text-xl font-bold {metric.tone ?? 'text-gray-900 dark:text-white'}">{metric.value}</p>
						{#if metric.hint}
							<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{metric.hint}</p>
						{/if}
					</div>
				{/each}
			</div>
		{/if}

		<DataTable
			{columns}
			data={displayRows}
			{searchPlaceholder}
			{searchKeys}
			{emptyMessage}
			{pageSize}
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				<slot name="cell" {column} {value} {row}>
					<span>{value ?? '-'}</span>
				</slot>
			</svelte:fragment>
		</DataTable>
	{/if}
</div>
