import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { f as formatCurrency, a as formatDate, P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { o as customers, J as products, A as salesOrders, a6 as salesActions } from "../../../chunks/dataStore.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
const SalesFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let subtotal;
  let tax;
  let total;
  let $customers, $$unsubscribe_customers;
  let $products, $$unsubscribe_products;
  $$unsubscribe_customers = subscribe(customers, (value) => $customers = value);
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  let { isOpen = false } = $$props;
  let { salesToEdit = null } = $$props;
  let date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
  let items = [];
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.salesToEdit === void 0 && $$bindings.salesToEdit && salesToEdit !== void 0) $$bindings.salesToEdit(salesToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (salesToEdit) {
          salesToEdit.customerId;
          date = salesToEdit.date;
          items = [...salesToEdit.items];
        } else {
          $customers[0]?.id || "";
          date = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
          items = [
            {
              id: "item-1",
              productId: $products[0]?.id || "",
              productName: $products[0]?.name || "",
              quantity: 5,
              unit: $products[0]?.unit || "Pcs",
              unitPrice: $products[0]?.price || 15e4,
              discount: 0,
              total: 5 * ($products[0]?.price || 15e4)
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
        title: salesToEdit ? "Edit Sales Order" : "New Sales Order",
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
              return `${escape(salesToEdit ? "Save Changes" : "Create Sales Order")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Customer Name",
              name: "customer",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="customer" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each($customers, (cust) => {
                  return `<option${add_attribute("value", cust.id, 0)}>${escape(cust.companyName)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Order Date",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )}</div> <div><div class="flex items-center justify-between mb-2"><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider" data-svelte-h="svelte-u5jend">Order Items</h4> ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `+ Add Item Row`;
            }
          })}</div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-495tyr"><tr><th class="p-2 text-left">Product</th> <th class="p-2 text-center w-20">Qty</th> <th class="p-2 text-center w-16">Unit</th> <th class="p-2 text-right w-28">Price (IDR)</th> <th class="p-2 text-center w-20">Discount (%)</th> <th class="p-2 text-right w-32">Total</th> <th class="p-2 text-center w-10">Action</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, idx) => {
            return `<tr><td class="p-2"><select${add_attribute("value", item.productId, 0)} class="w-full p-1.5 border border-gray-300 rounded text-xs bg-white">${each($products, (prd) => {
              return `<option${add_attribute("value", prd.id, 0)}>${escape(prd.name)}</option>`;
            })}</select></td> <td class="p-2"><input type="number" min="1" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.quantity, 0)}></td> <td class="p-2 text-center text-gray-500">${escape(item.unit)}</td> <td class="p-2"><input type="number" min="0" class="w-full p-1.5 border border-gray-300 rounded text-right text-xs"${add_attribute("value", item.unitPrice, 0)}></td> <td class="p-2"><input type="number" min="0" max="100" class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"${add_attribute("value", item.discount, 0)}></td> <td class="p-2 text-right font-mono font-semibold">${escape(formatCurrency(item.total))}</td> <td class="p-2 text-center"><button type="button" class="text-red-500 hover:text-red-700 text-sm font-bold" data-svelte-h="svelte-2idjz9">✕
                  </button></td> </tr>`;
          })}</tbody></table></div></div> <div class="flex justify-end pt-2"><div class="w-full sm:w-72 space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono font-semibold">${escape(formatCurrency(subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1kc64qu">VAT 11%:</span> <span class="font-mono font-semibold">${escape(formatCurrency(tax))}</span></div> <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2"><span data-svelte-h="svelte-2drnoe">Order Total:</span> <span class="font-mono text-blue-700">${escape(formatCurrency(total))}</span></div></div></div></form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_customers();
  $$unsubscribe_products();
  return $$rendered;
});
const SalesDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { sales = null } = $$props;
  let isPrintOpen = false;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.sales === void 0 && $$bindings.sales && sales !== void 0) $$bindings.sales(sales);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Sales Order Details",
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
          })} ${sales ? `${validate_component(Button, "Button").$$render($$result, { variant: "warning" }, {}, {
            default: () => {
              return `🚚 Create Delivery Order`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `🧾 Issue Invoice`;
            }
          })}` : ``} `;
        },
        default: () => {
          return `${sales ? `<div class="space-y-6 text-xs sm:text-sm"><div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3"><div><span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${escape(sales.salesNo)}</span> <h3 class="text-lg font-bold text-gray-900 mt-1">${escape(sales.customerName)}</h3> <p class="text-xs text-gray-500 font-mono">No. Transaksi: ${escape(sales.transactionNo)}</p></div> <div class="flex items-center gap-2">${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: sales.status,
              label: sales.status === "pending" ? "Awaiting Shipment" : sales.status === "delivered" ? "Delivered" : "Completed"
            },
            {},
            {}
          )} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "secondary" }, {}, {
            default: () => {
              return `🖨️ Print SO`;
            }
          })}</div></div> <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-f7tpbc">Order Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(sales.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-k26qga">Prepared By:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(sales.preparedBy)}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-ocugyu">Order Total:</span> <p class="font-bold text-indigo-700 font-mono mt-0.5">${escape(formatCurrency(sales.total))}</p></div></div>  <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-vosyp4"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Product Name</th> <th class="p-2.5 text-center w-16">Qty</th> <th class="p-2.5 text-center w-16">Unit</th> <th class="p-2.5 text-right w-28">Unit Price</th> <th class="p-2.5 text-center w-16">Discount</th> <th class="p-2.5 text-right w-32">Total</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(sales.items, (itm, i) => {
            return `<tr><td class="p-2.5 text-center text-gray-400 font-mono">${escape(i + 1)}</td> <td class="p-2.5 font-medium text-gray-800">${escape(itm.productName)}</td> <td class="p-2.5 text-center font-semibold">${escape(itm.quantity)}</td> <td class="p-2.5 text-center text-gray-500">${escape(itm.unit)}</td> <td class="p-2.5 text-right font-mono">${escape(formatCurrency(itm.unitPrice))}</td> <td class="p-2.5 text-center">${escape(itm.discount ? `${itm.discount}%` : "-")}</td> <td class="p-2.5 text-right font-mono font-semibold">${escape(formatCurrency(itm.total))}</td> </tr>`;
          })}</tbody></table></div> <div class="flex justify-end"><div class="w-full sm:w-64 space-y-1 text-xs"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono">${escape(formatCurrency(sales.subtotal))}</span></div> <div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1kc64qu">VAT 11%:</span> <span class="font-mono">${escape(formatCurrency(sales.tax))}</span></div> <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span class="font-mono text-indigo-700">${escape(formatCurrency(sales.total))}</span></div></div></div></div>` : ``}`;
        }
      }
    )} ${sales ? `${validate_component(PrintPreviewModal, "PrintPreviewModal").$$render(
      $$result,
      {
        documentType: "sales",
        documentNo: sales.salesNo,
        date: sales.date,
        customerOrSupplierName: sales.customerName,
        items: sales.items,
        subtotal: sales.subtotal,
        tax: sales.tax,
        total: sales.total,
        preparedBy: sales.preparedBy,
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
const SalesList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesOrders, $$unsubscribe_salesOrders;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedSales = null;
  let salesToEdit = null;
  const columns = [
    {
      key: "salesNo",
      label: "Sales Order No",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    { key: "preparedBy", label: "Prepared By" },
    {
      key: "total",
      label: "Order Total",
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
    salesToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedSales = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete sales order ${item.salesNo}? This action cannot be undone.`)) {
      salesActions.delete(item.id);
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
        title: "Sales Orders",
        description: "Active customer orders, delivery workflow and invoice issuance."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-rgez3o">New Sales Order</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $salesOrders,
        searchPlaceholder: "Search orders by SO number, customer or transaction number...",
        searchKeys: ["salesNo", "customerName", "transactionNo", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View sales order details",
              onEdit: () => openEdit(row),
              editTitle: "Edit sales order",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete sales order"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "salesNo" ? `<span class="font-mono font-bold text-indigo-700 dark:text-indigo-300 bg-indigo-50 dark:bg-indigo-500/10 px-2 py-0.5 rounded border border-indigo-200 dark:border-indigo-500/20">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "pending" ? "Processing" : value === "delivered" ? "Delivered" : value === "shipped" ? "Shipped" : "Completed"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`;
        }
      }
    )} ${validate_component(SalesFormModal, "SalesFormModal").$$render(
      $$result,
      { salesToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(SalesDetailModal, "SalesDetailModal").$$render(
      $$result,
      {
        sales: selectedSales,
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
  $$unsubscribe_salesOrders();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(SalesList, "SalesList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
