import { c as create_ssr_component, h as compute_slots, e as escape, d as add_attribute } from "./ssr.js";
const Modal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $$slots = compute_slots(slots);
  let { isOpen = false } = $$props;
  let { title = "" } = $$props;
  let { size = "md" } = $$props;
  const sizeClasses = {
    sm: "max-w-sm",
    md: "max-w-md",
    lg: "max-w-lg",
    xl: "max-w-xl",
    "2xl": "max-w-2xl",
    "3xl": "max-w-3xl",
    "4xl": "max-w-4xl"
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  return ` ${isOpen ? `<div class="fixed inset-0 z-50 overflow-y-auto"><div class="flex min-h-full items-center justify-center p-4"> <button type="button" aria-label="Tutup dialog" class="fixed inset-0 bg-black/50 transition-opacity w-full h-full border-0 cursor-default"></button>  <div class="${"relative w-full " + escape(sizeClasses[size], true) + " bg-white rounded-lg shadow-xl transform transition-all"}"><div class="flex items-center justify-between px-6 py-4 border-b border-gray-200"><h3 class="text-lg font-semibold text-gray-800">${escape(title)}</h3> <button class="text-gray-400 hover:text-gray-600 transition-colors" data-svelte-h="svelte-5rbxsq">✕</button></div> <div class="px-6 py-4">${slots.default ? slots.default({}) : ``}</div> ${$$slots.footer ? `<div class="px-6 py-4 border-t border-gray-200 flex justify-end gap-2">${slots.footer ? slots.footer({}) : ``}</div>` : ``}</div></div></div>` : ``}`;
});
const FormField = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { label } = $$props;
  let { name } = $$props;
  let { error = "" } = $$props;
  let { required = false } = $$props;
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.error === void 0 && $$bindings.error && error !== void 0) $$bindings.error(error);
  if ($$props.required === void 0 && $$bindings.required && required !== void 0) $$bindings.required(required);
  return `<div class="mb-4"><label${add_attribute("for", name, 0)} class="block text-sm font-medium text-gray-700 mb-1">${escape(label)} ${required ? `<span class="text-red-500" data-svelte-h="svelte-1n3raya">*</span>` : ``}</label> ${slots.default ? slots.default({}) : ``} ${error ? `<p class="mt-1 text-sm text-red-600">${escape(error)}</p>` : ``}</div>`;
});
export {
  FormField as F,
  Modal as M
};
