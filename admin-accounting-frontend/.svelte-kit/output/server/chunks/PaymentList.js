import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "./ssr.js";
import { D as DataTable } from "./DataTable.js";
import { M as Modal, R as RowActions } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { B as Badge } from "./Badge.js";
import { a as formatDate, f as formatCurrency, P as PageHeader } from "./formatters.js";
import { F as FormField } from "./FormField.js";
import { w as billPayments, p as payments, O as paymentActions } from "./dataStore.js";
import { P as PrintPreviewModal } from "./PrintPreviewModal.js";
const PaymentFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $billPayments, $$unsubscribe_billPayments;
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  let { isOpen = false } = $$props;
  let { paymentToEdit = null } = $$props;
  let customerName = "";
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let amount = 0;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.paymentToEdit === void 0 && $$bindings.paymentToEdit && paymentToEdit !== void 0) $$bindings.paymentToEdit(paymentToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (paymentToEdit) {
          paymentToEdit.invoiceNo;
          customerName = paymentToEdit.customerName;
          date = paymentToEdit.date;
          amount = paymentToEdit.amount;
          paymentToEdit.method;
        } else {
          const pendingBill = $billPayments.find((b) => b.status === "pending") || $billPayments[0];
          pendingBill?.billNo || "";
          customerName = pendingBill?.supplierName || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          amount = pendingBill?.amount || 5e6;
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: paymentToEdit ? "Edit Customer Receipt" : "Record Customer Receipt",
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
              return `${escape(paymentToEdit ? "Save Receipt" : "Issue Receipt")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Related Invoice Number",
              name: "invoiceNo"
            },
            {},
            {
              default: () => {
                return `<select id="invoiceNo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($billPayments, (b) => {
                  return `<option${add_attribute("value", b.billNo, 0)}>${escape(b.billNo)} - ${escape(b.supplierName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Customer Name",
              name: "customerName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="customerName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", customerName, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Receipt Date",
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
              label: "Amount Received (IDR)",
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
              return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-amcbrg">Bank Transfer</option><option value="cash" data-svelte-h="svelte-m0ewil">Uang Cash</option><option value="check" data-svelte-h="svelte-1te4giw">Post-dated Cheque</option></select>`;
            }
          })}</div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_billPayments();
  return $$rendered;
});
const PaymentDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { payment = null } = $$props;
  let isPrintOpen = false;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.payment === void 0 && $$bindings.payment && payment !== void 0) $$bindings.payment(payment);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Customer Receipt Details",
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
          return `${payment ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex justify-between items-center"><div><span class="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">${escape(payment.paymentNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(payment.customerName)}</h3> <p class="text-xs text-gray-600 font-mono">No. Invoice: ${escape(payment.invoiceNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render($$result, { status: "paid", label: "PAID" }, {}, {})} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Print Receipt`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1cmo4f2">Payment Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(payment.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-vnw1sf">Payment Method:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(payment.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-rw7xor">Cashier:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(payment.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-dmvnh">Amount Received:</span> <p class="font-bold text-base text-emerald-700 font-mono mt-0.5">${escape(formatCurrency(payment.amount))}</p></div></div></div>` : ``}`;
        }
      }
    )} ${payment ? `${validate_component(PrintPreviewModal, "PrintPreviewModal").$$render(
      $$result,
      {
        documentType: "payment",
        documentNo: payment.paymentNo,
        date: payment.date,
        customerOrSupplierName: payment.customerName,
        subtotal: payment.amount,
        total: payment.amount,
        preparedBy: payment.preparedBy,
        isOpen: isPrintOpen
      },
      {
        isOpen: ($$value) => {
          isPrintOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}` : ``}`;
  } while (!$$settled);
  return $$rendered;
});
const PaymentList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $payments, $$unsubscribe_payments;
  $$unsubscribe_payments = subscribe(payments, (value) => $payments = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedPayment = null;
  let paymentToEdit = null;
  const columns = [
    {
      key: "paymentNo",
      label: "Receipt No",
      sortable: true
    },
    {
      key: "date",
      label: "Payment Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    { key: "invoiceNo", label: "Invoice Ref" },
    { key: "method", label: "Method" },
    {
      key: "amount",
      label: "Amount Received",
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
    paymentToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedPayment = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete payment receipt ${item.paymentNo}? This action cannot be undone.`)) {
      paymentActions.delete(item.id);
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
        title: "Customer Receipts",
        description: "Record incoming customer payments, issue receipts and update receivable balances in the general ledger."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-1o4ivyv">Record Receipt</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $payments,
        searchPlaceholder: "Search receipts by number, customer or invoice...",
        searchKeys: ["paymentNo", "customerName", "invoiceNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View and print receipt",
              onEdit: () => openEdit(row),
              editTitle: "Edit receipt",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete receipt"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "paymentNo" ? `<span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "paid" ? "Received" : "Pending"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`}`;
        }
      }
    )} ${validate_component(PaymentFormModal, "PaymentFormModal").$$render(
      $$result,
      { paymentToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(PaymentDetailModal, "PaymentDetailModal").$$render(
      $$result,
      {
        payment: selectedPayment,
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
  $$unsubscribe_payments();
  return $$rendered;
});
export {
  PaymentList as P
};
