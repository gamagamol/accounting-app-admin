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

<div class="border-b border-gray-200">
  <nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">
    {#each tabs as tab}
      <button
        type="button"
        on:click={() => selectTab(tab.id)}
        class="whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors
               {activeTab === tab.id
                 ? 'border-blue-600 text-blue-600 font-semibold'
                 : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'}"
      >
        {#if tab.icon}
          <span>{tab.icon}</span>
        {/if}
        <span>{tab.label}</span>
        {#if tab.badge !== undefined}
          <span
            class="ml-1 px-2 py-0.5 text-xs rounded-full font-bold
                   {activeTab === tab.id ? 'bg-blue-100 text-blue-700' : 'bg-gray-100 text-gray-600'}"
          >
            {tab.badge}
          </span>
        {/if}
      </button>
    {/each}
  </nav>
</div>
