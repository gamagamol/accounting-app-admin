<script lang="ts">
	import { onMount } from 'svelte';
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { periodClosings, periodClosingActions, hydratePeriods } from '$lib/stores/dataStore';
	import { formatDate } from '$lib/utils/formatters';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'period', label: 'Accounting Period', sortable: true },
		{ key: 'startDate', label: 'Start Date', format: (v) => formatDate(v) },
		{ key: 'endDate', label: 'End Date', format: (v) => formatDate(v) },
		{ key: 'status', label: 'Status', align: 'center' },
		{ key: 'closedBy', label: 'Closed By' },
		{ key: 'closedAt', label: 'Closed At', format: (v) => (v ? formatDate(v) : '-') }
	];

	const fields: FieldDef[] = [
		{
			key: 'period',
			label: 'Period Code',
			type: 'text',
			required: true,
			placeholder: '2026-05'
		},
		{ key: 'startDate', label: 'Start Date', type: 'date', required: true },
		{ key: 'endDate', label: 'End Date', type: 'date', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { pending: 'Open', completed: 'Closed' },
			options: [
				{ value: 'pending', label: 'Open' },
				{ value: 'completed', label: 'Closed' }
			]
		},
		{ key: 'closedBy', label: 'Closed By', type: 'text' },
		{ key: 'closedAt', label: 'Closed At', type: 'date' },
		{ key: 'notes', label: 'Closing Notes', type: 'textarea', colSpan: 'full' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await periodClosingActions.update(id, payload);
			else await periodClosingActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save accounting period');
		}
	}

	async function handleDelete(id: string) {
		try {
			await periodClosingActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete accounting period');
		}
	}

	async function handleClose(row: Record<string, any>) {
		if (!confirm(`Close accounting period ${row.period}? No further postings will be allowed.`)) {
			return;
		}
		try {
			await periodClosingActions.closePeriod(row.id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to close accounting period');
		}
	}

	async function handleReopen(row: Record<string, any>) {
		if (!confirm(`Reopen accounting period ${row.period}? Posting will be allowed again.`)) {
			return;
		}
		try {
			await periodClosingActions.reopenPeriod(row.id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to reopen accounting period');
		}
	}

	onMount(() => {
		void hydratePeriods();
	});
</script>

<EntityManager
	title="Closing Period"
	description="Close accounting periods after all transactions are complete. Closed periods stay visible and their transactions become read-only."
	entityName="period"
	{columns}
	{fields}
	data={$periodClosings}
	searchKeys={['period', 'status', 'closedBy', 'notes']}
	searchPlaceholder="Search periods..."
	createLabel="Add Period"
	displayKey="period"
	pendingType="period_closing"
	pendingNumberKey="period"
	onSave={handleSave}
	onDelete={handleDelete}
>
	<svelte:fragment slot="extra-actions" let:row>
		{#if row.status === 'pending' || row.status === 'approved'}
			<button
				type="button"
				class="px-2 py-1 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200"
				title="Close this accounting period"
				on:click={() => handleClose(row)}
			>
				Close
			</button>
		{:else if row.status === 'completed'}
			<button
				type="button"
				class="px-2 py-1 text-[10px] font-bold rounded-md bg-amber-50 text-amber-700 hover:bg-amber-100 dark:bg-amber-500/10 dark:text-amber-200"
				title="Reopen this accounting period"
				on:click={() => handleReopen(row)}
			>
				Reopen
			</button>
		{/if}
	</svelte:fragment>
</EntityManager>
