import { f as formatCurrency, a as formatDate, c as formatPercent, d as formatNumber } from "./formatters.js";
function currencyColumn(key, label, options = {}) {
  return {
    key,
    label,
    sortable: true,
    align: "right",
    ...options,
    format: (value) => formatCurrency(Number(value) || 0)
  };
}
function numberColumn(key, label, options = {}) {
  return {
    key,
    label,
    sortable: true,
    align: "right",
    ...options,
    format: (value) => formatNumber(Number(value) || 0)
  };
}
function percentColumn(key, label, options = {}) {
  return {
    key,
    label,
    sortable: true,
    align: "right",
    ...options,
    format: (value) => formatPercent(Number(value) || 0)
  };
}
function dateColumn(key, label, options = {}) {
  return {
    key,
    label,
    sortable: true,
    ...options,
    format: (value) => formatDate(String(value ?? ""))
  };
}
function statusColumn(key = "status", label = "Status", options = {}) {
  return {
    key,
    label,
    sortable: true,
    ...options,
    badge: true
  };
}
export {
  currencyColumn as c,
  dateColumn as d,
  numberColumn as n,
  percentColumn as p,
  statusColumn as s
};
