<script lang="ts">
	interface SelectOption {
		value: string;
		label: string;
	}

	export let id: string;
	export let value: string;
	export let options: SelectOption[] = [];
	export let label = '';
	export let allLabel = '';
	export let ariaLabel = '';
</script>

<div class="flex items-center gap-2">
	{#if label}
		<label for={id} class="text-xs text-gray-500 dark:text-slate-400">{label}</label>
	{/if}
	<select
		{id}
		bind:value
		aria-label={ariaLabel || label || id}
		class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs"
	>
		{#if allLabel}
			<option value="all">{allLabel}</option>
		{/if}
		{#each options as option}
			<option value={option.value}>{option.label}</option>
		{/each}
	</select>
</div>
