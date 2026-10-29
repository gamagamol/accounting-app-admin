<script lang="ts">
	import { page } from '$app/stores';
	import TransactionDetail from './TransactionDetail.svelte';

	export let type: string;

	$: id = $page.params.id ?? '';
</script>

{#if id}
	{#key id}
		<TransactionDetail {type} {id} />
	{/key}
{/if}
