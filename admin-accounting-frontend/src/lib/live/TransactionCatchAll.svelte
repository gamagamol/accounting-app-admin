<script lang="ts">
	import { page } from '$app/stores';
	import TransactionForm from './TransactionForm.svelte';
	import TransactionDetail from './TransactionDetail.svelte';

	export let type: string;

	$: rest = ($page.params.rest ?? '').replace(/^\/+|\/+$/g, '');
	$: segments = rest.split('/').filter(Boolean);
	$: isNew = segments[0] === 'new';
	$: id = segments[0] ?? '';
</script>

{#if isNew}
	<TransactionForm {type} />
{:else if id}
	<TransactionDetail {type} {id} />
{:else}
	<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
		Transaction route not found.
	</div>
{/if}
