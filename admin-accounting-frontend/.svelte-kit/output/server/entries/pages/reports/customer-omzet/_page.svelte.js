import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
import { A as salesOrders, o as customers } from "../../../../chunks/dataStore.js";
const CustomerOmzetView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalAllSales;
  let omzetData;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $customers, $$unsubscribe_customers;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_customers = subscribe(customers, (value) => $customers = value);
  const columns = [
    {
      key: "companyName",
      label: "Customer Company",
      sortable: true
    },
    {
      key: "city",
      label: "City",
      sortable: true
    },
    {
      key: "orderCount",
      label: "Sales Orders",
      align: "center",
      sortable: true
    },
    {
      key: "contributionPercentage",
      label: "Revenue Contribution",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    },
    {
      key: "totalOmzet",
      label: "Total Revenue",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  totalAllSales = $salesOrders.reduce((sum, so) => sum + so.total, 0);
  omzetData = $customers.map((cust) => {
    const custOrders = $salesOrders.filter((so) => so.customerId === cust.id || so.customerName === cust.companyName);
    const totalOmzet = custOrders.reduce((sum, o) => sum + o.total, 0);
    const contributionPercentage = totalAllSales > 0 ? Math.round(totalOmzet / totalAllSales * 100) : 0;
    return {
      customerId: cust.id,
      companyName: cust.companyName,
      city: cust.city,
      orderCount: custOrders.length,
      totalOmzet,
      contributionPercentage
    };
  }).sort((a, b) => b.totalOmzet - a.totalOmzet);
  $$unsubscribe_salesOrders();
  $$unsubscribe_customers();
  return `<div class="space-y-6"><div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><span class="text-xs uppercase tracking-wider font-semibold text-blue-200" data-svelte-h="svelte-1den90m">Total Company Revenue</span> <h3 class="text-2xl sm:text-3xl font-extrabold font-mono mt-1">${escape(formatCurrency(totalAllSales))}</h3> <p class="text-xs text-blue-100 mt-1" data-svelte-h="svelte-lt1flg">Calculated from all approved sales orders.</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "md" }, {}, {
    default: () => {
      return `📥 Export / Print Revenue Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: omzetData,
      searchPlaceholder: "Search customer or city...",
      searchKeys: ["companyName", "city"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "totalOmzet" ? `<span class="font-mono font-bold text-gray-900 dark:text-gray-100 text-sm">${escape(formatCurrency(value))}</span>` : `${column.key === "contributionPercentage" ? `<div class="flex items-center justify-center gap-2"><div class="w-16 bg-gray-200 dark:bg-slate-700 rounded-full h-2 overflow-hidden"><div class="bg-blue-600 dark:bg-blue-500 h-2 rounded-full" style="${"width: " + escape(value, true) + "%"}"></div></div> <span class="font-bold text-xs font-mono text-gray-700 dark:text-slate-200">${escape(value)}%</span></div>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Customer Omzet",
      description: "Revenue contribution and order volume by customer."
    },
    {},
    {}
  )} ${validate_component(CustomerOmzetView, "CustomerOmzetView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
