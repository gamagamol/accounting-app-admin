<script lang="ts">
  export let label: string;
  export let percentage: number;
  export let color: string = 'bg-blue-500';
</script>

<div class="mb-4">
  <div class="flex items-center justify-between mb-1">
    <span class="text-sm font-semibold text-gray-700">{label}</span>
    <span class="text-sm font-semibold text-gray-700">{percentage}%</span>
  </div>
  <div class="w-full bg-gray-200 rounded-full h-2.5">
    <div class="{color} h-2.5 rounded-full transition-all duration-500" style="width: {percentage}%"></div>
  </div>
</div>
