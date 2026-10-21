import { c as create_ssr_component, f as add_attribute, e as escape } from "./ssr.js";
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { variant = "primary" } = $$props;
  let { size = "md" } = $$props;
  let { href = "" } = $$props;
  let { type = "button" } = $$props;
  let { disabled = false } = $$props;
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white shadow-sm shadow-blue-600/20",
    secondary: "bg-gray-100 hover:bg-gray-200 text-gray-800 dark:bg-slate-800 dark:hover:bg-slate-700 dark:text-slate-100 border border-gray-200 dark:border-slate-700",
    success: "bg-emerald-600 hover:bg-emerald-700 text-white shadow-sm shadow-emerald-600/20",
    danger: "bg-rose-600 hover:bg-rose-700 text-white shadow-sm shadow-rose-600/20",
    warning: "bg-amber-500 hover:bg-amber-600 text-white",
    info: "bg-cyan-500 hover:bg-cyan-600 text-white",
    ghost: "bg-transparent hover:bg-gray-100 dark:hover:bg-slate-800 text-gray-700 dark:text-slate-200 border border-transparent"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0) $$bindings.variant(variant);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0) $$bindings.href(href);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  return `${href ? `<a${add_attribute("href", href, 0)} class="${"inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " + escape(variantClasses[variant], true) + " " + escape(sizeClasses[size], true) + " " + escape(disabled ? "opacity-50 pointer-events-none" : "", true)}">${slots.default ? slots.default({}) : ``}</a>` : `<button${add_attribute("type", type, 0)} ${disabled ? "disabled" : ""} class="${"inline-flex items-center justify-center gap-2 rounded-lg font-semibold transition-colors " + escape(variantClasses[variant], true) + " " + escape(sizeClasses[size], true) + " " + escape(disabled ? "opacity-50 cursor-not-allowed" : "", true)}">${slots.default ? slots.default({}) : ``}</button>`}`;
});
export {
  Button as B
};
