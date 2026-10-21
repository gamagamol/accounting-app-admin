import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape, g as each, f as add_attribute } from "../../../chunks/ssr.js";
import { f as formatCurrency, P as PageHeader } from "../../../chunks/formatters.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { B as Button } from "../../../chunks/Button.js";
import { F as FilterSelect } from "../../../chunks/FilterSelect.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { S as StatCard } from "../../../chunks/StatCard.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { E as employees, c as chartOfAccounts, h as annualBudgets, g as departments, H as suppliers, b as bankAccounts, l as expenses, G as expenseActions } from "../../../chunks/dataStore.js";
import { u as user } from "../../../chunks/auth.js";
import "../../../chunks/client.js";
import { d as defaultExpenseAccount, c as defaultExpenseCategory, f as expenseTypeMap, g as expenseTypeOptions, p as paymentMethodOptions, e as expenseTypeLabel, h as expenseStatusOptions } from "../../../chunks/accounting-options.js";
import { E as ExpenseDetailModal, e as expensesApi } from "../../../chunks/ExpenseDetailModal.js";
import { d as dateColumn, c as currencyColumn, s as statusColumn } from "../../../chunks/tableColumns.js";
import { g as getErrorMessage } from "../../../chunks/errors.js";
function fromExpense(item) {
  return {
    date: item.date,
    expenseNo: item.expenseNo,
    expenseType: item.expenseType,
    category: item.category,
    accountCode: item.accountCode,
    accountName: item.accountName,
    departmentCode: item.departmentCode,
    departmentName: item.departmentName,
    budgetId: item.budgetId,
    budgetNo: item.budgetNo,
    employeeId: item.employeeId,
    employeeName: item.employeeName,
    supplierName: item.supplierName,
    description: item.description,
    amount: item.amount,
    taxAmount: item.taxAmount,
    totalAmount: item.totalAmount,
    paymentMethod: item.paymentMethod,
    bankAccount: item.bankAccount,
    paidTo: item.paidTo,
    status: item.status,
    attachmentUrl: item.attachmentUrl,
    notes: item.notes,
    submittedBy: item.submittedBy,
    approvedBy: item.approvedBy,
    postedAt: item.postedAt,
    glReference: item.glReference
  };
}
const ExpenseFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let expenseAccounts;
  let accountOptions;
  let budgetOptions;
  let departmentOptions;
  let activeEmployees;
  let selectedType;
  let isEmployeeExpense;
  let totalAmount;
  let $user, $$unsubscribe_user;
  let $employees, $$unsubscribe_employees;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  let $annualBudgets, $$unsubscribe_annualBudgets;
  let $departments, $$unsubscribe_departments;
  let $suppliers, $$unsubscribe_suppliers;
  let $bankAccounts, $$unsubscribe_bankAccounts;
  let $expenses, $$unsubscribe_expenses;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_employees = subscribe(employees, (value) => $employees = value);
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  $$unsubscribe_annualBudgets = subscribe(annualBudgets, (value) => $annualBudgets = value);
  $$unsubscribe_departments = subscribe(departments, (value) => $departments = value);
  $$unsubscribe_suppliers = subscribe(suppliers, (value) => $suppliers = value);
  $$unsubscribe_bankAccounts = subscribe(bankAccounts, (value) => $bankAccounts = value);
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  let { isOpen = false } = $$props;
  let { expense = null } = $$props;
  let { onSaved = () => {
  } } = $$props;
  let form = blankForm();
  let lastKey = "";
  let saving = false;
  function nextExpenseNo() {
    const year = 2024;
    return `EXP/${year}/${String($expenses.length + 1).padStart(3, "0")}`;
  }
  function blankForm() {
    const type = "salary";
    const department = $departments[0];
    const budget = $annualBudgets.find((item) => item.departmentCode === department?.code) ?? $annualBudgets[0];
    const employee = $employees.find((item) => item.status === "active");
    const account = $chartOfAccounts.find((item) => item.code === defaultExpenseAccount(type) && item.category === "Expense");
    return {
      date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
      expenseNo: nextExpenseNo(),
      expenseType: type,
      category: defaultExpenseCategory(type),
      accountCode: defaultExpenseAccount(type),
      accountName: account?.name ?? defaultExpenseCategory(type),
      departmentCode: department?.code ?? "",
      departmentName: department?.name ?? "",
      budgetId: budget?.id ?? "",
      budgetNo: budget?.budgetNo ?? "",
      employeeId: employee?.id ?? "",
      employeeName: employee?.name ?? "",
      supplierName: "",
      description: "",
      amount: 0,
      taxAmount: 0,
      totalAmount: 0,
      paymentMethod: "Bank Transfer",
      bankAccount: $bankAccounts[0]?.code ?? "",
      paidTo: employee?.name ?? "",
      status: "draft",
      attachmentUrl: "",
      notes: "",
      submittedBy: $user?.name ?? "",
      approvedBy: "",
      postedAt: "",
      glReference: ""
    };
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.expense === void 0 && $$bindings.expense && expense !== void 0) $$bindings.expense(expense);
  if ($$props.onSaved === void 0 && $$bindings.onSaved && onSaved !== void 0) $$bindings.onSaved(onSaved);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    expenseAccounts = $chartOfAccounts.filter((account) => account.category === "Expense");
    accountOptions = expenseAccounts.map((account) => ({
      value: account.code,
      label: `${account.code} — ${account.name}`
    }));
    budgetOptions = $annualBudgets.map((budget) => ({
      value: budget.id,
      label: `${budget.budgetNo} — ${budget.name}`
    }));
    departmentOptions = $departments.map((department) => ({
      value: department.code,
      label: `${department.code} — ${department.name}`
    }));
    activeEmployees = $employees.filter((employee) => employee.status === "active");
    {
      if (!isOpen) {
        lastKey = "";
      } else {
        const key = expense?.id ?? "new";
        if (lastKey !== key) {
          lastKey = key;
          form = expense ? fromExpense(expense) : blankForm();
        }
      }
    }
    selectedType = expenseTypeMap[form.expenseType];
    isEmployeeExpense = form.expenseType === "salary" || form.expenseType === "travel";
    totalAmount = (Number(form.amount) || 0) + (Number(form.taxAmount) || 0);
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: expense ? "Edit Expense Entry" : "New Expense Entry",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary", disabled: saving }, {}, {
            default: () => {
              return `${escape(expense ? "Save Changes" : "Save Expense")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3"><p class="text-xs font-semibold text-blue-800 dark:text-blue-200">${escape(selectedType.icon)} ${escape(selectedType.label)}</p> <p class="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">${escape(selectedType.hint)}</p></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Expense Type",
              name: "expenseType",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="expenseType" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(expenseTypeOptions, (option) => {
                  return `<option${add_attribute("value", option.value, 0)}>${escape(option.icon)} ${escape(option.label)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Expense Date",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.date, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Expense No",
              name: "expenseNo",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="expenseNo" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="EXP/2024/010"${add_attribute("value", form.expenseNo, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Category",
              name: "category",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="category" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.category, 0)}>`;
              }
            }
          )} <div class="sm:col-span-2">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Description",
              name: "description",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="description" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="What was this expense for?"${add_attribute("value", form.description, 0)}>`;
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
              label: "Budget",
              name: "budgetId",
              hint: "Optional; used for budget vs actual control."
            },
            {},
            {
              default: () => {
                return `<select id="budgetId" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="" data-svelte-h="svelte-6ovhuc">— No budget —</option>${each(budgetOptions, (option) => {
                  return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Expense Account (COA)",
              name: "accountCode",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="accountCode" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(accountOptions, (option) => {
                  return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
                })}</select>`;
              }
            }
          )} ${isEmployeeExpense ? `${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Employee",
              name: "employeeId",
              required: form.expenseType === "salary"
            },
            {},
            {
              default: () => {
                return `<select id="employeeId" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="" data-svelte-h="svelte-ux0rws">— Select employee —</option>${each(activeEmployees, (employee) => {
                  return `<option${add_attribute("value", employee.id, 0)}>${escape(employee.name)} — ${escape(employee.position)}</option>`;
                })}</select>`;
              }
            }
          )}` : `${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Supplier / Vendor",
              name: "supplierName",
              hint: "Choose from master data or type a new vendor name."
            },
            {},
            {
              default: () => {
                return `<input id="supplierName" list="supplier-options" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Select or type supplier / vendor"${add_attribute("value", form.supplierName, 0)}> <datalist id="supplier-options">${each($suppliers, (supplier) => {
                  return `<option${add_attribute("value", supplier.companyName, 0)}></option>`;
                })}</datalist>`;
              }
            }
          )}`} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Paid To",
              name: "paidTo",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="paidTo" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Employee, supplier or payee"${add_attribute("value", form.paidTo, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Amount (IDR)",
              name: "amount",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="amount" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.amount, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Tax / PPN (IDR)",
              name: "taxAmount"
            },
            {},
            {
              default: () => {
                return `<input id="taxAmount" type="number" min="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", form.taxAmount, 0)}>`;
              }
            }
          )} <div class="sm:col-span-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 flex items-center justify-between"><span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1ewioud">Total Expense</span> <span class="text-lg font-black text-gray-900 dark:text-white">${escape(formatCurrency(totalAmount))}</span></div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Payment Method",
              name: "paymentMethod"
            },
            {},
            {
              default: () => {
                return `<select id="paymentMethod" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(paymentMethodOptions, (option) => {
                  return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Bank / Cash Account",
              name: "bankAccount"
            },
            {},
            {
              default: () => {
                return `<select id="bankAccount" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($bankAccounts, (account) => {
                  return `<option${add_attribute("value", account.code, 0)}>${escape(account.code)} — ${escape(account.bankName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Attachment",
              name: "attachmentUrl",
              hint: "File name or URL; backend will store the uploaded document."
            },
            {},
            {
              default: () => {
                return `<input id="attachmentUrl" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="invoice.pdf"${add_attribute("value", form.attachmentUrl, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Initial Status", name: "status" }, {}, {
            default: () => {
              return `<select id="status" ${!!expense && !["draft", "rejected"].includes(expense.status) ? "disabled" : ""} class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60">${expense && !["draft", "rejected"].includes(expense.status) ? `<option${add_attribute("value", form.status, 0)}>${escape(form.status.replace(/_/g, " "))}</option>` : `<option value="draft" data-svelte-h="svelte-1e1b8nw">Draft</option> <option value="submitted" data-svelte-h="svelte-19uvybx">Submit for approval</option>`}</select>`;
            }
          })} <div class="sm:col-span-2">${validate_component(FormField, "FormField").$$render($$result, { label: "Notes", name: "notes" }, {}, {
            default: () => {
              return `<textarea id="notes" rows="2" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" placeholder="Additional approval notes...">${escape(form.notes || "")}</textarea>`;
            }
          })}</div></div> <p class="text-[11px] text-gray-500 dark:text-slate-400" data-svelte-h="svelte-o153pu">Payload will be sent to <code class="font-mono">POST /api/expenses</code>. In mock mode it is
			captured in the API payload log for backend integration.</p></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_user();
  $$unsubscribe_employees();
  $$unsubscribe_chartOfAccounts();
  $$unsubscribe_annualBudgets();
  $$unsubscribe_departments();
  $$unsubscribe_suppliers();
  $$unsubscribe_bankAccounts();
  $$unsubscribe_expenses();
  return $$rendered;
});
const ExpenseEntryView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let typeSummary;
  let salarySummary;
  let purchaseSummary;
  let officeSummary;
  let otherSummary;
  let rows;
  let $expenses, $$unsubscribe_expenses;
  $$unsubscribe_expenses = subscribe(expenses, (value) => $expenses = value);
  let isFormOpen = false;
  let editingExpense = null;
  let isDetailOpen = false;
  let detailExpense = null;
  let typeFilter = "all";
  let statusFilter = "all";
  const columns = [
    dateColumn("date", "Date"),
    {
      key: "expenseNo",
      label: "Expense No",
      sortable: true
    },
    {
      key: "expenseType",
      label: "Expense Type",
      sortable: true,
      format: (value) => `${typeIcon(value)} ${expenseTypeLabel(value)}`
    },
    {
      key: "description",
      label: "Description",
      format: (value) => {
        const text = String(value ?? "");
        return text.length > 34 ? `${text.slice(0, 34)}…` : text;
      }
    },
    {
      key: "departmentName",
      label: "Department",
      sortable: true
    },
    { key: "budgetNo", label: "Budget No" },
    currencyColumn("totalAmount", "Total"),
    statusColumn()
  ];
  function typeIcon(type) {
    return expenseTypeMap[type]?.icon ?? "🧾";
  }
  function openEdit(expense) {
    editingExpense = expense;
    isFormOpen = true;
  }
  function openDetail(expense) {
    detailExpense = expense;
    isDetailOpen = true;
  }
  async function deleteExpense(expense) {
    if (!confirm(`Delete expense "${expense.expenseNo}"? This action cannot be undone.`)) return;
    try {
      await expensesApi.delete(expense.id);
      expenseActions.delete(expense.id);
    } catch (error) {
      alert(getErrorMessage(error, "Failed to delete expense."));
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    typeSummary = $expenses.reduce(
      (summary, expense) => {
        const item = summary[expense.expenseType] ?? { total: 0, count: 0 };
        item.total += expense.totalAmount;
        item.count += 1;
        summary[expense.expenseType] = item;
        return summary;
      },
      {}
    );
    salarySummary = typeSummary.salary ?? { total: 0, count: 0 };
    purchaseSummary = typeSummary.purchase ?? { total: 0, count: 0 };
    officeSummary = typeSummary.office_supplies ?? { total: 0, count: 0 };
    otherSummary = Object.entries(typeSummary).filter(([type]) => !["salary", "purchase", "office_supplies"].includes(type)).reduce(
      (summary, [, item]) => ({
        total: summary.total + item.total,
        count: summary.count + item.count
      }),
      { total: 0, count: 0 }
    );
    rows = $expenses.filter((expense) => {
      const matchesType = typeFilter === "all" || expense.expenseType === typeFilter;
      const matchesStatus = statusFilter === "all" || expense.status === statusFilter;
      return matchesType && matchesStatus;
    });
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Expense Entry",
        description: "Record employee salaries, purchase expenses, office supplies (ATK), utilities and other operating expenses."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg>
			New Expense`;
      }
    })}</div> <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Employee Salary",
        value: formatCurrency(salarySummary.total),
        icon: "👔",
        color: "blue",
        hint: `${salarySummary.count} salary entries`
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Purchase Expense",
        value: formatCurrency(purchaseSummary.total),
        icon: "📦",
        color: "purple",
        hint: `${purchaseSummary.count} purchase entries`
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Office Supplies (ATK)",
        value: formatCurrency(officeSummary.total),
        icon: "✏️",
        color: "yellow",
        hint: `${officeSummary.count} ATK entries`
      },
      {},
      {}
    )} ${validate_component(StatCard, "StatCard").$$render(
      $$result,
      {
        title: "Other Operating",
        value: formatCurrency(otherSummary.total),
        icon: "🧾",
        color: "green",
        hint: `${otherSummary.count} other expense entries`
      },
      {},
      {}
    )}</div> <div class="rounded-xl border border-emerald-200 dark:border-emerald-500/30 bg-emerald-50 dark:bg-emerald-500/10 p-3 text-xs text-emerald-800 dark:text-emerald-200" data-svelte-h="svelte-4ysgcy"><strong>Special expense workflow:</strong> salary, purchase, ATK and other operating expenses are
		recorded here, then submitted for approval and posted to the general ledger. HRMIS remains a
		separate application; this menu only records the accounting expense.</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: rows,
        searchKeys: [
          "expenseNo",
          "category",
          "description",
          "departmentName",
          "budgetNo",
          "paidTo",
          "status"
        ],
        searchPlaceholder: "Search expense number, description or payee...",
        emptyMessage: "No expense entries found"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              onEdit: () => openEdit(row),
              onDelete: () => deleteExpense(row),
              viewTitle: "View expense",
              editTitle: "Edit expense",
              deleteTitle: "Delete expense"
            },
            {},
            {}
          )} `;
        },
        controls: () => {
          return `<div slot="controls" class="flex flex-wrap items-center gap-2">${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "expense-type-filter",
              allLabel: "All types",
              options: expenseTypeOptions,
              value: typeFilter
            },
            {
              value: ($$value) => {
                typeFilter = $$value;
                $$settled = false;
              }
            },
            {}
          )} ${validate_component(FilterSelect, "FilterSelect").$$render(
            $$result,
            {
              id: "expense-status-filter",
              allLabel: "All statuses",
              options: expenseStatusOptions,
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
    )}</div> ${validate_component(ExpenseFormModal, "ExpenseFormModal").$$render(
      $$result,
      {
        expense: editingExpense,
        isOpen: isFormOpen
      },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(ExpenseDetailModal, "ExpenseDetailModal").$$render(
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
  $$unsubscribe_expenses();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(ExpenseEntryView, "ExpenseEntryView").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
