import { c as create_ssr_component, f as createEventDispatcher, b as each, e as escape } from "./ssr.js";
const Tabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { tabs = [] } = $$props;
  let { activeTab = tabs[0]?.id || "" } = $$props;
  createEventDispatcher();
  if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0) $$bindings.tabs(tabs);
  if ($$props.activeTab === void 0 && $$bindings.activeTab && activeTab !== void 0) $$bindings.activeTab(activeTab);
  return `<div class="border-b border-gray-200"><nav class="-mb-px flex space-x-6 overflow-x-auto" aria-label="Tabs">${each(tabs, (tab) => {
    return `<button type="button" class="${"whitespace-nowrap py-3 px-1 border-b-2 font-medium text-sm flex items-center gap-2 transition-colors " + escape(
      activeTab === tab.id ? "border-blue-600 text-blue-600 font-semibold" : "border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300",
      true
    )}">${tab.icon ? `<span>${escape(tab.icon)}</span>` : ``} <span>${escape(tab.label)}</span> ${tab.badge !== void 0 ? `<span class="${"ml-1 px-2 py-0.5 text-xs rounded-full font-bold " + escape(
      activeTab === tab.id ? "bg-blue-100 text-blue-700" : "bg-gray-100 text-gray-600",
      true
    )}">${escape(tab.badge)} </span>` : ``} </button>`;
  })}</nav></div>`;
});
export {
  Tabs as T
};
