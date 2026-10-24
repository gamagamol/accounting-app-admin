<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import { auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import type { CrudDefinition } from './crudDefinitions';

	export let definition: CrudDefinition;
	export let store: CrudDefinition['store'];

	function handleDelete(row: any) {
		const label = row[definition.displayKey] ?? row.id;
		if (!confirm(`Delete ${definition.entityName} "${label}"? This action cannot be undone.`)) return;

		auditLogActions.record({
			module: definition.module,
			entityType: definition.entityType,
			entityId: row.id,
			documentNumber: label,
			action: 'delete',
			actor: $user?.name || 'System User',
			summary: `Deleted ${definition.entityName} ${label}.`,
			description: row.description ?? row.message,
			before: row as Record<string, unknown>
		});
		definition.deleteRecord(row.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
		<PageHeader title={definition.title} description={definition.description} />
		<Button variant="primary" on:click={() => goto(`/${definition.route}/new`)}>
			<svg class="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>{definition.createLabel}</span>
		</Button>
	</div>

	<DataTable
		columns={definition.columns}
		data={$store}
		searchKeys={definition.searchKeys}
		searchPlaceholder={`Search ${definition.entityName} records...`}
		emptyMessage={`No ${definition.entityName} records found`}
	>
		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => goto(`/${definition.route}/${row.id}`)}
				onEdit={() => goto(`/${definition.route}/${row.id}/edit`)}
				onDelete={() => handleDelete(row)}
			/>
		</svelte:fragment>
	</DataTable>
</div>
