import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { P as PageHeader, f as formatCurrency, d as formatNumber } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { B as Button } from "../../../chunks/Button.js";
import { J as products } from "../../../chunks/dataStore.js";
import { n as numberColumn, c as currencyColumn } from "../../../chunks/tableColumns.js";
const InventoryValuationView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let rows;
  let totalValue;
  let totalUnits;
  let categories;
  let zeroStock;
  let $products, $$unsubscribe_products;
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  const columns = [
    {
      key: "productCode",
      label: "Product Code",
      sortable: true
    },
    {
      key: "productName",
      label: "Product",
      sortable: true
    },
    {
      key: "category",
      label: "Category",
      sortable: true
    },
    {
      key: "unit",
      label: "Unit",
      align: "center"
    },
    numberColumn("stock", "On Hand"),
    currencyColumn("unitCost", "Unit Cost"),
    currencyColumn("inventoryValue", "Inventory Value")
  ];
  rows = $products.filter((product) => product.itemType === "goods").map((product) => {
    const unitCost = product.costPrice ?? product.price;
    return {
      id: product.id,
      productCode: product.code ?? product.id.toUpperCase(),
      productName: product.name,
      category: product.category,
      unit: product.unit,
      stock: product.stock,
      unitCost,
      inventoryValue: product.stock * unitCost
    };
  });
  totalValue = rows.reduce((sum, row) => sum + row.inventoryValue, 0);
  totalUnits = rows.reduce((sum, row) => sum + row.stock, 0);
  categories = new Set(rows.map((row) => row.category)).size;
  zeroStock = rows.filter((row) => row.stock <= 0).length;
  $$unsubscribe_products();
  return `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Inventory Valuation / Adjustment",
      description: "Weighted-average inventory value by product. Use Stock Adjustment to correct quantity and valuation differences."
    },
    {},
    {}
  )} ${validate_component(Button, "Button").$$render(
    $$result,
    {
      variant: "secondary",
      href: "/stock-adjustment"
    },
    {},
    {
      default: () => {
        return `Open Stock Adjustment`;
      }
    }
  )}</div> <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Inventory Value",
      value: formatCurrency(totalValue),
      icon: "🏷️",
      color: "blue",
      hint: "On-hand quantity × unit cost"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Total Units",
      value: formatNumber(totalUnits),
      icon: "📦",
      color: "purple",
      hint: "Across all goods products"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Product Categories",
      value: String(categories),
      icon: "🗂️",
      color: "green",
      hint: "Valuation categories"
    },
    {},
    {}
  )} ${validate_component(StatCard, "StatCard").$$render(
    $$result,
    {
      title: "Zero / Negative Stock",
      value: String(zeroStock),
      icon: "⚠️",
      color: "red",
      hint: "Requires adjustment review"
    },
    {},
    {}
  )}</div> <div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3 text-xs text-blue-800 dark:text-blue-200" data-svelte-h="svelte-1y48zik"><strong>API:</strong> GET /api/inventory/valuation — the backend will calculate weighted-average cost
		from stock movements. Quantity corrections are sent to POST /api/inventory/adjustments.</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: rows,
      searchKeys: ["productCode", "productName", "category"],
      searchPlaceholder: "Search product or category...",
      emptyMessage: "No inventory valuation records found"
    },
    {},
    {}
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(InventoryValuationView, "InventoryValuationView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
