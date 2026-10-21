import { c as create_ssr_component, s as subscribe, v as validate_component, f as add_attribute, g as each, e as escape } from "../../../chunks/ssr.js";
import { P as PageHeader, b as formatSummaryCurrency } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { B as Button } from "../../../chunks/Button.js";
import { F as FilterSelect } from "../../../chunks/FilterSelect.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { g as departments, h as annualBudgets, i as budgetAllocations, j as budgetingActions } from "../../../chunks/dataStore.js";
import { u as user } from "../../../chunks/auth.js";
import "../../../chunks/client.js";
import { B as BudgetDetailModal } from "../../../chunks/BudgetDetailModal.js";
import { b as budgetingApi } from "../../../chunks/budgeting.js";
import { a as budgetStatusOptions } from "../../../chunks/accounting-options.js";
import { c as currencyColumn, s as statusColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
const BudgetFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let departmentOptions;
  let $departments, $$unsubscribe_departments;
  let $user, $$unsubscribe_user;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  $$unsubscribe_departments = subscribe(departments, (value) => $departments = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  let { isOpen = false } = $$props;
  let { budget = null } = $$props;
  let { onSaved = () => {
  } } = $$props;
  let form = blankForm();
  let lastKey = "";
  let saving = false;
  function nextBudgetNo() {
    const year = 2024;
    const seq = $annualBudgets.length + 1;
    return `BUD/${year}/${String(seq).padStart(3, "0")}`;
  }
  function blankForm() {
    return {
      budgetNo: nextBudgetNo(),
      fiscalYear: 2024,
      name: "",
      departmentCode: $departments[0]?.code ?? "",
      departmentName: $departments[0]?.name ?? "",
      totalAmount: 0,
      status: "draft",
      preparedBy: $user?.name ?? "",
      notes: ""
    };
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.budget === void 0 && $$bindings.budget && budget !== void 0) $$bindings.budget(budget);
  if ($$props.onSaved === void 0 && $$bindings.onSaved && onSaved !== void 0) $$bindings.onSaved(onSaved);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    departmentOptions = $departments.map((dept) => ({
      value: dept.code,
      label: `${dept.code} — ${dept.name}`
    }));
    {
      if (!isOpen) {
        lastKey = "";
      } else {
        const key = budget?.id ?? "new";
        if (lastKey !== key) {
          lastKey = key;
          if (budget) {
            form = {
              budgetNo: budget.budgetNo,
              fiscalYear: budget.fiscalYear,
              name: budget.name,
              departmentCode: budget.departmentCode,
              departmentName: budget.departmentName,
              totalAmount: budget.totalAmount,
              status: budget.status,
              preparedBy: budget.preparedBy,
              notes: budget.notes
            };
          } else {
            form = blankForm();
          }
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: budget ? "Edit Annual Budget" : "New Annual Budget",
        size: "2xl",
        isOpen
      },
      {
        isOpen: ($$value) => {
          isOpen = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `${validate_component(Button, "Button").$$render($$result, { variant: "secondary" }, {}, {
            default: () => {
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary", disabled: saving }, {}, {
            default: () => {
              return `${escape(budget ? "Save Changes" : "Create Budget")}`;
            }
          })} `;
        },
        default: () => {
          return `<form><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Budget No",
              name: "budgetNo",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="budgetNo" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="BUD/2024/006"${add_attribute("value", form.budgetNo, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Fiscal Year",
              name: "fiscalYear",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="fiscalYear" type="number" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.fiscalYear, 0)}>`;
              }
            }
          )} <div class="sm:col-span-2">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Budget Name",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Operations Annual Budget 2024"${add_attribute("value", form.name, 0)}>`;
              }
            }
          )}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Department / Cost Center",
              name: "departmentCode",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="departmentCode" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(departmentOptions, (option) => {
                  return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Total Budget (IDR)",
              name: "totalAmount",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="totalAmount" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.totalAmount, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Status", name: "status" }, {}, {
            default: () => {
              return `<select id="status" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="draft" data-svelte-h="svelte-1e1b8nw">Draft</option><option value="submitted" data-svelte-h="svelte-wjchc">Submitted</option><option value="approved" data-svelte-h="svelte-ixlfky">Approved</option><option value="rejected" data-svelte-h="svelte-1jfsnli">Rejected</option><option value="revised" data-svelte-h="svelte-cgx8ci">Revised</option><option value="closed" data-svelte-h="svelte-106rur2">Closed</option></select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Prepared By", name: "preparedBy" }, {}, {
            default: () => {
              return `<input id="preparedBy" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.preparedBy, 0)}>`;
            }
          })} <div class="sm:col-span-2">${validate_component(FormField, "FormField").$$render($$result, { label: "Notes", name: "notes" }, {}, {
            default: () => {
              return `<textarea id="notes" rows="3" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Scope, assumptions and approval notes...">${escape(form.notes || "")}</textarea>`;
            }
          })}</div></div> <p class="text-[11px] text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1lzdxvi">Budget lines by COA and department are maintained in <strong>Budget Allocation</strong>. This
			form only prepares the annual budget header payload.</p></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_departments();
  $$unsubscribe_user();
  $$unsubscribe_annualBudgets();
  return $$rendered;
});
const BudgetList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalBudget;
  let allocated;
  let used;
  let pending;
  let filteredBudgets;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  let $budgetAllocations, $$unsubscribe_budgetAllocations;
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  $$unsubscribe_budgetAllocations = subscribe(budgetAllocations, (value) => $budgetAllocations = value);
  let isFormOpen = false;
  let editingBudget = null;
  let isDetailOpen = false;
  let detailBudget = null;
  let statusFilter = "all";
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
    {
      key: "fiscalYear",
      label: "Year",
      sortable: true,
      align: "center"
    },
    currencyColumn("totalAmount", "Total Budget"),
    statusColumn(),
    { key: "preparedBy", label: "Prepared By" }
  ];
  function openEdit(budget) {
    editingBudget = budget;
    isFormOpen = true;
  }
  function openDetail(budget) {
    detailBudget = budget;
    isDetailOpen = true;
  }
  async function deleteBudget(budget) {
    if (!confirm(`Delete budget "${budget.name}"? Its allocations and revisions will also be removed.`)) {
      return;
    }
    try {
      await budgetingApi.deleteBudget(budget.id);
      budgetingActions.deleteBudget(budget.id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete budget."));
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    totalBudget = $annualBudgets.reduce((sum, budget) => sum + budget.totalAmount, 0);
    allocated = $budgetAllocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
    used = $budgetAllocations.reduce((sum, line) => sum + line.usedAmount, 0);
    pending = $annualBudgets.filter((budget) => budget.status === "submitted").length;
    filteredBudgets = statusFilter === "all" ? $annualBudgets : $annualBudgets.filter((budget) => budget.status === statusFilter);
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Annual Budget Plan",
        description: "Prepare annual budget headers per department before allocation and approval."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
			New Budget`;
      }
    })}</div> <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Total Budget",
        value: formatSummaryCurrency(totalBudget),
        icon: "🎯",
        color: "blue",
        hint: "All annual budget headers"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Allocated",
        value: formatSummaryCurrency(allocated),
        icon: "🧩",
        color: "purple",
        hint: "Allocated to COA & department"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Used",
        value: formatSummaryCurrency(used),
        icon: "📉",
        color: "yellow",
        hint: "Consumed by actual expenses"
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Pending Approval",
        value: String(pending),
        icon: "⏳",
        color: "red",
        hint: "Submitted budget plans"
      },
      {},
      {}
    )}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: filteredBudgets,
        searchKeys: ["budgetNo", "name", "departmentName", "preparedBy", "status"],
        searchPlaceholder: "Search budget number, name or department...",
        emptyMessage: "No budget plans found"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              onEdit: () => openEdit(row),
              onDelete: () => deleteBudget(row),
              viewTitle: "View budget",
              editTitle: "Edit budget",
              deleteTitle: "Delete budget"
            },
            {},
            {}
          )} `;
        },
        controls: () => {
          return `<div slot="controls" class="flex items-center gap-2">${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "budget-status-filter",
              label: "Status",
              allLabel: "All",
              options: budgetStatusOptions,
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
    )}</div> ${validate_component(BudgetFormModal, "BudgetFormModal").$$render(
      $$result,
      {
        budget: editingBudget,
        isOpen: isFormOpen
      },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(BudgetDetailModal, "BudgetDetailModal").$$render(
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
  $$unsubscribe_annualBudgets();
  $$unsubscribe_budgetAllocations();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BudgetList, "BudgetList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
