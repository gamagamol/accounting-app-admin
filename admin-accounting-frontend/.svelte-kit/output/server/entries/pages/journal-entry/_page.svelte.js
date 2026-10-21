import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { c as chartOfAccounts, K as journalEntries, L as journalActions } from "../../../chunks/dataStore.js";
import { a as formatDate, f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let accountOptions;
  let fields;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  let $journalEntries, $$unsubscribe_journalEntries;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  $$unsubscribe_journalEntries = subscribe(journalEntries, (value) => $journalEntries = value);
  const columns = [
    {
      key: "date",
      label: "Journal Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "reference",
      label: "Reference",
      sortable: true
    },
    { key: "description", label: "Description" },
    {
      key: "debitAccount",
      label: "Debit Account"
    },
    {
      key: "creditAccount",
      label: "Credit Account"
    },
    {
      key: "amount",
      label: "Amount",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(Number(v) || 0)
    }
  ];
  function handleSave(payload, id) {
    if (id) journalActions.update(id, payload);
    else journalActions.add(payload);
  }
  accountOptions = $chartOfAccounts.map((account) => ({
    value: `${account.code} ${account.name}`,
    label: `${account.code} — ${account.name}`
  }));
  fields = [
    {
      key: "date",
      label: "Journal Date",
      type: "date",
      required: true
    },
    {
      key: "reference",
      label: "Reference",
      type: "text",
      placeholder: "JE/2024/001"
    },
    {
      key: "description",
      label: "Description",
      type: "textarea",
      colSpan: "full"
    },
    {
      key: "debitAccount",
      label: "Debit Account",
      type: "select",
      options: accountOptions,
      required: true
    },
    {
      key: "creditAccount",
      label: "Credit Account",
      type: "select",
      options: accountOptions,
      required: true
    },
    {
      key: "amount",
      label: "Amount",
      type: "currency",
      required: true
    }
  ];
  $$unsubscribe_chartOfAccounts();
  $$unsubscribe_journalEntries();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Manual Journal Entry",
      description: "Create balanced double-entry journals for adjustments, accruals and other manual postings.",
      entityName: "journal entry",
      columns,
      fields,
      data: $journalEntries,
      searchKeys: ["reference", "description", "debitAccount", "creditAccount"],
      searchPlaceholder: "Search journal entries...",
      createLabel: "New Journal Entry",
      displayKey: "reference",
      onSave: handleSave,
      onDelete: (id) => journalActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
