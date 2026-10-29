<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { appConfigs, appConfigActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'key', label: 'Config Key', sortable: true },
		{ key: 'value', label: 'Value', sortable: true },
		{ key: 'group', label: 'Group', sortable: true },
		{ key: 'dataType', label: 'Data Type', align: 'center' },
		{ key: 'isPublic', label: 'Public', align: 'center' },
		{ key: 'isEditable', label: 'Editable', align: 'center' }
	];

	const fields: FieldDef[] = [
		{ key: 'key', label: 'Config Key', type: 'text', required: true, placeholder: 'company.name' },
		{ key: 'value', label: 'Config Value', type: 'text', required: true, placeholder: 'PT Byond Technology Indonesia' },
		{ key: 'group', label: 'Config Group', type: 'text', placeholder: 'company' },
		{
			key: 'dataType',
			label: 'Data Type',
			type: 'select',
			options: [
				{ value: 'string', label: 'String' },
				{ value: 'number', label: 'Number' },
				{ value: 'boolean', label: 'Boolean' },
				{ value: 'json', label: 'JSON' },
				{ value: 'date', label: 'Date' }
			]
		},
		{
			key: 'isPublic',
			label: 'Public',
			type: 'select',
			options: [
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]
		},
		{
			key: 'isEditable',
			label: 'Editable',
			type: 'select',
			options: [
				{ value: 'yes', label: 'Yes' },
				{ value: 'no', label: 'No' }
			]
		},

		{ key: 'description', label: 'Description', type: 'textarea', colSpan: 'full' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await appConfigActions.update(id, payload);
			else await appConfigActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save configuration.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await appConfigActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete configuration.');
		}
	}
</script>

<EntityManager
	title="Application Configuration"
	description="Central registry for application, accounting and reporting settings stored in masterdata_config."
	entityName="config entry"
	{columns}
	{fields}
	data={$appConfigs}
	searchKeys={['key', 'value', 'group', 'dataType', 'description']}
	searchPlaceholder="Search configuration keys..."
	createLabel="Add Config Entry"
	displayKey="key"
	onSave={handleSave}
	onDelete={handleDelete}
/>
