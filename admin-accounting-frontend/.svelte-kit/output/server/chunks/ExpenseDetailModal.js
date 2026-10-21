import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape } from "./ssr.js";
import { M as Modal } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { B as Badge } from "./Badge.js";
import { D as DetailStat, a as DetailField } from "./DetailField.js";
import { A as ApprovalActions } from "./ApprovalActions.js";
import { l as expenses, G as expenseActions } from "./dataStore.js";
import { u as user } from "./auth.js";
import { c as apiRequest } from "./client.js";
import { e as expenseTypeLabel } from "./accounting-options.js";
import { a as formatDate, f as formatCurrency } from "./formatters.js";
import { g as getErrorMessage } from "./errors.js";
const BASE = "/api/expenses";
const expenseEndpoints = {
  expenses: BASE,
  expense: (id) => `${BASE}/${id}`,
  submit: (id) => `${BASE}/${id}/submit`,
  approve: (id) => `${BASE}/${id}/approve`,
  reject: (id) => `${BASE}/${id}/reject`,
  post: (id) => `${BASE}/${id}/post`,
  posted: `${BASE}/posted`
};
const expensesApi = {
  list() {
    return apiRequest(expenseEndpoints.expenses);
  },
  create(payload) {
    return apiRequest(expenseEndpoints.expenses, {
      method: "POST",
      body: payload
    });
  },
  update(id, payload) {
    return apiRequest(expenseEndpoints.expense(id), {
      method: "PUT",
      body: payload
    });
  },
  delete(id) {
    return apiRequest(expenseEndpoints.expense(id), { method: "DELETE" });
  },
  submit(id, submittedBy) {
    return apiRequest(expenseEndpoints.submit(id), {
      method: "POST",
      body: { submittedBy }
    });
  },
  approve(id, payload = {}) {
    return apiRequest(expenseEndpoints.approve(id), {
      method: "POST",
      body: payload
    });
  },
  reject(id, payload = {}) {
    return apiRequest(expenseEndpoints.reject(id), {
      method: "POST",
      body: payload
    });
  },
  post(id, payload = {}) {
    return apiRequest(expenseEndpoints.post(id), {
      method: "POST",
      body: payload
    });
  },
  listPosted() {
    return apiRequest(expenseEndpoints.posted);
  }
};
const ExpenseDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let current;
  let payload;
  let $user, $$unsubscribe_user;
  let $expenses, $$unsubscribe_expenses;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  let { isOpen = false } = $$props;
  let { expense = null } = $$props;
  let working = false;
  let errorMessage = "";
  async function runAction(action) {
    if (!current) return;
    working = true;
    errorMessage = "";
    try {
      if (action === "submit") {
        await expensesApi.submit(current.id, $user?.name ?? "");
        expenseActions.submit(current.id, $user?.name ?? "");
      } else if (action === "approve") {
        await expensesApi.approve(current.id, { approvedBy: $user?.name });
        expenseActions.approve(current.id, $user?.name);
      } else if (action === "reject") {
        await expensesApi.reject(current.id, { approvedBy: $user?.name });
        expenseActions.reject(current.id, $user?.name);
      } else {
        await expensesApi.post(current.id, { postedBy: $user?.name });
        expenseActions.post(current.id);
      }
    } catch (error) {
      errorMessage = getErrorMessage(error, "Action failed.");
    } finally {
      working = false;
    }
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.expense === void 0 && $$bindings.expense && expense !== void 0) $$bindings.expense(expense);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    current = expense ? $expenses.find((item) => item.id === expense.id) ?? expense : null;
    payload = current ? {
      date: current.date,
      expenseNo: current.expenseNo,
      expenseType: current.expenseType,
      category: current.category,
      accountCode: current.accountCode,
      accountName: current.accountName,
      departmentCode: current.departmentCode,
      departmentName: current.departmentName,
      budgetId: current.budgetId,
      budgetNo: current.budgetNo,
      employeeId: current.employeeId,
      employeeName: current.employeeName,
      supplierName: current.supplierName,
      description: current.description,
      amount: current.amount,
      taxAmount: current.taxAmount,
      totalAmount: current.totalAmount,
      paymentMethod: current.paymentMethod,
      bankAccount: current.bankAccount,
      paidTo: current.paidTo,
      status: current.status,
      attachmentUrl: current.attachmentUrl,
      notes: current.notes,
      submittedBy: current.submittedBy,
      approvedBy: current.approvedBy,
      postedAt: current.postedAt,
      glReference: current.glReference
    } : null;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Expense Entry Details",
        size: "3xl",
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
          })} ${current ? `${current.status === "draft" || current.status === "rejected" ? `${validate_component(Button, "Button").$$render($$result, { variant: "primary", disabled: working }, {}, {
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
          )}` : ``} ${current.status === "approved" ? `${validate_component(Button, "Button").$$render($$result, { variant: "success", disabled: working }, {}, {
            default: () => {
              return `Post to GL`;
            }
          })}` : ``}` : ``} `;
        },
        default: () => {
          return `${current ? `<div class="space-y-5"><div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3"><div><p class="text-xs font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">${escape(current.expenseNo)}</p> <h3 class="text-xl font-black text-gray-900 dark:text-white">${escape(expenseTypeLabel(current.expenseType))}</h3> <p class="text-sm text-gray-500 dark:text-slate-400">${escape(current.departmentName)} · ${escape(formatDate(current.date))}</p></div> ${validate_component(Badge, "Badge").$$render($$result, { status: current.status }, {}, {})}</div> <div class="grid grid-cols-2 lg:grid-cols-4 gap-3">${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Amount",
              value: formatCurrency(current.amount)
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Tax",
              value: formatCurrency(current.taxAmount)
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Total",
              value: formatCurrency(current.totalAmount),
              tone: "blue"
            },
            {},
            {}
          )} ${validate_component(DetailStat, "DetailStat").$$render(
            $$result,
            {
              label: "Budget",
              value: current.budgetNo || "—"
            },
            {},
            {}
          )}</div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Description",
              value: current.description
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Category",
              value: current.category
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Expense Account",
              value: `${current.accountCode} — ${current.accountName}`
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Paid To",
              value: current.paidTo || "—"
            },
            {},
            {}
          )} ${current.employeeName ? `${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Employee",
              value: current.employeeName
            },
            {},
            {}
          )}` : ``} ${current.supplierName ? `${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Supplier / Vendor",
              value: current.supplierName
            },
            {},
            {}
          )}` : ``} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Payment",
              value: `${current.paymentMethod} · ${current.bankAccount}`
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Attachment",
              value: current.attachmentUrl || "—"
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Submitted By",
              value: current.submittedBy || "—"
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
          )} ${current.status === "posted" ? `${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "Posted At",
              value: formatDate(current.postedAt)
            },
            {},
            {}
          )} ${validate_component(DetailField, "DetailField").$$render(
            $$result,
            {
              label: "GL Reference",
              value: current.glReference,
              mono: true
            },
            {},
            {}
          )}` : ``}</div> ${current.notes ? `<div class="rounded-lg bg-slate-50 dark:bg-slate-950/60 border border-gray-200 dark:border-slate-800 p-3"><p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-qv7eu">Notes</p> <p class="mt-1 text-sm text-gray-700 dark:text-slate-300">${escape(current.notes)}</p></div>` : ``} ${errorMessage ? `<p class="text-sm text-rose-600 dark:text-rose-400">${escape(errorMessage)}</p>` : ``} <details class="rounded-xl border border-dashed border-gray-300 dark:border-slate-700 p-3"><summary class="cursor-pointer text-xs font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1ky6wg5">API payload preview — POST /api/expenses</summary> <pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-emerald-300 text-[11px] p-3">${escape(JSON.stringify(payload, null, 2))}</pre></details></div>` : `<p class="text-sm text-gray-500 dark:text-slate-400" data-svelte-h="svelte-fmz21p">Expense not found.</p>`}`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_user();
  $$unsubscribe_expenses();
  return $$rendered;
});
export {
  ExpenseDetailModal as E,
  expensesApi as e
};
