<script lang="ts">
	export let label: string;
	export let value: string | number | null | undefined = '';
	export let mono = false;
</script>

<div class="rounded-lg border border-gray-200 dark:border-slate-800 p-3">
	<p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">{label}</p>
	<p class="mt-1 font-medium text-gray-800 dark:text-slate-100 {mono ? 'font-mono' : ''}">
		{value === '' || value === null || value === undefined ? '—' : value}
	</p>
</div>
