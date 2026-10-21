import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component, g as each } from "../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../chunks/formatters.js";
import { B as Button } from "../../../chunks/Button.js";
import { c as chartOfAccounts } from "../../../chunks/dataStore.js";
const ProfitLossView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let revenueAccounts;
  let expenseAccounts;
  let cogsAccounts;
  let operatingExpenses;
  let totalRevenue;
  let totalCogs;
  let grossProfit;
  let totalOperating;
  let netProfit;
  let marginPct;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  const toLines = (accounts) => accounts.map((a) => ({
    code: a.code,
    name: a.name,
    amount: a.balance
  }));
  revenueAccounts = $chartOfAccounts.filter((a) => a.category === "Revenue");
  expenseAccounts = $chartOfAccounts.filter((a) => a.category === "Expense");
  cogsAccounts = expenseAccounts.filter((a) => a.name.toLowerCase().includes("cost of goods") || a.code.startsWith("5-1"));
  operatingExpenses = expenseAccounts.filter((a) => !cogsAccounts.includes(a));
  totalRevenue = revenueAccounts.reduce((s, a) => s + a.balance, 0);
  totalCogs = cogsAccounts.reduce((s, a) => s + a.balance, 0);
  grossProfit = totalRevenue - totalCogs;
  totalOperating = operatingExpenses.reduce((s, a) => s + a.balance, 0);
  netProfit = grossProfit - totalOperating;
  marginPct = totalRevenue > 0 ? Math.round(netProfit / totalRevenue * 1e3) / 10 : 0;
  $$unsubscribe_chartOfAccounts();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-4 gap-4"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-1h1p096">Total Revenue</span> <p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">${escape(formatCurrency(totalRevenue))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-k6wdo6">Gross Profit</span> <p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">${escape(formatCurrency(grossProfit))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-p6bkwf">Net Profit</span> <p class="${"text-xl font-bold " + escape(
    netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
    true
  ) + " mt-1 font-mono"}">${escape(formatCurrency(netProfit))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-fuyubf">Net Margin</span> <p class="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">${escape(marginPct)}%</p></div></div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Profit &amp; Loss`;
    }
  })}</div> <div class="bg-white dark:bg-slate-900 rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden"><div class="p-5 border-b border-gray-200 dark:border-slate-800" data-svelte-h="svelte-81a6z3"><h3 class="text-base font-bold text-gray-900 dark:text-white">Profit &amp; Loss Statement</h3> <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">For the current reporting period</p></div> <div class="p-5 space-y-6 text-sm"><section><div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800"><h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider" data-svelte-h="svelte-1s4rf0f">Revenue</h4> <span class="font-mono font-bold text-blue-700 dark:text-blue-400">${escape(formatCurrency(totalRevenue))}</span></div> ${each(toLines(revenueAccounts), (line) => {
    return `<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300"><span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(line.code)}</span>${escape(line.name)}</span> <span class="font-mono">${escape(formatCurrency(line.amount))}</span> </div>`;
  })}</section> <section><div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800"><h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider" data-svelte-h="svelte-1yhoq1x">Cost of Goods Sold</h4> <span class="font-mono font-bold text-amber-700 dark:text-amber-400">(${escape(formatCurrency(totalCogs))})</span></div> ${each(toLines(cogsAccounts), (line) => {
    return `<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300"><span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(line.code)}</span>${escape(line.name)}</span> <span class="font-mono">(${escape(formatCurrency(line.amount))})</span> </div>`;
  })}</section> <div class="flex items-center justify-between py-3 border-y-2 border-gray-300 dark:border-slate-600 bg-gray-50 dark:bg-slate-800/60 px-3 rounded"><span class="font-bold text-gray-900 dark:text-white" data-svelte-h="svelte-1cyoq9a">Gross Profit</span> <span class="font-mono font-bold text-indigo-700 dark:text-indigo-300">${escape(formatCurrency(grossProfit))}</span></div> <section><div class="flex items-center justify-between pb-2 border-b border-gray-100 dark:border-slate-800"><h4 class="font-bold text-gray-800 dark:text-slate-100 uppercase text-xs tracking-wider" data-svelte-h="svelte-1ki2chv">Operating Expenses</h4> <span class="font-mono font-bold text-amber-700 dark:text-amber-400">(${escape(formatCurrency(totalOperating))})</span></div> ${each(toLines(operatingExpenses), (line) => {
    return `<div class="flex items-center justify-between py-1.5 text-gray-600 dark:text-slate-300"><span><span class="font-mono text-[11px] text-gray-400 dark:text-slate-500 mr-2">${escape(line.code)}</span>${escape(line.name)}</span> <span class="font-mono">(${escape(formatCurrency(line.amount))})</span> </div>`;
  })}</section> <div class="flex items-center justify-between py-3 border-t-2 border-gray-300 dark:border-slate-600 px-3"><span class="font-bold text-gray-900 dark:text-white text-base" data-svelte-h="svelte-i3air">Net Profit / (Loss)</span> <span class="${"font-mono font-black text-base " + escape(
    netProfit >= 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
    true
  )}">${escape(formatCurrency(netProfit))}</span></div></div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Profit & Loss",
      description: "Revenue, cost of goods sold, operating expenses and net profit."
    },
    {},
    {}
  )} ${validate_component(ProfitLossView, "ProfitLossView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
