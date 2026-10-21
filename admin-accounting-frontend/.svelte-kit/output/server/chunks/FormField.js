import { c as create_ssr_component, f as add_attribute, e as escape } from "./ssr.js";
const FormField = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { label } = $$props;
  let { name } = $$props;
  let { error = "" } = $$props;
  let { required = false } = $$props;
  let { hint = "" } = $$props;
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0) $$bindings.required(required);
  if ($$props.hint === void 0 && $$bindings.hint && hint !== void 0) $$bindings.hint(hint);
  return `<div class="mb-4"><label${add_attribute("for", name, 0)} class="block text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">${escape(label)} ${required ? `<span class="text-rose-500" data-svelte-h="svelte-150md34">*</span>` : ``}</label> ${slots.default ? slots.default({}) : ``} ${hint ? `<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">${escape(hint)}</p>` : ``} ${error ? `<p class="mt-1 text-xs text-rose-600 dark:text-rose-400">${escape(error)}</p>` : ``}</div>`;
});
export {
  FormField as F
};
