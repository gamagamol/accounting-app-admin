<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import PendingApprovalPanel from './PendingApprovalPanel.svelte';
	import TransactionPageShell from './TransactionPageShell.svelte';
	import { pendingTransactionTypeFor } from '$lib/data/pending';
	import { formatCurrency, formatDate, formatNumber } from '$lib/utils/formatters';
	import type { FieldDef } from '$lib/types/entity';

	export let title: string;
	export let description: string = '';
	export let backHref: string;
	export let backLabel: string = 'Back to list';
	export let eyebrow: string = '';
	export let fields: FieldDef[] = [];
	export let row: any = null;
	export let documentNumber: string = '';
	export let auditEntityType: string = '';
	export let auditEntityId: string = '';

	$: pendingType = pendingTransactionTypeFor(auditEntityType);

	function displayValue(field: FieldDef, value: unknown) {
		if (value === '' || value === null || value === undefined) return '—';
		if (field.type === 'currency') return formatCurrency(Number(value) || 0);
		if (field.type === 'number') return formatNumber(Number(value) || 0);
		if (field.type === 'date') return formatDate(String(value));
		if (field.type === 'select') {
			return field.options?.find((option) => option.value === value)?.label ?? String(value);
		}
		return String(value);
	}

	function badgeLabel(field: FieldDef, value: unknown) {
		return field.badgeLabels?.[String(value)] ?? String(value);
	}
</script>

<TransactionPageShell {title} {description} {backHref} {backLabel} {eyebrow} {documentNumber}>
	<svelte:fragment slot="actions">
		<slot name="actions" />
	</svelte:fragment>

	{#if row}
		<div class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<div class="grid grid-cols-1 gap-3 sm:grid-cols-2 lg:grid-cols-3">
				{#each fields as field}
					<div class="rounded-xl border border-gray-200 p-3 dark:border-slate-800 {field.colSpan === 'full' ? 'sm:col-span-2 lg:col-span-3' : ''}">
						<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">{field.label}</p>
						<p class="mt-1 break-words text-sm font-medium text-gray-800 dark:text-slate-100">
							{#if field.type === 'select' && field.badge}
								<Badge status={String(row[field.key] ?? '')} label={badgeLabel(field, row[field.key])} />
							{:else}
								{displayValue(field, row[field.key])}
							{/if}
						</p>
					</div>
				{/each}
			</div>

			{#if row.description || row.message}
				<div class="mt-4 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
					<p class="text-[11px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-200">Description / Message</p>
					<p class="mt-1 whitespace-pre-line text-sm text-blue-900 dark:text-blue-100">{row.description || row.message}</p>
				</div>
			{/if}
		</div>

		{#if pendingType && row.status}
			<PendingApprovalPanel
				transactionType={pendingType}
				transactionId={row.id ?? auditEntityId}
				transactionNumber={documentNumber}
				status={row.status}
			/>
		{/if}

		<slot />

		{#if auditEntityType && auditEntityId}
			<AuditLogPanel entityType={auditEntityType} entityId={auditEntityId} />
		{/if}
	{:else}
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">Record not found.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">The record may have been deleted or the link is invalid.</p>
		</div>
	{/if}
</TransactionPageShell>
