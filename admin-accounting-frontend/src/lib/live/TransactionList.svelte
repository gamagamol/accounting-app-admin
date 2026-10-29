<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { liveApi, type MasterDataOptions } from '$lib/api/live';
	import { getTransactionConfig } from './transaction-config';
	import { periodClosings } from '$lib/stores/dataStore';
	import { selectedFiscalYear, currentFiscalYear } from '$lib/stores/fiscal';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	export let type: string;

	$: config = getTransactionConfig(type);
	let options: MasterDataOptions | null = null;
	let rows: Record<string, any>[] = [];
	let loading = true;
	let error = '';
	let approvingId: number | null = null;

	function partyLabel(row: Record<string, any>): string {
		if (!options) return '-';
		if (row.customer_id) {
			const customer = options.customers.find((item) => item.id === Number(row.customer_id));
			if (customer) return customer.name;
		}
		if (row.supplier_id) {
			const supplier = options.suppliers.find((item) => item.id === Number(row.supplier_id));
			if (supplier) return supplier.name;
		}
		return '-';
	}

	function enrich(items: Record<string, any>[]): Record<string, any>[] {
		return items.map((row) => ({
			...row,
			party: partyLabel(row),
			grand_total_value: Number(row.grand_total ?? row.total_amount ?? 0),
			outstanding_value: Number(row.outstanding_amount ?? 0)
		}));
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const [optionsResult, listResult] = await Promise.all([
				liveApi.options(),
				liveApi.list(type, { limit: 100 })
			]);
			options = optionsResult.data;
			rows = enrich(listResult.data).sort((a, b) => Number(b.id) - Number(a.id));
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transactions';
		} finally {
			loading = false;
		}
	}

	function actorName(preparedBy: unknown): string {
		return options?.users.find((user) => user.id === Number(preparedBy))?.name ?? 'Frontend User';
	}

	function isLocked(row: Record<string, any>): boolean {
		const rawDate = String(row.document_date ?? '').slice(0, 10);
		if (!rawDate) return false;
		return $periodClosings.some((period) => {
			if (period.status !== 'completed') return false;
			const start = String(period.startDate ?? '').slice(0, 10);
			const end = String(period.endDate ?? '').slice(0, 10);
			return Boolean(start && end && rawDate >= start && rawDate <= end);
		});
	}

	$: fiscalYear = $selectedFiscalYear || currentFiscalYear;
	$: visibleRows = rows.filter((row) => {
		const year = Number(String(row.document_date ?? '').slice(0, 4));
		return !year || year === fiscalYear;
	});
	$: yearPeriods = $periodClosings.filter(
		(period) => Number(String(period.startDate ?? '').slice(0, 4)) === fiscalYear
	);
	$: fiscalYearClosed =
		yearPeriods.length > 0 && yearPeriods.every((period) => period.status === 'completed');

	async function approve(row: Record<string, any>) {
		approvingId = Number(row.id);
		try {
			await liveApi.approve(type, row.id, actorName(row.prepared_by));
			await load();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to approve transaction';
		} finally {
			approvingId = null;
		}
	}

	onMount(load);

	$: isLogistics = type === 'delivery' || type === 'goods-receipt';

	$: columns = [
		{ key: 'document_number', label: `${config.singular} No`, sortable: true },
		{
			key: 'document_date',
			label: 'Date',
			sortable: true,
			format: (value: string) => formatDate(value)
		},
		{ key: 'party', label: config.party === 'supplier' ? 'Supplier' : 'Customer', sortable: true },
		...(config.referenceKey
			? [
					{
						key: config.referenceKey,
						label: config.referenceLabel ?? 'Reference',
						sortable: true
					}
				]
			: []),
		...(isLogistics
			? []
			: [
					{
						key: 'grand_total_value',
						label: 'Total',
						sortable: true,
						align: 'right' as const,
						format: (value: number) => formatCurrency(Number(value) || 0)
					}
				]),
		...(type === 'sales-invoice' || type === 'purchase-invoice'
			? [
					{
						key: 'outstanding_value',
						label: 'Outstanding',
						sortable: true,
						align: 'right' as const,
						format: (value: number) => formatCurrency(Number(value) || 0)
					}
				]
			: []),
		{ key: 'status', label: 'Status', align: 'center' as const, sortable: true }
	];
</script>

<div class="space-y-6">
	<PageHeader title={config.title} description={config.description}>
		<Button variant="secondary" on:click={load}>Refresh</Button>
		<Button
			variant="primary"
			href={`/${config.route}/new`}
			disabled={fiscalYearClosed}
			title={fiscalYearClosed ? 'This fiscal year is closed and cannot accept new transactions.' : ''}
		>
			+ New {config.singular}
		</Button>
	</PageHeader>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading {config.title.toLowerCase()}...
		</div>
	{:else}
		<DataTable
			{columns}
			data={visibleRows}
			rowClass={(row) => (isLocked(row) ? 'opacity-60 bg-slate-50/70 dark:bg-slate-800/20' : '')}
			searchPlaceholder={`Search ${config.title.toLowerCase()}...`}
			searchKeys={[
				'document_number',
				'party',
				'status',
				...(config.referenceKey ? [config.referenceKey] : [])
			]}
			pageSize={10}
			emptyMessage={`No ${config.title.toLowerCase()} yet`}
		>
			<svelte:fragment slot="cell" let:column let:value let:row>
				{#if column.key === 'document_number'}
					<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">
						{value}
					</span>
				{:else if config.referenceKey && column.key === config.referenceKey}
					{#if config.referenceRoute && config.referenceIdKey && row[config.referenceIdKey]}
						<a
							href={`/${config.referenceRoute}/${row[config.referenceIdKey]}`}
							class="font-mono font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
						>
							{value ?? '-'}
						</a>
					{:else}
						<span class="font-mono font-semibold text-gray-700 dark:text-slate-200">{value ?? '-'}</span>
					{/if}
				{:else if column.key === 'status'}
					<div class="flex flex-col items-center gap-1">
						<Badge status={value} />
						{#if isLocked(row)}
							<span class="rounded-full bg-amber-100 px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide text-amber-800 dark:bg-amber-500/15 dark:text-amber-200">
								🔒 Locked
							</span>
						{/if}
					</div>
				{:else}
					{column.format ? column.format(value, row) : value ?? '-'}
				{/if}
			</svelte:fragment>

			<svelte:fragment slot="actions" let:row>
				<div class="flex items-center justify-end gap-1">
					<Button size="sm" variant="secondary" href={`/${config.route}/${row.id}`}>View</Button>
					{#if config.approvable && row.status === 'draft'}
						<Button
							size="sm"
							variant="success"
							disabled={approvingId === Number(row.id) || isLocked(row)}
							title={isLocked(row) ? 'Period is closed; this transaction is read-only.' : ''}
							on:click={() => approve(row)}
						>
							{approvingId === Number(row.id) ? 'Approving...' : isLocked(row) ? 'Locked' : 'Approve'}
						</Button>
					{/if}
				</div>
			</svelte:fragment>
		</DataTable>
	{/if}
</div>
