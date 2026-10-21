import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { b as salesOrders, i as deliveries } from "../../../chunks/dataStore.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
import { f as formatDate } from "../../../chunks/formatters.js";
const DeliveryFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesOrders, $$unsubscribe_salesOrders;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  let { isOpen = false } = $$props;
  let { deliveryToEdit = null } = $$props;
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let items = [];
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.deliveryToEdit === void 0 && $$bindings.deliveryToEdit && deliveryToEdit !== void 0) $$bindings.deliveryToEdit(deliveryToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (deliveryToEdit) {
          deliveryToEdit.salesNo;
          date = deliveryToEdit.date;
          deliveryToEdit.customerName;
          deliveryToEdit.status;
          items = [...deliveryToEdit.items];
        } else {
          const firstSO = $salesOrders[0];
          firstSO?.salesNo || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          firstSO?.customerName || "";
          items = firstSO ? [...firstSO.items] : [];
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: deliveryToEdit ? "Edit Surat Jalan / Pengiriman" : "Buat Surat Jalan (Delivery Order)",
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
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(deliveryToEdit ? "Simpan Perubahan" : "Terbitkan Surat Jalan")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nomor Sales Order (SO)",
              name: "salesNo",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="salesNo" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($salesOrders, (so) => {
                  return `<option${add_attribute("value", so.salesNo, 0)}>${escape(so.salesNo)} - ${escape(so.customerName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Tanggal Pengiriman",
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
              label: "Status Pengiriman",
              name: "status"
            },
            {},
            {
              default: () => {
                return `<select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="pending" data-svelte-h="svelte-a5vn2">Diproses / Packing</option><option value="shipped" data-svelte-h="svelte-jglcpm">Dalam Perjalanan (Shipped)</option><option value="delivered" data-svelte-h="svelte-164h2cp">Tiba di Tujuan (Delivered)</option></select>`;
              }
            }
          )}</div> <div><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider mb-2" data-svelte-h="svelte-2isdyv">Item Barang yang Dikirim</h4> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-115ofwo"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Nama Produk</th> <th class="p-2.5 text-center w-24">Qty Dikirim</th> <th class="p-2.5 text-center w-20">Satuan</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, i) => {
            return `<tr><td class="p-2.5 text-center font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium">${escape(item.productName)}</td> <td class="p-2.5"><input type="number" min="1" class="w-full p-1 border rounded text-center text-xs"${add_attribute("value", item.quantity, 0)}></td> <td class="p-2.5 text-center text-gray-500">${escape(item.unit)}</td> </tr>`;
          })}</tbody></table></div></div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_salesOrders();
  return $$rendered;
});
const DeliveryDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { delivery = null } = $$props;
  let isPrintOpen = false;
  let printDocType = "delivery";
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.delivery === void 0 && $$bindings.delivery && delivery !== void 0) $$bindings.delivery(delivery);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Detail Pengiriman (Delivery Order)",
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
              return `Tutup`;
            }
          })} `;
        },
        default: () => {
          return `${delivery ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">${escape(delivery.deliveryNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(delivery.customerName)}</h3> <p class="text-xs text-gray-500 font-mono">No. Sales Order: ${escape(delivery.salesNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: delivery.status,
              label: delivery.status
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `📄 Cetak DO`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "warning" }, {}, {
            default: () => {
              return `🏷️ Cetak Stiker`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-ehq5wq">Tanggal Pengiriman:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(delivery.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-a72cqc">Staff Ekspedisi / Driver:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(delivery.preparedBy)}</p></div></div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-1t2avh0"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Nama Produk</th> <th class="p-2.5 text-center w-20">Qty Dikirim</th> <th class="p-2.5 text-center w-20">Satuan</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(delivery.items, (itm, i) => {
            return `<tr><td class="p-2.5 text-center text-gray-400 font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium text-gray-800">${escape(itm.productName)}</td> <td class="p-2.5 text-center font-bold text-blue-600">${escape(itm.quantity)}</td> <td class="p-2.5 text-center text-gray-500">${escape(itm.unit)}</td> </tr>`;
          })}</tbody></table></div></div>` : ``}`;
        }
      }
    )} ${delivery ? `${validate_component(PrintPreviewModal, "PrintPreviewModal").$$render(
      $$result,
      {
        documentType: printDocType,
        documentNo: delivery.deliveryNo,
        date: delivery.date,
        customerOrSupplierName: delivery.customerName,
        items: delivery.items,
        preparedBy: delivery.preparedBy,
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
const DeliveryList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $deliveries, $$unsubscribe_deliveries;
  $$unsubscribe_deliveries = subscribe(deliveries, (value) => $deliveries = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedDelivery = null;
  let deliveryToEdit = null;
  const columns = [
    {
      key: "deliveryNo",
      label: "No. Surat Jalan",
      sortable: true
    },
    {
      key: "salesNo",
      label: "No. Sales Order",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Kirim",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer Penerima",
      sortable: true
    },
    {
      key: "preparedBy",
      label: "Staff Ekspedisi"
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
        title: "Pengiriman Barang (Delivery Order)",
        description: "Pengelolaan surat jalan pengiriman produk fisik ke alamat pelanggan dan cetak stiker paket"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-9iwco9">Buat Surat Jalan</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $deliveries,
        searchPlaceholder: "Cari surat jalan berdasarkan nomor DO, SO, atau customer...",
        searchKeys: ["deliveryNo", "salesNo", "customerName", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail &amp; Cetak" data-svelte-h="svelte-b07120">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "deliveryNo" ? `<span class="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "delivered" ? "Terkirim" : value === "shipped" ? "Dikirim" : "Diproses"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
        }
      }
    )} ${validate_component(DeliveryFormModal, "DeliveryFormModal").$$render(
      $$result,
      { deliveryToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(DeliveryDetailModal, "DeliveryDetailModal").$$render(
      $$result,
      {
        delivery: selectedDelivery,
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
  $$unsubscribe_deliveries();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(DeliveryList, "DeliveryList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
