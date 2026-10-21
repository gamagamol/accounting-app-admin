import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { b as salesOrders, c as billPayments } from "../../../chunks/dataStore.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
import { f as formatDate, a as formatCurrency } from "../../../chunks/formatters.js";
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
        title: billToEdit ? "Edit Faktur Tagihan (Invoice)" : "Terbitkan Faktur Tagihan Baru (Invoice)",
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
              return `${escape(billToEdit ? "Simpan Faktur" : "Terbitkan Faktur Tagihan")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Referensi Sales Order",
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
              label: "Nama Customer",
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
              label: "Tanggal Invoice",
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
              label: "Total Nominal Tagihan (IDR)",
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
                return `<select id="method" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="transfer" data-svelte-h="svelte-amcbrg">Bank Transfer</option><option value="cash" data-svelte-h="svelte-1npd9bc">Tunai (Cash)</option><option value="check" data-svelte-h="svelte-ouhdas">Bilyet Giro / Cek</option></select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Status Pembayaran",
              name: "status"
            },
            {},
            {
              default: () => {
                return `<select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="pending" data-svelte-h="svelte-1wj9wzq">Belum Lunas (Outstanding)</option><option value="paid" data-svelte-h="svelte-1ja0930">Lunas (Paid)</option></select>`;
              }
            }
          )}</div></form>`;
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
        title: "Detail Faktur Tagihan (Invoice Penjualan)",
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
              return `Tutup`;
            }
          })} ${bill && bill.status === "pending" ? `${validate_component(Button, "Button").$$render($$result, { variant: "success" }, {}, {
            default: () => {
              return `💵 Catat Pelunasan Tagihan`;
            }
          })}` : ``} `;
        },
        default: () => {
          return `${bill ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${escape(bill.billNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(bill.supplierName)}</h3> <p class="text-xs text-gray-500 font-mono">No. Pesanan: ${escape(bill.invoiceNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: bill.status,
              label: bill.status === "paid" ? "Lunas" : "Belum Lunas"
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Cetak Faktur`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-c8mlgt">Tanggal Faktur:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(bill.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1umrd31">Metode Penagihan:</span> <p class="font-semibold text-gray-800 uppercase mt-0.5">${escape(bill.method)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1jdujih">Diterbitkan Oleh:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(bill.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-v4qmv7">Total Nilai Tagihan:</span> <p class="font-bold text-base text-blue-700 font-mono mt-0.5">${escape(formatCurrency(bill.amount))}</p></div></div></div>` : ``}`;
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
      label: "No. Faktur (Invoice)",
      sortable: true
    },
    {
      key: "invoiceNo",
      label: "No. Pesanan (SO)",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Faktur",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Customer",
      sortable: true
    },
    { key: "method", label: "Metode" },
    {
      key: "amount",
      label: "Nomor Tagihan",
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
        title: "Faktur Tagihan (Bill Payment / Invoice)",
        description: "Penerbitan faktur piutang penjualan ke customer dan pemantauan status pelunasan"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1sdzrgw">Terbitkan Tagihan Baru</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $billPayments,
        searchPlaceholder: "Cari faktur berdasarkan no invoice, SO, atau customer...",
        searchKeys: ["billNo", "invoiceNo", "supplierName", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail &amp; Pelunasan" data-svelte-h="svelte-14jx5i1">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "billNo" ? `<span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${escape(value)}</span>` : `${column.key === "method" ? `<span class="uppercase text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "paid" ? "Lunas" : "Belum Lunas"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
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
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BillList, "BillList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
