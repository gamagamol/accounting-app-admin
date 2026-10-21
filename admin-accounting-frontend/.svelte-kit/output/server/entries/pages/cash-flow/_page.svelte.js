import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../chunks/ssr.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { B as Button } from "../../../chunks/Button.js";
import { l as expenses, m as debtPayments, p as payments } from "../../../chunks/dataStore.js";
const CashFlowView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let cashRows;
  let totalInflow;
  let totalOutflow;
  let netCashFlow;
  let operatingNet;
  let metrics;
  let $expenses, $$unsubscribe_expenses;
  let $debtPayments, $$unsubscribe_debtPayments;
  let $payments, $$unsubscribe_payments;
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  $$unsubscribe_debtPayments = subscribe(debtPayments, (value) => $debtPayments = value);
  $$unsubscribe_payments = subscribe(payments, (value) => $payments = value);
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    { key: "reference", label: "Reference" },
    {
      key: "description",
      label: "Description",
      sortable: true
    },
    {
      key: "category",
      label: "Activity",
      align: "center"
    },
    {
      key: "inflow",
      label: "Cash In",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    },
    {
      key: "outflow",
      label: "Cash Out",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    }
  ];
  cashRows = [
    ...$payments.filter((p) => p.status === "paid").map((p) => ({
      date: p.date,
      reference: p.paymentNo,
      description: `Customer receipt from ${p.customerName}`,
      category: "Operating",
      inflow: p.amount,
      outflow: 0
    })),
    ...$debtPayments.filter((p) => p.status === "paid").map((p) => ({
      date: p.date,
      reference: p.paymentNo,
      description: `Vendor payment to ${p.supplierName}`,
      category: "Operating",
      inflow: 0,
      outflow: p.amount
    })),
    ...$expenses.map((e) => ({
      date: e.date,
      reference: e.expenseNo,
      description: `${e.category}: ${e.description}`,
      category: "Operating",
      inflow: 0,
      outflow: e.amount
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));
  totalInflow = cashRows.reduce((s, r) => s + r.inflow, 0);
  totalOutflow = cashRows.reduce((s, r) => s + r.outflow, 0);
  netCashFlow = totalInflow - totalOutflow;
  operatingNet = cashRows.filter((r) => r.category === "Operating").reduce((s, r) => s + r.inflow - r.outflow, 0);
  metrics = [
    {
      label: "Total Cash In",
      value: formatCurrency(totalInflow),
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Total Cash Out",
      value: formatCurrency(totalOutflow),
      tone: "text-rose-700 dark:text-rose-400"
    },
    {
      label: "Net Cash Flow",
      value: formatCurrency(netCashFlow),
      tone: netCashFlow >= 0 ? "text-blue-700 dark:text-blue-400" : "text-rose-700 dark:text-rose-400"
    },
    {
      label: "Operating Cash Flow",
      value: formatCurrency(operatingNet),
      tone: operatingNet >= 0 ? "text-indigo-700 dark:text-indigo-400" : "text-rose-700 dark:text-rose-400"
    }
  ];
  $$unsubscribe_expenses();
  $$unsubscribe_debtPayments();
  $$unsubscribe_payments();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-between items-center gap-3 flex-wrap"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1dantht">Cash flow derived from customer receipts, vendor payments and operating expenses.</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Cash Flow`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: cashRows,
      searchPlaceholder: "Search reference or description...",
      searchKeys: ["reference", "description", "category"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "inflow" && value > 0 ? `<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">+${escape(formatCurrency(value))}</span>` : `${column.key === "outflow" && value > 0 ? `<span class="font-mono font-bold text-rose-700 dark:text-rose-400">-${escape(formatCurrency(value))}</span>` : `${column.key === "category" ? `<span class="px-2 py-0.5 rounded-full text-xs font-semibold border bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Cash Flow Statement",
      description: "Cash inflows and outflows from operating activities."
    },
    {},
    {}
  )} ${validate_component(CashFlowView, "CashFlowView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
