<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { chartOfAccounts } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

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

	let reportRows: ReportRow[] = [];
	let loading = true;
	let error = '';

	$: fiscalYear = $selectedFiscalYear || currentFiscalYear;
	$: accountId = String($page.params.id ?? '');
	$: account = $chartOfAccounts.find((item) => item.id === accountId);
	$: accountCode = account?.code ?? String(reportRows[0]?.account_code ?? '');
	$: accountName = account?.name ?? String(reportRows[0]?.account_name ?? 'Account Ledger');
	$: lines = reportRows
		.filter((row) => String(row.account_code ?? '') === accountCode)
		.sort((a, b) => {
			const dateCompare = String(a.date ?? '').localeCompare(String(b.date ?? ''));
			if (dateCompare !== 0) return dateCompare;
			const journalCompare = Number(a.journal_id || 0) - Number(b.journal_id || 0);
			if (journalCompare !== 0) return journalCompare;
			return Number(a.line_number || 0) - Number(b.line_number || 0);
		});
	$: totalDebit = lines.reduce((sum, row) => sum + Number(row.debit || 0), 0);
	$: totalCredit = lines.reduce((sum, row) => sum + Number(row.credit || 0), 0);
	$: closingBalance = totalDebit - totalCredit;

	$: runningRows = (() => {
		let running = 0;
		return lines.map((row) => {
			running += Number(row.debit || 0) - Number(row.credit || 0);
			return { ...row, running_balance: running } as ReportRow & { running_balance: number };
		});
	})();

	function sourceLabel(row: ReportRow): string {
		if (!row.reference_type) return 'Manual';
		return String(row.reference_type).replace(/_/g, ' ');
	}

	function sourceHref(row: ReportRow): string | null {
		if (!row.reference_type || !row.reference_id) return null;
		const route = sourceRoutes[String(row.reference_type)];
		return route ? `/${route}/${row.reference_id}` : null;
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await getReport('general-ledger', String(fiscalYear));
			reportRows = result.data ?? [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load ledger';
			reportRows = [];
		} finally {
			loading = false;
		}
	}

	onMount(load);
	$: if (fiscalYear) void load();
</script>

<div class="space-y-6">
	<PageHeader title={accountName} description={`General ledger detail for account ${accountCode || '-'}.`}>
		<Button variant="secondary" href="/general-ledger">← Back to General Ledger</Button>
		<Button variant="secondary" on:click={load}>Refresh</Button>
	</PageHeader>

	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
		<span class="font-bold">{$fiscalYearLabel}</span>
		<span class="opacity-60">•</span>
		<span class="font-mono font-semibold">{accountCode}</span>
		<span>{accountName}</span>
		<span class="opacity-60">•</span>
		<span>Realtime ledger; figures are final after period closing.</span>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading ledger...
		</div>
	{:else}
		<div class="overflow-hidden rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div class="border-b border-gray-200 px-5 py-4 dark:border-slate-800">
				<h3 class="text-sm font-bold uppercase tracking-wider text-gray-700 dark:text-slate-200">Account Ledger</h3>
				<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
					Running balance is calculated from the first entry in the selected fiscal year.
				</p>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full divide-y divide-gray-200 text-sm dark:divide-slate-800">
					<thead class="bg-gray-50 dark:bg-slate-800/60">
						<tr>
							<th class="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Date</th>
							<th class="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Journal No</th>
							<th class="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Source</th>
							<th class="px-4 py-2 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Description</th>
							<th class="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Debit</th>
							<th class="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Credit</th>
							<th class="px-4 py-2 text-right text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Balance</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						<tr class="bg-gray-50/70 dark:bg-slate-800/30">
							<td class="px-4 py-2 text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400" colspan="6">Opening Balance</td>
							<td class="px-4 py-2 text-right font-mono font-bold text-gray-700 dark:text-slate-200">{formatCurrency(0)}</td>
						</tr>
						{#if runningRows.length === 0}
							<tr>
								<td class="px-4 py-8 text-center text-sm text-gray-500 dark:text-slate-400" colspan="7">
									No journal entries for this account in the selected fiscal year.
								</td>
							</tr>
						{:else}
							{#each runningRows as row}
								<tr class="hover:bg-gray-50 dark:hover:bg-slate-800/40">
									<td class="whitespace-nowrap px-4 py-2 text-gray-700 dark:text-slate-200">{formatDate(row.date)}</td>
									<td class="whitespace-nowrap px-4 py-2">
										<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
											{row.journal_number}
										</span>
									</td>
									<td class="whitespace-nowrap px-4 py-2">
										{#if sourceHref(row)}
											<a href={sourceHref(row)} class="font-semibold text-indigo-700 hover:underline dark:text-indigo-300">
												{sourceLabel(row)}
											</a>
										{:else}
											<span class="text-gray-600 dark:text-slate-300">{sourceLabel(row)}</span>
										{/if}
									</td>
									<td class="px-4 py-2 text-gray-700 dark:text-slate-200">{row.description || '-'}</td>
									<td class="whitespace-nowrap px-4 py-2 text-right font-mono text-gray-800 dark:text-slate-100">
										{Number(row.debit) ? formatCurrency(Number(row.debit)) : '-'}
									</td>
									<td class="whitespace-nowrap px-4 py-2 text-right font-mono text-gray-800 dark:text-slate-100">
										{Number(row.credit) ? formatCurrency(Number(row.credit)) : '-'}
									</td>
									<td class="whitespace-nowrap px-4 py-2 text-right font-mono font-bold {Number(row.running_balance) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}">
										{formatCurrency(Number(row.running_balance) || 0)}
									</td>
								</tr>
							{/each}
						{/if}
					</tbody>
					<tfoot class="bg-gray-50 font-bold dark:bg-slate-800/60">
						<tr>
							<td class="px-4 py-2 text-right text-xs uppercase tracking-wider text-gray-500 dark:text-slate-400" colspan="4">Total / Closing Balance</td>
							<td class="px-4 py-2 text-right font-mono text-blue-700 dark:text-blue-300">{formatCurrency(totalDebit)}</td>
							<td class="px-4 py-2 text-right font-mono text-indigo-700 dark:text-indigo-300">{formatCurrency(totalCredit)}</td>
							<td class="px-4 py-2 text-right font-mono text-gray-900 dark:text-white">{formatCurrency(closingBalance)}</td>
						</tr>
					</tfoot>
				</table>
			</div>
		</div>
	{/if}
</div>
