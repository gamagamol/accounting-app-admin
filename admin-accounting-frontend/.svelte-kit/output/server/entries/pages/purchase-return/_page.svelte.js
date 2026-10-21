import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { _ as purchaseReturns, $ as purchaseReturnActions } from "../../../chunks/dataStore.js";
import { a as formatDate, f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $purchaseReturns, $$unsubscribe_purchaseReturns;
  $$unsubscribe_purchaseReturns = subscribe(purchaseReturns, (value) => $purchaseReturns = value);
  const columns = [
    {
      key: "returnNo",
      label: "Return No",
      sortable: true
    },
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "purchaseNo",
      label: "Purchase Order Ref",
      sortable: true
    },
    {
      key: "supplierName",
      label: "Vendor",
      sortable: true
    },
    { key: "reason", label: "Return Reason" },
    {
      key: "total",
      label: "Debit Amount",
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
      key: "returnNo",
      label: "Return / Debit Note No",
      type: "text",
      required: true,
      placeholder: "PR/2024/001"
    },
    {
      key: "date",
      label: "Return Date",
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
      key: "reason",
      label: "Return Reason",
      type: "textarea",
      colSpan: "full"
    },
    {
      key: "total",
      label: "Debit Amount",
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
        approved: "Approved",
        completed: "Completed"
      },
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" },
        { value: "completed", label: "Completed" }
      ]
    }
  ];
  function handleSave(payload, id) {
    if (id) purchaseReturnActions.update(id, payload);
    else purchaseReturnActions.add(payload);
  }
  $$unsubscribe_purchaseReturns();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Purchase Return / Debit Note",
      description: "Record goods returned to vendors and issue debit notes against purchase invoices.",
      entityName: "purchase return",
      columns,
      fields,
      data: $purchaseReturns,
      searchKeys: ["returnNo", "purchaseNo", "supplierName", "reason", "status"],
      searchPlaceholder: "Search purchase returns...",
      createLabel: "New Purchase Return",
      displayKey: "returnNo",
      onSave: handleSave,
      onDelete: (id) => purchaseReturnActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
