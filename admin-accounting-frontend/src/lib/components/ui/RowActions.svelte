<script lang="ts">
	import IconButton from './IconButton.svelte';

	export let onView: (() => void) | undefined = undefined;
	export let onEdit: (() => void) | undefined = undefined;
	export let onDelete: (() => void) | undefined = undefined;
	export let onPrint: (() => void) | undefined = undefined;

	export let viewTitle = 'View details';
	export let editTitle = 'Edit record';
	export let deleteTitle = 'Delete record';
	export let printTitle = 'Print record';

	export let extraFirst = false;
	export let gap: 'tight' | 'normal' = 'tight';
</script>

<div class="flex items-center justify-end {gap === 'normal' ? 'gap-1' : 'gap-0.5'}">
	{#if extraFirst}
		<slot />
	{/if}

	{#if onPrint}
		<IconButton name="print" title={printTitle} on:click={onPrint} />
	{/if}
	{#if onView}
		<IconButton name="view" title={viewTitle} on:click={onView} />
	{/if}
	{#if onEdit}
		<IconButton name="edit" title={editTitle} on:click={onEdit} />
	{/if}
	{#if onDelete}
		<IconButton name="delete" title={deleteTitle} on:click={onDelete} />
	{/if}

	{#if !extraFirst}
		<slot />
	{/if}
</div>
