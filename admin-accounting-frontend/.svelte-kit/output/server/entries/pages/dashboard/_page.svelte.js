import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../chunks/formatters.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { t as totalSalesAmount, r as totalReceivableAmount, u as totalPayableAmount, v as paymentCompletionRate, p as payments, w as billPayments, x as deliveries, y as goodsReceipts, z as purchaseOrders, A as salesOrders, B as quotations, s as systemAlerts } from "../../../chunks/dataStore.js";
import { B as Badge } from "../../../chunks/Badge.js";
const DashboardMetrics = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $totalSalesAmount, $$unsubscribe_totalSalesAmount;
  let $totalReceivableAmount, $$unsubscribe_totalReceivableAmount;
  let $totalPayableAmount, $$unsubscribe_totalPayableAmount;
  let $paymentCompletionRate, $$unsubscribe_paymentCompletionRate;
  $$unsubscribe_totalSalesAmount = subscribe(totalSalesAmount, (value) => $totalSalesAmount = value);
  $$unsubscribe_totalReceivableAmount = subscribe(totalReceivableAmount, (value) => $totalReceivableAmount = value);
  $$unsubscribe_totalPayableAmount = subscribe(totalPayableAmount, (value) => $totalPayableAmount = value);
  $$unsubscribe_paymentCompletionRate = subscribe(paymentCompletionRate, (value) => $paymentCompletionRate = value);
  $$unsubscribe_totalSalesAmount();
  $$unsubscribe_totalReceivableAmount();
  $$unsubscribe_totalPayableAmount();
  $$unsubscribe_paymentCompletionRate();
  return `<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Total Sales (SO)",
      value: formatCurrency($totalSalesAmount),
      icon: "📈",
      color: "blue"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Outstanding Receivables",
      value: formatCurrency($totalReceivableAmount),
      icon: "🧾",
      color: "yellow"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Vendor Payables",
      value: formatCurrency($totalPayableAmount),
      icon: "🏦",
      color: "red"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Settlement Rate",
      value: $paymentCompletionRate + "%",
      icon: "🎯",
      color: "green"
    },
    {},
    {}
  )}</div>`;
});
const TransactionFunnel = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let steps;
  let $payments, $$unsubscribe_payments;
  let $billPayments, $$unsubscribe_billPayments;
  let $deliveries, $$unsubscribe_deliveries;
  let $goodsReceipts, $$unsubscribe_goodsReceipts;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_payments = subscribe(payments, (value) => $payments = value);
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  $$unsubscribe_deliveries = subscribe(deliveries, (value) => $deliveries = value);
  $$unsubscribe_goodsReceipts = subscribe(goodsReceipts, (value) => $goodsReceipts = value);
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  steps = [
    {
      label: "Quotation",
      count: $quotations.length,
      color: "bg-blue-500",
      href: "/quotation",
      icon: "📄"
    },
    {
      label: "Sales Order",
      count: $salesOrders.length,
      color: "bg-indigo-500",
      href: "/sales",
      icon: "🛒"
    },
    {
      label: "Purchase Order",
      count: $purchaseOrders.length,
      color: "bg-emerald-500",
      href: "/purchase",
      icon: "🛍️"
    },
    {
      label: "Goods Receipt",
      count: $goodsReceipts.length,
      color: "bg-teal-500",
      href: "/goods",
      icon: "📥"
    },
    {
      label: "Delivery",
      count: $deliveries.length,
      color: "bg-cyan-500",
      href: "/delivery",
      icon: "🚚"
    },
    {
      label: "Sales Invoice",
      count: $billPayments.length,
      color: "bg-amber-500",
      href: "/sales-invoice",
      icon: "🧾"
    },
    {
      label: "Customer Receipt",
      count: $payments.length,
      color: "bg-green-500",
      href: "/customer-receipt",
      icon: "💵"
    }
  ];
  $$unsubscribe_payments();
  $$unsubscribe_billPayments();
  $$unsubscribe_deliveries();
  $$unsubscribe_goodsReceipts();
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_salesOrders();
  $$unsubscribe_quotations();
  return `<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><div class="flex items-center justify-between mb-5 gap-3 flex-wrap" data-svelte-h="svelte-1uvmd2h"><div><h3 class="text-base font-bold text-gray-900 dark:text-white">Transaction Funnel (Pipeline Status)</h3> <p class="text-xs text-gray-500 dark:text-slate-400">Active documents at each stage of the business cycle.</p></div> <a href="/reports/transaction-tracking" class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">View Tracking Details →</a></div> <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">${each(steps, (step) => {
    return `<a${add_attribute("href", step.href, 0)} class="p-3.5 rounded-xl border border-gray-100 dark:border-slate-800 hover:border-gray-300 dark:hover:border-slate-600 hover:shadow-md transition-all flex flex-col items-center text-center group bg-slate-50/50 dark:bg-slate-800/40"><span class="text-2xl mb-1 group-hover:scale-110 transition-transform">${escape(step.icon)}</span> <span class="text-[11px] font-semibold text-gray-600 dark:text-slate-300 truncate w-full">${escape(step.label)}</span> <span class="text-xl font-black text-gray-900 dark:text-white font-mono mt-1">${escape(step.count)}</span> <span class="text-[10px] text-gray-400 dark:text-slate-500 mt-0.5" data-svelte-h="svelte-kcu7ha">Documents</span> </a>`;
  })}</div></div>`;
});
const RecentActivities = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesOrders, $$unsubscribe_salesOrders;
  let $systemAlerts, $$unsubscribe_systemAlerts;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_systemAlerts = subscribe(systemAlerts, (value) => $systemAlerts = value);
  $$unsubscribe_salesOrders();
  $$unsubscribe_systemAlerts();
  return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"><div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><div class="flex items-center justify-between mb-4" data-svelte-h="svelte-eabtmu"><h4 class="text-sm font-bold text-gray-900 dark:text-white">Recent Sales Orders</h4> <a href="/sales" class="text-xs text-blue-600 dark:text-blue-400 hover:underline font-semibold">All SO →</a></div> <div class="divide-y divide-gray-100 dark:divide-slate-800">${each($salesOrders.slice(0, 5), (so) => {
    return `<div class="py-3 flex items-center justify-between text-xs gap-3"><div class="min-w-0"><div class="flex items-center gap-2 flex-wrap"><span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">${escape(so.salesNo)}</span> <span class="font-semibold text-gray-900 dark:text-gray-100 truncate">${escape(so.customerName)}</span></div> <p class="text-gray-500 dark:text-slate-400 text-[11px] mt-0.5">By ${escape(so.preparedBy)} • ${escape(formatDate(so.date))}</p></div> <div class="text-right shrink-0"><p class="font-mono font-bold text-gray-900 dark:text-gray-100">${escape(formatCurrency(so.total))}</p> ${validate_component(Badge, "Badge").$$render(
      $$result,
      {
        status: so.status,
        label: so.status === "pending" ? "Processing" : so.status === "delivered" ? "Delivered" : "Completed"
      },
      {},
      {}
    )}</div> </div>`;
  })}</div></div> <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><div class="flex items-center justify-between mb-4"><h4 class="text-sm font-bold text-gray-900 dark:text-white" data-svelte-h="svelte-1mru39l">Due Date &amp; Collection Alerts</h4> <span class="text-xs text-amber-700 dark:text-amber-300 font-semibold bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded-full border border-amber-200 dark:border-amber-500/20">${escape($systemAlerts.length)} Notifications</span></div> <div class="space-y-3">${each($systemAlerts, (alert) => {
    return `<div class="p-3 rounded-xl border border-gray-100 dark:border-slate-800 bg-gray-50/70 dark:bg-slate-800/40 text-xs flex items-start gap-3"><span class="text-lg mt-0.5">${escape(alert.type === "debt" ? "⚠️" : alert.type === "receivable" ? "🔔" : "ℹ️")}</span> <div class="flex-1"><p class="font-bold text-gray-900 dark:text-gray-100">${escape(alert.title)}</p> <p class="text-gray-600 dark:text-slate-300 mt-0.5">${escape(alert.message)}</p> <a${add_attribute("href", alert.link, 0)} class="inline-block mt-1 text-blue-600 dark:text-blue-400 hover:underline font-semibold text-[11px]">Follow Up →
						</a></div> </div>`;
  })}</div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Dashboard",
      description: "Overview of accounting operations, receivables, vendor payables and transaction flow."
    },
    {},
    {}
  )} ${validate_component(DashboardMetrics, "DashboardMetrics").$$render($$result, {}, {}, {})} ${validate_component(TransactionFunnel, "TransactionFunnel").$$render($$result, {}, {}, {})} ${validate_component(RecentActivities, "RecentActivities").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
