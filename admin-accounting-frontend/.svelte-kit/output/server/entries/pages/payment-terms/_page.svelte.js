import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { Q as paymentTerms, R as paymentTermActions } from "../../../chunks/dataStore.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $paymentTerms, $$unsubscribe_paymentTerms;
  $$unsubscribe_paymentTerms = subscribe(paymentTerms, (value) => $paymentTerms = value);
  const columns = [
    {
      key: "code",
      label: "Term Code",
      sortable: true
    },
    {
      key: "name",
      label: "Term Name",
      sortable: true
    },
    {
      key: "days",
      label: "Credit Days",
      sortable: true,
      align: "center",
      format: (v) => `${v} days`
    },
    { key: "description", label: "Description" }
  ];
  const fields = [
    {
      key: "code",
      label: "Term Code",
      type: "text",
      required: true,
      placeholder: "NET-30"
    },
    {
      key: "name",
      label: "Term Name",
      type: "text",
      required: true,
      placeholder: "Net 30 Days"
    },
    {
      key: "days",
      label: "Credit Days",
      type: "number",
      required: true
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      colSpan: "full"
    }
  ];
  function handleSave(payload, id) {
    if (id) paymentTermActions.update(id, payload);
    else paymentTermActions.add(payload);
  }
  $$unsubscribe_paymentTerms();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Terms of Payment",
      description: "Define standard payment terms for customers and vendors.",
      entityName: "payment term",
      columns,
      fields,
      data: $paymentTerms,
      searchKeys: ["code", "name", "description"],
      searchPlaceholder: "Search payment terms...",
      createLabel: "Add Payment Term",
      displayKey: "name",
      onSave: handleSave,
      onDelete: (id) => paymentTermActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
