import { c as create_ssr_component, f as add_attribute, e as escape, g as each } from "./ssr.js";
const FilterSelect = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { id } = $$props;
  let { value } = $$props;
  let { options = [] } = $$props;
  let { label = "" } = $$props;
  let { allLabel = "" } = $$props;
  let { ariaLabel = "" } = $$props;
  if ($$props.id === void 0 && $$bindings.id && id !== void 0) $$bindings.id(id);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.options === void 0 && $$bindings.options && options !== void 0) $$bindings.options(options);
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.allLabel === void 0 && $$bindings.allLabel && allLabel !== void 0) $$bindings.allLabel(allLabel);
  if ($$props.ariaLabel === void 0 && $$bindings.ariaLabel && ariaLabel !== void 0) $$bindings.ariaLabel(ariaLabel);
  return `<div class="flex items-center gap-2">${label ? `<label${add_attribute("for", id, 0)} class="text-xs text-gray-500 dark:text-slate-400">${escape(label)}</label>` : ``} <select${add_attribute("id", id, 0)}${add_attribute("aria-label", ariaLabel || label || id, 0)} class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-xs">${allLabel ? `<option value="all">${escape(allLabel)}</option>` : ``}${each(options, (option) => {
    return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
  })}</select></div>`;
});
export {
  FilterSelect as F
};
