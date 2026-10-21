import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { b as bankAccounts, e as bankReconciliations, f as bankReconciliationActions } from "../../../chunks/dataStore.js";
import { a as formatDate, f as formatCurrency } from "../../../chunks/formatters.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let bankOptions;
  let fields;
  let $bankAccounts, $$unsubscribe_bankAccounts;
  let $bankReconciliations, $$unsubscribe_bankReconciliations;
  $$unsubscribe_bankAccounts = subscribe(bankAccounts, (value) => $bankAccounts = value);
  $$unsubscribe_bankReconciliations = subscribe(bankReconciliations, (value) => $bankReconciliations = value);
  const columns = [
    {
      key: "date",
      label: "Statement Date",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "bankAccount",
      label: "Bank Account",
      sortable: true
    },
    {
      key: "statementBalance",
      label: "Statement Balance",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "glBalance",
      label: "GL Balance",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "difference",
      label: "Difference",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "status",
      label: "Status",
      align: "center"
    }
  ];
  function handleSave(payload, id) {
    if (id) bankReconciliationActions.update(id, payload);
    else bankReconciliationActions.add(payload);
  }
  bankOptions = $bankAccounts.map((account) => ({
    value: `${account.bankName} ${account.accountNumber}`,
    label: `${account.bankName} — ${account.accountNumber}`
  }));
  fields = [
    {
      key: "date",
      label: "Statement Date",
      type: "date",
      required: true
    },
    {
      key: "bankAccount",
      label: "Bank Account",
      type: "select",
      options: bankOptions
    },
    {
      key: "statementBalance",
      label: "Statement Balance",
      type: "currency",
      required: true
    },
    {
      key: "glBalance",
      label: "GL Balance",
      type: "currency",
      required: true
    },
    {
      key: "difference",
      label: "Difference",
      type: "currency"
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: {
        reconciled: "Reconciled",
        discrepancy: "Discrepancy"
      },
      options: [
        { value: "reconciled", label: "Reconciled" },
        {
          value: "discrepancy",
          label: "Discrepancy"
        }
      ]
    }
  ];
  $$unsubscribe_bankAccounts();
  $$unsubscribe_bankReconciliations();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Bank Reconciliation",
      description: "Compare bank statement balances with the general ledger and resolve differences.",
      entityName: "reconciliation",
      columns,
      fields,
      data: $bankReconciliations,
      searchKeys: ["bankAccount", "status"],
      searchPlaceholder: "Search reconciliations...",
      createLabel: "Add Reconciliation",
      displayKey: "bankAccount",
      onSave: handleSave,
      onDelete: (id) => bankReconciliationActions.delete(id)
    },
    {},
    {
      "extra-actions": ({ row }) => {
        return `${row.status === "discrepancy" ? `<button type="button" class="px-2 py-1 text-[10px] font-bold rounded-md bg-emerald-50 text-emerald-700 hover:bg-emerald-100 dark:bg-emerald-500/10 dark:text-emerald-200" title="Mark as reconciled" data-svelte-h="svelte-htnqgg">Reconcile</button>` : ``}`;
      }
    }
  )}`;
});
export {
  Page as default
};
