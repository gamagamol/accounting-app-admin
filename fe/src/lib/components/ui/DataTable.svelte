<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import type { TableColumn } from '$lib/types';

  export let columns: TableColumn[] = [];
  export let data: any[] = [];
  export let searchable: boolean = true;
  export let searchPlaceholder: string = 'Search records...';
  export let searchKeys: string[] = [];
  export let pageSize: number = 5; // Default 5 items as requested
  export let pageSizeOptions: number[] = [5, 10, 25, 50];
  export let emptyMessage: string = 'No records found';
  export let showPagination: boolean = true;

  const dispatch = createEventDispatcher();

  let searchTerm: string = '';
  let currentPage: number = 1;
  let sortKey: string = '';
  let sortDirection: 'asc' | 'desc' = 'asc';

  function handleSort(key: string, sortable?: boolean) {
    if (!sortable) return;
    if (sortKey === key) {
      sortDirection = sortDirection === 'asc' ? 'desc' : 'asc';
    } else {
      sortKey = key;
      sortDirection = 'asc';
    }
  }

  $: filteredData = data.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const keysToCheck = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
    return keysToCheck.some((key) => {
      const val = row[key];
      if (val === null || val === undefined) return false;
      return String(val).toLowerCase().includes(term);
    });
  });

  $: sortedData = [...filteredData].sort((a, b) => {
    if (!sortKey) return 0;
    const valA = a[sortKey];
    const valB = b[sortKey];
    if (valA === valB) return 0;
    if (valA === null || valA === undefined) return 1;
    if (valB === null || valB === undefined) return -1;

    let comp = 0;
    if (typeof valA === 'number' && typeof valB === 'number') {
      comp = valA - valB;
    } else {
      comp = String(valA).localeCompare(String(valB));
    }
    return sortDirection === 'asc' ? comp : -comp;
  });

  $: totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  $: {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  }

  $: paginatedData = showPagination
    ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize)
    : sortedData;

  $: startRange = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  $: endRange = Math.min(currentPage * pageSize, sortedData.length);

  // Generate page numbers array for pagination
  $: pageNumbers = (() => {
    const pages = [];
    const maxVisible = 5;
    let start = Math.max(1, currentPage - Math.floor(maxVisible / 2));
    let end = Math.min(totalPages, start + maxVisible - 1);
    if (end - start + 1 < maxVisible) {
      start = Math.max(1, end - maxVisible + 1);
    }
    for (let i = start; i <= end; i++) {
      pages.push(i);
    }
    return pages;
  })();
</script>

