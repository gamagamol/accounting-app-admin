<script lang="ts">
	import { page } from '$app/stores';
	import TransactionPageShell from './TransactionPageShell.svelte';
	import EntityCrudForm from './EntityCrudForm.svelte';
	import EntityCrudDetail from './EntityCrudDetail.svelte';
	import type { CrudDefinition } from './crudDefinitions';

	export let definition: CrudDefinition;
	export let store: CrudDefinition['store'];

	$: segments = ($page.params.rest ?? '').split('/').filter(Boolean);
	$: mode = segments[0] === 'new' ? 'new' : segments[1] === 'edit' ? 'edit' : 'detail';
	$: id = segments[0] === 'new' ? '' : segments[0] ?? '';
	$: record = mode === 'new' ? null : $store.find((item) => item.id === id) ?? null;
</script>

{#if mode === 'new'}
	<EntityCrudForm {definition} />
{:else if record && mode === 'edit'}
	<EntityCrudForm {definition} {record} />
{:else if record}
	<EntityCrudDetail {definition} {record} />
{:else}
	<TransactionPageShell
		title={`${definition.createTitle} Not Found`}
		description="The record may have been deleted or the link is invalid."
		backHref={`/${definition.route}`}
		backLabel={`Back to ${definition.title.toLowerCase()}`}
		eyebrow={definition.eyebrow}
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No {definition.entityName} matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
