import { c as create_ssr_component, s as subscribe, v as validate_component, b as each, d as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { o as suppliers, n as products, k as purchaseOrders } from "../../../chunks/dataStore.js";
import { a as formatCurrency, f as formatDate } from "../../../chunks/formatters.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
const PurchaseFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let subtotal;
  let tax;
  let total;
  let $suppliers, $$unsubscribe_suppliers;
  let $products, $$unsubscribe_products;
  $$unsubscribe_suppliers = subscribe(suppliers, (value) => $suppliers = value);
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  let { isOpen = false } = $$props;
  let { purchaseToEdit = null } = $$props;
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let items = [];
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.purchaseToEdit === void 0 && $$bindings.purchaseToEdit && purchaseToEdit !== void 0) $$bindings.purchaseToEdit(purchaseToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (purchaseToEdit) {
          purchaseToEdit.supplierId;
          date = purchaseToEdit.date;
          items = [...purchaseToEdit.items];
        } else {
          $suppliers[0]?.id || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          items = [
            {
              id: "item-1",
              productId: $products[0]?.id || "",
              productName: $products[0]?.name || "",
              quantity: 20,
              unit: $products[0]?.unit || "Pcs",
              unitPrice: $products[0]?.price ? Math.round($products[0].price * 0.7) : 1e5,
              discount: 0,
              total: 20 * ($products[0]?.price ? Math.round($products[0].price * 0.7) : 1e5)
            }
          ];
        }
      }
    }
    subtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
    tax = Math.round(subtotal * 0.11);
    total = subtotal + tax;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: purchaseToEdit ? "Edit Purchase Order (PO)" : "Buat Purchase Order Baru",
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
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(purchaseToEdit ? "Simpan Perubahan" : "Terbitkan Purchase Order")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Supplier / Pemasok",
              name: "supplier",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="supplier" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($suppliers, (sup) => {
                  return `<option${add_attribute("value", sup.id, 0)}>${escape(sup.companyName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Tanggal Purchase Order",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )}</div> <div><div class="flex items-center justify-between mb-2"><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider" data-svelte-h="svelte-p7k6el">Item Barang yang Dibeli</h4> ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `+ Tambah Baris Item`;
            }
          })}</div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-141c2tw"><tr><th class="p-2 text-left">Produk</th> <th class="p-2 text-center w-20">Qty</th> <th class="p-2 text-center w-16">Satuan</th> <th class="p-2 text-right w-28">Harga Beli</th> <th class="p-2 text-center w-20">Diskon (%)</th> <th class="p-2 text-right w-32">Total</th> <th class="p-2 text-center w-10">Aksi</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, idx) => {
            return `<tr><td class="p-2"><select${add_attribute("value", item.productId, 0)} class="w-full p-1.5 border border-gray-300 rounded text-xs bg-white">${each($products, (prd) => {
              return `<option${add_attribute("value", prd.id, 0)}>${escape(prd.name)}</option>`;
            })}</select></td> <td class="p-2"><input type="number" min="1" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.quantity, 0)}></td> <td class="p-2 text-center text-gray-500">${escape(item.unit)}</td> <td class="p-2"><input type="number" min="0" class="w-full p-1.5 border border-gray-300 rounded text-right text-xs"${add_attribute("value", item.unitPrice, 0)}></td> <td class="p-2"><input type="number" min="0" max="100" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.discount, 0)}></td> <td class="p-2 text-right font-mono font-semibold">${escape(formatCurrency(item.total))}</td> <td class="p-2 text-center"><button type="button" class="text-red-500 hover:text-red-700 text-sm font-bold" data-svelte-h="svelte-2idjz9">✕
                  </button></td> </tr>`;
          })}</tbody></table></div></div> <div class="flex justify-end pt-2"><div class="w-full sm:w-72 space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono font-semibold">${escape(formatCurrency(subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-jsgqoh">PPN 11%:</span> <span class="font-mono font-semibold">${escape(formatCurrency(tax))}</span></div> <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2"><span data-svelte-h="svelte-exha4s">Total Nilai Pembelian:</span> <span class="font-mono text-emerald-700">${escape(formatCurrency(total))}</span></div></div></div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_suppliers();
  $$unsubscribe_products();
  return $$rendered;
});
const PurchaseDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { purchase = null } = $$props;
  let isPrintOpen = false;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.purchase === void 0 && $$bindings.purchase && purchase !== void 0) $$bindings.purchase(purchase);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Detail Purchase Order (PO Pembelian)",
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
          })} ${purchase && purchase.status === "pending" ? `${validate_component(Button, "Button").$$render($$result, { variant: "success" }, {}, {
            default: () => {
              return `📥 Catat Penerimaan Barang (Goods Receipt)`;
            }
          })}` : ``} `;
        },
        default: () => {
          return `${purchase ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${escape(purchase.purchaseNo)}</span> <h3 class="text-lg font-bold text-gray-900 mt-1">${escape(purchase.supplierName)}</h3> <p class="text-xs text-gray-500 font-mono">No. Transaksi: ${escape(purchase.transactionNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: purchase.status,
              label: purchase.status === "pending" ? "Menunggu Barang" : purchase.status === "received" ? "Diterima" : "Selesai"
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Cetak PO`;
            }
          })}</div></div> <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-14vydrt">Tanggal PO:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(purchase.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-btyb2d">Dibuat Oleh:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(purchase.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-11d1qor">Total Nominal Pembelian:</span> <p class="font-bold text-emerald-700 font-mono mt-0.5">${escape(formatCurrency(purchase.total))}</p></div></div>  <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-1lqya1d"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Nama Produk</th> <th class="p-2.5 text-center w-16">Qty</th> <th class="p-2.5 text-center w-16">Satuan</th> <th class="p-2.5 text-right w-28">Harga Beli</th> <th class="p-2.5 text-center w-16">Diskon</th> <th class="p-2.5 text-right w-32">Total</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(purchase.items, (itm, i) => {
            return `<tr><td class="p-2.5 text-center text-gray-400 font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium text-gray-800">${escape(itm.productName)}</td> <td class="p-2.5 text-center font-semibold">${escape(itm.quantity)}</td> <td class="p-2.5 text-center text-gray-500">${escape(itm.unit)}</td> <td class="p-2.5 text-right font-mono">${escape(formatCurrency(itm.unitPrice))}</td> <td class="p-2.5 text-center">${escape(itm.discount ? `${itm.discount}%` : "-")}</td> <td class="p-2.5 text-right font-mono font-semibold">${escape(formatCurrency(itm.total))}</td> </tr>`;
          })}</tbody></table></div> <div class="flex justify-end"><div class="w-full sm:w-64 space-y-1 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono">${escape(formatCurrency(purchase.subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-jsgqoh">PPN 11%:</span> <span class="font-mono">${escape(formatCurrency(purchase.tax))}</span></div> <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span class="font-mono text-emerald-700">${escape(formatCurrency(purchase.total))}</span></div></div></div></div>` : ``}`;
        }
      }
    )} ${purchase ? `${validate_component(PrintPreviewModal, "PrintPreviewModal").$$render(
      $$result,
      {
        documentType: "purchase",
        documentNo: purchase.purchaseNo,
        date: purchase.date,
        customerOrSupplierName: purchase.supplierName,
        items: purchase.items,
        subtotal: purchase.subtotal,
        tax: purchase.tax,
        total: purchase.total,
        preparedBy: purchase.preparedBy,
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
const PurchaseList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedPurchase = null;
  let purchaseToEdit = null;
  const columns = [
    {
      key: "purchaseNo",
      label: "No. PO",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Supplier / Vendor",
      sortable: true
    },
    { key: "preparedBy", label: "Purchasing" },
    {
      key: "total",
      label: "Total Nominal",
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
        title: "Pesanan Pembelian (Purchase Order - PO)",
        description: "Pengadaan barang dan bahan baku industri kepada supplier & vendor rekanan"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1r08z39">Buat PO Baru</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $purchaseOrders,
        searchPlaceholder: "Cari PO berdasarkan nomor, supplier, atau nomor transaksi...",
        searchKeys: ["purchaseNo", "supplierName", "transactionNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Detail &amp; Penerimaan" data-svelte-h="svelte-tumnnc">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "purchaseNo" ? `<span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "pending" ? "Menunggu" : value === "received" ? "Diterima" : "Selesai"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
        }
      }
    )} ${validate_component(PurchaseFormModal, "PurchaseFormModal").$$render(
      $$result,
      { purchaseToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(PurchaseDetailModal, "PurchaseDetailModal").$$render(
      $$result,
      {
        purchase: selectedPurchase,
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
  $$unsubscribe_purchaseOrders();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PurchaseList, "PurchaseList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
