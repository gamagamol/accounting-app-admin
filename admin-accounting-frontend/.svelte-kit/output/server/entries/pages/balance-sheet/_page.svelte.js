import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component, g as each } from "../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../chunks/formatters.js";
import { B as Button } from "../../../chunks/Button.js";
import { c as chartOfAccounts } from "../../../chunks/dataStore.js";
const BalanceSheetView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let assetAccounts;
  let liabilityAccounts;
  let equityAccounts;
  let revenueAccounts;
  let expenseAccounts;
  let totalAssets;
  let totalLiabilities;
  let totalEquity;
  let netProfit;
  let totalEquityWithProfit;
  let totalLiabilitiesAndEquity;
  let difference;
  let assetLines;
  let liabilityLines;
  let equityLines;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  const line = (code, name, amount) => ({ code, name, amount });
  assetAccounts = $chartOfAccounts.filter((a) => a.category === "Asset");
  liabilityAccounts = $chartOfAccounts.filter((a) => a.category === "Liability");
  equityAccounts = $chartOfAccounts.filter((a) => a.category === "Equity");
  revenueAccounts = $chartOfAccounts.filter((a) => a.category === "Revenue");
  expenseAccounts = $chartOfAccounts.filter((a) => a.category === "Expense");
  totalAssets = assetAccounts.reduce((s, a) => s + a.balance, 0);
  totalLiabilities = liabilityAccounts.reduce((s, a) => s + a.balance, 0);
  totalEquity = equityAccounts.reduce((s, a) => s + a.balance, 0);
  netProfit = revenueAccounts.reduce((s, a) => s + a.balance, 0) - expenseAccounts.reduce((s, a) => s + a.balance, 0);
  totalEquityWithProfit = totalEquity + netProfit;
  totalLiabilitiesAndEquity = totalLiabilities + totalEquityWithProfit;
  difference = totalAssets - totalLiabilitiesAndEquity;
  assetLines = assetAccounts.map((a) => line(a.code, a.name, a.balance));
  liabilityLines = liabilityAccounts.map((a) => line(a.code, a.name, a.balance));
  equityLines = equityAccounts.map((a) => line(a.code, a.name, a.balance));
  $$unsubscribe_chartOfAccounts();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-ut3fn7">Total Assets</span> <p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">${escape(formatCurrency(totalAssets))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-6m73m9">Liabilities + Equity</span> <p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">${escape(formatCurrency(totalLiabilitiesAndEquity))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-4xgqs6">Balance Status</span> <p class="${"text-xl font-bold " + escape(
    difference === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
    true
  ) + " mt-1 flex items-center gap-2"}"><span>${escape(difference === 0 ? "Balanced" : "Out of Balance")}</span> <span class="text-sm">${escape(difference === 0 ? "⚖️" : "⚠️")}</span></p></div></div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Balance Sheet`;
    }
  })}</div> <div class="grid grid-cols-1 lg:grid-cols-2 gap-4"><div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden"><div class="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50" data-svelte-h="svelte-2tiack"><h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Assets</h3></div> <div class="p-4 space-y-1 text-sm">${each(assetLines, (item) => {
    return `<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70"><span class="text-gray-600 dark:text-slate-300"><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(item.code)}</span>${escape(item.name)}</span> <span class="font-mono text-gray-800 dark:text-slate-100">${escape(formatCurrency(item.amount))}</span> </div>`;
  })} <div class="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-slate-600"><span class="font-bold text-gray-900 dark:text-white" data-svelte-h="svelte-d4koqn">Total Assets</span> <span class="font-mono font-bold text-blue-700 dark:text-blue-400">${escape(formatCurrency(totalAssets))}</span></div></div></div> <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden"><div class="p-4 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-800/50" data-svelte-h="svelte-mm9q0d"><h3 class="text-sm font-bold text-gray-900 dark:text-white uppercase tracking-wider">Liabilities &amp; Equity</h3></div> <div class="p-4 text-sm"><h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2" data-svelte-h="svelte-cf0ku6">Liabilities</h4> ${each(liabilityLines, (item) => {
    return `<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70"><span class="text-gray-600 dark:text-slate-300"><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(item.code)}</span>${escape(item.name)}</span> <span class="font-mono text-gray-800 dark:text-slate-100">${escape(formatCurrency(item.amount))}</span> </div>`;
  })} <div class="flex items-center justify-between py-2 mt-1 border-t border-gray-200 dark:border-slate-700"><span class="font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-rrz9ps">Total Liabilities</span> <span class="font-mono font-semibold text-rose-700 dark:text-rose-400">${escape(formatCurrency(totalLiabilities))}</span></div> <h4 class="text-xs font-bold text-gray-500 dark:text-slate-400 uppercase tracking-wider mb-2 mt-5" data-svelte-h="svelte-vdzrxr">Equity</h4> ${each(equityLines, (item) => {
    return `<div class="flex items-center justify-between py-1.5 border-b border-gray-100 dark:border-slate-800/70"><span class="text-gray-600 dark:text-slate-300"><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(item.code)}</span>${escape(item.name)}</span> <span class="font-mono text-gray-800 dark:text-slate-100">${escape(formatCurrency(item.amount))}</span> </div>`;
  })} <div class="flex items-center justify-between py-1.5"><span class="text-gray-600 dark:text-slate-300" data-svelte-h="svelte-62wws5">Current Period Net Profit</span> <span class="font-mono text-gray-800 dark:text-slate-100">${escape(formatCurrency(netProfit))}</span></div> <div class="flex items-center justify-between py-2 border-t border-gray-200 dark:border-slate-700"><span class="font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-11gkdb2">Total Equity</span> <span class="font-mono font-semibold text-purple-700 dark:text-purple-400">${escape(formatCurrency(totalEquityWithProfit))}</span></div> <div class="flex items-center justify-between pt-3 mt-2 border-t-2 border-gray-300 dark:border-slate-600"><span class="font-bold text-gray-900 dark:text-white" data-svelte-h="svelte-r89e1y">Total Liabilities &amp; Equity</span> <span class="font-mono font-bold text-indigo-700 dark:text-indigo-400">${escape(formatCurrency(totalLiabilitiesAndEquity))}</span></div></div></div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Balance Sheet",
      description: "Financial position: assets, liabilities and equity."
    },
    {},
    {}
  )} ${validate_component(BalanceSheetView, "BalanceSheetView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
