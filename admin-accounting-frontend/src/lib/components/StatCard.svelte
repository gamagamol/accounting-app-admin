<script lang="ts">
    export let title: string;
    export let value: string | number;
    export let trend: string = '';
</script>

<div class="bg-white p-6 rounded-lg shadow-sm border border-gray-100">
    <h3 class="text-sm font-medium text-gray-500">{title}</h3>
    <div class="mt-2 flex items-baseline gap-2">
        <p class="text-3xl font-semibold text-gray-900">{value}</p>
        {#if trend}
            <span class="text-sm font-medium {trend.startsWith('+') ? 'text-green-600' : 'text-red-600'}">
                {trend}
            </span>
        {/if}
    </div>
</div>