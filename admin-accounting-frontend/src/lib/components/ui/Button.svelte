<script lang="ts">
	export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' | 'ghost' = 'primary';
	export let size: 'sm' | 'md' | 'lg' = 'md';
	export let href: string = '';
	export let type: 'button' | 'submit' | 'reset' = 'button';
	export let disabled: boolean = false;
	export let title: string = '';

	const variantClasses: Record<string, string> = {
		primary: 'bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20',
		secondary:
			'bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-gray-200 dark:border-slate-700',
		success: 'bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20',
		danger: 'bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20',
		warning: 'bg-amber-500 hover:bg-amber-600 text-white',
		info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
		ghost:
			'bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-transparent'
	};

	const sizeClasses: Record<string, string> = {
		sm: 'px-3 py-1.5 text-xs',
		md: 'px-4 py-2 text-sm',
		lg: 'px-6 py-3 text-base'
	};
</script>

{#if href}
	<a
		{href}
		{title}
		on:click
		class="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors {variantClasses[variant]} {sizeClasses[size]} {disabled ? 'opacity-50 pointer-events-none' : ''}"
	>
		<slot />
	</a>
{:else}
	<button
		{type}
		{disabled}
		{title}
		on:click
		class="inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors {variantClasses[variant]} {sizeClasses[size]} {disabled ? 'opacity-50 cursor-not-allowed' : ''}"
	>
		<slot />
	</button>
{/if}
