<script lang="ts">
	import { page } from '$app/stores';
	import GoodsDetailPage from '$lib/modules/goods/GoodsDetailPage.svelte';

	$: goodsId = $page.params.id ?? '';
</script>

<GoodsDetailPage {goodsId} />
