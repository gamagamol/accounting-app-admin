<script lang="ts">
  export let variant: 'primary' | 'secondary' | 'success' | 'danger' | 'warning' | 'info' = 'primary';
  export let size: 'sm' | 'md' | 'lg' = 'md';
  export let href: string = '';
  export let type: 'button' | 'submit' | 'reset' = 'button';
  export let disabled: boolean = false;

  const variantClasses: Record<string, string> = {
    primary: 'bg-blue-600 hover:bg-blue-700 text-white',
    secondary: 'bg-gray-200 hover:bg-gray-300 text-gray-800',
    success: 'bg-green-600 hover:bg-green-700 text-white',
    danger: 'bg-red-600 hover:bg-red-700 text-white',
    warning: 'bg-yellow-500 hover:bg-yellow-600 text-white',
    info: 'bg-cyan-500 hover:bg-cyan-600 text-white',
  };

  const sizeClasses: Record<string, string> = {
    sm: 'px-3 py-1.5 text-xs',
    md: 'px-4 py-2 text-sm',
    lg: 'px-6 py-3 text-base',
  };
</script>

{#if href}
  <a {href} class="inline-flex items-center gap-2 rounded-lg font-medium transition-colors {variantClasses[variant]} {sizeClasses[size]} {disabled ? 'opacity-50 pointer-events-none' : ''}">
    <slot />
  </a>
{:else}
  <button {type} {disabled} on:click class="inline-flex items-center gap-2 rounded-lg font-medium transition-colors {variantClasses[variant]} {sizeClasses[size]} disabled:opacity-50 disabled:cursor-not-allowed">
    <slot />
  </button>
{/if}
