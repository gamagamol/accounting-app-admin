import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { ab as warehouses, ac as warehouseActions } from "../../../chunks/dataStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $warehouses, $$unsubscribe_warehouses;
  $$unsubscribe_warehouses = subscribe(warehouses, (value) => $warehouses = value);
  const columns = [
    {
      key: "code",
      label: "Warehouse Code",
      sortable: true
    },
    {
      key: "name",
      label: "Warehouse Name",
      sortable: true
    },
    {
      key: "location",
      label: "Location",
      sortable: true
    },
    {
      key: "manager",
      label: "Manager",
      sortable: true
    },
    {
      key: "capacity",
      label: "Capacity",
      align: "center"
    },
    {
      key: "status",
      label: "Status",
      align: "center"
    }
  ];
  const fields = [
    {
      key: "code",
      label: "Warehouse Code",
      type: "text",
      required: true,
      placeholder: "WH-JKT-01"
    },
    {
      key: "name",
      label: "Warehouse Name",
      type: "text",
      required: true
    },
    {
      key: "location",
      label: "Location",
      type: "text"
    },
    {
      key: "manager",
      label: "Warehouse Manager",
      type: "text"
    },
    {
      key: "capacity",
      label: "Capacity",
      type: "text",
      placeholder: "5,000 m3"
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: { active: "Active", inactive: "Inactive" },
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ];
  function handleSave(payload, id) {
    if (id) warehouseActions.update(id, payload);
    else warehouseActions.add(payload);
  }
  $$unsubscribe_warehouses();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Warehouses & Locations",
      description: "Manage physical storage locations, capacity and the responsible warehouse manager.",
      entityName: "warehouse",
      columns,
      fields,
      data: $warehouses,
      searchKeys: ["code", "name", "location", "manager"],
      searchPlaceholder: "Search warehouses...",
      createLabel: "Add Warehouse",
      displayKey: "name",
      onSave: handleSave,
      onDelete: (id) => warehouseActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
