import { c as create_ssr_component, s as subscribe, g as each, f as add_attribute, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { a as formatDate, f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { y as goodsReceipts, z as purchaseOrders, p as payments, w as billPayments, x as deliveries, A as salesOrders, B as quotations } from "../../../../chunks/dataStore.js";
const TransactionTrackingView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let trackingItems;
  let activeTrx;
  let $goodsReceipts, $$unsubscribe_goodsReceipts;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $payments, $$unsubscribe_payments;
  let $billPayments, $$unsubscribe_billPayments;
  let $deliveries, $$unsubscribe_deliveries;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_goodsReceipts = subscribe(goodsReceipts, (value) => $goodsReceipts = value);
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_payments = subscribe(payments, (value) => $payments = value);
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  $$unsubscribe_deliveries = subscribe(deliveries, (value) => $deliveries = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  let selectedTrxIndex = 0;
  trackingItems = $quotations.map((q) => {
    const so = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const doItem = so ? $deliveries.find((d) => d.salesNo === so.salesNo || d.transactionNo === q.transactionNo) : null;
    const bill = so ? $billPayments.find((b) => b.invoiceNo === so.salesNo || b.transactionNo === q.transactionNo) : null;
    const pay = bill ? $payments.find((p) => p.invoiceNo === bill.billNo || p.transactionNo === q.transactionNo) : null;
    const po = $purchaseOrders[0];
    const gr = $goodsReceipts[0];
    return {
      transactionNo: q.transactionNo,
      customerName: q.customerName,
      date: q.date,
      quotation: q,
      salesOrder: so || null,
      purchaseOrder: po || null,
      goodsReceipt: gr || null,
      delivery: doItem || null,
      bill: bill || null,
      payment: pay || null
    };
  });
  activeTrx = trackingItems[selectedTrxIndex] || trackingItems[0];
  $$unsubscribe_goodsReceipts();
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_payments();
  $$unsubscribe_billPayments();
  $$unsubscribe_deliveries();
  $$unsubscribe_salesOrders();
  $$unsubscribe_quotations();
  return `<div class="space-y-6"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase tracking-wider" data-svelte-h="svelte-y5fnc8">Select Transaction Number to Track:</span> <select class="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono font-bold text-gray-900 dark:text-gray-100 bg-white dark:bg-slate-950 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(trackingItems, (item, idx) => {
    return `<option${add_attribute("value", idx, 0)}>${escape(item.transactionNo)} - ${escape(item.customerName)}</option>`;
  })}</select></div> ${activeTrx ? `<div class="text-right"><span class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-10gdq1b">Customer:</span> <p class="font-bold text-gray-900 dark:text-white text-sm">${escape(activeTrx.customerName)}</p> <span class="text-[11px] text-gray-500 dark:text-slate-400">Start Date: ${escape(formatDate(activeTrx.date))}</span></div>` : ``}</div> ${activeTrx ? `<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><h4 class="text-sm font-bold text-gray-900 dark:text-white mb-6 flex items-center gap-2" data-svelte-h="svelte-1kd2ely"><span>🚀</span> <span>Transaction Lifecycle</span></h4> <div class="grid grid-cols-1 md:grid-cols-7 gap-3 relative"><div class="${"p-3 rounded-xl border " + escape(
    activeTrx.quotation ? "bg-blue-50/70 dark:bg-blue-500/10 border-blue-300 dark:border-blue-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1" data-svelte-h="svelte-169s0lx"><span class="text-[10px] font-bold text-blue-800 dark:text-blue-300 uppercase">1. Quotation</span> <span class="text-xs">✅</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.quotation.quotationNo)}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">${escape(formatCurrency(activeTrx.quotation.total))}</p> <span class="inline-block mt-2 text-[10px] bg-blue-100 dark:bg-blue-500/20 text-blue-800 dark:text-blue-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-1tuyaue">Quotation</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.salesOrder ? "bg-indigo-50/70 dark:bg-indigo-500/10 border-indigo-300 dark:border-indigo-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-indigo-800 dark:text-indigo-300 uppercase" data-svelte-h="svelte-63m6aw">2. Sales Order</span> <span>${escape(activeTrx.salesOrder ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.salesOrder?.salesNo || "Not Issued")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">${escape(activeTrx.salesOrder ? formatCurrency(activeTrx.salesOrder.total) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-indigo-100 dark:bg-indigo-500/20 text-indigo-800 dark:text-indigo-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-js2lpm">Deal</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.purchaseOrder ? "bg-emerald-50/70 dark:bg-emerald-500/10 border-emerald-300 dark:border-emerald-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-emerald-800 dark:text-emerald-300 uppercase" data-svelte-h="svelte-180o5fq">3. Purchase Order</span> <span>${escape(activeTrx.purchaseOrder ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.purchaseOrder?.purchaseNo || "No PO Yet")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">${escape(activeTrx.purchaseOrder ? formatCurrency(activeTrx.purchaseOrder.total) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-emerald-100 dark:bg-emerald-500/20 text-emerald-800 dark:text-emerald-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-17i7y90">Procurement</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.goodsReceipt ? "bg-teal-50/70 dark:bg-teal-500/10 border-teal-300 dark:border-teal-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-teal-800 dark:text-teal-300 uppercase" data-svelte-h="svelte-6gd69w">4. Goods Receipt</span> <span>${escape(activeTrx.goodsReceipt ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.goodsReceipt?.receiptNo || "Awaiting Receipt")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">${escape(activeTrx.goodsReceipt ? "Physically Received" : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-teal-100 dark:bg-teal-500/20 text-teal-800 dark:text-teal-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-wpwozf">Warehouse</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.delivery ? "bg-cyan-50/70 dark:bg-cyan-500/10 border-cyan-300 dark:border-cyan-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-cyan-800 dark:text-cyan-300 uppercase" data-svelte-h="svelte-ja2lr7">5. Delivery Order</span> <span>${escape(activeTrx.delivery ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.delivery?.deliveryNo || "Awaiting Shipment")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 mt-0.5">${escape(activeTrx.delivery ? activeTrx.delivery.status : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-cyan-100 dark:bg-cyan-500/20 text-cyan-800 dark:text-cyan-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-o2kq3r">Logistics</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.bill ? "bg-amber-50/70 dark:bg-amber-500/10 border-amber-300 dark:border-amber-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-amber-800 dark:text-amber-300 uppercase" data-svelte-h="svelte-1pegr4f">6. Invoice</span> <span>${escape(activeTrx.bill ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.bill?.billNo || "Not Invoiced")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">${escape(activeTrx.bill ? formatCurrency(activeTrx.bill.amount) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-amber-100 dark:bg-amber-500/20 text-amber-800 dark:text-amber-200 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-1nbyt5p">Billing</span></div> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.payment ? "bg-green-50/70 dark:bg-green-500/10 border-green-300 dark:border-green-500/30" : "bg-gray-50 dark:bg-slate-800/40 border-gray-200 dark:border-slate-800 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-green-800 dark:text-green-300 uppercase" data-svelte-h="svelte-1uit9ea">7. Settlement</span> <span>${escape(activeTrx.payment ? "🎉" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 dark:text-gray-100 truncate">${escape(activeTrx.payment?.paymentNo || "Pending Payment")}</p> <p class="text-[11px] text-gray-500 dark:text-slate-400 font-mono mt-0.5">${escape(activeTrx.payment ? formatCurrency(activeTrx.payment.amount) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-green-100 dark:bg-green-500/20 text-green-800 dark:text-green-200 px-1.5 py-0.5 rounded font-semibold">${escape(activeTrx.payment ? "Fully Paid" : "Outstanding")}</span></div></div></div>` : ``}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Transaction Tracking",
      description: "End-to-end lifecycle tracking from quotation to settlement."
    },
    {},
    {}
  )} ${validate_component(TransactionTrackingView, "TransactionTrackingView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
