<script lang="ts">
	import {
		quotations,
		salesOrders,
		purchaseOrders,
		goodsReceipts,
		deliveries,
		billPayments,
		payments
	} from '$lib/stores/dataStore';

	$: steps = [
		{ label: 'Quotation', count: $quotations.length, color: 'bg-blue-500', href: '/quotation', icon: '📄' },
		{ label: 'Sales Order', count: $salesOrders.length, color: 'bg-indigo-500', href: '/sales', icon: '🛒' },
		{ label: 'Purchase Order', count: $purchaseOrders.length, color: 'bg-emerald-500', href: '/purchase', icon: '🛍️' },
		{ label: 'Goods Receipt', count: $goodsReceipts.length, color: 'bg-teal-500', href: '/goods', icon: '📥' },
		{ label: 'Delivery', count: $deliveries.length, color: 'bg-cyan-500', href: '/delivery', icon: '🚚' },
		{ label: 'Sales Invoice', count: $billPayments.length, color: 'bg-amber-500', href: '/sales-invoice', icon: '🧾' },
		{ label: 'Customer Receipt', count: $payments.length, color: 'bg-green-500', href: '/customer-receipt', icon: '💵' }
	];
</script>

<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
	<div class="flex items-center justify-between mb-5 gap-3 flex-wrap">
		<div>
			<h3 class="text-base font-bold text-gray-900 dark:text-white">Transaction Funnel (Pipeline Status)</h3>
			<p class="text-xs text-gray-500 dark:text-slate-400">Active documents at each stage of the business cycle.</p>
		</div>
		<a href="/reports/transaction-tracking" class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">
			View Tracking Details &rarr;
		</a>
	</div>

	<div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
		{#each steps as step}
			<a
				href={step.href}
				class="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md transition-all flex flex-col items-center text-center group bg-slate-50/50 dark:bg-slate-800/40"
			>
				<span class="text-2xl mb-1 group-hover:scale-110 transition-transform">{step.icon}</span>
				<span class="text-[11px] font-semibold text-gray-600 dark:text-slate-300 truncate w-full">{step.label}</span>
				<span class="text-xl font-black text-gray-900 dark:text-white font-mono mt-1">{step.count}</span>
				<span class="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5">Documents</span>
			</a>
		{/each}
	</div>
</div>
