import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { G as GeneralLedgerView } from "../../../chunks/GeneralLedgerView.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
    $$result,
    {
      title: "General Ledger",
      description: "Double-entry journal history and account movement for every posted transaction."
    },
    {},
    {}
  )} ${validate_component(GeneralLedgerView, "GeneralLedgerView").$$render($$result, {}, {}, {})}</div>`;
});
export {
  Page as default
};
