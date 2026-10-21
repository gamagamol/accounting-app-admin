import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as Badge } from "../../../../chunks/Badge.js";
import { A as salesOrders, B as quotations } from "../../../../chunks/dataStore.js";
const QuotationVsPoView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let reportData;
  let totalQuotation;
  let totalSales;
  let conversionRate;
  let metrics;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  const columns = [
    {
      key: "quotationNo",
      label: "Quotation No",
      sortable: true
    },
    {
      key: "customerName",
      label: "Customer Name",
      sortable: true
    },
    {
      key: "quotationDate",
      label: "Quotation Date"
    },
    {
      key: "quotationTotal",
      label: "Quotation Value",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    { key: "salesNo", label: "SO No (Actual)" },
    {
      key: "salesTotal",
      label: "SO Value",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    },
    {
      key: "status",
      label: "Deal Status",
      align: "center",
      sortable: true
    }
  ];
  reportData = $quotations.map((q) => {
    const matchedSO = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const salesTotal = matchedSO ? matchedSO.total : 0;
    const variance = salesTotal - q.total;
    return {
      quotationNo: q.quotationNo,
      customerName: q.customerName,
      quotationDate: q.date,
      quotationTotal: q.total,
      salesNo: matchedSO ? matchedSO.salesNo : "-",
      salesDate: matchedSO ? matchedSO.date : "-",
      salesTotal,
      variance,
      status: matchedSO ? "Won (SO Issued)" : "Pending Quotation"
    };
  });
  totalQuotation = reportData.reduce((sum, r) => sum + r.quotationTotal, 0);
  totalSales = reportData.reduce((sum, r) => sum + r.salesTotal, 0);
  conversionRate = totalQuotation > 0 ? Math.round(totalSales / totalQuotation * 100) : 0;
  metrics = [
    {
      label: "Total Quotation Value",
      value: formatCurrency(totalQuotation),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Total Sales Order Realization",
      value: formatCurrency(totalSales),
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Sales Conversion Rate",
      value: `${conversionRate}%`,
      tone: "text-indigo-700 dark:text-indigo-400"
    }
  ];
  $$unsubscribe_salesOrders();
  $$unsubscribe_quotations();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: reportData,
      searchPlaceholder: "Search by quotation number or customer...",
      searchKeys: ["quotationNo", "customerName", "salesNo"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "quotationNo" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${column.key === "salesNo" && value !== "-" ? `<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
          $$result,
          {
            status: value.includes("Won") ? "completed" : "pending",
            label: value
          },
          {},
          {}
        )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Quotation vs PO",
      description: "Conversion of issued quotations into confirmed sales orders."
    },
    {},
    {}
  )} ${validate_component(QuotationVsPoView, "QuotationVsPoView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
