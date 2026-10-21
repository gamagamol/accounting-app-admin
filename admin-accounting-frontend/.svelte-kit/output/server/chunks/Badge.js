import { c as create_ssr_component, e as escape } from "./ssr.js";
import { g as getStatusColor } from "./formatters.js";
const Badge = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { status } = $$props;
  let { label = "" } = $$props;
  if ($$props.status === void 0 && $$bindings.status && status !== void 0) $$bindings.status(status);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  return `<span class="${"inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold capitalize " + escape(getStatusColor(status), true)}">${escape(label || status.replace(/_/g, " "))}</span>`;
});
export {
  Badge as B
};
