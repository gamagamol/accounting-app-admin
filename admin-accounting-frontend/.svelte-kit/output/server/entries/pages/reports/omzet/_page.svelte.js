import { c as create_ssr_component, g as each, e as escape, v as validate_component } from "../../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../../chunks/formatters.js";
import { D as DataTable } from "../../../../chunks/DataTable.js";
import { B as Button } from "../../../../chunks/Button.js";
const OmzetReportView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalGross;
  let totalCogs;
  let totalMargin;
  let avgMarginPct;
  let metrics;
  const monthlyOmzet = [
    {
      period: "January 2024",
      grossSales: 1254e5,
      cogs: 825e5,
      margin: 429e5,
      marginPct: 34.2,
      orders: 12
    },
    {
      period: "February 2024",
      grossSales: 1482e5,
      cogs: 963e5,
      margin: 519e5,
      marginPct: 35,
      orders: 15
    },
    {
      period: "March 2024",
      grossSales: 1856e5,
      cogs: 1184e5,
      margin: 672e5,
      marginPct: 36.2,
      orders: 18
    },
    {
      period: "April 2024 (Current)",
      grossSales: 1629e5,
      cogs: 1045e5,
      margin: 584e5,
      marginPct: 35.8,
      orders: 14
    }
  ];
  const columns = [
    {
      key: "period",
      label: "Period",
      sortable: true
    },
    {
      key: "orders",
      label: "Transaction Volume",
      align: "center",
      sortable: true,
      format: (v) => `${v} Orders`
    },
    {
      key: "grossSales",
      label: "Gross Sales",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "cogs",
      label: "Cost of Goods Sold",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "margin",
      label: "Gross Profit",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "marginPct",
      label: "Margin (%)",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    }
  ];
  totalGross = monthlyOmzet.reduce((s, m) => s + m.grossSales, 0);
  totalCogs = monthlyOmzet.reduce((s, m) => s + m.cogs, 0);
  totalMargin = monthlyOmzet.reduce((s, m) => s + m.margin, 0);
  avgMarginPct = Math.round(totalMargin / totalGross * 100);
  metrics = [
    {
      label: "Total Accumulated Revenue",
      value: formatCurrency(totalGross),
      tone: "text-blue-700 dark:text-blue-400"
    },
    {
      label: "Cost of Goods Sold",
      value: formatCurrency(totalCogs),
      tone: "text-amber-700 dark:text-amber-400"
    },
    {
      label: "Gross Profit",
      value: formatCurrency(totalMargin),
      tone: "text-emerald-700 dark:text-emerald-400"
    },
    {
      label: "Average Margin",
      value: `${avgMarginPct}%`,
      tone: "text-indigo-700 dark:text-indigo-400"
    }
  ];
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-4 gap-4">${each(metrics, (metric) => {
    return `<div class="bg-white dark:bg-slate-900 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><span class="text-xs font-semibold text-gray-500 dark:text-slate-400 uppercase">${escape(metric.label)}</span> <p class="${"text-xl font-bold " + escape(metric.tone, true) + " mt-1 font-mono"}">${escape(metric.value)}</p> </div>`;
  })}</div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Export / Print Monthly Revenue Report`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: monthlyOmzet,
      searchPlaceholder: "Search period...",
      searchKeys: ["period"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "grossSales" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-400">${escape(formatCurrency(value))}</span>` : `${column.key === "margin" ? `<span class="font-mono font-bold text-emerald-700 dark:text-emerald-400">${escape(formatCurrency(value))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "Omzet Report",
      description: "Monthly gross sales, cost of goods sold and gross profit."
    },
    {},
    {}
  )} ${validate_component(OmzetReportView, "OmzetReportView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
