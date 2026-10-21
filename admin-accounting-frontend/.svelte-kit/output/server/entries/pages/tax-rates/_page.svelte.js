import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { a3 as taxRates, a9 as taxRateActions } from "../../../chunks/dataStore.js";
import { c as formatPercent } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $taxRates, $$unsubscribe_taxRates;
  $$unsubscribe_taxRates = subscribe(taxRates, (value) => $taxRates = value);
  const columns = [
    {
      key: "code",
      label: "Tax Code",
      sortable: true
    },
    {
      key: "name",
      label: "Tax Name",
      sortable: true
    },
    {
      key: "rate",
      label: "Rate",
      sortable: true,
      align: "center",
      format: (v) => formatPercent(Number(v) || 0)
    },
    {
      key: "type",
      label: "Tax Type",
      align: "center"
    },
    { key: "description", label: "Description" }
  ];
  const fields = [
    {
      key: "code",
      label: "Tax Code",
      type: "text",
      required: true,
      placeholder: "PPN-11"
    },
    {
      key: "name",
      label: "Tax Name",
      type: "text",
      required: true
    },
    {
      key: "rate",
      label: "Rate (%)",
      type: "number",
      required: true
    },
    {
      key: "type",
      label: "Tax Type",
      type: "select",
      badge: true,
      badgeLabels: {
        sales: "Sales",
        purchase: "Purchase",
        withholding: "Withholding"
      },
      options: [
        { value: "sales", label: "Sales" },
        { value: "purchase", label: "Purchase" },
        {
          value: "withholding",
          label: "Withholding"
        }
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
    if (id) taxRateActions.update(id, payload);
    else taxRateActions.add(payload);
  }
  $$unsubscribe_taxRates();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Tax Rates",
      description: "Configure sales, purchase and withholding tax rates used across transactions.",
      entityName: "tax rate",
      columns,
      fields,
      data: $taxRates,
      searchKeys: ["code", "name", "type", "description"],
      searchPlaceholder: "Search tax rates...",
      createLabel: "Add Tax Rate",
      displayKey: "name",
      onSave: handleSave,
      onDelete: (id) => taxRateActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
