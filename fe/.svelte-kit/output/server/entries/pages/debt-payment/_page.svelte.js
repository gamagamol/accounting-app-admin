import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { k as purchaseOrders, l as debtPayments } from "../../../chunks/dataStore.js";
import { f as formatDate, a as formatCurrency } from "../../../chunks/formatters.js";
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
        title: debtToEdit ? "Edit Pembayaran Hutang" : "Catat Pengeluaran Kas (Bayar Hutang Supplier)",
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
              return `${escape(debtToEdit ? "Simpan Perubahan" : "Catat Pengeluaran Kas")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nomor Purchase Order (PO)",
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
              label: "Nama Vendor / Supplier",
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
              label: "Tanggal Kas Keluar",
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
              label: "Jumlah Pembayaran (IDR)",
              name: "amount",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="amount" type="number" min="1" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", amount, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Metode Pembayaran",
              name: "method"
            },
            {},
            {
              default: () => {
                return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-1jxj55u">Transfer Bank Perusahaan</option><option value="cash" data-svelte-h="svelte-fm8nng">Kas Kecil (Cash)</option><option value="check" data-svelte-h="svelte-1h909on">Cek / Giro</option></select>`;
              }
            }
          )}</div></form>`;
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
        title: "Detail Bukti Pembayaran Hutang Vendor",
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
          return `${debt ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-rose-50/70 p-4 rounded-xl border border-rose-200 flex justify-between items-center"><div><span class="text-xs font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">${escape(debt.paymentNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(debt.supplierName)}</h3> <p class="text-xs text-gray-600 font-mono">No. Purchase Order: ${escape(debt.purchaseNo)}</p></div> ${validate_component(Badge, "Badge").$$render($$result, { status: "paid", label: "LUNAS / DIBAYAR" }, {}, {})}</div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-4aep6t">Tanggal Bayar:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(debt.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-6hhoz1">Metode Pengeluaran Kas:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(debt.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1c1cmly">Disetujui Oleh:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(debt.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-5dl6nh">Nominal yang Dibayarkan:</span> <p class="font-bold text-base text-rose-700 font-mono mt-0.5">${escape(formatCurrency(debt.amount))}</p></div></div></div>` : ``}`;
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
      label: "No. Bukti Kas Keluar",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Kas",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Nama Vendor / Supplier",
      sortable: true
    },
    { key: "purchaseNo", label: "No. PO (Ref)" },
    { key: "method", label: "Metode" },
    {
      key: "amount",
      label: "Nominal Keluar",
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
        title: "Pembayaran Hutang Vendor (Debt Payment)",
        description: "Pencatatan pengeluaran kas pelunasan tagihan supplier atas pesanan pembelian (PO)"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1btgjh7">Catat Bayar Hutang</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $debtPayments,
        searchPlaceholder: "Cari pembayaran hutang berdasarkan nomor, supplier, PO...",
        searchKeys: ["paymentNo", "supplierName", "purchaseNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail Bukti" data-svelte-h="svelte-18igq57">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "paymentNo" ? `<span class="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render($$result, { status: value, label: "Lunas" }, {}, {})}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
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
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(DebtPaymentList, "DebtPaymentList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
