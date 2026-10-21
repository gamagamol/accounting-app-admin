import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "./ssr.js";
import { D as DataTable } from "./DataTable.js";
import { M as Modal, R as RowActions } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { B as Badge } from "./Badge.js";
import { a as formatDate, f as formatCurrency, P as PageHeader } from "./formatters.js";
import { F as FormField } from "./FormField.js";
import { z as purchaseOrders, m as debtPayments, P as debtPaymentActions } from "./dataStore.js";
const DebtPaymentFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  let { isOpen = false } = $$props;
  let { debtToEdit = null } = $$props;
  let supplierName = "";
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let amount = 0;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.debtToEdit === void 0 && $$bindings.debtToEdit && debtToEdit !== void 0) $$bindings.debtToEdit(debtToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (debtToEdit) {
          debtToEdit.purchaseNo;
          supplierName = debtToEdit.supplierName;
          date = debtToEdit.date;
          amount = debtToEdit.amount;
          debtToEdit.method;
        } else {
          const firstPO = $purchaseOrders[0];
          firstPO?.purchaseNo || "";
          supplierName = firstPO?.supplierName || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          amount = firstPO?.total || 15e6;
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: debtToEdit ? "Edit Vendor Payment" : "Record Vendor Payment",
        size: "xl",
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
              return `${escape(debtToEdit ? "Save Changes" : "Record Payment")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Purchase Order Number",
              name: "purchaseNo"
            },
            {},
            {
              default: () => {
                return `<select id="purchaseNo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($purchaseOrders, (po) => {
                  return `<option${add_attribute("value", po.purchaseNo, 0)}>${escape(po.purchaseNo)} - ${escape(po.supplierName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Vendor / Supplier Name",
              name: "supplierName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="supplierName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", supplierName, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Payment Date",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Payment Amount (IDR)",
              name: "amount",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="amount" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", amount, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Payment Method", name: "method" }, {}, {
            default: () => {
              return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-1c4yb2f">Company Bank Transfer</option><option value="cash" data-svelte-h="svelte-1cna9oo">Petty Cash</option><option value="check" data-svelte-h="svelte-1u4um7r">Cheque / Bank Draft</option></select>`;
            }
          })}</div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_purchaseOrders();
  return $$rendered;
});
const DebtPaymentDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { debt = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.debt === void 0 && $$bindings.debt && debt !== void 0) $$bindings.debt(debt);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Vendor Payment Details",
        size: "xl",
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
          return `${debt ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-rose-50/70 p-4 rounded-xl border border-rose-200 flex justify-between items-center"><div><span class="text-xs font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">${escape(debt.paymentNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(debt.supplierName)}</h3> <p class="text-xs text-gray-600 font-mono">No. Purchase Order: ${escape(debt.purchaseNo)}</p></div> ${validate_component(Badge, "Badge").$$render($$result, { status: "paid", label: "PAID / DIBAYAR" }, {}, {})}</div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1cmo4f2">Payment Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(debt.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1h1hwua">Disbursement Method:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(debt.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1y61m3w">Approved By:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(debt.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-lqlxpq">Amount Paid:</span> <p class="font-bold text-base text-rose-700 font-mono mt-0.5">${escape(formatCurrency(debt.amount))}</p></div></div></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const DebtPaymentList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $debtPayments, $$unsubscribe_debtPayments;
  $$unsubscribe_debtPayments = subscribe(debtPayments, (value) => $debtPayments = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedDebt = null;
  let debtToEdit = null;
  const columns = [
    {
      key: "paymentNo",
      label: "Payment Voucher No",
      sortable: true
    },
    {
      key: "date",
      label: "Payment Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Vendor / Supplier",
      sortable: true
    },
    { key: "purchaseNo", label: "PO Ref" },
    { key: "method", label: "Method" },
    {
      key: "amount",
      label: "Amount Paid",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
    }
  ];
  function openEdit(item) {
    debtToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedDebt = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete vendor payment ${item.paymentNo}? This action cannot be undone.`)) {
      debtPaymentActions.delete(item.id);
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
        title: "Vendor Payments",
        description: "Record cash disbursements settling supplier invoices against purchase orders."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-m01ox3">Record Vendor Payment</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $debtPayments,
        searchPlaceholder: "Search vendor payments by number, supplier or PO...",
        searchKeys: ["paymentNo", "supplierName", "purchaseNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View payment voucher",
              onEdit: () => openEdit(row),
              editTitle: "Edit payment voucher",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete payment voucher"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "paymentNo" ? `<span class="font-mono font-bold text-rose-700 dark:text-rose-300 bg-rose-50 dark:bg-rose-500/10 px-2 py-0.5 rounded border border-rose-200 dark:border-rose-500/20">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "paid" ? "Paid" : "Pending"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`}`;
        }
      }
    )} ${validate_component(DebtPaymentFormModal, "DebtPaymentFormModal").$$render(
      $$result,
      { debtToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(DebtPaymentDetailModal, "DebtPaymentDetailModal").$$render(
      $$result,
      { debt: selectedDebt, isOpen: isDetailOpen },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_debtPayments();
  return $$rendered;
});
export {
  DebtPaymentList as D
};
