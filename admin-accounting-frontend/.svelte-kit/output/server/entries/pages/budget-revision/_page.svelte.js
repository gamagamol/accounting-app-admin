import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { A as ApprovalActions } from "../../../chunks/ApprovalActions.js";
import { h as annualBudgets, k as budgetRevisions, j as budgetingActions } from "../../../chunks/dataStore.js";
import { u as user } from "../../../chunks/auth.js";
import "../../../chunks/client.js";
import { b as budgetingApi } from "../../../chunks/budgeting.js";
import { b as budgetRevisionStatusOptions } from "../../../chunks/accounting-options.js";
import { f as formatCurrency } from "../../../chunks/formatters.js";
import { d as dateColumn, c as currencyColumn, s as statusColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
const BudgetRevisionView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let budgetOptions;
  let fields;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  let $user, $$unsubscribe_user;
  let $budgetRevisions, $$unsubscribe_budgetRevisions;
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_budgetRevisions = subscribe(budgetRevisions, (value) => $budgetRevisions = value);
  let workingId = "";
  const columns = [
    {
      key: "revisionNo",
      label: "Revision No",
      sortable: true
    },
    {
      key: "budgetNo",
      label: "Budget No",
      sortable: true
    },
    dateColumn("date", "Date"),
    {
      key: "requestedBy",
      label: "Requested By"
    },
    currencyColumn("currentAmount", "Current"),
    currencyColumn("requestedAmount", "Requested"),
    {
      key: "difference",
      label: "Difference",
      align: "right",
      format: (value) => `${Number(value) >= 0 ? "+" : ""}${formatCurrency(Number(value) || 0)}`
    },
    statusColumn()
  ];
  async function saveRevision(payload, id) {
    const budget = $annualBudgets.find((item) => item.budgetNo === payload.budgetNo);
    const currentAmount = budget?.totalAmount ?? 0;
    const requestedAmount = Number(payload.requestedAmount) || 0;
    const fullPayload = {
      revisionNo: String(payload.revisionNo),
      budgetId: budget?.id ?? "",
      budgetNo: String(payload.budgetNo),
      date: String(payload.date),
      requestedBy: String(payload.requestedBy),
      currentAmount,
      requestedAmount,
      difference: requestedAmount - currentAmount,
      reason: String(payload.reason ?? ""),
      status: payload.status ?? "pending"
    };
    try {
      if (id) {
        await budgetingApi.updateRevision(id, fullPayload);
        budgetingActions.updateRevision(id, fullPayload);
      } else {
        await budgetingApi.createRevision(fullPayload);
        budgetingActions.addRevision(fullPayload);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save budget revision."));
    }
  }
  async function deleteRevision(id) {
    try {
      await budgetingApi.deleteRevision(id);
      budgetingActions.deleteRevision(id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete budget revision."));
    }
  }
  async function decide(revision, decision) {
    workingId = revision.id;
    try {
      if (decision === "approve") {
        await budgetingApi.approveRevision(revision.id);
        budgetingActions.approveRevision(revision.id);
      } else {
        await budgetingApi.rejectRevision(revision.id);
        budgetingActions.rejectRevision(revision.id);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to update revision status."));
    } finally {
      workingId = "";
    }
  }
  budgetOptions = $annualBudgets.map((budget) => ({
    value: budget.budgetNo,
    label: `${budget.budgetNo} — ${budget.name}`
  }));
  fields = [
    {
      key: "revisionNo",
      label: "Revision No",
      type: "text",
      required: true,
      defaultValue: `REV/2024/${String($budgetRevisions.length + 1).padStart(3, "0")}`
    },
    {
      key: "budgetNo",
      label: "Budget",
      type: "select",
      required: true,
      options: budgetOptions
    },
    {
      key: "date",
      label: "Request Date",
      type: "date",
      required: true,
      defaultValue: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
    },
    {
      key: "requestedBy",
      label: "Requested By",
      type: "text",
      required: true,
      defaultValue: $user?.name ?? ""
    },
    {
      key: "requestedAmount",
      label: "Requested Amount (IDR)",
      type: "currency",
      required: true
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      options: budgetRevisionStatusOptions
    },
    {
      key: "reason",
      label: "Revision Reason",
      type: "textarea",
      required: true,
      colSpan: "full"
    }
  ];
  $$unsubscribe_annualBudgets();
  $$unsubscribe_user();
  $$unsubscribe_budgetRevisions();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Budget Revision / Over-budget Request",
      description: "Request additional budget or reallocation when actual demand exceeds the approved annual plan.",
      entityName: "budget revision",
      createLabel: "New Revision Request",
      columns,
      data: $budgetRevisions,
      fields,
      searchKeys: ["revisionNo", "budgetNo", "requestedBy", "reason", "status"],
      searchPlaceholder: "Search revision, budget or requester...",
      displayKey: "revisionNo",
      formSize: "2xl",
      onSave: saveRevision,
      onDelete: deleteRevision
    },
    {},
    {
      "extra-actions": ({ row }) => {
        return `${row.status === "pending" ? `${validate_component(ApprovalActions, "ApprovalActions").$$render(
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
  )}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BudgetRevisionView, "BudgetRevisionView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
