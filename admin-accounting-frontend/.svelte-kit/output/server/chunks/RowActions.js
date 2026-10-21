import { c as create_ssr_component, e as escape, l as compute_slots, f as add_attribute, v as validate_component } from "./ssr.js";
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
  return ` ${isOpen ? `<div class="fixed inset-0 z-50 overflow-y-auto"><div class="flex min-h-full items-center justify-center p-4"> <button type="button" aria-label="Close dialog" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm transition-opacity w-full h-full border-0 cursor-default"></button>  <div class="${"relative w-full " + escape(sizeClasses[size], true) + " bg-white dark:bg-slate-900 rounded-2xl shadow-2xl border border-gray-200 dark:border-slate-800 transform transition-all"}"><div class="flex items-center justify-between px-6 py-4 border-b border-gray-200 dark:border-slate-800"><h3 class="text-lg font-bold text-gray-900 dark:text-white">${escape(title)}</h3> <button type="button" class="p-1.5 rounded-lg text-gray-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors" aria-label="Close" data-svelte-h="svelte-u811az"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"></path></svg></button></div> <div class="px-6 py-4">${slots.default ? slots.default({}) : ``}</div> ${$$slots.footer ? `<div class="px-6 py-4 border-t border-gray-200 dark:border-slate-800 flex justify-end gap-2">${slots.footer ? slots.footer({}) : ``}</div>` : ``}</div></div></div>` : ``}`;
});
const IconButton = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { name = "view" } = $$props;
  let { title = "" } = $$props;
  let { disabled = false } = $$props;
  const tones = {
    view: "text-blue-600 dark:text-blue-300 hover:bg-blue-50 dark:hover:bg-blue-500/10",
    edit: "text-amber-600 dark:text-amber-300 hover:bg-amber-50 dark:hover:bg-amber-500/10",
    delete: "text-rose-600 dark:text-rose-300 hover:bg-rose-50 dark:hover:bg-rose-500/10",
    print: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60",
    add: "text-emerald-600 dark:text-emerald-300 hover:bg-emerald-50 dark:hover:bg-emerald-500/10",
    refresh: "text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-slate-700/60"
  };
  if ($$props.name === void 0 && $$bindings.name && name !== void 0) $$bindings.name(name);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  return `<button type="button" ${disabled ? "disabled" : ""}${add_attribute("title", title, 0)}${add_attribute("aria-label", title || name, 0)} class="${"p-1.5 rounded-lg transition-colors " + escape(tones[name], true) + " disabled:opacity-40 disabled:cursor-not-allowed"}"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="1.8">${name === "view" ? `<path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"></path> <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path>` : `${name === "edit" ? `<path stroke-linecap="round" stroke-linejoin="round" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z"></path>` : `${name === "delete" ? `<path stroke-linecap="round" stroke-linejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16"></path>` : `${name === "print" ? `<path stroke-linecap="round" stroke-linejoin="round" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path>` : `${name === "add" ? `<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path>` : `<path stroke-linecap="round" stroke-linejoin="round" d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"></path>`}`}`}`}`}</svg></button>`;
});
const RowActions = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { onView = void 0 } = $$props;
  let { onEdit = void 0 } = $$props;
  let { onDelete = void 0 } = $$props;
  let { onPrint = void 0 } = $$props;
  let { viewTitle = "View details" } = $$props;
  let { editTitle = "Edit record" } = $$props;
  let { deleteTitle = "Delete record" } = $$props;
  let { printTitle = "Print record" } = $$props;
  let { extraFirst = false } = $$props;
  let { gap = "tight" } = $$props;
  if ($$props.onView === void 0 && $$bindings.onView && onView !== void 0) $$bindings.onView(onView);
  if ($$props.onEdit === void 0 && $$bindings.onEdit && onEdit !== void 0) $$bindings.onEdit(onEdit);
  if ($$props.onDelete === void 0 && $$bindings.onDelete && onDelete !== void 0) $$bindings.onDelete(onDelete);
  if ($$props.onPrint === void 0 && $$bindings.onPrint && onPrint !== void 0) $$bindings.onPrint(onPrint);
  if ($$props.viewTitle === void 0 && $$bindings.viewTitle && viewTitle !== void 0) $$bindings.viewTitle(viewTitle);
  if ($$props.editTitle === void 0 && $$bindings.editTitle && editTitle !== void 0) $$bindings.editTitle(editTitle);
  if ($$props.deleteTitle === void 0 && $$bindings.deleteTitle && deleteTitle !== void 0) $$bindings.deleteTitle(deleteTitle);
  if ($$props.printTitle === void 0 && $$bindings.printTitle && printTitle !== void 0) $$bindings.printTitle(printTitle);
  if ($$props.extraFirst === void 0 && $$bindings.extraFirst && extraFirst !== void 0) $$bindings.extraFirst(extraFirst);
  if ($$props.gap === void 0 && $$bindings.gap && gap !== void 0) $$bindings.gap(gap);
  return `<div class="${"flex items-center justify-end " + escape(gap === "normal" ? "gap-1" : "gap-0.5", true)}">${extraFirst ? `${slots.default ? slots.default({}) : ``}` : ``} ${onPrint ? `${validate_component(IconButton, "IconButton").$$render($$result, { name: "print", title: printTitle }, {}, {})}` : ``} ${onView ? `${validate_component(IconButton, "IconButton").$$render($$result, { name: "view", title: viewTitle }, {}, {})}` : ``} ${onEdit ? `${validate_component(IconButton, "IconButton").$$render($$result, { name: "edit", title: editTitle }, {}, {})}` : ``} ${onDelete ? `${validate_component(IconButton, "IconButton").$$render($$result, { name: "delete", title: deleteTitle }, {}, {})}` : ``} ${!extraFirst ? `${slots.default ? slots.default({}) : ``}` : ``}</div>`;
});
export {
  Modal as M,
  RowActions as R
};
