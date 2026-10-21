<script lang="ts">
	export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
	export let message: string;
	export let dismissible: boolean = true;

	let visible = true;

	const typeClasses: Record<string, string> = {
		success: 'bg-emerald-50 dark:bg-emerald-500/10 border-emerald-500 text-emerald-800 dark:text-emerald-200',
		error: 'bg-rose-50 dark:bg-rose-500/10 border-rose-500 text-rose-800 dark:text-rose-200',
		warning: 'bg-amber-50 dark:bg-amber-500/10 border-amber-500 text-amber-800 dark:text-amber-200',
		info: 'bg-blue-50 dark:bg-blue-500/10 border-blue-500 text-blue-800 dark:text-blue-200'
	};
</script>

{#if visible}
	<div class="border-l-4 p-4 mb-4 rounded-r-lg {typeClasses[type]}" role="alert">
		<div class="flex items-center justify-between gap-3">
			<p class="text-sm font-medium">{message}</p>
			{#if dismissible}
				<button
					type="button"
					on:click={() => (visible = false)}
					class="text-lg opacity-50 hover:opacity-100 transition-opacity"
					aria-label="Dismiss alert"
				>
					✕
				</button>
			{/if}
		</div>
	</div>
{/if}
