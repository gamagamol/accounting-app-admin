import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { a7 as stockAdjustments, V as inventoryActions } from "../../../chunks/dataStore.js";
import { a as formatDate } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $stockAdjustments, $$unsubscribe_stockAdjustments;
  $$unsubscribe_stockAdjustments = subscribe(stockAdjustments, (value) => $stockAdjustments = value);
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "adjustmentNo",
      label: "Adjustment No",
      sortable: true
    },
    {
      key: "warehouse",
      label: "Warehouse",
      sortable: true
    },
    {
      key: "productName",
      label: "Product",
      sortable: true
    },
    {
      key: "systemQty",
      label: "System Qty",
      align: "right",
      sortable: true
    },
    {
      key: "actualQty",
      label: "Actual Qty",
      align: "right",
      sortable: true
    },
    {
      key: "diffQty",
      label: "Difference",
      align: "right",
      sortable: true
    },
    {
      key: "status",
      label: "Status",
      align: "center"
    }
  ];
  const fields = [
    {
      key: "date",
      label: "Adjustment Date",
      type: "date",
      required: true
    },
    {
      key: "adjustmentNo",
      label: "Adjustment No",
      type: "text",
      required: true,
      placeholder: "ADJ/2024/001"
    },
    {
      key: "warehouse",
      label: "Warehouse",
      type: "text"
    },
    {
      key: "productName",
      label: "Product Name",
      type: "text",
      required: true
    },
    {
      key: "systemQty",
      label: "System Quantity",
      type: "number"
    },
    {
      key: "actualQty",
      label: "Actual Quantity",
      type: "number"
    },
    {
      key: "diffQty",
      label: "Difference",
      type: "number"
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: { pending: "Pending", approved: "Approved" },
      options: [
        { value: "pending", label: "Pending" },
        { value: "approved", label: "Approved" }
      ]
    },
    {
      key: "reason",
      label: "Adjustment Reason",
      type: "textarea",
      colSpan: "full"
    }
  ];
  function handleSave(payload, id) {
    if (id) inventoryActions.updateAdjustment(id, payload);
    else inventoryActions.addAdjustment(payload);
  }
  $$unsubscribe_stockAdjustments();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Stock Adjustment",
      description: "Record physical count variances and reconcile system stock against actual warehouse stock.",
      entityName: "stock adjustment",
      columns,
      fields,
      data: $stockAdjustments,
      searchKeys: ["adjustmentNo", "warehouse", "productName", "reason", "status"],
      searchPlaceholder: "Search stock adjustments...",
      createLabel: "Add Adjustment",
      displayKey: "adjustmentNo",
      onSave: handleSave,
      onDelete: (id) => inventoryActions.deleteAdjustment(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
