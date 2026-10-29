<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import {
		journalApi,
		type JournalDocument,
		type JournalHeader
	} from '$lib/api/journals';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';

	const sourceRoutes: Record<string, string> = {
		delivery: 'delivery',
		sales_invoice: 'sales-invoice',
		customer_receipt: 'customer-receipt',
		purchase_invoice: 'purchase-invoice',
		vendor_payment: 'vendor-payment',
		goods_receipt: 'goods',
		sales_order: 'sales',
		purchase_order: 'purchase'
	};

	const typeStyles: Record<string, string> = {
		purchase: 'bg-amber-100 text-amber-700 dark:bg-amber-500/10 dark:text-amber-300',
		payment: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/10 dark:text-emerald-300',
		sales: 'bg-blue-100 text-blue-700 dark:bg-blue-500/10 dark:text-blue-300',
		inventory: 'bg-violet-100 text-violet-700 dark:bg-violet-500/10 dark:text-violet-300'
	};
	const defaultTypeStyle = 'bg-slate-100 text-slate-600 dark:bg-slate-800 dark:text-slate-300';

	type DetailState = JournalDocument | 'loading' | 'error';

	const pageSize = 10;

	let rows: JournalHeader[] = [];
	let loading = true;
	let error = '';
	let search = '';
	let typeFilter = 'all';
	let page = 1;
	let details: Record<number, DetailState> = {};

	$: fiscalYear = $selectedFiscalYear || currentFiscalYear;
	$: totalDebit = rows.reduce((sum, row) => sum + Number(row.total_debit || 0), 0);
	$: totalCredit = rows.reduce((sum, row) => sum + Number(row.total_credit || 0), 0);
	$: balanced = Math.abs(totalDebit - totalCredit) < 0.005;
	$: types = Array.from(new Set(rows.map((r) => r.journal_type).filter(Boolean))).sort();

	$: filtered = rows
		.filter((row) => typeFilter === 'all' || row.journal_type === typeFilter)
		.filter((row) => {
			const q = search.trim().toLowerCase();
			if (!q) return true;
			return [row.journal_number, row.description, row.journal_type, row.reference_type]
				.some((v) => String(v ?? '').toLowerCase().includes(q));
		})
		// journal order: oldest first, then by id
		.sort((a, b) =>
			String(a.journal_date).localeCompare(String(b.journal_date)) || Number(a.id) - Number(b.id)
		);

	$: totalPages = Math.max(1, Math.ceil(filtered.length / pageSize));
	$: if (page > totalPages) page = totalPages;
	$: pageRows = filtered.slice((page - 1) * pageSize, page * pageSize);
	$: void loadPageDetails(pageRows);

	// reset to page 1 when filters change
	$: {
		search;
		typeFilter;
		page = 1;
	}

	function sourceLabel(row: JournalHeader): string {
		if (!row.reference_type) return 'Manual';
		return String(row.reference_type).replace(/_/g, ' ');
	}

	function sourceHref(row: JournalHeader): string | null {
		if (!row.reference_type || !row.reference_id) return null;
		const route = sourceRoutes[row.reference_type];
		return route ? `/${route}/${row.reference_id}` : null;
	}

	// debit lines first, then credit lines (classic journal layout)
	function sortedLines(doc: JournalDocument) {
		return [...doc.lines].sort(
			(a, b) => Number(Number(b.debit) > 0) - Number(Number(a.debit) > 0)
		);
	}

	function isCredit(line: { debit: unknown; credit: unknown }): boolean {
		return !(Number(line.debit) > 0) && Number(line.credit) > 0;
	}

	async function loadDetail(id: number) {
		details = { ...details, [id]: 'loading' };
		try {
			const result = await journalApi.get(id);
			details = { ...details, [id]: result.data };
		} catch {
			details = { ...details, [id]: 'error' };
		}
	}

	async function loadPageDetails(list: JournalHeader[]) {
		const pending = list.filter((r) => !details[r.id]);
		await Promise.all(pending.map((r) => loadDetail(r.id)));
	}

	async function load() {
		loading = true;
		error = '';
		details = {};
		try {
			const result = await journalApi.list({ period: String(fiscalYear), limit: 500 });
			rows = (result.data ?? []).filter((row) => {
				const year = String(row.journal_date ?? '').slice(0, 4);
				return !year || Number(year) === fiscalYear;
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load journals';
			rows = [];
		} finally {
			loading = false;
		}
	}

	onMount(load);
	$: if (fiscalYear) void load();
</script>

<div class="space-y-6">
	<PageHeader
		title="General Journal"
		description="Read-only accounting journal from every completed transaction. Values are provisional until the accounting period is closed."
	>
		<Button variant="secondary" on:click={load}>Refresh</Button>
	</PageHeader>

	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
		<span class="font-bold">{$fiscalYearLabel}</span>
		<span class="opacity-60">•</span>
		<span>Every posted transaction appears here in realtime. Closing the period makes the figures final.</span>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Journal Entries</p>
			<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{rows.length}</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Debit</p>
			<p class="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalDebit)}</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Credit</p>
			<p class="mt-2 text-2xl font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(totalCredit)}</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Balance</p>
			<p class="mt-2 text-2xl font-bold {balanced ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}">
				{balanced ? 'Balanced' : formatCurrency(totalDebit - totalCredit)}
			</p>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	<!-- Filters -->
	<div class="flex flex-wrap items-center gap-3">
		<input
			type="search"
			bind:value={search}
			placeholder="Search journal number, description, or source..."
			class="min-w-[16rem] flex-1 rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 placeholder-gray-400 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
		/>
		<select
			bind:value={typeFilter}
			class="rounded-xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900 focus:border-blue-500 focus:outline-none dark:border-slate-700 dark:bg-slate-900 dark:text-white"
		>
			<option value="all">All types</option>
			{#each types as t}
				<option value={t}>{t}</option>
			{/each}
		</select>
	</div>

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading journal...
		</div>
	{:else if filtered.length === 0}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			No journal entries for this fiscal year yet.
		</div>
	{:else}
		<!-- Journal book -->
		<div class="overflow-x-auto rounded-2xl border border-gray-200 bg-white dark:border-slate-800 dark:bg-slate-900">
			<table class="min-w-full border-collapse text-sm">
				<thead class="bg-gray-50 dark:bg-slate-800/60">
					<tr class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
						<th class="w-32 px-4 py-3 text-left">Date</th>
						<th class="px-4 py-3 text-left">Account / Description</th>
						<th class="w-28 px-4 py-3 text-left">Ref</th>
						<th class="w-40 px-4 py-3 text-right">Debit</th>
						<th class="w-40 px-4 py-3 text-right">Credit</th>
					</tr>
				</thead>

				{#each pageRows as row (row.id)}
					{@const detail = details[row.id]}
					<tbody class="border-t-2 border-gray-200 dark:border-slate-700">
						<!-- Entry header -->
						<tr class="bg-slate-50/70 dark:bg-slate-800/30">
							<td class="px-4 py-2 align-top font-semibold text-gray-900 dark:text-white">
								{formatDate(row.journal_date)}
							</td>
							<td class="px-4 py-2" colspan="4">
								<div class="flex flex-wrap items-center gap-2">
									<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
										{row.journal_number}
									</span>
									<span class="rounded-full px-2 py-0.5 text-[11px] font-semibold uppercase {typeStyles[row.journal_type] ?? defaultTypeStyle}">
										{row.journal_type}
									</span>
									<Badge status={row.status} />
									<span class="ml-auto text-xs text-gray-500 dark:text-slate-400">
										{#if sourceHref(row)}
											<a href={sourceHref(row)} class="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
												{sourceLabel(row)} #{row.reference_id}
											</a>
										{:else}
											{sourceLabel(row)}
										{/if}
									</span>
								</div>
							</td>
						</tr>

						<!-- Lines -->
						{#if !detail || detail === 'loading'}
							<tr>
								<td></td>
								<td colspan="4" class="px-4 py-3 text-xs text-gray-400 dark:text-slate-500">Loading entries...</td>
							</tr>
						{:else if detail === 'error'}
							<tr>
								<td></td>
								<td colspan="4" class="px-4 py-3 text-xs text-rose-600 dark:text-rose-300">
									Failed to load lines.
									<button class="font-semibold underline" on:click={() => loadDetail(row.id)}>Retry</button>
								</td>
							</tr>
						{:else}
							{#each sortedLines(detail) as line}
								<tr class="hover:bg-gray-50 dark:hover:bg-slate-800/30">
									<td></td>
									<td class="px-4 py-1.5 {isCredit(line) ? 'pl-12' : ''}">
										<span class="font-mono text-xs font-bold text-blue-700 dark:text-blue-300">{line.account_code}</span>
										<span class="ml-2 text-gray-800 dark:text-slate-100">{line.account_name}</span>
										{#if line.description}
											<div class="text-xs text-gray-500 dark:text-slate-400 {isCredit(line) ? '' : 'pl-0'}">{line.description}</div>
										{/if}
									</td>
									<td class="px-4 py-1.5"></td>
									<td class="px-4 py-1.5 text-right font-mono text-gray-800 dark:text-slate-100">
										{Number(line.debit) ? formatCurrency(Number(line.debit)) : ''}
									</td>
									<td class="px-4 py-1.5 text-right font-mono text-gray-800 dark:text-slate-100">
										{Number(line.credit) ? formatCurrency(Number(line.credit)) : ''}
									</td>
								</tr>
							{/each}
						{/if}

						<!-- Narration -->
						<tr>
							<td></td>
							<td class="px-4 pb-3 pt-1 pl-12 text-xs italic text-gray-500 dark:text-slate-400" colspan="2">
								({row.description || '-'})
							</td>
							<td class="border-t border-gray-300 px-4 pb-3 pt-1 text-right font-mono text-xs font-bold text-blue-700 dark:border-slate-600 dark:text-blue-300">
								{formatCurrency(Number(row.total_debit) || 0)}
							</td>
							<td class="border-t border-gray-300 px-4 pb-3 pt-1 text-right font-mono text-xs font-bold text-indigo-700 dark:border-slate-600 dark:text-indigo-300">
								{formatCurrency(Number(row.total_credit) || 0)}
							</td>
						</tr>
					</tbody>
				{/each}
			</table>
		</div>

		<!-- Pagination -->
		<div class="flex items-center justify-between text-sm text-gray-600 dark:text-slate-300">
			<span>
				{(page - 1) * pageSize + 1}–{Math.min(page * pageSize, filtered.length)} of {filtered.length} entries
			</span>
			<div class="flex items-center gap-2">
				<Button size="sm" variant="secondary" disabled={page <= 1} on:click={() => (page -= 1)}>Prev</Button>
				<span class="px-2">Page {page} / {totalPages}</span>
				<Button size="sm" variant="secondary" disabled={page >= totalPages} on:click={() => (page += 1)}>Next</Button>
			</div>
		</div>
	{/if}
</div>