import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { B as Button } from "../../../chunks/Button.js";
import { F as FilterSelect } from "../../../chunks/FilterSelect.js";
import { R as RowActions } from "../../../chunks/RowActions.js";
import { A as ApprovalActions } from "../../../chunks/ApprovalActions.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { E as ExpenseDetailModal, e as expensesApi } from "../../../chunks/ExpenseDetailModal.js";
import { l as expenses, G as expenseActions } from "../../../chunks/dataStore.js";
import { u as user } from "../../../chunks/auth.js";
import "../../../chunks/client.js";
import { e as expenseTypeLabel } from "../../../chunks/accounting-options.js";
import { d as dateColumn, c as currencyColumn, s as statusColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
const ExpenseApprovalView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let statusCounts;
  let pendingCount;
  let approvedCount;
  let postedCount;
  let rows;
  let $user, $$unsubscribe_user;
  let $expenses, $$unsubscribe_expenses;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  let statusFilter = "submitted";
  let isDetailOpen = false;
  let detailExpense = null;
  let workingId = "";
  const stageOptions = [
    { value: "submitted", label: "Pending" },
    { value: "approved", label: "Approved" },
    { value: "rejected", label: "Rejected" },
    { value: "posted", label: "Posted" }
  ];
  const columns = [
    dateColumn("date", "Date"),
    {
      key: "expenseNo",
      label: "Expense No",
      sortable: true
    },
    {
      key: "expenseType",
      label: "Type",
      sortable: true,
      format: (value) => expenseTypeLabel(value)
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true
    },
    { key: "paidTo", label: "Paid To" },
    currencyColumn("totalAmount", "Total"),
    {
      key: "submittedBy",
      label: "Submitted By"
    },
    statusColumn()
  ];
  function openDetail(expense) {
    detailExpense = expense;
    isDetailOpen = true;
  }
  async function decide(expense, decision) {
    workingId = expense.id;
    try {
      if (decision === "approve") {
        await expensesApi.approve(expense.id, { approvedBy: $user?.name });
        expenseActions.approve(expense.id, $user?.name);
      } else if (decision === "reject") {
        await expensesApi.reject(expense.id, { approvedBy: $user?.name });
        expenseActions.reject(expense.id, $user?.name);
      } else {
        await expensesApi.post(expense.id, { postedBy: $user?.name });
        expenseActions.post(expense.id);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update expense status."));
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
    statusCounts = $expenses.reduce(
      (counts, expense) => {
        counts[expense.status] = (counts[expense.status] ?? 0) + 1;
        return counts;
      },
      {}
    );
    pendingCount = statusCounts.submitted ?? 0;
    approvedCount = statusCounts.approved ?? 0;
    postedCount = statusCounts.posted ?? 0;
    rows = statusFilter === "all" ? $expenses : $expenses.filter((expense) => expense.status === statusFilter);
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Expense Approval",
        description: "Review submitted expenses, approve or reject them, then post approved expenses to the general ledger."
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
        hint: "Submitted expenses"
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
        hint: "Ready to post to GL"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Posted to GL",
        value: String(postedCount),
        icon: "📘",
        color: "blue",
        hint: "Journal entries created"
      },
      {},
      {}
    )}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: rows,
        searchKeys: [
          "expenseNo",
          "expenseType",
          "departmentName",
          "paidTo",
          "submittedBy",
          "status"
        ],
        searchPlaceholder: "Search submitted expense...",
        emptyMessage: "No expense in this approval stage"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View expense",
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
                )}` : `${row.status === "approved" ? `${validate_component(Button, "Button").$$render(
                  $$result,
                  {
                    size: "sm",
                    variant: "primary",
                    disabled: workingId === row.id
                  },
                  {},
                  {
                    default: () => {
                      return `Post to GL`;
                    }
                  }
                )}` : ``}`}`;
              }
            }
          )} `;
        },
        controls: () => {
          return `<div slot="controls" class="flex items-center gap-2">${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "expense-approval-filter",
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
    )}</div> ${validate_component(ExpenseDetailModal, "ExpenseDetailModal").$$render(
      $$result,
      {
        expense: detailExpense,
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
  $$unsubscribe_expenses();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(ExpenseApprovalView, "ExpenseApprovalView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
