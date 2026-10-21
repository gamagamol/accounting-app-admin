<script lang="ts">
  import { getStatusColor } from '$lib/utils/formatters';
  export let status: string;
  export let label: string = '';
</script>

<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium capitalize {getStatusColor(status)}">
  {label || status}
</span>
