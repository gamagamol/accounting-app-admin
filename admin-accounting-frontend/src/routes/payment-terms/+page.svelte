<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import type { FieldDef } from '$lib/types/entity';
	import { paymentTerms, paymentTermActions } from '$lib/stores/dataStore';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Term Code', sortable: true },
		{ key: 'name', label: 'Term Name', sortable: true },
		{ key: 'days', label: 'Credit Days', sortable: true, align: 'center', format: (v) => `${v} days` },
		{ key: 'description', label: 'Description' }
	];

	const fields: FieldDef[] = [
		{ key: 'code', label: 'Term Code', type: 'text', required: true, placeholder: 'NET-30' },
		{ key: 'name', label: 'Term Name', type: 'text', required: true, placeholder: 'Net 30 Days' },
		{ key: 'days', label: 'Credit Days', type: 'number', required: true },
		{ key: 'description', label: 'Description', type: 'textarea', colSpan: 'full' }
	];

	async function handleSave(payload: Record<string, any>, id?: string) {
		try {
			if (id) await paymentTermActions.update(id, payload);
			else await paymentTermActions.add(payload as any);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save payment term.');
		}
	}

	async function handleDelete(id: string) {
		try {
			await paymentTermActions.delete(id);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to delete payment term.');
		}
	}
</script>

<EntityManager
	title="Terms of Payment"
	description="Define standard payment terms for customers and vendors."
	entityName="payment term"
	{columns}
	{fields}
	data={$paymentTerms}
	searchKeys={['code', 'name', 'description']}
	searchPlaceholder="Search payment terms..."
	createLabel="Add Payment Term"
	displayKey="name"
	onSave={handleSave}
	onDelete={handleDelete}
/>
