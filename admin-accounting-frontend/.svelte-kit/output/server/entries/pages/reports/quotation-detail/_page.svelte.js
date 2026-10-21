import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape } from "../../../../chunks/ssr.js";
import { a as formatDate, f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as quotations } from "../../../../chunks/dataStore.js";
const QuotationDetailView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let detailRows;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  const columns = [
    {
      key: "quotationNo",
      label: "Quotation No",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    {
      key: "productName",
      label: "Item Name",
      sortable: true
    },
    {
      key: "quantity",
      label: "Qty",
      align: "center",
      sortable: true
    },
    {
      key: "unit",
      label: "Unit",
      align: "center"
    },
    {
      key: "unitPrice",
      label: "Unit Price",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "discount",
      label: "Discount",
      align: "center",
      format: (v) => v ? `${v}%` : "-"
    },
    {
      key: "total",
      label: "Total Amount",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  detailRows = $quotations.flatMap((q) => q.items.map((item) => ({
    quotationNo: q.quotationNo,
    date: q.date,
    customerName: q.customerName,
    productName: item.productName,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    discount: item.discount,
    total: item.total
  })));
  $$unsubscribe_quotations();
  return `<div class="space-y-6"><div class="flex justify-between items-center gap-3 flex-wrap"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1h7b2rq">Line-item breakdown of every quotation issued.</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Detail Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: detailRows,
      searchPlaceholder: "Search by quotation, product, or customer...",
      searchKeys: ["quotationNo", "customerName", "productName"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "quotationNo" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Quotation Detail",
      description: "Line-item breakdown of all issued quotations."
    },
    {},
    {}
  )} ${validate_component(QuotationDetailView, "QuotationDetailView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
