<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from './EntityFormPage.svelte';
	import { auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import type { CrudDefinition } from './crudDefinitions';

	export let definition: CrudDefinition;
	export let record: any = null;

	$: values = record ? { ...record } : definition.defaults?.() ?? {};
	$: backHref = record ? `/${definition.route}/${record.id}` : `/${definition.route}`;
	$: title = record ? `Edit ${definition.createTitle}` : `New ${definition.createTitle}`;
	$: documentNumber = record?.[definition.displayKey] ?? 'Draft document';

	async function handleSubmit(payload: Record<string, any>) {
		const before = record ? (record as Record<string, unknown>) : null;
		let saved: any;

		try {
			if (record) {
				await definition.updateRecord(record.id, payload);
				saved = { ...record, ...payload };
			} else {
				saved = await definition.createRecord(payload);
			}
		} catch (error) {
			alert(error instanceof Error ? error.message : `Failed to save ${definition.entityName}.`);
			return;
		}

		if (!saved) {
			saved = { ...payload };
		}

		auditLogActions.record({
			module: definition.module,
			entityType: definition.entityType,
			entityId: saved.id,
			documentNumber: saved[definition.displayKey] ?? saved.id,
			action: record ? 'update' : 'create',
			actor: $user?.name || 'System User',
			summary: `${record ? 'Updated' : 'Created'} ${definition.entityName} ${saved[definition.displayKey] ?? saved.id}.`,
			description: payload.description ?? saved.description ?? saved.message,
			before,
			after: saved as Record<string, unknown>
		});

		goto(`/${definition.route}/${saved.id}`);
	}
</script>

<EntityFormPage
	{title}
	description={definition.description}
	{backHref}
	backLabel={`Back to ${definition.title.toLowerCase()}`}
	eyebrow={definition.eyebrow}
	fields={definition.fields}
	{values}
	submitLabel={record ? 'Save Changes' : `Create ${definition.createTitle}`}
	onSubmit={handleSubmit}
	auditEntityType={definition.entityType}
	auditEntityId={record?.id ?? 'new'}
	{documentNumber}
/>
