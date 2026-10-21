import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { Y as purchaseInvoices, z as purchaseOrders } from "../../../../chunks/dataStore.js";
const PurchaseByVendorView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let vendorData;
  let totalPurchase;
  let totalInvoiced;
  let totalPaid;
  let totalOutstanding;
  let metrics;
  let $purchaseInvoices, $$unsubscribe_purchaseInvoices;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  $$unsubscribe_purchaseInvoices = subscribe(purchaseInvoices, (value) => $purchaseInvoices = value);
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  const columns = [
    {
      key: "supplierName",
      label: "Vendor / Supplier",
      sortable: true
    },
    {
      key: "orderCount",
      label: "PO Count",
      align: "center",
      sortable: true
    },
    {
      key: "totalPurchase",
      label: "Total Purchases",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "invoiced",
      label: "Invoiced",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "paid",
      label: "Paid",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "outstanding",
      label: "Outstanding",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  vendorData = (() => {
    const map = /* @__PURE__ */ new Map();
    $purchaseOrders.forEach((po) => {
      const existing = map.get(po.supplierName) || {
        supplierName: po.supplierName,
        orderCount: 0,
        totalPurchase: 0,
        invoiced: 0,
        paid: 0,
        outstanding: 0
      };
      existing.orderCount += 1;
      existing.totalPurchase += po.total;
      map.set(po.supplierName, existing);
    });
    $purchaseInvoices.forEach((inv) => {
      const existing = map.get(inv.supplierName);
      if (!existing) return;
      existing.invoiced += inv.amount;
      if (inv.status === "paid") existing.paid += inv.amount;
      else existing.outstanding += inv.amount;
    });
    return Array.from(map.values()).sort((a, b) => b.totalPurchase - a.totalPurchase);
  })();
  totalPurchase = vendorData.reduce((s, v) => s + v.totalPurchase, 0);
  totalInvoiced = vendorData.reduce((s, v) => s + v.invoiced, 0);
  totalPaid = vendorData.reduce((s, v) => s + v.paid, 0);
  totalOutstanding = vendorData.reduce((s, v) => s + v.outstanding, 0);
  metrics = [
    {
      label: "Total Purchases",
      value: formatCurrency(totalPurchase),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Total Invoiced",
      value: formatCurrency(totalInvoiced),
      tone: "text-indigo-700 dark:text-indigo-400"
    },
    {
      label: "Total Paid",
      value: formatCurrency(totalPaid),
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Outstanding Payables",
      value: formatCurrency(totalOutstanding),
      tone: "text-rose-700 dark:text-rose-400"
    }
  ];
  $$unsubscribe_purchaseInvoices();
  $$unsubscribe_purchaseOrders();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Purchase by Vendor`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: vendorData,
      searchPlaceholder: "Search vendor...",
      searchKeys: ["supplierName"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "supplierName" ? `<span class="font-semibold text-gray-900 dark:text-gray-100">${escape(value)}</span>` : `${column.key === "outstanding" ? `<span class="${"font-mono font-bold " + escape(
          value > 0 ? "text-rose-700 dark:text-rose-400" : "text-gray-500 dark:text-slate-400",
          true
        )}">${escape(formatCurrency(value))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Purchase by Vendor",
      description: "Purchase volume, invoicing and payables by vendor."
    },
    {},
    {}
  )} ${validate_component(PurchaseByVendorView, "PurchaseByVendorView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
