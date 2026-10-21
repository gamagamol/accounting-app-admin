import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { a4 as salesReturns, a5 as salesReturnActions } from "../../../chunks/dataStore.js";
import { a as formatDate, f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $salesReturns, $$unsubscribe_salesReturns;
  $$unsubscribe_salesReturns = subscribe(salesReturns, (value) => $salesReturns = value);
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
      key: "salesNo",
      label: "Sales Order Ref",
      sortable: true
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    { key: "reason", label: "Return Reason" },
    {
      key: "total",
      label: "Credit Amount",
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
      label: "Return / Credit Note No",
      type: "text",
      required: true,
      placeholder: "SR/2024/001"
    },
    {
      key: "date",
      label: "Return Date",
      type: "date",
      required: true
    },
    {
      key: "salesNo",
      label: "Sales Order Reference",
      type: "text"
    },
    {
      key: "customerName",
      label: "Customer Name",
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
      label: "Credit Amount",
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
    if (id) salesReturnActions.update(id, payload);
    else salesReturnActions.add(payload);
  }
  $$unsubscribe_salesReturns();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Sales Return / Credit Note",
      description: "Record returned goods and issue credit notes to customers.",
      entityName: "sales return",
      columns,
      fields,
      data: $salesReturns,
      searchKeys: ["returnNo", "salesNo", "customerName", "reason", "status"],
      searchPlaceholder: "Search sales returns...",
      createLabel: "New Sales Return",
      displayKey: "returnNo",
      onSave: handleSave,
      onDelete: (id) => salesReturnActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
