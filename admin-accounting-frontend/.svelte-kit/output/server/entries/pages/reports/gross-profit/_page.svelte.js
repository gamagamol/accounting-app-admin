import { c as create_ssr_component, s as subscribe, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { J as products, A as salesOrders } from "../../../../chunks/dataStore.js";
const GrossProfitByProductView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let productProfit;
  let totalRevenue;
  let totalCost;
  let totalProfit;
  let avgMargin;
  let metrics;
  let $products, $$unsubscribe_products;
  let $salesOrders, $$unsubscribe_salesOrders;
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  const columns = [
    {
      key: "productName",
      label: "Product",
      sortable: true
    },
    {
      key: "quantitySold",
      label: "Qty Sold",
      align: "right",
      sortable: true
    },
    {
      key: "revenue",
      label: "Revenue",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "cost",
      label: "Cost of Goods",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "grossProfit",
      label: "Gross Profit",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "marginPct",
      label: "Margin",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    }
  ];
  productProfit = (() => {
    const map = /* @__PURE__ */ new Map();
    $salesOrders.forEach((so) => {
      so.items.forEach((item) => {
        const product = $products.find((p) => p.name === item.productName || p.id === item.productId);
        const unitCost = product?.costPrice ?? item.unitPrice * 0.7;
        const existing = map.get(item.productName) || {
          productName: item.productName,
          quantitySold: 0,
          revenue: 0,
          cost: 0,
          grossProfit: 0,
          marginPct: 0
        };
        existing.quantitySold += item.quantity;
        existing.revenue += item.total;
        existing.cost += unitCost * item.quantity;
        existing.grossProfit = existing.revenue - existing.cost;
        existing.marginPct = existing.revenue > 0 ? Math.round(existing.grossProfit / existing.revenue * 1e3) / 10 : 0;
        map.set(item.productName, existing);
      });
    });
    return Array.from(map.values()).sort((a, b) => b.grossProfit - a.grossProfit);
  })();
  totalRevenue = productProfit.reduce((s, p) => s + p.revenue, 0);
  totalCost = productProfit.reduce((s, p) => s + p.cost, 0);
  totalProfit = totalRevenue - totalCost;
  avgMargin = totalRevenue > 0 ? Math.round(totalProfit / totalRevenue * 1e3) / 10 : 0;
  metrics = [
    {
      label: "Total Revenue",
      value: formatCurrency(totalRevenue),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Total Cost of Goods",
      value: formatCurrency(totalCost),
      tone: "text-amber-700 dark:text-amber-400"
    },
    {
      label: "Gross Profit",
      value: formatCurrency(totalProfit),
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Average Margin",
      value: `${avgMargin}%`,
      tone: "text-indigo-700 dark:text-indigo-400"
    }
  ];
  $$unsubscribe_products();
  $$unsubscribe_salesOrders();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Print Gross Profit Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: productProfit,
      searchPlaceholder: "Search product...",
      searchKeys: ["productName"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "grossProfit" ? `<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">${escape(formatCurrency(value))}</span>` : `${column.key === "marginPct" ? `<span class="${"inline-block px-2 py-0.5 rounded-full text-xs font-semibold " + escape(
          value >= 30 ? "bg-emerald-50 dark:bg-emerald-500/10 text-emerald-700 dark:text-emerald-300" : value >= 15 ? "bg-amber-50 dark:bg-amber-500/10 text-amber-700 dark:text-amber-300" : "bg-rose-50 dark:bg-rose-500/10 text-rose-700 dark:text-rose-300",
          true
        )}">${escape(value)}%</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Gross Profit by Product",
      description: "Revenue, cost of goods sold and margin per product."
    },
    {},
    {}
  )} ${validate_component(GrossProfitByProductView, "GrossProfitByProductView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
