import { c as create_ssr_component, e as escape } from "./ssr.js";
const PageHeader = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let sub;
  let { title } = $$props;
  let { subtitle = "" } = $$props;
  let { description = "" } = $$props;
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.subtitle === void 0 && $$bindings.subtitle && subtitle !== void 0) $$bindings.subtitle(subtitle);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0) $$bindings.description(description);
  sub = subtitle || description;
  return `<div class="mb-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 class="text-2xl font-black text-gray-900 tracking-tight">${escape(title)}</h1> ${sub ? `<p class="mt-1 text-sm text-gray-500">${escape(sub)}</p>` : ``}</div> <div class="flex items-center gap-2">${slots.default ? slots.default({}) : ``}</div></div>`;
});
export {
  PageHeader as P
};
