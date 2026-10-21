<script lang="ts">
	import { onMount } from 'svelte';
	import '../app.css';
	import AppShell from '$lib/layout/AppShell.svelte';
	import { initTheme } from '$lib/stores/theme';

	onMount(() => {
		initTheme();
	});
</script>

<AppShell>
	<slot />
</AppShell>
