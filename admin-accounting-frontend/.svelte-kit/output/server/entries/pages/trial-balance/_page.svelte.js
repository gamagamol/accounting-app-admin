import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component } from "../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { B as Button } from "../../../chunks/Button.js";
import { c as chartOfAccounts } from "../../../chunks/dataStore.js";
const TrialBalanceView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rows;
  let totalDebit;
  let totalCredit;
  let difference;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  const debitCategories = ["Asset", "Expense"];
  const columns = [
    {
      key: "code",
      label: "Account Code",
      sortable: true
    },
    {
      key: "name",
      label: "Account Name",
      sortable: true
    },
    {
      key: "category",
      label: "Category",
      sortable: true
    },
    {
      key: "debit",
      label: "Debit (IDR)",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    },
    {
      key: "credit",
      label: "Credit (IDR)",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    }
  ];
  rows = $chartOfAccounts.map((acc) => {
    const isDebit = debitCategories.includes(acc.category);
    return {
      code: acc.code,
      name: acc.name,
      category: acc.category,
      debit: isDebit && acc.balance >= 0 ? acc.balance : 0,
      credit: !isDebit && acc.balance >= 0 ? acc.balance : 0
    };
  });
  totalDebit = rows.reduce((s, r) => s + r.debit, 0);
  totalCredit = rows.reduce((s, r) => s + r.credit, 0);
  difference = totalDebit - totalCredit;
  $$unsubscribe_chartOfAccounts();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-d0o0jo">Total Debit</span> <p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">${escape(formatCurrency(totalDebit))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-fyd6u3">Total Credit</span> <p class="text-xl font-bold text-indigo-700 dark:text-indigo-400 mt-1 font-mono">${escape(formatCurrency(totalCredit))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-4xgqs6">Balance Status</span> <p class="${"text-xl font-bold " + escape(
    difference === 0 ? "text-emerald-700 dark:text-emerald-400" : "text-rose-700 dark:text-rose-400",
    true
  ) + " mt-1 flex items-center gap-2"}"><span>${escape(difference === 0 ? "Balanced" : "Out of Balance")}</span> <span class="text-sm">${escape(difference === 0 ? "⚖️" : "⚠️")}</span></p></div></div> <div class="flex justify-between items-center gap-3 flex-wrap"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1ggcq05">Trial balance as of the current period. Debit and credit totals must be equal.</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Trial Balance`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: rows,
      searchPlaceholder: "Search account code or name...",
      searchKeys: ["code", "name", "category"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "code" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Trial Balance",
      description: "Debit and credit balances across the chart of accounts."
    },
    {},
    {}
  )} ${validate_component(TrialBalanceView, "TrialBalanceView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
