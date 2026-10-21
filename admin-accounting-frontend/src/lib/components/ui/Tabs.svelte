<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import type { TabItem } from '$lib/types';

	export let tabs: TabItem[] = [];
	export let activeTab: string = tabs[0]?.id || '';

	const dispatch = createEventDispatcher();

	function selectTab(id: string) {
		activeTab = id;
		dispatch('change', id);
	}
</script>

<div class="border-b border-gray-200 dark:border-slate-800 overflow-x-auto">
	<nav class="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">
		{#each tabs as tab}
			<button
				type="button"
				on:click={() => selectTab(tab.id)}
				class="whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors
				       {activeTab === tab.id
				       	? 'border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-400 font-semibold'
				       	: 'border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600'}"
			>
				{#if tab.icon}
					<span>{tab.icon}</span>
				{/if}
				<span>{tab.label}</span>
				{#if tab.badge !== undefined}
					<span
						class="ml-1 px-2 py-0.5 text-xs rounded-full font-bold
						       {activeTab === tab.id
						       	? 'bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200'
						       	: 'bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300'}"
					>
						{tab.badge}
					</span>
				{/if}
			</button>
		{/each}
	</nav>
</div>
