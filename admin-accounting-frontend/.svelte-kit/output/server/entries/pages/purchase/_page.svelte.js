import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { H as suppliers, J as products, z as purchaseOrders, a0 as purchaseActions } from "../../../chunks/dataStore.js";
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
        title: purchaseToEdit ? "Edit Purchase Order (PO)" : "New Purchase Order",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(purchaseToEdit ? "Save Changes" : "Create Purchase Order")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Supplier / Vendor Name",
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
              label: "Purchase Order Date",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )}</div> <div><div class="flex items-center justify-between mb-2"><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider" data-svelte-h="svelte-xl3v54">Purchased Items</h4> ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `+ Add Item Row`;
            }
          })}</div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-1i5o4k"><tr><th class="p-2 text-left">Product</th> <th class="p-2 text-center w-20">Qty</th> <th class="p-2 text-center w-16">Unit</th> <th class="p-2 text-right w-28">Purchase Price</th> <th class="p-2 text-center w-20">Discount (%)</th> <th class="p-2 text-right w-32">Total</th> <th class="p-2 text-center w-10">Action</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, idx) => {
            return `<tr><td class="p-2"><select${add_attribute("value", item.productId, 0)} class="w-full p-1.5 border border-gray-300 rounded text-xs bg-white">${each($products, (prd) => {
              return `<option${add_attribute("value", prd.id, 0)}>${escape(prd.name)}</option>`;
            })}</select></td> <td class="p-2"><input type="number" min="1" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.quantity, 0)}></td> <td class="p-2 text-center text-gray-500">${escape(item.unit)}</td> <td class="p-2"><input type="number" min="0" class="w-full p-1.5 border border-gray-300 rounded text-right text-xs"${add_attribute("value", item.unitPrice, 0)}></td> <td class="p-2"><input type="number" min="0" max="100" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.discount, 0)}></td> <td class="p-2 text-right font-mono font-semibold">${escape(formatCurrency(item.total))}</td> <td class="p-2 text-center"><button type="button" class="text-red-500 hover:text-red-700 text-sm font-bold" data-svelte-h="svelte-2idjz9">✕
                  </button></td> </tr>`;
          })}</tbody></table></div></div> <div class="flex justify-end pt-2"><div class="w-full sm:w-72 space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono font-semibold">${escape(formatCurrency(subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1kc64qu">VAT 11%:</span> <span class="font-mono font-semibold">${escape(formatCurrency(tax))}</span></div> <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2"><span data-svelte-h="svelte-199fhp1">Purchase Total:</span> <span class="font-mono text-emerald-700">${escape(formatCurrency(total))}</span></div></div></div></form>`;
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
        title: "Purchase Order Details",
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
              return `Close`;
            }
          })} ${purchase && purchase.status === "pending" ? `${validate_component(Button, "Button").$$render($$result, { variant: "success" }, {}, {
            default: () => {
              return `📥 Record Goods Receipt`;
            }
          })}` : ``} `;
        },
        default: () => {
          return `${purchase ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">${escape(purchase.purchaseNo)}</span> <h3 class="text-lg font-bold text-gray-900 mt-1">${escape(purchase.supplierName)}</h3> <p class="text-xs text-gray-500 font-mono">No. Transaksi: ${escape(purchase.transactionNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: purchase.status,
              label: purchase.status === "pending" ? "Awaiting Goods" : purchase.status === "received" ? "Received" : "Completed"
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Print PO`;
            }
          })}</div></div> <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-167finp">PO Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(purchase.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-k26qga">Prepared By:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(purchase.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1ribpj1">Purchase Total:</span> <p class="font-bold text-emerald-700 font-mono mt-0.5">${escape(formatCurrency(purchase.total))}</p></div></div>  <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-b2wnl1"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Product Name</th> <th class="p-2.5 text-center w-16">Qty</th> <th class="p-2.5 text-center w-16">Unit</th> <th class="p-2.5 text-right w-28">Purchase Price</th> <th class="p-2.5 text-center w-16">Discount</th> <th class="p-2.5 text-right w-32">Total</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(purchase.items, (itm, i) => {
            return `<tr><td class="p-2.5 text-center text-gray-400 font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium text-gray-800">${escape(itm.productName)}</td> <td class="p-2.5 text-center font-semibold">${escape(itm.quantity)}</td> <td class="p-2.5 text-center text-gray-500">${escape(itm.unit)}</td> <td class="p-2.5 text-right font-mono">${escape(formatCurrency(itm.unitPrice))}</td> <td class="p-2.5 text-center">${escape(itm.discount ? `${itm.discount}%` : "-")}</td> <td class="p-2.5 text-right font-mono font-semibold">${escape(formatCurrency(itm.total))}</td> </tr>`;
          })}</tbody></table></div> <div class="flex justify-end"><div class="w-full sm:w-64 space-y-1 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono">${escape(formatCurrency(purchase.subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1kc64qu">VAT 11%:</span> <span class="font-mono">${escape(formatCurrency(purchase.tax))}</span></div> <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span class="font-mono text-emerald-700">${escape(formatCurrency(purchase.total))}</span></div></div></div></div>` : ``}`;
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
      label: "PO No",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
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
      label: "Purchasing Staff"
    },
    {
      key: "total",
      label: "Total Amount",
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
    purchaseToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedPurchase = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete purchase order ${item.purchaseNo}? This action cannot be undone.`)) {
      purchaseActions.delete(item.id);
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
        title: "Purchase Orders",
        description: "Procurement of goods and raw materials from suppliers and partner vendors."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-1ufyug3">New Purchase Order</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $purchaseOrders,
        searchPlaceholder: "Search purchase orders by number, supplier or transaction number...",
        searchKeys: ["purchaseNo", "supplierName", "transactionNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View purchase order & receipt",
              onEdit: () => openEdit(row),
              editTitle: "Edit purchase order",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete purchase order"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "purchaseNo" ? `<span class="font-mono font-bold text-emerald-700 dark:text-emerald-300 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-0.5 rounded border border-emerald-200 dark:border-emerald-500/20">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "pending" ? "Pending" : value === "received" ? "Received" : "Completed"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`;
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
