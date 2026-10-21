<script lang="ts">
	export let label: string;
	export let percentage: number;
	export let color: string = 'bg-blue-500';
	export let hint: string = '';
</script>

<div class="mb-4">
	<div class="flex items-center justify-between mb-1">
		<span class="text-xs font-semibold text-gray-700 dark:text-slate-300">{label}</span>
		<span class="text-xs font-bold text-gray-700 dark:text-slate-300">{percentage}%</span>
	</div>
	<div class="w-full bg-gray-200 dark:bg-slate-800 rounded-full h-2.5 overflow-hidden">
		<div class="{color} h-2.5 rounded-full transition-all duration-500" style="width: {percentage}%"></div>
	</div>
	{#if hint}
		<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">{hint}</p>
	{/if}
</div>
