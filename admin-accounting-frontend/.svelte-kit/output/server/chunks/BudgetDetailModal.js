import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape, g as each } from "./ssr.js";
import { M as Modal } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { B as Badge } from "./Badge.js";
import { D as DetailStat, a as DetailField } from "./DetailField.js";
import { A as ApprovalActions } from "./ApprovalActions.js";
import { i as budgetAllocations, h as annualBudgets, j as budgetingActions } from "./dataStore.js";
import { u as user } from "./auth.js";
import "./client.js";
import { b as budgetingApi } from "./budgeting.js";
import { f as formatCurrency, a as formatDate, c as formatPercent } from "./formatters.js";
import { g as getErrorMessage } from "./errors.js";
const BudgetDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let current;
  let allocations;
  let allocated;
  let used;
  let remaining;
  let utilization;
  let payload;
  let $user, $$unsubscribe_user;
  let $budgetAllocations, $$unsubscribe_budgetAllocations;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_budgetAllocations = subscribe(budgetAllocations, (value) => $budgetAllocations = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  let { isOpen = false } = $$props;
  let { budget = null } = $$props;
  let working = false;
  let errorMessage = "";
  async function runAction(action) {
    if (!current) return;
    working = true;
    errorMessage = "";
    try {
      if (action === "submit") {
        await budgetingApi.submitBudget(current.id);
        budgetingActions.submitBudget(current.id);
      } else if (action === "approve") {
        await budgetingApi.approveBudget(current.id, { approvedBy: $user?.name });
        budgetingActions.approveBudget(current.id, $user?.name);
      } else if (action === "reject") {
        await budgetingApi.rejectBudget(current.id, { approvedBy: $user?.name });
        budgetingActions.rejectBudget(current.id);
      } else {
        await budgetingApi.closeBudget(current.id);
        budgetingActions.closeBudget(current.id);
      }
    } catch (error) {
      errorMessage = getErrorMessage(error, "Action failed.");
    } finally {
      working = false;
    }
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.budget === void 0 && $$bindings.budget && budget !== void 0) $$bindings.budget(budget);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    current = budget ? $annualBudgets.find((item) => item.id === budget.id) ?? budget : null;
    allocations = current ? $budgetAllocations.filter((allocation) => allocation.budgetId === current.id) : [];
    allocated = allocations.reduce((sum, line) => sum + line.allocatedAmount, 0);
    used = allocations.reduce((sum, line) => sum + line.usedAmount, 0);
    remaining = allocated - used;
    utilization = allocated > 0 ? used / allocated * 100 : 0;
    payload = current ? {
      budgetNo: current.budgetNo,
      fiscalYear: current.fiscalYear,
      name: current.name,
      departmentCode: current.departmentCode,
      departmentName: current.departmentName,
      totalAmount: current.totalAmount,
      status: current.status,
      preparedBy: current.preparedBy,
      notes: current.notes
    } : null;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Annual Budget Details",
        size: "4xl",
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
              return `Close`;
            }
          })} ${current ? `${current.status === "draft" || current.status === "rejected" || current.status === "revised" ? `${validate_component(Button, "Button").$$render($$result, { variant: "primary", disabled: working }, {}, {
            default: () => {
              return `Submit for Approval`;
            }
          })}` : ``} ${current.status === "submitted" ? `${validate_component(ApprovalActions, "ApprovalActions").$$render(
            $$result,
            {
              rejectFirst: true,
              disabled: working,
              onApprove: () => runAction("approve"),
              onReject: () => runAction("reject")
            },
            {},
            {}
          )}` : ``} ${current.status === "approved" ? `${validate_component(Button, "Button").$$render($$result, { variant: "secondary", disabled: working }, {}, {
            default: () => {
              return `Close Budget`;
            }
          })}` : ``}` : ``} `;
        },
        default: () => {
          return `${current ? `<div class="space-y-5"><div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">${escape(current.budgetNo)}</p> <h3 class="text-xl font-black text-gray-900 dark:text-white">${escape(current.name)}</h3> <p class="text-sm text-gray-500 dark:text-slate-400">${escape(current.departmentName)} · Fiscal Year ${escape(current.fiscalYear)}</p></div> ${validate_component(Badge, "Badge").$$render($$result, { status: current.status }, {}, {})}</div> <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Total Budget",
              value: formatCurrency(current.totalAmount)
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Allocated",
              value: formatCurrency(allocated),
              tone: "blue"
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Used",
              value: formatCurrency(used),
              tone: "amber"
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Remaining",
              value: formatCurrency(remaining),
              tone: "emerald"
            },
            {},
            {}
          )}</div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Prepared By",
              value: current.preparedBy || "—"
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Approved By",
              value: current.approvedBy || "—"
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Created At",
              value: formatDate(current.createdAt)
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Utilization",
              value: formatPercent(utilization)
            },
            {},
            {}
          )}</div> ${current.notes ? `<div class="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-3"><p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-qv7eu">Notes</p> <p class="mt-1 text-sm text-gray-700 dark:text-slate-300">${escape(current.notes)}</p></div>` : ``} <div><div class="flex items-center justify-between mb-2" data-svelte-h="svelte-h7azyj"><h4 class="text-sm font-bold text-gray-900 dark:text-white">Budget Allocation Lines</h4> <a href="/budget-allocation" class="text-xs font-semibold text-blue-600 dark:text-blue-300 hover:underline">Manage allocations →</a></div> <div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800"><table class="min-w-full text-sm"><thead class="bg-slate-50 dark:bg-slate-950/60 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-b4dedd"><tr><th class="px-3 py-2 text-left">COA</th> <th class="px-3 py-2 text-left">Account</th> <th class="px-3 py-2 text-left">Department</th> <th class="px-3 py-2 text-right">Allocated</th> <th class="px-3 py-2 text-right">Used</th> <th class="px-3 py-2 text-right">Remaining</th></tr></thead> <tbody class="divide-y divide-gray-100 dark:divide-slate-800">${allocations.length ? each(allocations, (line) => {
            return `<tr><td class="px-3 py-2 font-mono text-xs">${escape(line.accountCode)}</td> <td class="px-3 py-2">${escape(line.accountName)}</td> <td class="px-3 py-2">${escape(line.departmentName)}</td> <td class="px-3 py-2 text-right">${escape(formatCurrency(line.allocatedAmount))}</td> <td class="px-3 py-2 text-right">${escape(formatCurrency(line.usedAmount))}</td> <td class="px-3 py-2 text-right">${escape(formatCurrency(line.allocatedAmount - line.usedAmount))}</td> </tr>`;
          }) : `<tr data-svelte-h="svelte-mebb09"><td colspan="6" class="px-3 py-6 text-center text-gray-500 dark:text-slate-400">No allocation lines yet.</td> </tr>`}</tbody></table></div></div> ${errorMessage ? `<p class="text-sm text-rose-600 dark:text-rose-400">${escape(errorMessage)}</p>` : ``} <details class="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-3"><summary class="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1wufw70">API payload preview — POST /api/budgeting/budgets</summary> <pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-emerald-300 text-[11px] p-3">${escape(JSON.stringify(payload, null, 2))}</pre></details></div>` : `<p class="text-sm text-gray-500 dark:text-slate-400" data-svelte-h="svelte-fbrfdo">Budget not found.</p>`}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_user();
  $$unsubscribe_budgetAllocations();
  $$unsubscribe_annualBudgets();
  return $$rendered;
});
export {
  BudgetDetailModal as B
};
