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
      aria-label="Tutup dialog"
      class="fixed inset-0 bg-black/50 transition-opacity w-full h-full border-0 cursor-default"
      on:click={close}
    ></button>

    <!-- Modal Content -->
    <div class="relative w-full {sizeClasses[size]} bg-white rounded-lg shadow-xl transform transition-all">
      <div class="flex items-center justify-between px-6 py-4 border-b border-gray-200">
        <h3 class="text-lg font-semibold text-gray-800">{title}</h3>
        <button on:click={close} class="text-gray-400 hover:text-gray-600 transition-colors">
          ✕
        </button>
      </div>
      <div class="px-6 py-4">
        <slot />
      </div>
      {#if $$slots.footer}
      <div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">
        <slot name="footer" />
      </div>
      {/if}
    </div>
  </div>
</div>
{/if}
