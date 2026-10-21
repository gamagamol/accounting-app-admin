import { b as set_current_component, d as current_component, r as run_all, c as create_ssr_component, s as subscribe, e as escape, f as add_attribute, g as each, h as createEventDispatcher, v as validate_component } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import { u as user } from "../../chunks/auth.js";
import { a as appSettings, s as systemAlerts } from "../../chunks/dataStore.js";
import { t as theme } from "../../chunks/theme.js";
const dirty_components = [];
const binding_callbacks = [];
let render_callbacks = [];
const flush_callbacks = [];
const resolved_promise = /* @__PURE__ */ Promise.resolve();
let update_scheduled = false;
function schedule_update() {
  if (!update_scheduled) {
    update_scheduled = true;
    resolved_promise.then(flush);
  }
}
function tick() {
  schedule_update();
  return resolved_promise;
}
function add_render_callback(fn) {
  render_callbacks.push(fn);
}
const seen_callbacks = /* @__PURE__ */ new Set();
let flushidx = 0;
function flush() {
  if (flushidx !== 0) {
    return;
  }
  const saved_component = current_component;
  do {
    try {
      while (flushidx < dirty_components.length) {
        const component = dirty_components[flushidx];
        flushidx++;
        set_current_component(component);
        update(component.$$);
      }
    } catch (e) {
      dirty_components.length = 0;
      flushidx = 0;
      throw e;
    }
    set_current_component(null);
    dirty_components.length = 0;
    flushidx = 0;
    while (binding_callbacks.length) binding_callbacks.pop()();
    for (let i = 0; i < render_callbacks.length; i += 1) {
      const callback = render_callbacks[i];
      if (!seen_callbacks.has(callback)) {
        seen_callbacks.add(callback);
        callback();
      }
    }
    render_callbacks.length = 0;
  } while (dirty_components.length);
  while (flush_callbacks.length) {
    flush_callbacks.pop()();
  }
  update_scheduled = false;
  seen_callbacks.clear();
  set_current_component(saved_component);
}
function update($$) {
  if ($$.fragment !== null) {
    $$.update();
    run_all($$.before_update);
    const dirty = $$.dirty;
    $$.dirty = [-1];
    $$.fragment && $$.fragment.p($$.ctx, dirty);
    $$.after_update.forEach(add_render_callback);
  }
}
const mainNavItems = [
  { label: "Dashboard", href: "/dashboard", icon: "📊" }
];
const navGroups = [
  {
    label: "Master Data",
    icon: "🗂️",
    items: [
      { label: "Chart of Accounts (COA)", href: "/coa", icon: "📒" },
      { label: "Customer", href: "/customer", icon: "👥" },
      { label: "Supplier", href: "/supplier", icon: "🚚" },
      { label: "Employee", href: "/employee", icon: "🪪" },
      { label: "Product", href: "/product", icon: "📦" },
      { label: "Unit of Measurement (UoM)", href: "/uom", icon: "📐" },
      { label: "Warehouse / Location", href: "/warehouse", icon: "🏭" },
      { label: "Tax Rates", href: "/tax-rates", icon: "🧮" },
      { label: "Terms of Payment", href: "/payment-terms", icon: "📅" },
      { label: "Bank & Cash Accounts", href: "/bank-accounts", icon: "🏦" },
      { label: "Departments & Cost Centers", href: "/department", icon: "🏢" }
    ]
  },
  {
    label: "Sales Flow",
    icon: "💳",
    items: [
      { label: "Quotation", href: "/quotation", icon: "📄" },
      { label: "Sales Order", href: "/sales", icon: "🛒" },
      { label: "Delivery", href: "/delivery", icon: "🚚" },
      { label: "Sales Invoice", href: "/sales-invoice", icon: "🧾" },
      { label: "Customer Receipt", href: "/customer-receipt", icon: "💵" },
      { label: "Sales Return / Credit Note", href: "/sales-return", icon: "↩️" }
    ]
  },
  {
    label: "Purchasing Flow",
    icon: "🛍️",
    items: [
      { label: "Purchase Order", href: "/purchase", icon: "📋" },
      { label: "Goods Receipt", href: "/goods", icon: "📥" },
      { label: "Purchase Invoice", href: "/purchase-invoice", icon: "🧾" },
      { label: "Vendor Payment", href: "/vendor-payment", icon: "🏦" },
      { label: "Purchase Return / Debit Note", href: "/purchase-return", icon: "↪️" }
    ]
  },
  {
    label: "Inventory",
    icon: "📦",
    items: [
      { label: "Stock Movement", href: "/stock-movement", icon: "🔁" },
      { label: "Stock Adjustment", href: "/stock-adjustment", icon: "⚖️" },
      { label: "Product Account Mapping", href: "/product-account-mapping", icon: "🔗" },
      { label: "Inventory Valuation / Adjustment", href: "/inventory-valuation", icon: "🏷️" }
    ]
  },
  {
    label: "Accounting & Financial Reports",
    icon: "📘",
    items: [
      { label: "Manual Journal Entry", href: "/journal-entry", icon: "✍️" },
      { label: "Bank Reconciliation", href: "/bank-reconciliation", icon: "🏧" },
      { label: "General Ledger", href: "/general-ledger", icon: "📚" },
      { label: "Period Closing", href: "/period-closing", icon: "🔒" },
      { label: "Trial Balance", href: "/trial-balance", icon: "⚖️" },
      { label: "Profit & Loss", href: "/profit-loss", icon: "📈" },
      { label: "Balance Sheet", href: "/balance-sheet", icon: "🏛️" },
      { label: "Cash Flow Statement", href: "/cash-flow", icon: "🌊" }
    ]
  },
  {
    label: "Operational & Management Reports",
    icon: "📊",
    items: [
      { label: "Aging Schedule", href: "/reports/aging-schedule", icon: "⏰" },
      { label: "Quotation vs PO", href: "/reports/quotation-vs-po", icon: "📊" },
      { label: "Quotation Detail", href: "/reports/quotation-detail", icon: "📑" },
      { label: "Customer Omzet", href: "/reports/customer-omzet", icon: "👥" },
      { label: "Outstanding Report", href: "/reports/outstanding", icon: "⚠️" },
      { label: "Omzet Report", href: "/reports/omzet", icon: "📈" },
      { label: "Transaction Tracking", href: "/reports/transaction-tracking", icon: "🚀" },
      { label: "Stock Card", href: "/reports/stock-card", icon: "🗃️" },
      { label: "Order Fulfillment (SO vs DO)", href: "/reports/order-fulfillment", icon: "📦" },
      { label: "Purchase by Vendor Report", href: "/reports/purchase-by-vendor", icon: "🏷️" },
      { label: "Gross Profit by Product", href: "/reports/gross-profit", icon: "💰" },
      { label: "Tax Summary", href: "/reports/tax-summary", icon: "🧾" }
    ]
  },
  {
    label: "Expense & Budgeting",
    icon: "💼",
    items: [
      { label: "Annual Budget Plan", href: "/budgets", icon: "🎯" },
      { label: "Budget Approval", href: "/budget-approval", icon: "✅" },
      { label: "Budget Allocation", href: "/budget-allocation", icon: "🧩" },
      { label: "Expense Entry", href: "/expenses", icon: "💳" },
      { label: "Expense Approval", href: "/expense-approval", icon: "🔎" },
      { label: "Posted Expenses (GL)", href: "/posted-expenses", icon: "📘" },
      { label: "Budget vs Actual", href: "/budget-vs-actual", icon: "📊" },
      { label: "Budget Revision", href: "/budget-revision", icon: "🔁" }
    ]
  },
  {
    label: "System Configuration",
    icon: "⚙️",
    items: [
      { label: "Company & Profile Settings", href: "/settings", icon: "🏢" },
      { label: "User Management", href: "/settings?tab=users", icon: "🔐" },
      { label: "Appearance & Theme", href: "/settings?tab=appearance", icon: "🎨" },
      { label: "API Integration & Payloads", href: "/api-contract", icon: "🔌" }
    ]
  }
];
[
  { name: "Dashboard", href: "/dashboard", icon: "dashboard" },
  ...navGroups.flatMap(
    (group) => group.items.map((item) => ({ name: item.label, href: item.href, icon: item.icon }))
  )
];
function routeMatches(href, path, search) {
  const [hrefPath, query] = href.split("?");
  if (query) {
    return path === hrefPath && search.includes(query);
  }
  if (hrefPath === "/settings") {
    return path === "/settings" && !search.includes("tab=users") && !search.includes("tab=appearance");
  }
  if (hrefPath === "/dashboard") {
    return path === "/dashboard" || path === "/";
  }
  return path === hrefPath;
}
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let currentPath;
  let currentSearch;
  let routeKey;
  let activeHrefs;
  let activeGroupLabel;
  let $page, $$unsubscribe_page;
  let $appSettings, $$unsubscribe_appSettings;
  let $user, $$unsubscribe_user;
  let $theme, $$unsubscribe_theme;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_appSettings = subscribe(appSettings, (value) => $appSettings = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  let { isOpen = false } = $$props;
  let { collapsed = false } = $$props;
  let expanded = {};
  let navEl;
  let lastRouteKey = "";
  function buildActiveHrefs(path, search) {
    return new Set([...mainNavItems, ...navGroups.flatMap((group) => group.items)].filter((item) => routeMatches(item.href, path, search)).map((item) => item.href));
  }
  async function scrollActiveIntoView() {
    await tick();
    return;
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.collapsed === void 0 && $$bindings.collapsed && collapsed !== void 0) $$bindings.collapsed(collapsed);
  currentPath = $page.url.pathname;
  currentSearch = $page.url.search;
  routeKey = `${currentPath}${currentSearch}`;
  activeHrefs = buildActiveHrefs(currentPath, currentSearch);
  activeGroupLabel = navGroups.find((group) => group.items.some((item) => activeHrefs.has(item.href)))?.label ?? "";
  {
    if (routeKey && routeKey !== lastRouteKey) {
      lastRouteKey = routeKey;
      if (activeGroupLabel) {
        expanded = { ...expanded, [activeGroupLabel]: true };
      }
      scrollActiveIntoView();
    }
  }
  $$unsubscribe_page();
  $$unsubscribe_appSettings();
  $$unsubscribe_user();
  $$unsubscribe_theme();
  return ` ${isOpen ? `<button type="button" aria-label="Close navigation" class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden border-0 cursor-default"></button>` : ``} <aside class="${"fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen shrink-0 flex flex-col overflow-hidden bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100 border-r border-gray-200 dark:border-slate-800 transition-[width,transform] duration-300 ease-in-out shadow-2xl lg:shadow-none " + escape(collapsed ? "lg:w-20" : "lg:w-72", true) + " " + escape(
    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    true
  )}"> <div class="${"h-16 flex items-center gap-2 px-3.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 shrink-0 " + escape(
    collapsed ? "lg:justify-center lg:px-2" : "justify-between",
    true
  )}"><a href="/dashboard" class="flex items-center gap-3 min-w-0 group"><div class="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform" data-svelte-h="svelte-qe45vd">BY</div> <div class="${"min-w-0 " + escape(collapsed ? "lg:hidden" : "", true)}"><span class="text-sm font-extrabold tracking-wide text-gray-900 dark:text-white block leading-tight" data-svelte-h="svelte-vmpd58">ACCOUNTING ERP</span> <span class="text-[10px] text-gray-500 dark:text-slate-400 block leading-tight truncate max-w-[160px]">${escape($appSettings.companyName)}</span></div></a> <div class="flex items-center gap-1 shrink-0"><button type="button" class="${"hidden lg:flex items-center justify-center p-1.5 rounded-lg text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-slate-800 transition-colors " + escape(collapsed ? "lg:hidden" : "", true)}" title="Collapse sidebar" aria-label="Collapse sidebar"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg></button> <button type="button" class="lg:hidden text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 text-lg" aria-label="Close sidebar" data-svelte-h="svelte-vnsfgk">✕</button></div></div>  <div class="${"px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800/80 flex items-center justify-between shrink-0 " + escape(collapsed ? "lg:hidden" : "", true)}"><div class="flex items-center gap-2" data-svelte-h="svelte-mzzz6h"><span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span> <span class="text-[11px] font-medium text-gray-600 dark:text-slate-300">Access level</span></div> <span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">${escape($user.role.replace("_", " "))}</span></div>  <nav class="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto custom-scrollbar text-sm" aria-label="Main navigation"${add_attribute("this", navEl, 0)}>${each(mainNavItems, (item) => {
    return `<a${add_attribute("href", item.href, 0)}${add_attribute("data-nav-active", activeHrefs.has(item.href), 0)}${add_attribute("title", item.label, 0)} class="${"flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all " + escape(collapsed ? "lg:justify-center lg:px-0" : "", true) + " " + escape(
      activeHrefs.has(item.href) ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white",
      true
    )}"><span class="text-base shrink-0">${escape(item.icon)}</span> <span${add_attribute("class", collapsed ? "lg:hidden" : "", 0)}>${escape(item.label)}</span> </a>`;
  })} <div class="${"pt-2 pb-1 px-3 " + escape(collapsed ? "lg:hidden" : "", true)}"><p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500" data-svelte-h="svelte-8pkz93">Modules</p></div> ${each(navGroups, (group) => {
    let active = activeGroupLabel === group.label;
    return ` <div class="${"rounded-xl transition-colors " + escape(active ? "bg-blue-50 dark:bg-slate-800/50" : "", true)}"><button type="button" class="${"w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left " + escape(collapsed ? "lg:justify-center lg:px-0" : "", true) + " " + escape(
      active ? "text-blue-700 dark:text-white" : "text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white",
      true
    )}"${add_attribute("aria-expanded", !!expanded[group.label], 0)}${add_attribute("title", group.label, 0)}><span class="text-base shrink-0">${escape(group.icon)}</span> <span class="${"flex-1 text-[12px] font-semibold leading-tight " + escape(collapsed ? "lg:hidden" : "", true)}">${escape(group.label)}</span> <svg class="${"w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-400 transition-transform duration-200 " + escape(expanded[group.label] ? "rotate-180" : "", true) + " " + escape(collapsed ? "lg:hidden" : "", true)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${expanded[group.label] ? `<div class="${"pb-2 pl-2 pr-1.5 space-y-0.5 " + escape(collapsed ? "lg:hidden" : "", true)}">${each(group.items, (item) => {
      return `<a${add_attribute("href", item.href, 0)}${add_attribute("data-nav-active", activeHrefs.has(item.href), 0)}${add_attribute("title", item.label, 0)} class="${"flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-lg text-[12px] transition-colors border-l-2 " + escape(
        activeHrefs.has(item.href) ? "bg-blue-600 text-white font-semibold border-blue-400 shadow-sm" : "text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white border-transparent",
        true
      )}"><span class="text-sm shrink-0">${escape(item.icon)}</span> <span class="truncate">${escape(item.label)}</span> </a>`;
    })} </div>` : ``} </div>`;
  })}</nav>  <div class="p-3.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/30 shrink-0 space-y-2.5"><button type="button" class="${"w-full flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900 dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors " + escape(
    collapsed ? "lg:justify-center lg:px-0" : "justify-between",
    true
  )}"${add_attribute(
    "title",
    $theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    0
  )}><span class="flex items-center gap-2 text-[11px] font-semibold"><span>${escape($theme === "dark" ? "🌙" : "☀️")}</span> <span${add_attribute("class", collapsed ? "lg:hidden" : "", 0)}>${escape($theme === "dark" ? "Dark mode" : "Light mode")}</span></span> <span class="${"text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 " + escape(collapsed ? "lg:hidden" : "", true)}">Theme</span></button> <div class="${"flex items-center gap-3 " + escape(collapsed ? "lg:justify-center" : "", true)}"><div class="w-9 h-9 shrink-0 rounded-full bg-blue-100 dark:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30 text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div class="${"flex-1 min-w-0 " + escape(collapsed ? "lg:hidden" : "", true)}"><p class="text-xs font-semibold text-gray-900 dark:text-white truncate">${escape($user.name)}</p> <p class="text-[10px] text-gray-500 dark:text-slate-400 truncate">${escape($user.email)}</p></div> <a href="/settings" class="${"text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 text-xs " + escape(collapsed ? "lg:hidden" : "", true)}" title="Account settings">⚙️</a></div></div></aside>`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let unreadAlerts;
  let $systemAlerts, $$unsubscribe_systemAlerts;
  let $user, $$unsubscribe_user;
  let $theme, $$unsubscribe_theme;
  $$unsubscribe_systemAlerts = subscribe(systemAlerts, (value) => $systemAlerts = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  let { isSidebarOpen = false } = $$props;
  let { sidebarCollapsed = false } = $$props;
  createEventDispatcher();
  if ($$props.isSidebarOpen === void 0 && $$bindings.isSidebarOpen && isSidebarOpen !== void 0) $$bindings.isSidebarOpen(isSidebarOpen);
  if ($$props.sidebarCollapsed === void 0 && $$bindings.sidebarCollapsed && sidebarCollapsed !== void 0) $$bindings.sidebarCollapsed(sidebarCollapsed);
  unreadAlerts = $systemAlerts.filter((alert) => !alert.read);
  $$unsubscribe_systemAlerts();
  $$unsubscribe_user();
  $$unsubscribe_theme();
  return `<header class="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm transition-colors"> <div class="flex items-center gap-3"><button type="button" class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none" aria-label="Toggle navigation" data-svelte-h="svelte-737g6j"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <button type="button" class="hidden lg:inline-flex p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none"${add_attribute("aria-label", sidebarCollapsed ? "Open sidebar" : "Collapse sidebar", 0)}${add_attribute("title", sidebarCollapsed ? "Open sidebar" : "Collapse sidebar", 0)}>${sidebarCollapsed ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7"></path></svg>` : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"></path></svg>`}</button> <div class="hidden sm:block"><span class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20">${escape($user.role.replace("_", " "))}</span></div></div>  <div class="flex items-center gap-1.5 sm:gap-3"> <button type="button" class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"${add_attribute(
    "title",
    $theme === "dark" ? "Switch to light mode" : "Switch to dark mode",
    0
  )} aria-label="Toggle color theme">${$theme === "dark" ? `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path></svg>` : `<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`}</button>  <div class="relative"><button type="button" class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-200 dark:border-slate-700" title="Simulate another role"><span class="text-sm" data-svelte-h="svelte-7wg2e0">🎭</span> <span class="hidden md:inline" data-svelte-h="svelte-1f9t4t3">Role:</span> <span class="font-bold text-blue-700 dark:text-blue-300">${escape($user.role.replace("_", " "))}</span> <svg class="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${``}</div>  <div class="relative"><button type="button" class="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors" aria-label="Notifications"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> ${unreadAlerts.length > 0 ? `<span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">${escape(unreadAlerts.length)}</span>` : ``}</button> ${``}</div>  <div class="relative"><button type="button" class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"><div class="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div class="hidden md:block text-left text-xs"><p class="font-semibold text-gray-800 dark:text-white leading-tight">${escape($user.name)}</p> <p class="text-[10px] text-gray-500 dark:text-slate-400 leading-tight">${escape($user.email)}</p></div></button> ${``}</div></div></header>`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isSidebarOpen = false;
  let isSidebarCollapsed = false;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 antialiased transition-colors"> ${validate_component(Sidebar, "Sidebar").$$render(
      $$result,
      {
        isOpen: isSidebarOpen,
        collapsed: isSidebarCollapsed
      },
      {
        isOpen: ($$value) => {
          isSidebarOpen = $$value;
          $$settled = false;
        },
        collapsed: ($$value) => {
          isSidebarCollapsed = $$value;
          $$settled = false;
        }
      },
      {}
    )}  <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden"> ${validate_component(Header, "Header").$$render(
      $$result,
      {
        sidebarCollapsed: isSidebarCollapsed,
        isSidebarOpen
      },
      {
        isSidebarOpen: ($$value) => {
          isSidebarOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}  <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8"><div class="max-w-7xl mx-auto space-y-6">${slots.default ? slots.default({}) : ``}</div></main></div></div>`;
  } while (!$$settled);
  return $$rendered;
});
const Layout = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(AppShell, "AppShell").$$render($$result, {}, {}, {
    default: () => {
      return `${slots.default ? slots.default({}) : ``}`;
    }
  })}`;
});
export {
  Layout as default
};
