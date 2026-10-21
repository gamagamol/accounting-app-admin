<script lang="ts">
	export let label: string;
	export let value: string;
	export let tone: 'default' | 'blue' | 'amber' | 'emerald' = 'default';

	const toneClasses: Record<string, string> = {
		default: 'text-gray-900 dark:text-white',
		blue: 'text-blue-600 dark:text-blue-300',
		amber: 'text-amber-600 dark:text-amber-300',
		emerald: 'text-emerald-600 dark:text-emerald-300'
	};
</script>

<div class="rounded-xl border border-gray-200 dark:border-slate-800 p-3">
	<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">{label}</p>
	<p class="mt-1 font-bold {toneClasses[tone]}">{value}</p>
</div>
