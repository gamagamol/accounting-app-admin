<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from './EntityDetailPage.svelte';
	import { auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import type { CrudDefinition } from './crudDefinitions';

	export let definition: CrudDefinition;
	export let record: any = null;

	function handleDelete() {
		if (!record) return;
		const label = record[definition.displayKey] ?? record.id;
		if (!confirm(`Delete ${definition.entityName} "${label}"? This action cannot be undone.`)) return;

		auditLogActions.record({
			module: definition.module,
			entityType: definition.entityType,
			entityId: record.id,
			documentNumber: label,
			action: 'delete',
			actor: $user?.name || 'System User',
			summary: `Deleted ${definition.entityName} ${label}.`,
			description: record.description ?? record.message,
			before: record as Record<string, unknown>
		});
		definition.deleteRecord(record.id);
		goto(`/${definition.route}`);
	}
</script>

<EntityDetailPage
	title={`${definition.createTitle} Details`}
	description={definition.description}
	backHref={`/${definition.route}`}
	backLabel={`Back to ${definition.title.toLowerCase()}`}
	eyebrow={definition.eyebrow}
	fields={definition.fields}
	row={record}
	documentNumber={record?.[definition.displayKey] ?? ''}
	auditEntityType={definition.entityType}
	auditEntityId={record?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if record}
			<Button variant="secondary" href={`/${definition.route}/${record.id}/edit`}>Edit</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>
</EntityDetailPage>
