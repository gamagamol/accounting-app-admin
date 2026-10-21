import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { P as PaymentList } from "../../../chunks/PaymentList.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(PaymentList, "PaymentList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
