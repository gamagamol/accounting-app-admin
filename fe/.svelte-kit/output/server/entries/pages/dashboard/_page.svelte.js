import { c as create_ssr_component, e as escape, s as subscribe, v as validate_component, b as each, d as add_attribute } from "../../../chunks/ssr.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { t as totalSalesAmount, f as totalReceivableAmount, g as totalPayableAmount, p as paymentCompletionRate, h as payments, c as billPayments, i as deliveries, j as goodsReceipts, k as purchaseOrders, b as salesOrders, q as quotations, s as systemAlerts } from "../../../chunks/dataStore.js";
import { a as formatCurrency, f as formatDate } from "../../../chunks/formatters.js";
import { B as Badge } from "../../../chunks/Badge.js";
const StatCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { value } = $$props;
  let { icon = "💰" } = $$props;
  let { color = "blue" } = $$props;
  const colorClasses = {
    blue: "border-l-blue-500 text-blue-600",
    green: "border-l-green-500 text-green-600",
    yellow: "border-l-yellow-500 text-yellow-600",
    purple: "border-l-purple-500 text-purple-600",
    red: "border-l-red-500 text-red-600"
  };
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  return `<div class="${"bg-white rounded-lg shadow-md border-l-4 " + escape(colorClasses[color], true) + " p-5 hover:shadow-lg transition-shadow"}"><div class="flex items-center justify-between"><div><p class="${"text-xs font-semibold uppercase tracking-wide " + escape(colorClasses[color].split(" ")[1], true)}">${escape(title)}</p> <p class="mt-1 text-xl font-bold text-gray-800">${escape(value)}</p></div> <div class="text-3xl text-gray-300">${escape(icon)}</div></div></div>`;
});
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
      title: "Total Penjualan (SO)",
      value: formatCurrency($totalSalesAmount),
      icon: "📈",
      color: "blue"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Piutang Tertunggak",
      value: formatCurrency($totalReceivableAmount),
      icon: "🧾",
      color: "yellow"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Hutang Usaha ke Vendor",
      value: formatCurrency($totalPayableAmount),
      icon: "🏦",
      color: "red"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Persentase Pelunasan",
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
      label: "Bill Payment",
      count: $billPayments.length,
      color: "bg-amber-500",
      href: "/bill",
      icon: "🧾"
    },
    {
      label: "Payment",
      count: $payments.length,
      color: "bg-green-500",
      href: "/payment",
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
  return `<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><div class="flex items-center justify-between mb-5" data-svelte-h="svelte-1hkcnyc"><div><h3 class="text-base font-bold text-gray-900">Alur Funnel Transaksi (Pipeline Status)</h3> <p class="text-xs text-gray-500">Jumlah berkas aktif di setiap tahapan siklus bisnis</p></div> <a href="/report?tab=tracking" class="text-xs text-blue-600 hover:underline font-semibold">Lihat Detail Tracking →</a></div> <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">${each(steps, (step) => {
    return `<a${add_attribute("href", step.href, 0)} class="p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all flex flex-col items-center text-center group bg-slate-50/50"><span class="text-2xl mb-1 group-hover:scale-110 transition-transform">${escape(step.icon)}</span> <span class="text-[11px] font-semibold text-gray-600 truncate w-full">${escape(step.label)}</span> <span class="text-xl font-black text-gray-900 font-mono mt-1">${escape(step.count)}</span> <span class="text-[10px] text-gray-400 mt-0.5" data-svelte-h="svelte-1ka41o8">Dokumen</span> </a>`;
  })}</div></div>`;
});
const RecentActivities = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesOrders, $$unsubscribe_salesOrders;
  let $systemAlerts, $$unsubscribe_systemAlerts;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_systemAlerts = subscribe(systemAlerts, (value) => $systemAlerts = value);
  $$unsubscribe_salesOrders();
  $$unsubscribe_systemAlerts();
  return `<div class="grid grid-cols-1 lg:grid-cols-2 gap-6"> <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><div class="flex items-center justify-between mb-4" data-svelte-h="svelte-mt7iaq"><h4 class="text-sm font-bold text-gray-900">Pesanan Penjualan Terbaru (SO)</h4> <a href="/sales" class="text-xs text-blue-600 hover:underline font-semibold">Semua SO →</a></div> <div class="divide-y divide-gray-100">${each($salesOrders.slice(0, 5), (so) => {
    return `<div class="py-3 flex items-center justify-between text-xs"><div><div class="flex items-center gap-2"><span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${escape(so.salesNo)}</span> <span class="font-semibold text-gray-900">${escape(so.customerName)}</span></div> <p class="text-gray-500 text-[11px] mt-0.5">${escape(formatDate(so.date))} • Oleh: ${escape(so.preparedBy)}</p></div> <div class="text-right"><p class="font-mono font-bold text-gray-900">${escape(formatCurrency(so.total))}</p> ${validate_component(Badge, "Badge").$$render($$result, { status: so.status, label: so.status }, {}, {})}</div> </div>`;
  })}</div></div>  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><div class="flex items-center justify-between mb-4"><h4 class="text-sm font-bold text-gray-900" data-svelte-h="svelte-1wr0pva">Peringatan Jatuh Tempo &amp; Penagihan</h4> <span class="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">${escape($systemAlerts.length)} Pemberitahuan</span></div> <div class="space-y-3">${each($systemAlerts, (alert) => {
    return `<div class="p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs flex items-start gap-3"><span class="text-lg mt-0.5">${escape(alert.type === "debt" ? "⚠️" : alert.type === "receivable" ? "🔔" : "ℹ️")}</span> <div class="flex-1"><p class="font-bold text-gray-900">${escape(alert.title)}</p> <p class="text-gray-600 mt-0.5">${escape(alert.message)}</p> <a${add_attribute("href", alert.link, 0)} class="inline-block mt-1 text-blue-600 hover:underline font-semibold text-[11px]">Tindak Lanjut →
            </a></div> </div>`;
  })}</div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Dashboard Utama",
      description: "Ringkasan kinerja operasional akuntansi, status piutang, hutang vendor, dan arus transaksi"
    },
    {},
    {}
  )}  ${validate_component(DashboardMetrics, "DashboardMetrics").$$render($$result, {}, {}, {})}  ${validate_component(TransactionFunnel, "TransactionFunnel").$$render($$result, {}, {}, {})}  ${validate_component(RecentActivities, "RecentActivities").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
