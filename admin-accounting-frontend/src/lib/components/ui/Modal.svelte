<script lang="ts">
	export let isOpen: boolean = false;
	export let title: string = '';
	export let size: 'sm' | 'md' | 'lg' | 'xl' | '2xl' | '3xl' | '4xl' = 'md';

	const sizeClasses: Record<string, string> = {
		sm: 'max-w-sm',
		md: 'max-w-md',
		lg: 'max-w-lg',
		xl: 'max-w-xl',
		'2xl': 'max-w-2xl',
		'3xl': 'max-w-3xl',
		'4xl': 'max-w-4xl'
	};

	function close() {
		isOpen = false;
	}

	function handleKeydown(e: KeyboardEvent) {
		if (e.key === 'Escape') close();
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<div class="fixed inset-0 z-50 overflow-y-auto">
		<div class="flex min-h-full items-center justify-center p-4">
			<!-- Backdrop -->
			<button
				type="button"
				aria-label="Close dialog"
				class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity w-full h-full border-0 cursor-default"
				on:click={close}
			></button>

			<!-- Modal Content -->
			<div
				class="relative w-full {sizeClasses[size]} bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 transform transition-all"
			>
				<div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800">
					<h3 class="text-lg font-bold text-gray-900 dark:text-white">{title}</h3>
					<button
						type="button"
						on:click={close}
						class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
						aria-label="Close"
					>
						<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
							<path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12" />
						</svg>
					</button>
				</div>
				<div class="px-6 py-4">
					<slot />
				</div>
				{#if $$slots.footer}
					<div class="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2">
						<slot name="footer" />
					</div>
				{/if}
			</div>
		</div>
	</div>
{/if}