<div class="space-y-4">
  <!-- Table Controls (Search & Page Size) -->
  {#if searchable || $$slots.controls || showPagination}
    <div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
      {#if searchable}
        <div class="relative max-w-sm w-full">
          <div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
          </div>
          <input
            type="text"
            bind:value={searchTerm}
            placeholder={searchPlaceholder}
            class="block w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"
          />
          {#if searchTerm}
            <button
              type="button"
              on:click={() => (searchTerm = '')}
              class="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
              aria-label="Clear search"
            >
              ✕
            </button>
          {/if}
        </div>
      {:else}
        <div></div>
      {/if}

      <div class="flex items-center gap-3">
        <slot name="controls" />

        {#if showPagination}
          <div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-gray-400">
            <span>Rows:</span>
            <select
              bind:value={pageSize}
              class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
            >
              {#each pageSizeOptions as opt}
                <option value={opt}>{opt}</option>
              {/each}
            </select>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <!-- Table Container -->
  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors">
    <div class="overflow-x-auto min-h-[140px]">
      <table class="min-w-full divide-y divide-gray-200 dark:divide-slate-800">
        <thead class="bg-slate-50 dark:bg-slate-950/60">
          <tr>
            <th class="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12">
              #
            </th>
            {#each columns as col}
              <th
                class="px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none
                       {col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}
                       {col.sortable !== false ? 'cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors' : ''}"
                on:click={() => handleSort(col.key, col.sortable !== false)}
              >
                <div class="inline-flex items-center gap-1.5 {col.align === 'right' ? 'justify-end' : col.align === 'center' ? 'justify-center' : ''}">
                  <span>{col.label}</span>
                  {#if col.sortable !== false}
                    <span class="text-xs text-gray-400">
                      {#if sortKey === col.key}
                        {sortDirection === 'asc' ? '▲' : '▼'}
                      {:else}
                        <span class="opacity-30">⇅</span>
                      {/if}
                    </span>
                  {/if}
                </div>
              </th>
            {/each}
            {#if $$slots.actions}
              <th class="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28">
                Actions
              </th>
            {/if}
          </tr>
        </thead>
        <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">
          {#if paginatedData.length === 0}
            <tr>
              <td
                colspan={columns.length + 1 + ($$slots.actions ? 1 : 0)}
                class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"
              >
                <div class="flex flex-col items-center justify-center space-y-2">
                  <div class="text-gray-300 dark:text-slate-700 text-4xl">📂</div>
                  <p class="font-medium text-gray-600 dark:text-gray-300">{emptyMessage}</p>
                  {#if searchTerm}
                    <p class="text-xs text-gray-400 dark:text-gray-500">Try modifying your search query</p>
                  {/if}
                </div>
              </td>
            </tr>
          {:else}
            {#each paginatedData as row, idx}
              <tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors">
                <td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono text-center">
                  {(currentPage - 1) * pageSize + idx + 1}
                </td>
                {#each columns as col}
                  <td
                    class="px-4 py-3 text-sm text-gray-800 dark:text-gray-200
                           {col.align === 'right' ? 'text-right' : col.align === 'center' ? 'text-center' : 'text-left'}"
                  >
                    {#if $$slots.cell}
                      <slot name="cell" {row} column={col} value={row[col.key]}>
                        {col.format ? col.format(row[col.key], row) : row[col.key] ?? '-'}
                      </slot>
                    {:else if col.format}
                      {col.format(row[col.key], row)}
                    {:else}
                      {row[col.key] ?? '-'}
                    {/if}
                  </td>
                {/each}
                {#if $$slots.actions}
                  <td class="px-4 py-3 text-right text-sm font-medium whitespace-nowrap">
                    <slot name="actions" {row} />
                  </td>
                {/if}
              </tr>
            {/each}
          {/if}
        </tbody>
      </table>
    </div>

    <!-- Complete Pagination Footer -->
    {#if showPagination && sortedData.length > 0}
      <div class="px-4 py-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-gray-400">
        <div>
          Showing <span class="font-semibold text-gray-700 dark:text-gray-200">{startRange}</span> to <span class="font-semibold text-gray-700 dark:text-gray-200">{endRange}</span> of <span class="font-semibold text-gray-700 dark:text-gray-200">{sortedData.length}</span> entries
          {#if totalPages > 1}
            <span class="mx-1.5">•</span>
            <span>Page <strong class="text-gray-700 dark:text-gray-200">{currentPage}</strong> of <strong class="text-gray-700 dark:text-gray-200">{totalPages}</strong></span>
          {/if}
        </div>

        {#if totalPages > 1}
          <div class="flex items-center gap-1">
            <button
              type="button"
              disabled={currentPage === 1}
              on:click={() => (currentPage = 1)}
              class="px-2 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              title="First Page"
            >
              «
            </button>
            <button
              type="button"
              disabled={currentPage === 1}
              on:click={() => (currentPage = Math.max(1, currentPage - 1))}
              class="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Prev
            </button>

            {#each pageNumbers as p}
              <button
                type="button"
                on:click={() => (currentPage = p)}
                class="min-w-[28px] h-7 px-1.5 rounded font-medium text-xs transition-colors
                       {currentPage === p
                         ? 'bg-blue-600 text-white font-bold'
                         : 'border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300'}"
              >
                {p}
              </button>
            {/each}

            <button
              type="button"
              disabled={currentPage === totalPages}
              on:click={() => (currentPage = Math.min(totalPages, currentPage + 1))}
              class="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
            >
              Next
            </button>
            <button
              type="button"
              disabled={currentPage === totalPages}
              on:click={() => (currentPage = totalPages)}
              class="px-2 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed"
              title="Last Page"
            >
              »
            </button>
          </div>
        {/if}
      </div>
    {/if}
  </div>
</div>
