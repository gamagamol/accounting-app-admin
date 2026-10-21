import { c as create_ssr_component, e as escape } from "./ssr.js";
const StatCard = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { title } = $$props;
  let { value } = $$props;
  let { icon = "💰" } = $$props;
  let { color = "blue" } = $$props;
  let { hint = "" } = $$props;
  const colorClasses = {
    blue: "border-l-blue-500 text-blue-600 dark:text-blue-300",
    green: "border-l-emerald-500 text-emerald-600 dark:text-emerald-300",
    yellow: "border-l-amber-500 text-amber-600 dark:text-amber-300",
    purple: "border-l-purple-500 text-purple-600 dark:text-purple-300",
    red: "border-l-rose-500 text-rose-600 dark:text-rose-300",
    slate: "border-l-slate-500 text-slate-600 dark:text-slate-300"
  };
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.value === void 0 && $$bindings.value && value !== void 0) $$bindings.value(value);
  if ($$props.icon === void 0 && $$bindings.icon && icon !== void 0) $$bindings.icon(icon);
  if ($$props.color === void 0 && $$bindings.color && color !== void 0) $$bindings.color(color);
  if ($$props.hint === void 0 && $$bindings.hint && hint !== void 0) $$bindings.hint(hint);
  return `<div class="${"bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 border-l-4 " + escape(colorClasses[color], true) + " p-5 hover:shadow-md transition-all"}"><div class="flex items-center justify-between gap-3"><div class="min-w-0"><p class="${"text-[10px] font-bold uppercase tracking-wider " + escape(colorClasses[color].split(" ")[1], true)}">${escape(title)}</p> <p class="mt-1 text-xl font-black text-gray-900 dark:text-white truncate">${escape(value)}</p> ${hint ? `<p class="mt-0.5 text-[11px] text-gray-500 dark:text-slate-400 truncate">${escape(hint)}</p>` : ``}</div> <div class="text-2xl opacity-40 dark:opacity-60">${escape(icon)}</div></div></div>`;
});
export {
  StatCard as S
};
