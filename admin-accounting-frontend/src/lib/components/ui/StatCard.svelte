<script lang="ts">
	export let title: string;
	export let value: string;
	export let icon: string = '💰';
	export let color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' | 'slate' = 'blue';
	export let hint: string = '';

	const colorClasses: Record<string, string> = {
		blue: 'border-l-blue-500 text-blue-600 dark:text-blue-300',
		green: 'border-l-emerald-500 text-emerald-600 dark:text-emerald-300',
		yellow: 'border-l-amber-500 text-amber-600 dark:text-amber-300',
		purple: 'border-l-purple-500 text-purple-600 dark:text-purple-300',
		red: 'border-l-rose-500 text-rose-600 dark:text-rose-300',
		slate: 'border-l-slate-500 text-slate-600 dark:text-slate-300'
	};
</script>

<div
	class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 border-l-4 {colorClasses[color]} p-5 hover:shadow-md transition-all"
>
	<div class="flex items-center justify-between gap-3">
		<div class="min-w-0">
			<p class="text-[10px] font-bold uppercase tracking-wider {colorClasses[color].split(' ')[1]}">{title}</p>
			<p class="mt-1 text-xl font-black text-gray-900 dark:text-white truncate">{value}</p>
			{#if hint}
				<p class="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400 truncate">{hint}</p>
			{/if}
		</div>
		<div class="text-2xl opacity-40 dark:opacity-60">{icon}</div>
	</div>
</div>
