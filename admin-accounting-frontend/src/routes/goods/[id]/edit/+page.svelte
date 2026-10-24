<script lang="ts">
	import { page } from '$app/stores';
	import GoodsFormPage from '$lib/modules/goods/GoodsFormPage.svelte';
	import { goodsReceipts } from '$lib/stores/dataStore';

	$: goodsId = $page.params.id ?? '';
	$: goods = $goodsReceipts.find((item) => item.id === goodsId) ?? null;
</script>

{#if goods}
	<GoodsFormPage {goods} />
{:else}
	<p class="text-sm text-gray-500 dark:text-slate-400">Goods receipt not found.</p>
{/if}
