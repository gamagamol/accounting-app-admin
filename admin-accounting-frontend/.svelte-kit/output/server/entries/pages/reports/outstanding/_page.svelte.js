import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as Badge } from "../../../../chunks/Badge.js";
import { z as purchaseOrders, A as salesOrders, w as billPayments } from "../../../../chunks/dataStore.js";
const OutstandingView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let outstandingBills;
  let totalOutstandingReceivable;
  let pendingDeliveries;
  let totalPendingDeliveryValue;
  let pendingPurchases;
  let totalPendingPurchaseValue;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $billPayments, $$unsubscribe_billPayments;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  const receivableColumns = [
    {
      key: "billNo",
      label: "Invoice No",
      sortable: true
    },
    {
      key: "date",
      label: "Issue Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Customer",
      sortable: true
    },
    { key: "invoiceNo", label: "SO Ref" },
    {
      key: "amount",
      label: "Outstanding Amount",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "status",
      label: "Collection Status",
      align: "center"
    }
  ];
  outstandingBills = $billPayments.filter((b) => b.status === "pending");
  totalOutstandingReceivable = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  pendingDeliveries = $salesOrders.filter((s) => s.status === "pending");
  totalPendingDeliveryValue = pendingDeliveries.reduce((sum, s) => sum + s.total, 0);
  pendingPurchases = $purchaseOrders.filter((p) => p.status === "pending");
  totalPendingPurchaseValue = pendingPurchases.reduce((sum, p) => sum + p.total, 0);
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_salesOrders();
  $$unsubscribe_billPayments();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-amber-50/70 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/40 ring-2 ring-amber-400",
    true
  )}"><span class="text-xs font-semibold text-amber-800 dark:text-amber-300 uppercase tracking-wider" data-svelte-h="svelte-18ry1i7">Unpaid Receivables</span> <p class="text-xl font-bold text-amber-700 dark:text-amber-400 mt-1 font-mono">${escape(formatCurrency(totalOutstandingReceivable))}</p> <span class="text-xs text-amber-600 dark:text-amber-300 mt-1 block">${escape(outstandingBills.length)} invoices awaiting payment</span></button> <button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700",
    true
  )}"><span class="text-xs font-semibold text-blue-800 dark:text-blue-300 uppercase tracking-wider" data-svelte-h="svelte-1sc8rv2">Pending Deliveries</span> <p class="text-xl font-bold text-blue-700 dark:text-blue-400 mt-1 font-mono">${escape(formatCurrency(totalPendingDeliveryValue))}</p> <span class="text-xs text-blue-600 dark:text-blue-300 mt-1 block">${escape(pendingDeliveries.length)} orders awaiting shipment</span></button> <button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-white dark:bg-slate-900 border-gray-200 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-700",
    true
  )}"><span class="text-xs font-semibold text-rose-800 dark:text-rose-300 uppercase tracking-wider" data-svelte-h="svelte-1jqgwia">Payables / Pending POs</span> <p class="text-xl font-bold text-rose-700 dark:text-rose-400 mt-1 font-mono">${escape(formatCurrency(totalPendingPurchaseValue))}</p> <span class="text-xs text-rose-600 dark:text-rose-300 mt-1 block">${escape(pendingPurchases.length)} POs not yet received</span></button></div> <div class="flex justify-between items-center gap-3 flex-wrap"><div class="text-xs font-semibold text-gray-700 dark:text-slate-200">${`List of outstanding customer invoices that are not yet paid.`}</div> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Outstanding Report`;
    }
  })}</div> ${`${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns: receivableColumns,
      data: outstandingBills,
      searchPlaceholder: "Search outstanding invoices...",
      searchKeys: ["billNo", "supplierName", "invoiceNo"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "billNo" ? `<span class="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render($$result, { status: "pending", label: "Unpaid" }, {}, {})}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}`}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Outstanding Report",
      description: "Outstanding receivables, pending deliveries and pending purchase orders."
    },
    {},
    {}
  )} ${validate_component(OutstandingView, "OutstandingView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
