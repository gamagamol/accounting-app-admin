<script lang="ts">
	export let name: 'view' | 'edit' | 'delete' | 'print' | 'add' | 'refresh' = 'view';
	export let title: string = '';
	export let disabled: boolean = false;

	const tones: Record<string, string> = {
		view: 'text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10',
		edit: 'text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10',
		delete: 'text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10',
		print: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60',
		add: 'text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10',
		refresh: 'text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60'
	};
</script>

<button
	type="button"
	{disabled}
	{title}
	aria-label={title || name}
	class="p-1.5 rounded-lg transition-colors {tones[name]} disabled:opacity-40 disabled:cursor-not-allowed"
	on:click
>
	<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">
		{#if name === 'view'}
			<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
			<path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
		{:else if name === 'edit'}
			<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
		{:else if name === 'delete'}
			<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
		{:else if name === 'print'}
			<path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
		{:else if name === 'add'}
			<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
		{:else}
			<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15" />
		{/if}
	</svg>
</button>
