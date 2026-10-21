import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { F as FilterSelect } from "../../../chunks/FilterSelect.js";
import { R as RowActions } from "../../../chunks/RowActions.js";
import { A as ApprovalActions } from "../../../chunks/ApprovalActions.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { B as BudgetDetailModal } from "../../../chunks/BudgetDetailModal.js";
import { h as annualBudgets, j as budgetingActions } from "../../../chunks/dataStore.js";
import { u as user } from "../../../chunks/auth.js";
import "../../../chunks/client.js";
import { b as budgetingApi } from "../../../chunks/budgeting.js";
import { c as currencyColumn, d as dateColumn, s as statusColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
const BudgetApprovalView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let statusCounts;
  let pendingCount;
  let approvedCount;
  let rejectedCount;
  let rows;
  let $user, $$unsubscribe_user;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  let statusFilter = "submitted";
  let isDetailOpen = false;
  let detailBudget = null;
  let workingId = "";
  const stageOptions = [
    { value: "submitted", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" }
  ];
  const columns = [
    {
      key: "budgetNo",
      label: "Budget No",
      sortable: true
    },
    {
      key: "name",
      label: "Budget Name",
      sortable: true
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true
    },
    currencyColumn("totalAmount", "Total Budget"),
    { key: "preparedBy", label: "Prepared By" },
    dateColumn("createdAt", "Submitted"),
    statusColumn()
  ];
  function openDetail(budget) {
    detailBudget = budget;
    isDetailOpen = true;
  }
  async function decide(budget, decision) {
    workingId = budget.id;
    try {
      if (decision === "approve") {
        await budgetingApi.approveBudget(budget.id, { approvedBy: $user?.name });
        budgetingActions.approveBudget(budget.id, $user?.name);
      } else {
        await budgetingApi.rejectBudget(budget.id, { approvedBy: $user?.name });
        budgetingActions.rejectBudget(budget.id);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update budget status."));
    } finally {
      workingId = "";
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    statusCounts = $annualBudgets.reduce(
      (counts, budget) => {
        counts[budget.status] = (counts[budget.status] ?? 0) + 1;
        return counts;
      },
      {}
    );
    pendingCount = statusCounts.submitted ?? 0;
    approvedCount = statusCounts.approved ?? 0;
    rejectedCount = statusCounts.rejected ?? 0;
    rows = statusFilter === "all" ? $annualBudgets : $annualBudgets.filter((budget) => budget.status === statusFilter);
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Budget Approval",
        description: "Review submitted annual budgets and approve or reject them before allocation."
      },
      {},
      {}
    )} <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Pending Approval",
        value: String(pendingCount),
        icon: "⏳",
        color: "yellow",
        hint: "Waiting for a decision"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Approved",
        value: String(approvedCount),
        icon: "✅",
        color: "green",
        hint: "Ready for allocation"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Rejected",
        value: String(rejectedCount),
        icon: "⛔",
        color: "red",
        hint: "Returned to preparer"
      },
      {},
      {}
    )}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: rows,
        searchKeys: ["budgetNo", "name", "departmentName", "preparedBy", "status"],
        searchPlaceholder: "Search submitted budget...",
        emptyMessage: "No budget in this approval stage"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View budget",
              gap: "normal"
            },
            {},
            {
              default: () => {
                return `${row.status === "submitted" ? `${validate_component(ApprovalActions, "ApprovalActions").$$render(
                  $$result,
                  {
                    disabled: workingId === row.id,
                    onApprove: () => decide(row, "approve"),
                    onReject: () => decide(row, "reject")
                  },
                  {},
                  {}
                )}` : ``}`;
              }
            }
          )} `;
        },
        controls: () => {
          return `<div slot="controls" class="flex items-center gap-2">${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "approval-status-filter",
              label: "Stage",
              allLabel: "All",
              options: stageOptions,
              value: statusFilter
            },
            {
              value: ($$value) => {
                statusFilter = $$value;
                $$settled = false;
              }
            },
            {}
          )}</div>`;
        }
      }
    )}</div> ${validate_component(BudgetDetailModal, "BudgetDetailModal").$$render(
      $$result,
      {
        budget: detailBudget,
        isOpen: isDetailOpen
      },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}`;
  } while (!$$settled);
  $$unsubscribe_user();
  $$unsubscribe_annualBudgets();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BudgetApprovalView, "BudgetApprovalView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
