import { c as create_ssr_component, s as subscribe, e as escape, b as each, d as add_attribute, f as createEventDispatcher, v as validate_component } from "../../chunks/ssr.js";
import { p as page } from "../../chunks/stores.js";
import { u as user } from "../../chunks/auth.js";
import { a as appSettings, s as systemAlerts } from "../../chunks/dataStore.js";
const Sidebar = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  let $user, $$unsubscribe_user;
  let $appSettings, $$unsubscribe_appSettings;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_appSettings = subscribe(appSettings, (value) => $appSettings = value);
  let { isOpen = false } = $$props;
  const sections = [
    {
      title: "Master Data",
      icon: "📁",
      items: [
        {
          label: "Data Produk",
          href: "/product",
          icon: "📦",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "OWNER"]
        },
        {
          label: "Data Customer",
          href: "/customer",
          icon: "👥",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Bagan Akun (COA)",
          href: "/coa",
          icon: "📑",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Data Supplier",
          href: "/supplier",
          icon: "🚚",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "OWNER"]
        },
        {
          label: "Data Pegawai",
          href: "/employee",
          icon: "🪪",
          roles: ["SUPER_ADMIN", "OWNER"]
        }
      ]
    },
    {
      title: "Transaksi",
      icon: "💳",
      items: [
        {
          label: "Penawaran (Quotation)",
          href: "/quotation",
          icon: "📄",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "OWNER"]
        },
        {
          label: "Pesanan (Sales Order)",
          href: "/sales",
          icon: "🛒",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "OWNER"]
        },
        {
          label: "Pembelian (PO)",
          href: "/purchase",
          icon: "🛍️",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "OWNER"]
        },
        {
          label: "Penerimaan (Goods)",
          href: "/goods",
          icon: "📥",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Pengiriman (Delivery)",
          href: "/delivery",
          icon: "🚚",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Faktur Tagihan (Bill)",
          href: "/bill",
          icon: "🧾",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Pelunasan Piutang",
          href: "/payment",
          icon: "💵",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Bayar Hutang Vendor",
          href: "/debt-payment",
          icon: "🏦",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        }
      ]
    },
    {
      title: "Laporan & Akuntansi",
      icon: "📊",
      items: [
        {
          label: "Pusat Laporan (Reports)",
          href: "/report",
          icon: "📈",
          roles: ["SUPER_ADMIN", "SALES_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        },
        {
          label: "Buku Besar (Ledger)",
          href: "/ledger",
          icon: "📚",
          roles: ["SUPER_ADMIN", "ACCOUNTING_ADMIN", "OWNER"]
        }
      ]
    },
    {
      title: "Sistem & Konfigurasi",
      icon: "⚙️",
      items: [
        {
          label: "Pengaturan & Profil",
          href: "/settings",
          icon: "⚙️"
        },
        {
          label: "Manajemen Pengguna",
          href: "/settings?tab=users",
          icon: "🔐",
          roles: ["SUPER_ADMIN"]
        }
      ]
    }
  ];
  function canAccess(itemRoles) {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes($user.role);
  }
  function isActive(href) {
    if (href === "/dashboard") {
      return $page.url.pathname === "/dashboard" || $page.url.pathname === "/";
    }
    const cleanHref = href.split("?")[0];
    return $page.url.pathname.startsWith(cleanHref);
  }
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  $$unsubscribe_page();
  $$unsubscribe_user();
  $$unsubscribe_appSettings();
  return ` ${isOpen ? `<button type="button" aria-label="Tutup sidebar" class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden border-0 cursor-default"></button>` : ``}  <aside class="${"fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none " + escape(
    isOpen ? "translate-x-0" : "-translate-x-full lg:translate-x-0",
    true
  )}"> <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40"><a href="/dashboard" class="flex items-center gap-3 group"><div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform" data-svelte-h="svelte-475jb3">BY</div> <div><span class="text-sm font-extrabold tracking-wide text-white block leading-tight" data-svelte-h="svelte-86q6rk">ACCOUNTING ERP</span> <span class="text-[10px] text-slate-400 block leading-tight truncate max-w-[150px]">${escape($appSettings.companyName)}</span></div></a> <button type="button" class="lg:hidden text-slate-400 hover:text-white p-1" aria-label="Close sidebar" data-svelte-h="svelte-1eh37qb">✕</button></div>  <div class="px-5 py-3 bg-slate-800/40 border-b border-slate-800/80 flex items-center justify-between"><div class="flex items-center gap-2" data-svelte-h="svelte-6782e6"><span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span> <span class="text-xs font-medium text-slate-300">Akses Pengguna:</span></div> <span class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">${escape($user.role.replace("_", " "))}</span></div>  <nav class="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar text-sm"> <div><a href="/dashboard" class="${"flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all " + escape(
    isActive("/dashboard") ? "bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold" : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
    true
  )}"><span class="text-base" data-svelte-h="svelte-1j6xj25">📊</span> <span data-svelte-h="svelte-xyitl2">Dashboard</span></a></div>  ${each(sections, (section) => {
    let visibleItems = section.items.filter((item) => canAccess(item.roles));
    return ` ${visibleItems.length > 0 ? `<div><div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2"><span>${escape(section.icon)}</span> <span>${escape(section.title)}</span></div> <div class="space-y-1">${each(visibleItems, (item) => {
      return `<a${add_attribute("href", item.href, 0)} class="${"flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-colors " + escape(
        isActive(item.href) ? "bg-blue-600 text-white font-semibold shadow-xs" : "text-slate-300 hover:bg-slate-800/70 hover:text-white",
        true
      )}"><span class="text-sm">${escape(item.icon)}</span> <span class="truncate">${escape(item.label)}</span> </a>`;
    })}</div> </div>` : ``}`;
  })}</nav>  <div class="p-4 border-t border-slate-800 bg-slate-950/30"><div class="flex items-center gap-3"><div class="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-xs">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div class="flex-1 min-w-0"><p class="text-xs font-semibold text-white truncate">${escape($user.name)}</p> <p class="text-[10px] text-slate-400 truncate">${escape($user.email)}</p></div> <a href="/settings" class="text-slate-400 hover:text-white p-1 text-xs" title="Pengaturan Akun" data-svelte-h="svelte-1ezmlw8">⚙️</a></div></div></aside>`;
});
const Header = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let unreadAlerts;
  let $systemAlerts, $$unsubscribe_systemAlerts;
  let $user, $$unsubscribe_user;
  $$unsubscribe_systemAlerts = subscribe(systemAlerts, (value) => $systemAlerts = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let { isSidebarOpen = false } = $$props;
  createEventDispatcher();
  if ($$props.isSidebarOpen === void 0 && $$bindings.isSidebarOpen && isSidebarOpen !== void 0) $$bindings.isSidebarOpen(isSidebarOpen);
  unreadAlerts = $systemAlerts.filter((a) => !a.read);
  $$unsubscribe_systemAlerts();
  $$unsubscribe_user();
  return `<header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs"> <div class="flex items-center gap-3"><button type="button" class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden focus:outline-none" aria-label="Toggle menu" data-svelte-h="svelte-1hlhp0d"><svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16"></path></svg></button> <div class="hidden sm:block"><span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">${escape($user.role.replace("_", " "))}</span></div></div>  <div class="flex items-center gap-2 sm:gap-4"> <div class="relative"><button type="button" class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200" title="Simulasi Ganti Role"><span class="text-sm" data-svelte-h="svelte-7wg2e0">🎭</span> <span class="hidden md:inline" data-svelte-h="svelte-vdfyyi">Ganti Role:</span> <span class="font-bold text-blue-700">${escape($user.role.replace("_", " "))}</span> <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${``}</div>  <div class="relative"><button type="button" class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors" aria-label="Pemberitahuan"><svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg> ${unreadAlerts.length > 0 ? `<span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">${escape(unreadAlerts.length)}</span>` : ``}</button> ${``}</div>  <div class="relative"><button type="button" class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"><div class="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xs">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div class="hidden md:block text-left text-xs"><p class="font-semibold text-gray-800 leading-tight">${escape($user.name)}</p> <p class="text-[10px] text-gray-500 leading-tight">${escape($user.email)}</p></div></button> ${``}</div></div></header>`;
});
const AppShell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let isSidebarOpen = false;
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="min-h-screen flex bg-slate-50 font-sans text-slate-800 antialiased"> ${validate_component(Sidebar, "Sidebar").$$render(
      $$result,
      { isOpen: isSidebarOpen },
      {
        isOpen: ($$value) => {
          isSidebarOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}  <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden"> ${validate_component(Header, "Header").$$render(
      $$result,
      { isSidebarOpen },
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
