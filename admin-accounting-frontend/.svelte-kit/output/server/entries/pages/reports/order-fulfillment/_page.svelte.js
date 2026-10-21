import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as Badge } from "../../../../chunks/Badge.js";
import { x as deliveries, A as salesOrders } from "../../../../chunks/dataStore.js";
const OrderFulfillmentView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let reportData;
  let totalValue;
  let fullyDelivered;
  let avgFulfillment;
  let metrics;
  let $deliveries, $$unsubscribe_deliveries;
  let $salesOrders, $$unsubscribe_salesOrders;
  $$unsubscribe_deliveries = subscribe(deliveries, (value) => $deliveries = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  const columns = [
    {
      key: "salesNo",
      label: "Sales Order No",
      sortable: true
    },
    {
      key: "date",
      label: "Order Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    {
      key: "total",
      label: "Order Value",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    { key: "deliveryNo", label: "Delivery No" },
    {
      key: "deliveryCount",
      label: "DO Count",
      align: "center"
    },
    {
      key: "fulfillment",
      label: "Fulfillment",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
    }
  ];
  reportData = $salesOrders.map((so) => {
    const related = $deliveries.filter((d) => d.salesNo === so.salesNo);
    const isDelivered = related.some((d) => d.status === "delivered");
    const isShipped = related.some((d) => d.status === "shipped");
    const fulfillment = isDelivered ? 100 : isShipped ? 50 : related.length > 0 ? 25 : 0;
    return {
      salesNo: so.salesNo,
      date: so.date,
      customerName: so.customerName,
      total: so.total,
      deliveryCount: related.length,
      deliveryNo: related[0]?.deliveryNo || "-",
      lastDeliveryDate: related[0]?.date || "",
      status: so.status,
      fulfillment
    };
  });
  totalValue = reportData.reduce((s, r) => s + r.total, 0);
  fullyDelivered = reportData.filter((r) => r.fulfillment === 100).length;
  avgFulfillment = reportData.length > 0 ? Math.round(reportData.reduce((s, r) => s + r.fulfillment, 0) / reportData.length) : 0;
  metrics = [
    {
      label: "Total Order Value",
      value: formatCurrency(totalValue),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Fully Delivered Orders",
      value: `${fullyDelivered} / ${reportData.length}`,
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Average Fulfillment",
      value: `${avgFulfillment}%`,
      tone: "text-indigo-700 dark:text-indigo-400"
    }
  ];
  $$unsubscribe_deliveries();
  $$unsubscribe_salesOrders();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Fulfillment Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: reportData,
      searchPlaceholder: "Search by SO number or customer...",
      searchKeys: ["salesNo", "customerName", "deliveryNo"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "salesNo" ? `<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">${escape(value)}</span>` : `${column.key === "fulfillment" ? `<div class="flex items-center justify-center gap-2"><div class="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden"><div class="${escape(
          value === 100 ? "bg-emerald-600" : value >= 50 ? "bg-amber-500" : "bg-rose-500",
          true
        ) + " h-2 rounded-full"}" style="${"width: " + escape(value, true) + "%"}"></div></div> <span class="font-bold text-xs font-mono text-gray-700 dark:text-slate-200">${escape(value)}%</span></div>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
          $$result,
          {
            status: value,
            label: value === "pending" ? "Pending" : value === "delivered" ? "Delivered" : "Completed"
          },
          {},
          {}
        )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Order Fulfillment (SO vs DO)",
      description: "Delivery fulfillment rate for every sales order."
    },
    {},
    {}
  )} ${validate_component(OrderFulfillmentView, "OrderFulfillmentView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
