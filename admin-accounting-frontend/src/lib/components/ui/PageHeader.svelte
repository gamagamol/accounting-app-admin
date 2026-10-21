<script lang="ts">
	export let title: string;
	export let subtitle: string = '';
	export let description: string = '';

	$: sub = subtitle || description;
</script>

<div class="mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
	<div>
		<h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">{title}</h1>
		{#if sub}
			<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">{sub}</p>
		{/if}
	</div>
	<div class="flex items-center gap-2">
		<slot />
	</div>
</div>
