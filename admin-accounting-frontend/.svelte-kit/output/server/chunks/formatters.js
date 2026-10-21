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
  return `<div class="mb-1 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4"><div><h1 class="text-2xl font-black text-gray-900 dark:text-white tracking-tight">${escape(title)}</h1> ${sub ? `<p class="mt-1 text-sm text-gray-500 dark:text-slate-400">${escape(sub)}</p>` : ``}</div> <div class="flex items-center gap-2">${slots.default ? slots.default({}) : ``}</div></div>`;
});
function formatCurrency(amount) {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0
  }).format(amount);
}
function formatCompactCurrency(amount) {
  if (Math.abs(amount) >= 1e9) return `IDR ${(amount / 1e9).toFixed(1)}B`;
  if (Math.abs(amount) >= 1e6) return `IDR ${(amount / 1e6).toFixed(1)}M`;
  if (Math.abs(amount) >= 1e3) return `IDR ${(amount / 1e3).toFixed(1)}K`;
  return formatCurrency(amount);
}
function formatSummaryCurrency(amount) {
  return Math.abs(amount) >= 1e9 ? formatCompactCurrency(amount) : formatCurrency(amount);
}
function formatDate(dateStr) {
  if (!dateStr) return "-";
  return new Date(dateStr).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric"
  });
}
function formatNumber(num) {
  return new Intl.NumberFormat("en-US").format(num);
}
function formatPercent(value, digits = 1) {
  return `${value.toFixed(digits)}%`;
}
function getStatusColor(status) {
  const colors = {
    pending: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
    draft: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
    submitted: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
    revised: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200",
    over_budget: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    quotation: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
    sales: "bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200",
    sent: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
    approved: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    completed: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    delivered: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    shipped: "bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200",
    received: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    paid: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    active: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    inactive: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    rejected: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    cancelled: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    overdue: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    partial: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200",
    open: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
    closed: "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200",
    posted: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    reconciled: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    discrepancy: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    goods: "bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200",
    service: "bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200",
    in: "bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200",
    out: "bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200",
    adjustment: "bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
  };
  return colors[status?.toLowerCase()] || "bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200";
}
export {
  PageHeader as P,
  formatDate as a,
  formatSummaryCurrency as b,
  formatPercent as c,
  formatNumber as d,
  formatCurrency as f,
  getStatusColor as g
};
