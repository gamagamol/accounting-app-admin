import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { z as purchaseOrders, A as salesOrders, a3 as taxRates } from "../../../../chunks/dataStore.js";
const TaxSummaryView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let taxRows;
  let outputVat;
  let inputVat;
  let netVat;
  let totalBase;
  let metrics;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $taxRates, $$unsubscribe_taxRates;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_taxRates = subscribe(taxRates, (value) => $taxRates = value);
  const vatRate = ($taxRates.find((t) => t.type === "sales")?.rate ?? 11) / 100;
  const columns = [
    {
      key: "docNo",
      label: "Document No",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "type",
      label: "Tax Type",
      align: "center",
      sortable: true
    },
    {
      key: "counterparty",
      label: "Counterparty",
      sortable: true
    },
    {
      key: "base",
      label: "Tax Base (DPP)",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "rate",
      label: "Rate",
      align: "center",
      format: (v) => `${v}%`
    },
    {
      key: "tax",
      label: "VAT Amount",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  taxRows = [
    ...$salesOrders.map((so) => ({
      docNo: so.salesNo,
      date: so.date,
      type: "Output VAT",
      counterparty: so.customerName,
      base: so.subtotal,
      rate: so.subtotal > 0 ? Math.round(so.tax / so.subtotal * 1e3) / 10 : vatRate * 100,
      tax: so.tax,
      total: so.total
    })),
    ...$purchaseOrders.map((po) => ({
      docNo: po.purchaseNo,
      date: po.date,
      type: "Input VAT",
      counterparty: po.supplierName,
      base: po.subtotal,
      rate: po.subtotal > 0 ? Math.round(po.tax / po.subtotal * 1e3) / 10 : vatRate * 100,
      tax: po.tax,
      total: po.total
    }))
  ].sort((a, b) => b.date.localeCompare(a.date));
  outputVat = taxRows.filter((r) => r.type === "Output VAT").reduce((s, r) => s + r.tax, 0);
  inputVat = taxRows.filter((r) => r.type === "Input VAT").reduce((s, r) => s + r.tax, 0);
  netVat = outputVat - inputVat;
  totalBase = taxRows.reduce((s, r) => s + r.base, 0);
  metrics = [
    {
      label: "Total Tax Base (DPP)",
      value: formatCurrency(totalBase),
      tone: "text-gray-900 dark:text-white"
    },
    {
      label: "Output VAT (Sales)",
      value: formatCurrency(outputVat),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Input VAT (Purchases)",
      value: formatCurrency(inputVat),
      tone: "text-amber-700 dark:text-amber-400"
    },
    {
      label: netVat >= 0 ? "Net VAT Payable" : "Net VAT Creditable",
      value: formatCurrency(Math.abs(netVat)),
      tone: netVat >= 0 ? "text-rose-700 dark:text-rose-400" : "text-emerald-700 dark:text-emerald-400"
    }
  ];
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_salesOrders();
  $$unsubscribe_taxRates();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Tax Summary`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: taxRows,
      searchPlaceholder: "Search document or counterparty...",
      searchKeys: ["docNo", "counterparty", "type"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "docNo" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${column.key === "type" ? `<span class="${"px-2 py-0.5 rounded-full text-xs font-semibold border " + escape(
          value === "Output VAT" ? "bg-blue-50 dark:bg-blue-500/10 text-blue-700 dark:text-blue-300 border-blue-200 dark:border-blue-500/20" : "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300 border-amber-200 dark:border-amber-500/20",
          true
        )}">${escape(value)}</span>` : `${column.key === "tax" ? `<span class="font-mono font-bold text-gray-900 dark:text-gray-100">${escape(formatCurrency(value))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Tax Summary",
      description: "Output and input VAT recap for the reporting period."
    },
    {},
    {}
  )} ${validate_component(TaxSummaryView, "TaxSummaryView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
