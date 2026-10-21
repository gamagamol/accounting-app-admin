import { c as create_ssr_component, s as subscribe, v as validate_component, g as each, f as add_attribute, e as escape } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { a as formatDate, P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { A as salesOrders, x as deliveries, C as deliveryActions } from "../../../chunks/dataStore.js";
import { P as PrintPreviewModal } from "../../../chunks/PrintPreviewModal.js";
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
        title: deliveryToEdit ? "Edit Delivery Order" : "New Delivery Order",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(deliveryToEdit ? "Save Changes" : "Issue Delivery Order")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Sales Order Number",
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
              label: "Delivery Date",
              name: "date",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="date" type="date" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", date, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Delivery Status", name: "status" }, {}, {
            default: () => {
              return `<select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="pending" data-svelte-h="svelte-1voire6">Processing / Packing</option><option value="shipped" data-svelte-h="svelte-136edv5">In Transit (Shipped)</option><option value="delivered" data-svelte-h="svelte-462xjy">Delivered</option></select>`;
            }
          })}</div> <div><h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider mb-2" data-svelte-h="svelte-im2644">Shipped Items</h4> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-gray-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-1uor4ww"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Product Name</th> <th class="p-2.5 text-center w-24">Qty Shipped</th> <th class="p-2.5 text-center w-20">Unit</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(items, (item, i) => {
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
        title: "Delivery Order Details",
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
              return `📄 Print DO`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { size: "sm", variant: "warning" }, {}, {
            default: () => {
              return `🏷️ Print Label`;
            }
          })}</div></div> <div class="grid grid-cols-2 gap-3 text-xs"><div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-464u5o">Delivery Date:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(formatDate(delivery.date))}</p></div> <div class="p-3 border rounded-lg"><span class="text-gray-500" data-svelte-h="svelte-1jbl7ys">Courier / Driver:</span> <p class="font-semibold text-gray-800 mt-0.5">${escape(delivery.preparedBy)}</p></div></div> <div class="border border-gray-200 rounded-xl overflow-x-auto"><table class="min-w-full text-xs"><thead class="bg-slate-50 border-b border-gray-200 text-gray-600" data-svelte-h="svelte-j4dkks"><tr><th class="p-2.5 text-center w-10">No</th> <th class="p-2.5 text-left">Product Name</th> <th class="p-2.5 text-center w-20">Qty Shipped</th> <th class="p-2.5 text-center w-20">Unit</th></tr></thead> <tbody class="divide-y divide-gray-100">${each(delivery.items, (itm, i) => {
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
      label: "Delivery Order No",
      sortable: true
    },
    {
      key: "salesNo",
      label: "Sales Order No",
      sortable: true
    },
    {
      key: "date",
      label: "Delivery Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    {
      key: "preparedBy",
      label: "Courier / Staff"
    },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
    }
  ];
  function openEdit(item) {
    deliveryToEdit = item;
    isFormOpen = true;
  }
  function openDetail(item) {
    selectedDelivery = item;
    isDetailOpen = true;
  }
  function handleDelete(item) {
    if (confirm(`Delete delivery order ${item.deliveryNo}? This action cannot be undone.`)) {
      deliveryActions.delete(item.id);
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
        title: "Delivery Orders",
        description: "Manage delivery notes for physical products shipped to customer addresses and print package labels."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-12q3390">New Delivery Order</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $deliveries,
        searchPlaceholder: "Search delivery orders by DO number, SO or customer...",
        searchKeys: ["deliveryNo", "salesNo", "customerName", "preparedBy"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onPrint: () => openDetail(row),
              printTitle: "View and print delivery order",
              onEdit: () => openEdit(row),
              editTitle: "Edit delivery order",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete delivery order"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "deliveryNo" ? `<span class="font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/20">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "delivered" ? "Delivered" : value === "shipped" ? "Shipped" : "Processing"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`}`}`;
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
