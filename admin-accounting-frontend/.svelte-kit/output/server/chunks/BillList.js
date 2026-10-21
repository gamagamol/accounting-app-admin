import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "./ssr.js";
import { D as DataTable } from "./DataTable.js";
import { M as Modal, R as RowActions } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { B as Badge } from "./Badge.js";
import { a as formatDate, f as formatCurrency, P as PageHeader } from "./formatters.js";
import { F as FormField } from "./FormField.js";
import { A as salesOrders, w as billPayments, N as billActions } from "./dataStore.js";
import { P as PrintPreviewModal } from "./PrintPreviewModal.js";
const BillFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesOrders, $$unsubscribe_salesOrders;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  let { isOpen = false } = $$props;
  let { billToEdit = null } = $$props;
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let customerName = "";
  let amount = 0;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.billToEdit === void 0 && $$bindings.billToEdit && billToEdit !== void 0) $$bindings.billToEdit(billToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (billToEdit) {
          billToEdit.invoiceNo;
          date = billToEdit.date;
          customerName = billToEdit.supplierName;
          amount = billToEdit.amount;
          billToEdit.method;
          billToEdit.status;
        } else {
          const firstSO = $salesOrders[0];
          firstSO?.salesNo || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          customerName = firstSO?.customerName || "";
          amount = firstSO?.total || 1e7;
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: billToEdit ? "Edit Invoice" : "Issue New Invoice",
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
              return `${escape(billToEdit ? "Save Invoice" : "Issue Invoice")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Sales Order Reference",
              name: "invoiceNo"
            },
            {},
            {
              default: () => {
                return `<select id="invoiceNo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($salesOrders, (so) => {
                  return `<option${add_attribute("value", so.salesNo, 0)}>${escape(so.salesNo)} - ${escape(so.customerName)}</option>`;
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
              label: "Invoice Date",
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
              label: "Invoice Amount (IDR)",
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
              return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-amcbrg">Bank Transfer</option><option value="cash" data-svelte-h="svelte-1krjaga">Cash</option><option value="check" data-svelte-h="svelte-1u4um7r">Cheque / Bank Draft</option></select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Payment Status", name: "status" }, {}, {
            default: () => {
              return `<select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="pending" data-svelte-h="svelte-153aqix">Unpaid (Outstanding)</option><option value="paid" data-svelte-h="svelte-1ezzwbm">Paid</option></select>`;
            }
          })}</div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_salesOrders();
  return $$rendered;
});
const BillDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { bill = null } = $$props;
  let isPrintOpen = false;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.bill === void 0 && $$bindings.bill && bill !== void 0) $$bindings.bill(bill);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Sales Invoice Details",
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
              return `Close`;
            }
          })} ${bill && bill.status === "pending" ? `${validate_component(Button, "Button").$$render($$result, { variant: "success" }, {}, {
            default: () => {
              return `💵 Record Invoice Settlement`;
            }
          })}` : ``} `;
        },
        default: () => {
          return `${bill ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${escape(bill.billNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(bill.supplierName)}</h3> <p class="text-xs text-gray-500 font-mono">Sales Order No: ${escape(bill.invoiceNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: bill.status,
              label: bill.status === "paid" ? "Paid" : "Unpaid"
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Print Invoice`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-hbt655">Invoice Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(bill.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-vnw1sf">Payment Method:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(bill.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1cjifa2">Issued By:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(bill.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1n1bcxf">Invoice Total:</span> <p class="font-bold text-base text-blue-700 font-mono mt-0.5">${escape(formatCurrency(bill.amount))}</p></div></div></div>` : ``}`;
        }
      }
    )} ${bill ? `${validate_component(PrintPreviewModal, "PrintPreviewModal").$$render(
      $$result,
      {
        documentType: "bill",
        documentNo: bill.billNo,
        date: bill.date,
        customerOrSupplierName: bill.supplierName,
        subtotal: bill.amount,
        total: bill.amount,
        preparedBy: bill.preparedBy,
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
const BillList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $billPayments, $$unsubscribe_billPayments;
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedBill = null;
  let billToEdit = null;
  const columns = [
    {
      key: "billNo",
      label: "Invoice No",
      sortable: true
    },
    {
      key: "invoiceNo",
      label: "Sales Order No",
      sortable: true
    },
    {
      key: "date",
      label: "Invoice Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Customer",
      sortable: true
    },
    { key: "method", label: "Method" },
    {
      key: "amount",
      label: "Invoice Amount",
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
    billToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedBill = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete invoice ${item.billNo}? This action cannot be undone.`)) {
      billActions.delete(item.id);
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
        title: "Sales Invoices",
        description: "Issue customer receivables invoices and monitor settlement status."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-snp3rs">Issue New Invoice</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $billPayments,
        searchPlaceholder: "Search invoices by invoice number, SO or customer...",
        searchKeys: ["billNo", "invoiceNo", "supplierName", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View invoice and settlement",
              onEdit: () => openEdit(row),
              editTitle: "Edit invoice",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete invoice"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "billNo" ? `<span class="font-mono font-bold text-amber-700 dark:text-amber-300 bg-amber-50 dark:bg-amber-500/10 px-2 py-0.5 rounded border border-amber-200 dark:border-amber-500/20">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 dark:text-gray-300 bg-gray-100 dark:bg-slate-800 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "paid" ? "Paid" : "Unpaid"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`}`;
        }
      }
    )} ${validate_component(BillFormModal, "BillFormModal").$$render(
      $$result,
      { billToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(BillDetailModal, "BillDetailModal").$$render(
      $$result,
      { bill: selectedBill, isOpen: isDetailOpen },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_billPayments();
  return $$rendered;
});
export {
  BillList as B
};
