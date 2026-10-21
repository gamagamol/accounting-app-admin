<script lang="ts">
  export let title: string = '';
  export let padding: boolean = true;
</script>

<div class="bg-white rounded-lg shadow-md overflow-hidden">
  {#if title}
  <div class="px-6 py-4 border-b border-gray-200">
    <h3 class="text-lg font-semibold text-blue-600">{title}</h3>
  </div>
  {/if}
  <div class={padding ? 'p-6' : ''}>
    <slot />
  </div>
</div>
