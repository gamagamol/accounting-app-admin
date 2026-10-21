import { c as create_ssr_component, v as validate_component, e as escape, f as add_attribute, s as subscribe } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { f as formatCurrency, P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { c as chartOfAccounts, n as coaActions } from "../../../chunks/dataStore.js";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
const CoaFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { coaToEdit = null } = $$props;
  let formData = {
    code: "",
    name: "",
    balance: 0
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.coaToEdit === void 0 && $$bindings.coaToEdit && coaToEdit !== void 0) $$bindings.coaToEdit(coaToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (coaToEdit) {
          formData = {
            code: coaToEdit.code,
            name: coaToEdit.name,
            category: coaToEdit.category,
            balance: coaToEdit.balance
          };
        } else {
          formData = {
            code: "",
            name: "",
            category: "Asset",
            balance: 0
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: coaToEdit ? "Edit Account" : "New Account",
        size: "md",
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
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(coaToEdit ? "Save Changes" : "Create Account")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Account Code",
              name: "code",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="code" type="text" placeholder="e.g. 1-1000 or 4-1000" class="${escape(inputClass, true) + " font-mono"}" required${add_attribute("value", formData.code, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Account Name",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="e.g. Petty Cash, Accounts Receivable"${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Account Category",
              name: "category"
            },
            {},
            {
              default: () => {
                return `<select id="category"${add_attribute("class", inputClass, 0)}><option value="Asset" data-svelte-h="svelte-17u4uly">Asset</option><option value="Liability" data-svelte-h="svelte-13wai1o">Liability</option><option value="Equity" data-svelte-h="svelte-1r5iq36">Equity</option><option value="Revenue" data-svelte-h="svelte-1xz9maa">Revenue</option><option value="Expense" data-svelte-h="svelte-g8868e">Expense</option></select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Opening / Current Balance (IDR)",
              name: "balance"
            },
            {},
            {
              default: () => {
                return `<input id="balance" type="number" placeholder="0" class="${escape(inputClass, true) + " font-mono"}"${add_attribute("value", formData.balance, 0)}>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const CoaDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { account = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.account === void 0 && $$bindings.account && account !== void 0) $$bindings.account(account);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Account Details",
        size: "md",
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
          })} `;
        },
        default: () => {
          return `${account ? `<div class="space-y-5 text-sm"><div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800"><p class="text-xs font-mono text-blue-700 dark:text-blue-300">${escape(account.code)}</p> <h4 class="text-lg font-bold text-gray-900 dark:text-white mt-0.5">${escape(account.name)}</h4> <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">${escape(account.category)}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1kr6w50">Current Balance</p> <p class="text-xl font-black font-mono text-gray-900 dark:text-white mt-1">${escape(formatCurrency(account.balance))}</p></div> <p class="text-[11px] text-gray-500 dark:text-slate-400" data-svelte-h="svelte-ixia55">Accounts are used across journals, invoices, expense postings and financial statements.
				Changing the balance manually should be done through a journal adjustment.</p></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
function getCategoryColor(cat) {
  switch (cat) {
    case "Asset":
      return "bg-emerald-50 text-emerald-700 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-200 dark:border-emerald-500/20";
    case "Liability":
      return "bg-rose-50 text-rose-700 border-rose-200 dark:bg-rose-500/10 dark:text-rose-200 dark:border-rose-500/20";
    case "Equity":
      return "bg-purple-50 text-purple-700 border-purple-200 dark:bg-purple-500/10 dark:text-purple-200 dark:border-purple-500/20";
    case "Revenue":
      return "bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-500/10 dark:text-blue-200 dark:border-blue-500/20";
    case "Expense":
      return "bg-amber-50 text-amber-700 border-amber-200 dark:bg-amber-500/10 dark:text-amber-200 dark:border-amber-500/20";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  }
}
const CoaList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedAccount = null;
  let coaToEdit = null;
  const columns = [
    {
      key: "code",
      label: "Account Code",
      sortable: true
    },
    {
      key: "name",
      label: "Account Name",
      sortable: true
    },
    {
      key: "category",
      label: "Category",
      sortable: true
    },
    {
      key: "balance",
      label: "Balance (IDR)",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(Number(v) || 0)
    }
  ];
  function openEdit(coa) {
    coaToEdit = coa;
    isFormOpen = true;
  }
  function openDetail(coa) {
    selectedAccount = coa;
    isDetailOpen = true;
  }
  function handleDelete(coa) {
    if (confirm(`Delete account ${coa.code} - ${coa.name}? This action cannot be undone.`)) {
      coaActions.delete(coa.id);
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Chart of Accounts",
        description: "Accounting ledger structure: assets, liabilities, equity, revenue and expenses."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-1w8nceq">Add Account</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $chartOfAccounts,
        searchPlaceholder: "Search by account code or account name...",
        searchKeys: ["code", "name", "category"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View account details",
              onEdit: () => openEdit(row),
              editTitle: "Edit account",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete account"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "code" ? `<span class="font-mono font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded border border-blue-200 dark:border-blue-500/20">${escape(value)}</span>` : `${column.key === "category" ? `<span class="${"px-2 py-0.5 rounded-full text-xs font-semibold border " + escape(getCategoryColor(value), true)}">${escape(value)}</span>` : `${column.key === "balance" ? `<span class="font-mono font-semibold text-gray-900 dark:text-gray-100">${escape(formatCurrency(Number(value) || 0))}</span>` : `${escape(value ?? "-")}`}`}`}`;
        }
      }
    )} ${validate_component(CoaFormModal, "CoaFormModal").$$render(
      $$result,
      { coaToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(CoaDetailModal, "CoaDetailModal").$$render(
      $$result,
      {
        account: selectedAccount,
        isOpen: isDetailOpen
      },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_chartOfAccounts();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(CoaList, "CoaList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
