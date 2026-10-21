import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { D as DebtPaymentList } from "../../../chunks/DebtPaymentList.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(DebtPaymentList, "DebtPaymentList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
