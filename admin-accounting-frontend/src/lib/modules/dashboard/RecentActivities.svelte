<script lang="ts">
	import Badge from '$lib/components/ui/Badge.svelte';
	import { salesOrders, systemAlerts } from '$lib/stores/dataStore';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<h4 class="text-sm font-bold text-gray-900 dark:text-white">Recent Sales Orders</h4>
			<a href="/sales" class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">All SO &rarr;</a>
		</div>

		<div class="divide-y divide-gray-100 dark:divide-slate-800">
			{#each $salesOrders.slice(0, 5) as so}
				<div class="py-3 flex items-center justify-between text-xs gap-3">
					<div class="min-w-0">
						<div class="flex items-center gap-2 flex-wrap">
							<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">
								{so.salesNo}
							</span>
							<span class="font-semibold text-gray-900 dark:text-gray-100 truncate">{so.customerName}</span>
						</div>
						<p class="text-gray-500 dark:text-slate-400 text-[11px] mt-0.5">By {so.preparedBy} • {formatDate(so.date)}</p>
					</div>
					<div class="text-right shrink-0">
						<p class="font-mono font-bold text-gray-900 dark:text-gray-100">{formatCurrency(so.total)}</p>
						<Badge status={so.status} label={so.status === 'pending' ? 'Processing' : so.status === 'delivered' ? 'Delivered' : 'Completed'} />
					</div>
				</div>
			{/each}
		</div>
	</div>

	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<div class="flex items-center justify-between mb-4">
			<h4 class="text-sm font-bold text-gray-900 dark:text-white">Due Date & Collection Alerts</h4>
			<span class="text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">
				{$systemAlerts.length} Notifications
			</span>
		</div>

		<div class="space-y-3">
			{#each $systemAlerts as alert}
				<div class="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 text-xs flex items-start gap-3">
					<span class="text-lg mt-0.5">{alert.type === 'debt' ? '⚠️' : alert.type === 'receivable' ? '🔔' : 'ℹ️'}</span>
					<div class="flex-1">
						<p class="font-bold text-gray-900 dark:text-gray-100">{alert.title}</p>
						<p class="text-gray-600 dark:text-slate-300 mt-0.5">{alert.message}</p>
						<a href={alert.link} class="inline-block mt-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px]">
							Follow Up &rarr;
						</a>
					</div>
				</div>
			{/each}
		</div>
	</div>
</div>
