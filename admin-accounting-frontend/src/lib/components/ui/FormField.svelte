<script lang="ts">
	export let label: string;
	export let name: string;
	export let error: string = '';
	export let required: boolean = false;
	export let hint: string = '';
</script>

<div class="mb-4">
	<label for={name} class="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">
		{label}
		{#if required}<span class="text-rose-500">*</span>{/if}
	</label>
	<slot />
	{#if hint}
		<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{hint}</p>
	{/if}
	{#if error}
		<p class="mt-1 text-xs text-rose-600 dark:text-rose-400">{error}</p>
	{/if}
</div>
