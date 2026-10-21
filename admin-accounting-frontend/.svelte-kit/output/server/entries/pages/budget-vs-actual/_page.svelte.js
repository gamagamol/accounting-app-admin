import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape } from "../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader, b as formatSummaryCurrency } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { F as FilterSelect } from "../../../chunks/FilterSelect.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { i as budgetAllocations, l as expenses, h as annualBudgets, g as departments } from "../../../chunks/dataStore.js";
import { c as currencyColumn, p as percentColumn } from "../../../chunks/tableColumns.js";
const BudgetVsActualView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let departmentOptions;
  let budgetNameById;
  let approvedExpensesByBudget;
  let baseRows;
  let rows;
  let totalBudget;
  let totalActual;
  let totalVariance;
  let overBudget;
  let $budgetAllocations, $$unsubscribe_budgetAllocations;
  let $expenses, $$unsubscribe_expenses;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  let $departments, $$unsubscribe_departments;
  $$unsubscribe_budgetAllocations = subscribe(budgetAllocations, (value) => $budgetAllocations = value);
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  $$unsubscribe_departments = subscribe(departments, (value) => $departments = value);
  let departmentFilter = "all";
  const columns = [
    {
      key: "budgetNo",
      label: "Budget",
      sortable: true,
      format: (value, row) => `${value} — ${row.budgetName}`
    },
    {
      key: "accountCode",
      label: "Account (COA)",
      sortable: true,
      format: (value, row) => `${value} — ${row.accountName}`
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true
    },
    currencyColumn("allocatedAmount", "Budget"),
    currencyColumn("actualAmount", "Actual"),
    {
      key: "variance",
      label: "Variance",
      sortable: true,
      align: "right",
      format: (value) => {
        const amount = Number(value) || 0;
        return `${amount < 0 ? "-" : ""}${formatCurrency(Math.abs(amount))}`;
      }
    },
    percentColumn("utilization", "Used %")
  ];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    departmentOptions = $departments.map((department) => ({
      value: department.code,
      label: department.name
    }));
    budgetNameById = new Map($annualBudgets.map((budget) => [budget.id, budget.name]));
    approvedExpensesByBudget = $expenses.filter((expense) => expense.status === "approved" || expense.status === "posted").reduce(
      (groups, expense) => {
        const group = groups[expense.budgetId] ?? [];
        group.push(expense);
        groups[expense.budgetId] = group;
        return groups;
      },
      {}
    );
    baseRows = $budgetAllocations.map((allocation) => {
      const actualAmount = (approvedExpensesByBudget[allocation.budgetId] ?? []).filter((expense) => expense.accountCode.startsWith(allocation.accountCode)).reduce((sum, expense) => sum + expense.totalAmount, 0);
      return {
        ...allocation,
        budgetName: budgetNameById.get(allocation.budgetId) ?? allocation.budgetNo,
        actualAmount,
        variance: allocation.allocatedAmount - actualAmount,
        utilization: allocation.allocatedAmount > 0 ? actualAmount / allocation.allocatedAmount * 100 : 0
      };
    });
    rows = departmentFilter === "all" ? baseRows : baseRows.filter((row) => row.departmentCode === departmentFilter);
    totalBudget = rows.reduce((sum, row) => sum + row.allocatedAmount, 0);
    totalActual = rows.reduce((sum, row) => sum + row.actualAmount, 0);
    totalVariance = totalBudget - totalActual;
    overBudget = rows.filter((row) => row.variance < 0).length;
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Budget vs Actual",
        description: "Compare approved budget allocation with actual approved and posted expenses per COA and department."
      },
      {},
      {}
    )} <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Total Budget",
        value: formatSummaryCurrency(totalBudget),
        icon: "🎯",
        color: "blue",
        hint: "Allocation for current filter"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Actual Expense",
        value: formatSummaryCurrency(totalActual),
        icon: "🧾",
        color: "yellow",
        hint: "Approved + posted expenses"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Remaining",
        value: formatSummaryCurrency(totalVariance),
        icon: "💼",
        color: "green",
        hint: "Budget minus actual"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Over Budget Lines",
        value: String(overBudget),
        icon: "⚠️",
        color: "red",
        hint: "Variance below zero"
      },
      {},
      {}
    )}</div> <div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3 text-xs text-blue-800 dark:text-blue-200" data-svelte-h="svelte-ot5chi"><strong>API:</strong> GET /api/budgeting/budget-vs-actual — the backend will recalculate actual
		amounts from posted journals. This page uses approved/posted expense entries as the local mock
		source.</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: rows,
        searchKeys: ["budgetNo", "accountCode", "accountName", "departmentName"],
        searchPlaceholder: "Search budget, COA or department...",
        emptyMessage: "No budget allocation found for this filter"
      },
      {},
      {
        cell: ({ column, value, row }) => {
          return `${column.key === "variance" ? `<span class="${"font-semibold " + escape(
            Number(value) < 0 ? "text-rose-600 dark:text-rose-300" : "text-emerald-600 dark:text-emerald-300",
            true
          )}">${escape(column.format?.(value, row))}</span>` : `${column.key === "utilization" ? `<div class="flex items-center justify-end gap-2">${row.variance < 0 ? `${validate_component(Badge, "Badge").$$render($$result, { status: "over_budget", label: "Over" }, {}, {})}` : ``} <span class="${"font-semibold " + escape(
            row.variance < 0 ? "text-rose-600 dark:text-rose-300" : "text-gray-800 dark:text-gray-200",
            true
          )}">${escape(column.format?.(value, row))}</span></div>` : `${column.format ? `${escape(column.format(value, row))}` : `${escape(value ?? "-")}`}`}`} `;
        },
        controls: () => {
          return `<div slot="controls" class="flex items-center gap-2">${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "budget-dept-filter",
              label: "Department",
              allLabel: "All departments",
              options: departmentOptions,
              value: departmentFilter
            },
            {
              value: ($$value) => {
                departmentFilter = $$value;
                $$settled = false;
              }
            },
            {}
          )}</div>`;
        }
      }
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_budgetAllocations();
  $$unsubscribe_expenses();
  $$unsubscribe_annualBudgets();
  $$unsubscribe_departments();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BudgetVsActualView, "BudgetVsActualView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
