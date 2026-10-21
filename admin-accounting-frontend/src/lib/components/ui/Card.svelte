<script lang="ts">
	export let title: string = '';
	export let padding: boolean = true;
</script>

<div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
	{#if title}
		<div class="px-5 py-3.5 border-b border-gray-200 dark:border-slate-800">
			<h3 class="text-sm font-bold text-gray-800 dark:text-white">{title}</h3>
		</div>
	{/if}
	<div class={padding ? 'p-5' : ''}>
		<slot />
	</div>
</div>
