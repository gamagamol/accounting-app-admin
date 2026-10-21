import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { U as productAccountMappings, V as inventoryActions } from "../../../chunks/dataStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $productAccountMappings, $$unsubscribe_productAccountMappings;
  $$unsubscribe_productAccountMappings = subscribe(productAccountMappings, (value) => $productAccountMappings = value);
  const columns = [
    {
      key: "category",
      label: "Product Category",
      sortable: true
    },
    {
      key: "inventoryAccount",
      label: "Inventory Account"
    },
    {
      key: "salesAccount",
      label: "Sales Account"
    },
    {
      key: "cogsAccount",
      label: "COGS Account"
    },
    {
      key: "returnAccount",
      label: "Return Account"
    }
  ];
  const fields = [
    {
      key: "category",
      label: "Product Category",
      type: "text",
      required: true,
      placeholder: "Raw Materials"
    },
    {
      key: "inventoryAccount",
      label: "Inventory Account",
      type: "text"
    },
    {
      key: "salesAccount",
      label: "Sales Account",
      type: "text"
    },
    {
      key: "cogsAccount",
      label: "COGS Account",
      type: "text"
    },
    {
      key: "returnAccount",
      label: "Return Account",
      type: "text"
    }
  ];
  function handleSave(payload, id) {
    if (id) inventoryActions.updateMapping(id, payload);
    else inventoryActions.addMapping(payload);
  }
  $$unsubscribe_productAccountMappings();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Product Account Mapping",
      description: "Map product categories to their inventory, revenue, cost of goods sold and return accounts.",
      entityName: "account mapping",
      columns,
      fields,
      data: $productAccountMappings,
      searchKeys: [
        "category",
        "inventoryAccount",
        "salesAccount",
        "cogsAccount",
        "returnAccount"
      ],
      searchPlaceholder: "Search account mappings...",
      createLabel: "Add Mapping",
      displayKey: "category",
      onSave: handleSave,
      onDelete: (id) => inventoryActions.deleteMapping(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
