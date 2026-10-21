import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { c as billPayments, h as payments } from "../../../chunks/dataStore.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
import { f as formatDate, a as formatCurrency } from "../../../chunks/formatters.js";
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
        title: paymentToEdit ? "Edit Pembayaran Piutang" : "Catat Penerimaan Pembayaran (Kuitansi)",
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
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(paymentToEdit ? "Simpan Pembayaran" : "Terbitkan Kuitansi Pembayaran")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nomor Faktur (Invoice) Terkait",
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
              label: "Nama Pelanggan (Customer)",
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
              label: "Tanggal Penerimaan Kas",
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
              label: "Jumlah Pembayaran Diterima (IDR)",
              name: "amount",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="amount" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", amount, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Cara Bayar", name: "method" }, {}, {
            default: () => {
              return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-1x1c9zv">Transfer Rekening Bank</option><option value="cash" data-svelte-h="svelte-fjjto7">Uang Tunai (Cash)</option><option value="check" data-svelte-h="svelte-15r7uel">Bilyet Giro / Cek Mundur</option></select>`;
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
        title: "Detail Kuitansi Penerimaan Pembayaran",
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
              return `Tutup`;
            }
          })} `;
        },
        default: () => {
          return `${payment ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex justify-between items-center"><div><span class="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">${escape(payment.paymentNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(payment.customerName)}</h3> <p class="text-xs text-gray-600 font-mono">No. Invoice: ${escape(payment.invoiceNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render($$result, { status: "paid", label: "LUNAS" }, {}, {})} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Cetak Kuitansi`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-jakhg2">Tanggal Kas Masuk:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(payment.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-vfghjb">Metode Bayar:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(payment.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-nym3b5">Petugas Kasir:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(payment.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-9k4a8l">Jumlah Kas Diterima:</span> <p class="font-bold text-base text-emerald-700 font-mono mt-0.5">${escape(formatCurrency(payment.amount))}</p></div></div></div>` : ``}`;
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
      label: "No. Kuitansi",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Kas",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Nama Customer",
      sortable: true
    },
    {
      key: "invoiceNo",
      label: "No. Faktur (Ref)"
    },
    { key: "method", label: "Metode" },
    {
      key: "amount",
      label: "Nominal Masuk",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(v || 0)
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
    }
  ];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Penerimaan Kas (Pelunasan Piutang)",
        description: "Pencatatan uang masuk dari customer, penerbitan kuitansi, dan update saldo piutang buku besar"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1es0mpy">Catat Penerimaan Kas</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $payments,
        searchPlaceholder: "Cari kuitansi berdasarkan nomor, customer, atau invoice...",
        searchKeys: ["paymentNo", "customerName", "invoiceNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail &amp; Cetak" data-svelte-h="svelte-b07120">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "paymentNo" ? `<span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render($$result, { status: value, label: "Lunas" }, {}, {})}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
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
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PaymentList, "PaymentList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
