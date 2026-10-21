import { c as create_ssr_component, e as escape } from "./ssr.js";
const DetailStat = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { label } = $$props;
  let { value } = $$props;
  let { tone = "default" } = $$props;
  const toneClasses = {
    default: "text-gray-900 dark:text-white",
    blue: "text-blue-600 dark:text-blue-300",
    amber: "text-amber-600 dark:text-amber-300",
    emerald: "text-emerald-600 dark:text-emerald-300"
  };
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.tone === void 0 && $$bindings.tone && tone !== void 0) $$bindings.tone(tone);
  return `<div class="rounded-xl border border-gray-200 dark:border-slate-800 p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">${escape(label)}</p> <p class="${"mt-1 font-bold " + escape(toneClasses[tone], true)}">${escape(value)}</p></div>`;
});
const DetailField = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { label } = $$props;
  let { value = "" } = $$props;
  let { mono = false } = $$props;
  if ($$props.label === void 0 && $$bindings.label && label !== void 0) $$bindings.label(label);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.mono === void 0 && $$bindings.mono && mono !== void 0) $$bindings.mono(mono);
  return `<div class="rounded-lg border border-gray-200 dark:border-slate-800 p-3"><p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">${escape(label)}</p> <p class="${"mt-1 font-medium text-gray-800 dark:text-slate-100 " + escape(mono ? "font-mono" : "", true)}">${escape(value === "" || value === null || value === void 0 ? "—" : value)}</p></div>`;
});
export {
  DetailStat as D,
  DetailField as a
};
