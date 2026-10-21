import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { W as unitsOfMeasurement, aa as unitActions } from "../../../chunks/dataStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $unitsOfMeasurement, $$unsubscribe_unitsOfMeasurement;
  $$unsubscribe_unitsOfMeasurement = subscribe(unitsOfMeasurement, (value) => $unitsOfMeasurement = value);
  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true
    },
    {
      key: "name",
      label: "Unit Name",
      sortable: true
    },
    {
      key: "category",
      label: "Category",
      sortable: true,
      align: "center"
    },
    { key: "description", label: "Description" }
  ];
  const fields = [
    {
      key: "code",
      label: "Unit Code",
      type: "text",
      required: true,
      placeholder: "e.g. PCS, KG, BOX"
    },
    {
      key: "name",
      label: "Unit Name",
      type: "text",
      required: true,
      placeholder: "e.g. Pieces"
    },
    {
      key: "category",
      label: "Measurement Category",
      type: "select",
      options: [
        { value: "Count", label: "Count" },
        { value: "Weight", label: "Weight" },
        { value: "Volume", label: "Volume" },
        { value: "Length", label: "Length" },
        { value: "Time", label: "Time" },
        { value: "Service", label: "Service" }
      ]
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      colSpan: "full"
    }
  ];
  function handleSave(payload, id) {
    if (id) unitActions.update(id, payload);
    else unitActions.add(payload);
  }
  $$unsubscribe_unitsOfMeasurement();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Units of Measurement",
      description: "Maintain measurement units used by products, inventory movements and transaction lines.",
      entityName: "unit",
      columns,
      fields,
      data: $unitsOfMeasurement,
      searchKeys: ["code", "name", "category", "description"],
      searchPlaceholder: "Search units...",
      createLabel: "Add Unit",
      displayKey: "name",
      onSave: handleSave,
      onDelete: (id) => unitActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
