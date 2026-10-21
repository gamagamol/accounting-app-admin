import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { Y as purchaseInvoices, Z as purchaseInvoiceActions } from "../../../chunks/dataStore.js";
import { a as formatDate, f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $purchaseInvoices, $$unsubscribe_purchaseInvoices;
  $$unsubscribe_purchaseInvoices = subscribe(purchaseInvoices, (value) => $purchaseInvoices = value);
  const columns = [
    {
      key: "invoiceNo",
      label: "Invoice No",
      sortable: true
    },
    {
      key: "date",
      label: "Invoice Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "purchaseNo",
      label: "PO Reference",
      sortable: true
    },
    {
      key: "supplierName",
      label: "Vendor",
      sortable: true
    },
    {
      key: "dueDate",
      label: "Due Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "status",
      label: "Status",
      align: "center"
    }
  ];
  const fields = [
    {
      key: "invoiceNo",
      label: "Vendor Invoice No",
      type: "text",
      required: true,
      placeholder: "PI/2024/001"
    },
    {
      key: "date",
      label: "Invoice Date",
      type: "date",
      required: true
    },
    {
      key: "purchaseNo",
      label: "Purchase Order Reference",
      type: "text"
    },
    {
      key: "supplierName",
      label: "Vendor Name",
      type: "text",
      required: true
    },
    {
      key: "dueDate",
      label: "Due Date",
      type: "date",
      required: true
    },
    {
      key: "amount",
      label: "Invoice Amount",
      type: "currency",
      required: true
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: {
        pending: "Pending",
        paid: "Paid",
        overdue: "Overdue"
      },
      options: [
        { value: "pending", label: "Pending" },
        { value: "paid", label: "Paid" },
        { value: "overdue", label: "Overdue" }
      ]
    },
    {
      key: "preparedBy",
      label: "Prepared By",
      type: "text"
    }
  ];
  function handleSave(payload, id) {
    if (id) purchaseInvoiceActions.update(id, payload);
    else purchaseInvoiceActions.add(payload);
  }
  $$unsubscribe_purchaseInvoices();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Purchase Invoice",
      description: "Record vendor invoices, monitor due dates and track payable settlement status.",
      entityName: "purchase invoice",
      columns,
      fields,
      data: $purchaseInvoices,
      searchKeys: ["invoiceNo", "purchaseNo", "supplierName", "status", "preparedBy"],
      searchPlaceholder: "Search purchase invoices...",
      createLabel: "Add Purchase Invoice",
      displayKey: "invoiceNo",
      onSave: handleSave,
      onDelete: (id) => purchaseInvoiceActions.delete(id)
    },
    {},
    {
      "extra-actions": ({ row }) => {
        return `${row.status !== "paid" ? `<button type="button" class="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200" title="Mark invoice as paid" data-svelte-h="svelte-10d2p2o">Mark Paid</button>` : ``}`;
      }
    }
  )}`;
});
export {
  Page as default
};
