<script lang="ts">
	import { onMount } from 'svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import { getReport, type ReportRow } from '$lib/api/reports';
	import { chartOfAccounts } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear, fiscalYearLabel } from '$lib/stores/fiscal';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	interface LedgerAccountRow {
		id: string;
		code: string;
		name: string;
		category: string;
		debit: number;
		credit: number;
		balance: number;
		entries: number;
	}

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Account Code', sortable: true },
		{ key: 'name', label: 'Account Name', sortable: true },
		{ key: 'category', label: 'Type', align: 'center', sortable: true },
		{
			key: 'debit',
			label: 'Debit',
			align: 'right',
			sortable: true,
			format: (value) => formatCurrency(Number(value) || 0)
		},
		{
			key: 'credit',
			label: 'Credit',
			align: 'right',
			sortable: true,
			format: (value) => formatCurrency(Number(value) || 0)
		},
		{
			key: 'balance',
			label: 'Balance',
			align: 'right',
			sortable: true,
			format: (value) => formatCurrency(Number(value) || 0)
		},
		{ key: 'entries', label: 'Entries', align: 'right', sortable: true }
	];

	let reportRows: ReportRow[] = [];
	let loading = true;
	let error = '';

	$: fiscalYear = $selectedFiscalYear || currentFiscalYear;
	$: accounts = buildAccounts($chartOfAccounts, reportRows);
	$: totalDebit = reportRows.reduce((sum, row) => sum + Number(row.debit || 0), 0);
	$: totalCredit = reportRows.reduce((sum, row) => sum + Number(row.credit || 0), 0);

	function buildAccounts(
		coa: { id: string; code: string; name: string; category: string }[],
		rows: ReportRow[]
	): LedgerAccountRow[] {
		const byCode = new Map<string, ReportRow[]>();
		for (const row of rows) {
			const code = String(row.account_code ?? '');
			if (!byCode.has(code)) byCode.set(code, []);
			byCode.get(code)!.push(row);
		}

		return coa.map((account) => {
			const lines = byCode.get(account.code) ?? [];
			const debit = lines.reduce((sum, row) => sum + Number(row.debit || 0), 0);
			const credit = lines.reduce((sum, row) => sum + Number(row.credit || 0), 0);
			return {
				id: account.id,
				code: account.code,
				name: account.name,
				category: account.category,
				debit,
				credit,
				balance: debit - credit,
				entries: lines.length
			};
		});
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await getReport('general-ledger', String(fiscalYear));
			reportRows = result.data ?? [];
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load general ledger';
			reportRows = [];
		} finally {
			loading = false;
		}
	}

	onMount(load);
	$: if (fiscalYear) void load();
</script>

<div class="space-y-6">
	<PageHeader
		title="General Ledger"
		description="Account list with realtime debit, credit and balance. Open an account to view its ledger table."
	>
		<Button variant="secondary" on:click={load}>Refresh</Button>
	</PageHeader>

	<div class="flex flex-wrap items-center gap-3 rounded-xl border border-blue-200 bg-blue-50 px-4 py-3 text-xs text-blue-800 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-200">
		<span class="font-bold">{$fiscalYearLabel}</span>
		<span class="opacity-60">•</span>
		<span>Figures update in realtime from completed transactions and become final after period closing.</span>
	</div>

	<div class="grid grid-cols-1 gap-4 sm:grid-cols-3">
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Accounts</p>
			<p class="mt-2 text-2xl font-bold text-gray-900 dark:text-white">{accounts.length}</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Debit</p>
			<p class="mt-2 text-2xl font-bold text-blue-700 dark:text-blue-300">{formatCurrency(totalDebit)}</p>
		</div>
		<div class="rounded-2xl border border-gray-200 bg-white p-4 dark:border-slate-800 dark:bg-slate-900">
			<p class="text-[11px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Credit</p>
			<p class="mt-2 text-2xl font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(totalCredit)}</p>
		</div>
	</div>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading general ledger accounts...
		</div>
	{:else}
		<DataTable
			{columns}
			data={accounts}
			searchPlaceholder="Search account code, name, or type..."
			searchKeys={['code', 'name', 'category']}
			pageSize={10}
			emptyMessage="No accounts found."
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'code'}
					<span class="rounded border border-blue-200 bg-blue-50 px-2 py-0.5 font-mono text-xs font-bold text-blue-700 dark:border-blue-500/20 dark:bg-blue-500/10 dark:text-blue-300">
						{value}
					</span>
				{:else if column.key === 'balance'}
					<span class="font-mono font-bold {Number(value) >= 0 ? 'text-emerald-700 dark:text-emerald-300' : 'text-rose-700 dark:text-rose-300'}">
						{formatCurrency(Number(value) || 0)}
					</span>
				{:else}
					{column.format ? column.format(value, row) : value ?? '-'}
				{/if}
			</svelte:fragment>

			<svelte:fragment slot="actions" let:row>
				<Button size="sm" variant="secondary" href={`/general-ledger/${row.id}`}>View</Button>
			</svelte:fragment>
		</DataTable>
	{/if}
</div>
