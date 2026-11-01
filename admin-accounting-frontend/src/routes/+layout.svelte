<script lang="ts">
	import { onMount } from 'svelte';
	import { page } from '$app/stores';
	import '../app.css';
	import AppShell from '$lib/layout/AppShell.svelte';
	import { hydrateBudgetingData, hydrateMasterData, hydratePeriods } from '$lib/stores/dataStore';
	import { initTheme } from '$lib/stores/theme';

	$: isAuthRoute = $page.url.pathname === '/login' || $page.url.pathname === '/register';

	onMount(() => {
		initTheme();
		void hydrateMasterData();
		void hydratePeriods();
		void hydrateBudgetingData();
	});
</script>

{#if isAuthRoute}
	<slot />
{:else}
	<AppShell>
		<slot />
	</AppShell>
{/if}
