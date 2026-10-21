<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { periodClosings, periodClosingActions } from '$lib/stores/dataStore';
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
		{ key: 'period', label: 'Period Name', type: 'text', required: true, placeholder: 'May 2024' },
		{ key: 'startDate', label: 'Start Date', type: 'date', required: true },
		{ key: 'endDate', label: 'End Date', type: 'date', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			badgeLabels: { open: 'Open', closed: 'Closed' },
			options: [
				{ value: 'open', label: 'Open' },
				{ value: 'closed', label: 'Closed' }
			]
		},
		{ key: 'closedBy', label: 'Closed By', type: 'text' },
		{ key: 'closedAt', label: 'Closed At', type: 'date' },
		{ key: 'notes', label: 'Closing Notes', type: 'textarea', colSpan: 'full' }
	];

	function handleSave(payload: Record<string, any>, id?: string) {
		if (id) periodClosingActions.update(id, payload);
		else periodClosingActions.add(payload as any);
	}
</script>

<EntityManager
	title="Period Closing"
	description="Lock accounting periods after all transactions and reconciliations are complete."
	entityName="period"
	{columns}
	{fields}
	data={$periodClosings}
	searchKeys={['period', 'status', 'closedBy', 'notes']}
	searchPlaceholder="Search periods..."
	createLabel="Add Period"
	displayKey="period"
	onSave={handleSave}
	onDelete={(id) => periodClosingActions.delete(id)}
>
	<svelte:fragment slot="extra-actions" let:row>
		{#if row.status === 'open'}
			<button
				type="button"
				class="px-2 py-1 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200"
				title="Close this accounting period"
				on:click={() => {
					if (confirm(`Close accounting period ${row.period}? No further postings will be allowed.`)) {
						periodClosingActions.closePeriod(row.id);
					}
				}}
			>
				Close
			</button>
		{/if}
	</svelte:fragment>
</EntityManager>
