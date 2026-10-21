import { c as create_ssr_component, v as validate_component } from "../../../chunks/ssr.js";
import { B as BillList } from "../../../chunks/BillList.js";
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(BillList, "BillList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
