import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { S as periodClosings, T as periodClosingActions } from "../../../chunks/dataStore.js";
import { a as formatDate } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $periodClosings, $$unsubscribe_periodClosings;
  $$unsubscribe_periodClosings = subscribe(periodClosings, (value) => $periodClosings = value);
  const columns = [
    {
      key: "period",
      label: "Accounting Period",
      sortable: true
    },
    {
      key: "startDate",
      label: "Start Date",
      format: (v) => formatDate(v)
    },
    {
      key: "endDate",
      label: "End Date",
      format: (v) => formatDate(v)
    },
    {
      key: "status",
      label: "Status",
      align: "center"
    },
    { key: "closedBy", label: "Closed By" },
    {
      key: "closedAt",
      label: "Closed At",
      format: (v) => v ? formatDate(v) : "-"
    }
  ];
  const fields = [
    {
      key: "period",
      label: "Period Name",
      type: "text",
      required: true,
      placeholder: "May 2024"
    },
    {
      key: "startDate",
      label: "Start Date",
      type: "date",
      required: true
    },
    {
      key: "endDate",
      label: "End Date",
      type: "date",
      required: true
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: { open: "Open", closed: "Closed" },
      options: [{ value: "open", label: "Open" }, { value: "closed", label: "Closed" }]
    },
    {
      key: "closedBy",
      label: "Closed By",
      type: "text"
    },
    {
      key: "closedAt",
      label: "Closed At",
      type: "date"
    },
    {
      key: "notes",
      label: "Closing Notes",
      type: "textarea",
      colSpan: "full"
    }
  ];
  function handleSave(payload, id) {
    if (id) periodClosingActions.update(id, payload);
    else periodClosingActions.add(payload);
  }
  $$unsubscribe_periodClosings();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Period Closing",
      description: "Lock accounting periods after all transactions and reconciliations are complete.",
      entityName: "period",
      columns,
      fields,
      data: $periodClosings,
      searchKeys: ["period", "status", "closedBy", "notes"],
      searchPlaceholder: "Search periods...",
      createLabel: "Add Period",
      displayKey: "period",
      onSave: handleSave,
      onDelete: (id) => periodClosingActions.delete(id)
    },
    {},
    {
      "extra-actions": ({ row }) => {
        return `${row.status === "open" ? `<button type="button" class="px-2 py-1 text-[10px] font-bold rounded-md bg-rose-50 text-rose-700 hover:bg-rose-100 dark:bg-rose-500/10 dark:text-rose-200" title="Close this accounting period" data-svelte-h="svelte-btpekj">Close</button>` : ``}`;
      }
    }
  )}`;
});
export {
  Page as default
};
