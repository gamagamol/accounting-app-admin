<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from './DataTable.svelte';
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import FormField from './FormField.svelte';
	import DataTableCell from './DataTableCell.svelte';
	import RowActions from './RowActions.svelte';
	import PageHeader from './PageHeader.svelte';
	import PendingApprovalPanel from '$lib/components/transactions/PendingApprovalPanel.svelte';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
	import type { PendingTransactionType, TableColumn } from '$lib/types';
	import type { FieldDef } from '$lib/types/entity';

	export let title: string;
	export let description: string = '';
	export let entityName: string = 'record';
	export let columns: TableColumn[] = [];
	export let data: any[] = [];
	export let fields: FieldDef[] = [];
	export let searchKeys: string[] = [];
	export let searchPlaceholder: string = 'Search records...';
	export let createLabel: string = 'Add New';
	export let canCreate: boolean = true;
	export let canEdit: boolean = true;
	export let canDelete: boolean = true;
	export let canView: boolean = true;
	export let formSize: 'md' | 'lg' | 'xl' | '2xl' | '3xl' = '2xl';
	export let displayKey: string = '';
	export let onSave: (payload: Record<string, any>, id?: string) => void = () => {};
	export let onDelete: (id: string) => void = () => {};

	// Optional pending-approval integration for list/modal-only transactions.
	// When set, the detail modal renders the shared pending panel and history.
	export let pendingType: PendingTransactionType | null = null;
	export let pendingNumberKey: string = '';

	// Optional dedicated-page mode. When these are set, create/view/edit
	// actions navigate to a full page instead of opening a modal.
	export let createHref: string = '';
	export let viewHref: ((row: any) => string) | null = null;
	export let editHref: ((row: any) => string) | null = null;

	let isFormOpen = false;
	let isDetailOpen = false;
	let editingRow: any = null;
	let detailRow: any = null;
	let formData: Record<string, any> = {};

	// Keep the open detail modal in sync with store updates, for example after
	// the pending panel changes a row from pending to approved.
	$: currentDetailRow = detailRow
		? (data.find((row) => row.id === detailRow.id) ?? detailRow)
		: null;

	$: if (!displayKey && fields.length > 0) {
		displayKey = fields[0].key;
	}

	$: fieldMap = fields.reduce<Record<string, FieldDef>>((acc, field) => {
		acc[field.key] = field;
		return acc;
	}, {});

	function blankForm(): Record<string, any> {
		const result: Record<string, any> = {};
		for (const field of fields) {
			if (field.defaultValue !== undefined) {
				result[field.key] = field.defaultValue;
			} else if (field.type === 'number' || field.type === 'currency') {
				result[field.key] = 0;
			} else if (field.type === 'select') {
				result[field.key] = field.options?.[0]?.value ?? '';
			} else {
				result[field.key] = '';
			}
		}
		return result;
	}

	function openCreate() {
		if (createHref) {
			goto(createHref);
			return;
		}
		editingRow = null;
		formData = blankForm();
		isFormOpen = true;
	}

	function openEdit(row: any) {
		if (editHref) {
			goto(editHref(row));
			return;
		}
		editingRow = row;
		const next: Record<string, any> = {};
		for (const field of fields) {
			next[field.key] = row[field.key] ?? blankForm()[field.key];
		}
		formData = next;
		isFormOpen = true;
	}

	function openDetail(row: any) {
		if (viewHref) {
			goto(viewHref(row));
			return;
		}
		detailRow = row;
		isDetailOpen = true;
	}

	function handleSubmit() {
		for (const field of fields) {
			const value = formData[field.key];
			if (field.required && (value === '' || value === null || value === undefined)) {
				alert(`${field.label} is required.`);
				return;
			}
		}

		const payload: Record<string, any> = {};
		for (const field of fields) {
			const value = formData[field.key];
			payload[field.key] = field.type === 'number' || field.type === 'currency' ? Number(value) || 0 : value;
		}
		onSave(payload, editingRow?.id);
		isFormOpen = false;
	}

	function handleDelete(row: any) {
		const label = row[displayKey] ?? row.id;
		if (confirm(`Delete ${entityName} "${label}"? This action cannot be undone.`)) {
			onDelete(row.id);
		}
	}

	function displayValue(row: any, field: FieldDef) {
		const value = row[field.key];
		if (field.type === 'currency') return formatCurrency(Number(value) || 0);
		if (field.type === 'date') return value ? formatDate(String(value)) : '-';
		if (field.type === 'select') {
			return field.options?.find((option) => option.value === value)?.label ?? value ?? '-';
		}
		return value === '' || value === null || value === undefined ? '-' : value;
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader {title} {description} />
		{#if canCreate}
			<Button variant="primary" on:click={openCreate}>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
					<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
				</svg>
				<span>{createLabel}</span>
			</Button>
		{/if}
	</div>

	<DataTable
		{columns}
		{data}
		{searchKeys}
		{searchPlaceholder}
		emptyMessage="No {entityName} records found"
	>
		<svelte:fragment slot="cell" let:column let:row>
			{@const field = fieldMap[column.key]}
			<DataTableCell
				column={column}
				{row}
				badge={field?.badge}
				badgeLabels={field?.badgeLabels}
			/>
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				extraFirst
				onView={canView ? () => openDetail(row) : undefined}
				onEdit={canEdit ? () => openEdit(row) : undefined}
				onDelete={canDelete ? () => handleDelete(row) : undefined}
			>
				<slot name="extra-actions" {row} />
			</RowActions>
		</svelte:fragment>
	</DataTable>

	<!-- Create / edit modal -->
	<Modal bind:isOpen={isFormOpen} title={editingRow ? `Edit ${entityName}` : `New ${entityName}`} size={formSize}>
		<form on:submit|preventDefault={handleSubmit} class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
				{#each fields as field}
					<div class={field.colSpan === 'full' ? 'sm:col-span-2' : ''}>
						<FormField label={field.label} name={field.key} required={field.required}>
							{#if field.type === 'select'}
								<select id={field.key} bind:value={formData[field.key]} class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">
									{#each field.options ?? [] as option}
										<option value={option.value}>{option.label}</option>
									{/each}
								</select>
							{:else if field.type === 'textarea'}
								<textarea
									id={field.key}
									rows="3"
									bind:value={formData[field.key]}
									placeholder={field.placeholder ?? ''}
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
								></textarea>
							{:else}
								<input
									id={field.key}
									type={field.type === 'currency' || field.type === 'number' ? 'number' : field.type === 'date' ? 'date' : field.type ?? 'text'}
									value={formData[field.key]}
									on:input={(event) =>
										(formData[field.key] =
											field.type === 'currency' || field.type === 'number'
												? Number(event.currentTarget.value)
												: event.currentTarget.value)}
									placeholder={field.placeholder ?? ''}
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none {field.type === 'currency' ? 'font-mono' : ''}"
									required={field.required}
								/>
							{/if}
							{#if field.help}
								<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{field.help}</p>
							{/if}
						</FormField>
					</div>
				{/each}
			</div>
		</form>

		<svelte:fragment slot="footer">
			<Button variant="secondary" on:click={() => (isFormOpen = false)}>Cancel</Button>
			<Button variant="primary" on:click={handleSubmit}>
				{editingRow ? 'Save Changes' : `Create ${entityName}`}
			</Button>
		</svelte:fragment>
	</Modal>

	<!-- Detail modal -->
	<Modal
		bind:isOpen={isDetailOpen}
		title={`${entityName} Details`}
		size={pendingType ? '3xl' : 'xl'}
	>
		{#if currentDetailRow}
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">
				{#each fields as field}
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3 {field.colSpan === 'full' ? 'sm:col-span-2' : ''}">
						<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">{field.label}</p>
						<p class="mt-1 font-medium text-gray-800 dark:text-slate-100 break-words">
							{displayValue(currentDetailRow, field)}
						</p>
					</div>
				{/each}
			</div>

			{#if pendingType}
				<div class="mt-4">
					<PendingApprovalPanel
						transactionType={pendingType}
						transactionId={currentDetailRow.id}
						transactionNumber={pendingNumberKey
							? currentDetailRow[pendingNumberKey]
							: (currentDetailRow[displayKey] ?? currentDetailRow.id)}
						status={currentDetailRow.status ?? 'draft'}
					/>
				</div>
			{/if}
		{/if}

		<svelte:fragment slot="footer">
			<Button variant="secondary" on:click={() => (isDetailOpen = false)}>Close</Button>
		</svelte:fragment>
	</Modal>
</div>
