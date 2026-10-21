<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import { chartOfAccounts } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';

	interface StatementLine {
		code: string;
		name: string;
		amount: number;
	}

	$: revenueAccounts = $chartOfAccounts.filter((a) => a.category === 'Revenue');
	$: expenseAccounts = $chartOfAccounts.filter((a) => a.category === 'Expense');

	$: cogsAccounts = expenseAccounts.filter(
		(a) => a.name.toLowerCase().includes('cost of goods') || a.code.startsWith('5-1')
	);
	$: operatingExpenses = expenseAccounts.filter((a) => !cogsAccounts.includes(a));

	$: totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
	$: totalCogs = cogsAccounts.reduce((s, a) => s + a.balance, 0);
	$: grossProfit = totalRevenue - totalCogs;
	$: totalOperating = operatingExpenses.reduce((s, a) => s + a.balance, 0);
	$: netProfit = grossProfit - totalOperating;
	$: marginPct = totalRevenue > 0 ? Math.round((netProfit / totalRevenue) * 1000) / 10 : 0;

	const toLines = (accounts: typeof revenueAccounts): StatementLine[] =>
		accounts.map((a) => ({ code: a.code, name: a.name, amount: a.balance }));
</script>

<div class="space-y-6">
	<div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Total Revenue</span>
			<p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">{formatCurrency(totalRevenue)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Gross Profit</span>
			<p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">{formatCurrency(grossProfit)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Net Profit</span>
			<p class="text-xl font-bold {netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'} mt-1 font-mono">{formatCurrency(netProfit)}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
			<span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Net Margin</span>
			<p class="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">{marginPct}%</p>
		</div>
	</div>

	<div class="flex justify-end gap-2">
		<Button variant="secondary" size="sm" on:click={() => window.print()}>🖨️ Print Profit & Loss</Button>
	</div>

	<div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
		<div class="p-5 border-b border-gray-200 dark:border-slate-800">
			<h3 class="text-base font-bold text-gray-900 dark:text-white">Profit & Loss Statement</h3>
			<p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">For the current reporting period</p>
		</div>

		<div class="p-5 space-y-6 text-sm">
			<section>
				<div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
					<h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider">Revenue</h4>
					<span class="font-mono font-bold text-blue-700 dark:text-blue-400">{formatCurrency(totalRevenue)}</span>
				</div>
				{#each toLines(revenueAccounts) as line}
					<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300">
						<span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{line.code}</span>{line.name}</span>
						<span class="font-mono">{formatCurrency(line.amount)}</span>
					</div>
				{/each}
			</section>

			<section>
				<div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
					<h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider">Cost of Goods Sold</h4>
					<span class="font-mono font-bold text-amber-700 dark:text-amber-400">({formatCurrency(totalCogs)})</span>
				</div>
				{#each toLines(cogsAccounts) as line}
					<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300">
						<span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{line.code}</span>{line.name}</span>
						<span class="font-mono">({formatCurrency(line.amount)})</span>
					</div>
				{/each}
			</section>

			<div class="flex items-center justify-between py-3 border-y-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/60 px-3 rounded">
				<span class="font-bold text-gray-900 dark:text-white">Gross Profit</span>
				<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300">{formatCurrency(grossProfit)}</span>
			</div>

			<section>
				<div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800">
					<h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider">Operating Expenses</h4>
					<span class="font-mono font-bold text-amber-700 dark:text-amber-400">({formatCurrency(totalOperating)})</span>
				</div>
				{#each toLines(operatingExpenses) as line}
					<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300">
						<span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">{line.code}</span>{line.name}</span>
						<span class="font-mono">({formatCurrency(line.amount)})</span>
					</div>
				{/each}
			</section>

			<div class="flex items-center justify-between py-3 border-t-2 border-gray-300 dark:border-slate-600 px-3">
				<span class="font-bold text-gray-900 dark:text-white text-base">Net Profit / (Loss)</span>
				<span class="font-mono font-black text-base {netProfit >= 0 ? 'text-emerald-700 dark:text-emerald-400' : 'text-rose-700 dark:text-rose-400'}">
					{formatCurrency(netProfit)}
				</span>
			</div>
		</div>
	</div>
</div>
