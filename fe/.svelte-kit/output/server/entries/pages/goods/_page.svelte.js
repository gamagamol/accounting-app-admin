import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { k as purchaseOrders, j as goodsReceipts } from "../../../chunks/dataStore.js";
import { f as formatDate } from "../../../chunks/formatters.js";
const GoodsFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  let { isOpen = false } = $$props;
  let { goodsToEdit = null } = $$props;
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let items = [];
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.goodsToEdit === void 0 && $$bindings.goodsToEdit && goodsToEdit !== void 0) $$bindings.goodsToEdit(goodsToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (goodsToEdit) {
          goodsToEdit.purchaseNo;
          date = goodsToEdit.date;
          goodsToEdit.supplierName;
          items = [...goodsToEdit.items];
        } else {
          const firstPO = $purchaseOrders[0];
          firstPO?.purchaseNo || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          firstPO?.supplierName || "";
          items = firstPO ? [...firstPO.items] : [];
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: goodsToEdit ? "Edit Penerimaan Barang" : "Catat Penerimaan Barang Masuk (Goods Receipt)",
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
              return `${escape(goodsToEdit ? "Simpan Perubahan" : "Konfirmasi Penerimaan Barang")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nomor Purchase Order (PO)",
              name: "purchaseNo",
              required: true
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
              label: "Tanggal Diterima Gudang",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )}</div> <div><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider mb-2" data-svelte-h="svelte-k1sxmz">Item Barang Fisik yang Masuk</h4> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-1dfeaz2"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Nama Produk</th> <th class="p-2.5 text-center w-24">Qty Diterima</th> <th class="p-2.5 text-center w-20">Satuan</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, i) => {
            return `<tr><td class="p-2.5 text-center font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium">${escape(item.productName)}</td> <td class="p-2.5"><input type="number" min="1" class="w-full p-1 border rounded text-center text-xs"${add_attribute("value", item.quantity, 0)}></td> <td class="p-2.5 text-center text-gray-500">${escape(item.unit)}</td> </tr>`;
          })}</tbody></table></div></div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_purchaseOrders();
  return $$rendered;
});
const GoodsDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { goods = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.goods === void 0 && $$bindings.goods && goods !== void 0) $$bindings.goods(goods);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Detail Penerimaan Barang (Goods Receipt)",
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
          })} `;
        },
        default: () => {
          return `${goods ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center"><div><span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(goods.receiptNo)}</span> <h3 class="text-base font-bold text-gray-900 mt-1">${escape(goods.supplierName)}</h3> <p class="text-xs text-gray-500 font-mono">No. PO Referensi: ${escape(goods.purchaseNo)}</p></div> ${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: goods.status,
              label: goods.status === "received" ? "Diterima di Gudang" : "Diproses"
            },
            {},
            {}
          )}</div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1b19tqr">Tanggal Diterima:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(goods.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-glo4m">Penerima (Staff Gudang):</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(goods.preparedBy)}</p></div></div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-4ic39a"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Nama Produk</th> <th class="p-2.5 text-center w-20">Kuantitas Masuk</th> <th class="p-2.5 text-center w-20">Satuan</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(goods.items, (itm, i) => {
            return `<tr><td class="p-2.5 text-center text-gray-400 font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium text-gray-800">${escape(itm.productName)}</td> <td class="p-2.5 text-center font-bold text-emerald-600">${escape(itm.quantity)}</td> <td class="p-2.5 text-center text-gray-500">${escape(itm.unit)}</td> </tr>`;
          })}</tbody></table></div></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const GoodsList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $goodsReceipts, $$unsubscribe_goodsReceipts;
  $$unsubscribe_goodsReceipts = subscribe(goodsReceipts, (value) => $goodsReceipts = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedGoods = null;
  let goodsToEdit = null;
  const columns = [
    {
      key: "receiptNo",
      label: "No. Penerimaan",
      sortable: true
    },
    {
      key: "purchaseNo",
      label: "No. PO Asal",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Masuk",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Supplier / Vendor",
      sortable: true
    },
    {
      key: "preparedBy",
      label: "Penerima Gudang"
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
        title: "Penerimaan Barang (Goods Receipt)",
        description: "Pemeriksaan fisik barang masuk dari vendor berdasarkan Purchase Order (PO)"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1wafjhu">Catat Penerimaan Barang</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $goodsReceipts,
        searchPlaceholder: "Cari penerimaan barang berdasarkan no penerimaan, PO, atau supplier...",
        searchKeys: ["receiptNo", "purchaseNo", "supplierName", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail" data-svelte-h="svelte-1hz9cum">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "receiptNo" ? `<span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(value)}</span>` : `${column.key === "purchaseNo" ? `<span class="font-mono text-gray-700 font-semibold">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "received" ? "Diterima" : "Diproses"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
        }
      }
    )} ${validate_component(GoodsFormModal, "GoodsFormModal").$$render(
      $$result,
      { goodsToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(GoodsDetailModal, "GoodsDetailModal").$$render(
      $$result,
      {
        goods: selectedGoods,
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
  $$unsubscribe_goodsReceipts();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(GoodsList, "GoodsList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
