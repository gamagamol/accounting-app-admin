<script lang="ts">
	import { theme, setTheme } from '$lib/stores/theme';

	const options = [
		{
			id: 'light' as const,
			label: 'Light',
			description: 'Bright surfaces for well-lit office environments.',
			icon: '☀️'
		},
		{
			id: 'dark' as const,
			label: 'Dark',
			description: 'Reduced glare and lower eye strain in low light.',
			icon: '🌙'
		}
	];
</script>

<div class="space-y-6 max-w-4xl">
	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
			Appearance & Theme
		</h4>
		<p class="text-xs text-gray-500 dark:text-slate-400 mb-5">
			Choose how the accounting workspace looks. Your preference is saved on this device and applied immediately.
		</p>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			{#each options as option}
				<button
					type="button"
					on:click={() => setTheme(option.id)}
					class="text-left p-5 rounded-2xl border-2 transition-all
						{$theme === option.id
						? 'border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-blue-400'
						: 'border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600'}"
				>
					<div class="flex items-center justify-between mb-3">
						<span class="text-3xl">{option.icon}</span>
						{#if $theme === option.id}
							<span class="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-full">
								Active
							</span>
						{/if}
					</div>
					<p class="text-sm font-bold text-gray-900 dark:text-white">{option.label}</p>
					<p class="text-xs text-gray-500 dark:text-slate-400 mt-1">{option.description}</p>

					<div class="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700">
						<div class="h-16 {option.id === 'dark' ? 'bg-slate-950' : 'bg-slate-100'} p-2 flex gap-2">
							<div class="w-6 rounded {option.id === 'dark' ? 'bg-slate-800' : 'bg-white'}"></div>
							<div class="flex-1 space-y-1.5">
								<div class="h-2.5 rounded {option.id === 'dark' ? 'bg-slate-700' : 'bg-white'} w-3/4"></div>
								<div class="h-2.5 rounded {option.id === 'dark' ? 'bg-slate-800' : 'bg-white'} w-1/2"></div>
								<div class="h-2.5 rounded {option.id === 'dark' ? 'bg-blue-500/60' : 'bg-blue-500'} w-2/3"></div>
							</div>
						</div>
					</div>
				</button>
			{/each}
		</div>

		<div class="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800">
			<p class="text-xs text-gray-500 dark:text-slate-400">
				Current theme: <span class="font-bold text-gray-800 dark:text-slate-100 capitalize">{$theme}</span>
			</p>
		</div>
	</div>
</div>
