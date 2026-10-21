import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { g as departments, h as annualBudgets, c as chartOfAccounts, i as budgetAllocations, j as budgetingActions } from "../../../chunks/dataStore.js";
import "../../../chunks/client.js";
import { b as budgetingApi } from "../../../chunks/budgeting.js";
import { f as formatCurrency } from "../../../chunks/formatters.js";
import { c as currencyColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
const BudgetAllocationList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let budgetOptions;
  let expenseAccounts;
  let accountOptions;
  let departmentOptions;
  let fields;
  let $departments, $$unsubscribe_departments;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  let $budgetAllocations, $$unsubscribe_budgetAllocations;
  $$unsubscribe_departments = subscribe(departments, (value) => $departments = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  $$unsubscribe_budgetAllocations = subscribe(budgetAllocations, (value) => $budgetAllocations = value);
  const columns = [
    {
      key: "budgetNo",
      label: "Budget No",
      sortable: true
    },
    {
      key: "account",
      label: "Account (COA)",
      format: (_value, row) => `${row.accountCode} — ${row.accountName}`
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true
    },
    currencyColumn("allocatedAmount", "Allocated"),
    currencyColumn("usedAmount", "Used"),
    {
      key: "remaining",
      label: "Remaining",
      align: "right",
      format: (_value, row) => formatCurrency((row.allocatedAmount || 0) - (row.usedAmount || 0))
    }
  ];
  async function saveAllocation(payload, id) {
    const budget = $annualBudgets.find((item) => item.budgetNo === payload.budgetNo);
    const account = expenseAccounts.find((item) => item.code === payload.accountCode);
    const department = $departments.find((item) => item.code === payload.departmentCode);
    const fullPayload = {
      budgetId: budget?.id ?? "",
      budgetNo: String(payload.budgetNo),
      fiscalYear: budget?.fiscalYear ?? 2024,
      accountCode: String(payload.accountCode),
      accountName: account?.name ?? "",
      departmentCode: String(payload.departmentCode),
      departmentName: department?.name ?? "",
      allocatedAmount: Number(payload.allocatedAmount) || 0,
      usedAmount: Number(payload.usedAmount) || 0,
      notes: String(payload.notes ?? "")
    };
    try {
      if (id) {
        await budgetingApi.updateAllocation(id, fullPayload);
        budgetingActions.updateAllocation(id, fullPayload);
      } else {
        await budgetingApi.createAllocation(fullPayload);
        budgetingActions.addAllocation(fullPayload);
      }
    } catch (error) {
      alert(getErrorMessage(error, "Failed to save budget allocation."));
    }
  }
  async function deleteAllocation(id) {
    try {
      await budgetingApi.deleteAllocation(id);
      budgetingActions.deleteAllocation(id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete budget allocation."));
    }
  }
  budgetOptions = $annualBudgets.map((budget) => ({
    value: budget.budgetNo,
    label: `${budget.budgetNo} — ${budget.name}`
  }));
  expenseAccounts = $chartOfAccounts.filter((account) => account.category === "Expense");
  accountOptions = expenseAccounts.map((account) => ({
    value: account.code,
    label: `${account.code} — ${account.name}`
  }));
  departmentOptions = $departments.map((department) => ({
    value: department.code,
    label: `${department.code} — ${department.name}`
  }));
  fields = [
    {
      key: "budgetNo",
      label: "Budget",
      type: "select",
      required: true,
      options: budgetOptions
    },
    {
      key: "accountCode",
      label: "Expense Account (COA)",
      type: "select",
      required: true,
      options: accountOptions
    },
    {
      key: "departmentCode",
      label: "Department",
      type: "select",
      required: true,
      options: departmentOptions
    },
    {
      key: "allocatedAmount",
      label: "Allocated Amount (IDR)",
      type: "currency",
      required: true
    },
    {
      key: "usedAmount",
      label: "Used Amount (IDR)",
      type: "currency"
    },
    {
      key: "notes",
      label: "Notes",
      type: "textarea",
      colSpan: "full"
    }
  ];
  $$unsubscribe_departments();
  $$unsubscribe_annualBudgets();
  $$unsubscribe_chartOfAccounts();
  $$unsubscribe_budgetAllocations();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Budget Allocation",
      description: "Allocate annual budget to expense accounts and departments. Each line is the basis for budget vs actual control.",
      entityName: "budget allocation",
      createLabel: "Add Allocation",
      columns,
      data: $budgetAllocations,
      fields,
      searchKeys: ["budgetNo", "accountCode", "accountName", "departmentName", "notes"],
      searchPlaceholder: "Search budget, COA or department...",
      displayKey: "budgetNo",
      formSize: "2xl",
      onSave: saveAllocation,
      onDelete: deleteAllocation
    },
    {},
    {}
  )}`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BudgetAllocationList, "BudgetAllocationList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
