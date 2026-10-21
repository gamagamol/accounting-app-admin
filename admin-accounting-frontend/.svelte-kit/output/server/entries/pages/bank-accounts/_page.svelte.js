import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { b as bankAccounts, d as bankAccountActions } from "../../../chunks/dataStore.js";
import { f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $bankAccounts, $$unsubscribe_bankAccounts;
  $$unsubscribe_bankAccounts = subscribe(bankAccounts, (value) => $bankAccounts = value);
  const columns = [
    {
      key: "code",
      label: "Account Code",
      sortable: true
    },
    {
      key: "bankName",
      label: "Bank / Cash Name",
      sortable: true
    },
    {
      key: "accountNumber",
      label: "Account Number"
    },
    {
      key: "accountHolder",
      label: "Account Holder"
    },
    {
      key: "currency",
      label: "Currency",
      align: "center"
    },
    {
      key: "balance",
      label: "Balance",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(Number(v) || 0)
    }
  ];
  const fields = [
    {
      key: "code",
      label: "Account Code",
      type: "text",
      required: true,
      placeholder: "BCA-001"
    },
    {
      key: "bankName",
      label: "Bank / Cash Name",
      type: "text",
      required: true
    },
    {
      key: "accountNumber",
      label: "Account Number",
      type: "text"
    },
    {
      key: "accountHolder",
      label: "Account Holder",
      type: "text"
    },
    {
      key: "currency",
      label: "Currency",
      type: "select",
      options: [
        {
          value: "IDR",
          label: "IDR - Indonesian Rupiah"
        },
        { value: "USD", label: "USD - US Dollar" },
        {
          value: "SGD",
          label: "SGD - Singapore Dollar"
        }
      ]
    },
    {
      key: "balance",
      label: "Current Balance",
      type: "currency"
    }
  ];
  function handleSave(payload, id) {
    if (id) bankAccountActions.update(id, payload);
    else bankAccountActions.add(payload);
  }
  $$unsubscribe_bankAccounts();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Bank & Cash Accounts",
      description: "Manage company bank accounts and cash boxes used for receipts, payments and reconciliation.",
      entityName: "account",
      columns,
      fields,
      data: $bankAccounts,
      searchKeys: ["code", "bankName", "accountNumber", "accountHolder", "currency"],
      searchPlaceholder: "Search bank accounts...",
      createLabel: "Add Account",
      displayKey: "bankName",
      onSave: handleSave,
      onDelete: (id) => bankAccountActions.delete(id)
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
