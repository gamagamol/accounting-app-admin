<script lang="ts">
  export let type: 'success' | 'error' | 'warning' | 'info' = 'info';
  export let message: string;
  export let dismissible: boolean = true;

  let visible = true;

  const typeClasses: Record<string, string> = {
    success: 'bg-green-50 border-green-500 text-green-800',
    error: 'bg-red-50 border-red-500 text-red-800',
    warning: 'bg-yellow-50 border-yellow-500 text-yellow-800',
    info: 'bg-blue-50 border-blue-500 text-blue-800',
  };
</script>

{#if visible}
<div class="border-l-4 p-4 mb-4 rounded-r-lg {typeClasses[type]}" role="alert">
  <div class="flex items-center justify-between">
    <p class="text-sm font-medium">{message}</p>
    {#if dismissible}
      <button on:click={() => visible = false} class="ml-4 text-lg opacity-50 hover:opacity-100">
        ✕
      </button>
    {/if}
  </div>
</div>
{/if}
