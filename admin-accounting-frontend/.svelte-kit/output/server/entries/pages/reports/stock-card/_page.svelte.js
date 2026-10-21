import { c as create_ssr_component, s as subscribe, g as each, f as add_attribute, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { a as formatDate, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { B as Badge } from "../../../../chunks/Badge.js";
import { J as products, a2 as stockMovements } from "../../../../chunks/dataStore.js";
const StockCardView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rows;
  let totalIn;
  let totalOut;
  let currentProduct;
  let $products, $$unsubscribe_products;
  let $stockMovements, $$unsubscribe_stockMovements;
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  $$unsubscribe_stockMovements = subscribe(stockMovements, (value) => $stockMovements = value);
  const productNames = Array.from(new Set($stockMovements.map((m) => m.productName)));
  let selectedProduct = productNames[0] || "";
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "docNo",
      label: "Document No",
      sortable: true
    },
    {
      key: "type",
      label: "Type",
      align: "center"
    },
    { key: "reference", label: "Reference" },
    { key: "warehouse", label: "Warehouse" },
    {
      key: "inQty",
      label: "In",
      align: "right",
      format: (v) => v > 0 ? v : "-"
    },
    {
      key: "outQty",
      label: "Out",
      align: "right",
      format: (v) => v > 0 ? v : "-"
    },
    {
      key: "balance",
      label: "Balance",
      align: "right",
      sortable: true
    }
  ];
  rows = (() => {
    const filtered = $stockMovements.filter((m) => m.productName === selectedProduct).sort((a, b) => a.date.localeCompare(b.date));
    let running = 0;
    const result = filtered.map((m) => {
      const inQty = m.type === "IN" || m.type === "ADJUST" && m.quantity > 0 ? m.quantity : 0;
      const outQty = m.type === "OUT" || m.type === "ADJUST" ? Math.abs(Math.min(m.quantity, 0)) : 0;
      running += inQty - outQty;
      return {
        id: m.id,
        date: m.date,
        docNo: m.docNo,
        type: m.type,
        reference: m.reference,
        warehouse: m.warehouse,
        inQty,
        outQty,
        balance: running,
        unit: m.unit
      };
    });
    return result.reverse();
  })();
  totalIn = rows.reduce((s, r) => s + r.inQty, 0);
  totalOut = rows.reduce((s, r) => s + r.outQty, 0);
  currentProduct = $products.find((p) => p.name === selectedProduct);
  $$unsubscribe_products();
  $$unsubscribe_stockMovements();
  return `<div class="space-y-6"><div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div class="w-full sm:w-96"><label for="product" class="block text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase mb-1" data-svelte-h="svelte-1kim4qq">Product</label> <select id="product" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(productNames, (name) => {
    return `<option${add_attribute("value", name, 0)}>${escape(name)}</option>`;
  })}</select></div> <div class="flex items-center gap-6 text-sm"><div><span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold" data-svelte-h="svelte-cjwj8h">On Hand</span> <p class="font-mono font-bold text-gray-900 dark:text-white">${escape(currentProduct?.stock ?? 0)} ${escape(currentProduct?.unit ?? "")}</p></div> <div><span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold" data-svelte-h="svelte-1xhdnnu">Total In</span> <p class="font-mono font-bold text-emerald-700 dark:text-emerald-400">${escape(totalIn)}</p></div> <div><span class="text-[11px] text-gray-500 dark:text-slate-400 uppercase font-semibold" data-svelte-h="svelte-2bjfgx">Total Out</span> <p class="font-mono font-bold text-rose-700 dark:text-rose-400">${escape(totalOut)}</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print`;
    }
  })}</div></div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: rows,
      searchPlaceholder: "Search document or reference...",
      searchKeys: ["docNo", "reference", "warehouse"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "docNo" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${column.key === "type" ? `${validate_component(Badge, "Badge").$$render(
          $$result,
          {
            status: value === "IN" ? "in" : value === "OUT" ? "out" : value === "ADJUST" ? "adjustment" : "open",
            label: value
          },
          {},
          {}
        )}` : `${column.key === "balance" ? `<span class="font-mono font-bold text-gray-900 dark:text-gray-100">${escape(value)} ${escape(row.unit)}</span>` : `${column.key === "inQty" ? `<span class="font-mono text-emerald-700 dark:text-emerald-400">${escape(column.format ? column.format(value, row) : value)}</span>` : `${column.key === "outQty" ? `<span class="font-mono text-rose-700 dark:text-rose-400">${escape(column.format ? column.format(value, row) : value)}</span>` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Stock Card",
      description: "Chronological inventory movement and running balance per product."
    },
    {},
    {}
  )} ${validate_component(StockCardView, "StockCardView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
