<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';

	export let title: string;
	export let description: string = '';
	export let backHref: string;
	export let backLabel: string = 'Back to list';
	export let documentNumber: string = '';
	export let eyebrow: string = '';
</script>

<div class="space-y-5">
	<a
		href={backHref}
		class="inline-flex items-center gap-1.5 text-xs font-semibold text-gray-500 transition-colors hover:text-blue-600 dark:text-slate-400 dark:hover:text-blue-300"
	>
		<span aria-hidden="true">←</span>
		{backLabel}
	</a>

	<div class="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
		<div>
			{#if eyebrow}
				<p class="text-[11px] font-bold uppercase tracking-[0.18em] text-blue-600 dark:text-blue-300">
					{eyebrow}
				</p>
			{/if}
			<PageHeader {title} {description} />
			{#if documentNumber}
				<p class="mt-1 font-mono text-xs font-bold text-gray-500 dark:text-slate-400">{documentNumber}</p>
			{/if}
		</div>
		<div class="flex flex-wrap items-center gap-2">
			<slot name="actions" />
		</div>
	</div>

	<slot />
</div>
