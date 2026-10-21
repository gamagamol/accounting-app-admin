import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { a2 as stockMovements, V as inventoryActions } from "../../../chunks/dataStore.js";
import { a as formatDate, d as formatNumber } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $stockMovements, $$unsubscribe_stockMovements;
  $$unsubscribe_stockMovements = subscribe(stockMovements, (value) => $stockMovements = value);
  const columns = [
    {
      key: "date",
      label: "Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "docNo",
      label: "Document No",
      sortable: true
    },
    {
      key: "productName",
      label: "Product",
      sortable: true
    },
    {
      key: "type",
      label: "Movement",
      align: "center"
    },
    {
      key: "warehouse",
      label: "Warehouse",
      sortable: true
    },
    {
      key: "quantity",
      label: "Qty",
      align: "right",
      format: (v, r) => `${formatNumber(Number(v) || 0)} ${r.unit ?? ""}`
    },
    { key: "reference", label: "Reference" }
  ];
  const fields = [
    {
      key: "date",
      label: "Movement Date",
      type: "date",
      required: true
    },
    {
      key: "docNo",
      label: "Document No",
      type: "text",
      required: true,
      placeholder: "GR/2024/001"
    },
    {
      key: "productCode",
      label: "Product Code",
      type: "text"
    },
    {
      key: "productName",
      label: "Product Name",
      type: "text",
      required: true
    },
    {
      key: "type",
      label: "Movement Type",
      type: "select",
      badge: true,
      badgeLabels: {
        IN: "Stock In",
        OUT: "Stock Out",
        ADJUST: "Adjustment",
        TRANSFER: "Transfer"
      },
      options: [
        { value: "IN", label: "Stock In" },
        { value: "OUT", label: "Stock Out" },
        { value: "ADJUST", label: "Adjustment" },
        { value: "TRANSFER", label: "Transfer" }
      ]
    },
    {
      key: "warehouse",
      label: "Warehouse",
      type: "text"
    },
    {
      key: "quantity",
      label: "Quantity",
      type: "number",
      required: true
    },
    {
      key: "unit",
      label: "Unit",
      type: "text",
      placeholder: "Pcs"
    },
    {
      key: "reference",
      label: "Reference Document",
      type: "text",
      colSpan: "full"
    }
  ];
  function handleSave(payload, id) {
    if (id) inventoryActions.updateMovement(id, payload);
    else inventoryActions.addMovement(payload);
  }
  $$unsubscribe_stockMovements();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Stock Movement",
      description: "Track every stock in, stock out, transfer and adjustment movement across warehouses.",
      entityName: "stock movement",
      columns,
      fields,
      data: $stockMovements,
      searchKeys: ["docNo", "productCode", "productName", "type", "warehouse", "reference"],
      searchPlaceholder: "Search stock movements...",
      createLabel: "Record Movement",
      displayKey: "docNo",
      onSave: handleSave,
      onDelete: (id) => inventoryActions.deleteMovement(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
