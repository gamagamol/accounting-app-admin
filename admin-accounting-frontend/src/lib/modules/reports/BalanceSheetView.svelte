<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { chartOfAccounts } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';

	$: assetAccounts = $chartOfAccounts.filter((a) => a.category === 'Asset');
	$: liabilityAccounts = $chartOfAccounts.filter((a) => a.category === 'Liability');
	$: equityAccounts = $chartOfAccounts.filter((a) => a.category === 'Equity');
	$: revenueAccounts = $chartOfAccounts.filter((a) => a.category === 'Revenue');
	$: expenseAccounts = $chartOfAccounts.filter((a) => a.category === 'Expense');

	$: totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
	$: totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
	$: totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);
	$: netProfit =
		revenueAccounts.reduce((s, a) => s + a.balance, 0) -
		expenseAccounts.reduce((s, a) => s + a.balance, 0);
	$: totalEquityWithProfit = totalEquity + netProfit;
	$: totalLiabilitiesAndEquity = totalLiabilities + totalEquityWithProfit;
	$: difference = totalAssets - totalLiabilitiesAndEquity;

	const line = (code: string, name: string, amount: number) => ({ code, name, amount });
	$: assetLines = assetAccounts.map((a) => line(a.code, a.name, a.balance));
	$: liabilityLines = liabilityAccounts.map((a) => line(a.code, a.name, a.balance));
	$: equityLines = equityAccounts.map((a) => line(a.code, a.name, a.balance));
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Assets</span>
			<p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">{formatCurrency(totalAssets)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Liabilities + Equity</span>
			<p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">{formatCurrency(totalLiabilitiesAndEquity)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Balance Status</span>
			<p class="text-xl font-bold {difference === 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'} mt-1 flex items-center gap-2">
				<span>{difference === 0 ? 'Balanced' : 'Out of Balance'}</span>
				<span class="text-sm">{difference === 0 ? '⚖️' : '⚠️'}</span>
			</p>
		</div>
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Balance Sheet</Button>
	</div>

	<div class="grid grid-cols-1 lg:grid-cols-2 gap-4">
		<div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
			<div class="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Assets</h3>
			</div>
			<div class="p-4 space-y-1 text-sm">
				{#each assetLines as item}
					<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70">
						<span class="text-gray-600 dark:text-slate-300">
							<span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{item.code}</span>{item.name}
						</span>
						<span class="font-mono text-gray-800 dark:text-slate-100">{formatCurrency(item.amount)}</span>
					</div>
				{/each}
				<div class="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-slate-600">
					<span class="font-bold text-gray-900 dark:text-white">Total Assets</span>
					<span class="font-mono font-bold text-blue-700 dark:text-blue-400">{formatCurrency(totalAssets)}</span>
				</div>
			</div>
		</div>

		<div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
			<div class="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Liabilities & Equity</h3>
			</div>
			<div class="p-4 text-sm">
				<h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2">Liabilities</h4>
				{#each liabilityLines as item}
					<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70">
						<span class="text-gray-600 dark:text-slate-300">
							<span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{item.code}</span>{item.name}
						</span>
						<span class="font-mono text-gray-800 dark:text-slate-100">{formatCurrency(item.amount)}</span>
					</div>
				{/each}
				<div class="flex items-center justify-between py-2 mt-1 border-t border-gray-200 dark:border-slate-700">
					<span class="font-semibold text-gray-700 dark:text-slate-200">Total Liabilities</span>
					<span class="font-mono font-semibold text-rose-700 dark:text-rose-400">{formatCurrency(totalLiabilities)}</span>
				</div>

				<h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-5">Equity</h4>
				{#each equityLines as item}
					<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70">
						<span class="text-gray-600 dark:text-slate-300">
							<span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{item.code}</span>{item.name}
						</span>
						<span class="font-mono text-gray-800 dark:text-slate-100">{formatCurrency(item.amount)}</span>
					</div>
				{/each}
				<div class="flex items-center justify-between py-1.5">
					<span class="text-gray-600 dark:text-slate-300">Current Period Net Profit</span>
					<span class="font-mono text-gray-800 dark:text-slate-100">{formatCurrency(netProfit)}</span>
				</div>
				<div class="flex items-center justify-between py-2 border-t border-gray-200 dark:border-slate-700">
					<span class="font-semibold text-gray-700 dark:text-slate-200">Total Equity</span>
					<span class="font-mono font-semibold text-purple-700 dark:text-purple-400">{formatCurrency(totalEquityWithProfit)}</span>
				</div>

				<div class="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-slate-600">
					<span class="font-bold text-gray-900 dark:text-white">Total Liabilities & Equity</span>
					<span class="font-mono font-bold text-indigo-700 dark:text-indigo-400">{formatCurrency(totalLiabilitiesAndEquity)}</span>
				</div>
			</div>
		</div>
	</div>
</div>
