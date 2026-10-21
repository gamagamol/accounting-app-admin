<script lang="ts">
  export let label: string;
  export let name: string;
  export let error: string = '';
  export let required: boolean = false;
</script>

<div class="mb-4">
  <label for={name} class="block text-sm font-medium text-gray-700 mb-1">
    {label}
    {#if required}<span class="text-red-500">*</span>{/if}
  </label>
  <slot />
  {#if error}
    <p class="mt-1 text-sm text-red-600">{error}</p>
  {/if}
</div>
