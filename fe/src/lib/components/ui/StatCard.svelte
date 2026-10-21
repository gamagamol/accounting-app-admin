<script lang="ts">
  export let title: string;
  export let value: string;
  export let icon: string = '💰';
  export let color: 'blue' | 'green' | 'yellow' | 'purple' | 'red' = 'blue';

  const colorClasses: Record<string, string> = {
    blue: 'border-l-blue-500 text-blue-600',
    green: 'border-l-green-500 text-green-600',
    yellow: 'border-l-yellow-500 text-yellow-600',
    purple: 'border-l-purple-500 text-purple-600',
    red: 'border-l-red-500 text-red-600',
  };
</script>

<div class="bg-white rounded-lg shadow-md border-l-4 {colorClasses[color]} p-5 hover:shadow-lg transition-shadow">
  <div class="flex items-center justify-between">
    <div>
      <p class="text-xs font-semibold uppercase tracking-wide {colorClasses[color].split(' ')[1]}">{title}</p>
      <p class="mt-1 text-xl font-bold text-gray-800">{value}</p>
    </div>
    <div class="text-3xl text-gray-300">{icon}</div>
  </div>
</div>
