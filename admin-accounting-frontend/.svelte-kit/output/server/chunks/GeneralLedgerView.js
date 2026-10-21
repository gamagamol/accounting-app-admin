import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component } from "./ssr.js";
import { D as DataTable } from "./DataTable.js";
import { B as Button } from "./Button.js";
import { K as journalEntries, c as chartOfAccounts } from "./dataStore.js";
import { f as formatCurrency, a as formatDate } from "./formatters.js";
const GeneralLedgerView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalJournalAmount;
  let $journalEntries, $$unsubscribe_journalEntries;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_journalEntries = subscribe(journalEntries, (value) => $journalEntries = value);
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  const columns = [
    {
      key: "date",
      label: "Journal Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "reference",
      label: "Reference No",
      sortable: true
    },
    {
      key: "description",
      label: "Transaction Description",
      sortable: true
    },
    {
      key: "debitAccount",
      label: "Debit Account",
      sortable: true
    },
    {
      key: "creditAccount",
      label: "Credit Account",
      sortable: true
    },
    {
      key: "amount",
      label: "Amount (IDR)",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  totalJournalAmount = $journalEntries.reduce((s, j) => s + j.amount, 0);
  $$unsubscribe_journalEntries();
  $$unsubscribe_chartOfAccounts();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-18qfq51">Total General Journal Movements</span> <p class="text-xl font-bold text-gray-900 dark:text-white mt-1 font-mono">${escape(formatCurrency(totalJournalAmount))}</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase" data-svelte-h="svelte-1p37o3m">Active Accounts (COA)</span> <p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">${escape($chartOfAccounts.length)} Accounts</p></div> <div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800" data-svelte-h="svelte-1vmzukl"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">Bookkeeping Balance</span> <p class="text-xl font-bold text-emerald-700 dark:text-emerald-400 mt-1 flex items-center gap-2"><span>Balanced</span> <span class="text-sm">⚖️</span></p></div></div> <div class="flex justify-between items-center"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1jf1kcq">List of general journal entries recording financial and operational transactions.</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print General Journal`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: $journalEntries,
      searchPlaceholder: "Search journals by description, account, or reference number...",
      searchKeys: ["description", "reference", "debitAccount", "creditAccount"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "reference" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${column.key === "debitAccount" ? `<span class="font-medium text-emerald-800 dark:text-emerald-300">${escape(value)}</span>` : `${column.key === "creditAccount" ? `<span class="font-medium text-rose-800 dark:text-rose-300">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
export {
  GeneralLedgerView as G
};
