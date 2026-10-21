<script lang="ts">
  import { page } from '$app/stores';
  import { user } from '$lib/stores/auth';
  import { appSettings } from '$lib/stores/dataStore';
  import type { UserRole } from '$lib/types';

  export let isOpen: boolean = false;

  interface NavSubItem {
    label: string;
    href: string;
    icon: string;
    roles?: UserRole[];
  }

  interface NavSection {
    title: string;
    icon: string;
    items: NavSubItem[];
  }

  const sections: NavSection[] = [
    {
      title: 'Master Data',
      icon: '📁',
      items: [
        { label: 'Data Produk', href: '/product', icon: '📦', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'OWNER'] },
        { label: 'Data Customer', href: '/customer', icon: '👥', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Bagan Akun (COA)', href: '/coa', icon: '📑', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Data Supplier', href: '/supplier', icon: '🚚', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'OWNER'] },
        { label: 'Data Pegawai', href: '/employee', icon: '🪪', roles: ['SUPER_ADMIN', 'OWNER'] }
      ]
    },
    {
      title: 'Transaksi',
      icon: '💳',
      items: [
        { label: 'Penawaran (Quotation)', href: '/quotation', icon: '📄', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'OWNER'] },
        { label: 'Pesanan (Sales Order)', href: '/sales', icon: '🛒', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'OWNER'] },
        { label: 'Pembelian (PO)', href: '/purchase', icon: '🛍️', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'OWNER'] },
        { label: 'Penerimaan (Goods)', href: '/goods', icon: '📥', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Pengiriman (Delivery)', href: '/delivery', icon: '🚚', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Faktur Tagihan (Bill)', href: '/bill', icon: '🧾', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Pelunasan Piutang', href: '/payment', icon: '💵', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Bayar Hutang Vendor', href: '/debt-payment', icon: '🏦', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] }
      ]
    },
    {
      title: 'Laporan & Akuntansi',
      icon: '📊',
      items: [
        { label: 'Pusat Laporan (Reports)', href: '/report', icon: '📈', roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] },
        { label: 'Buku Besar (Ledger)', href: '/ledger', icon: '📚', roles: ['SUPER_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'] }
      ]
    },
    {
      title: 'Sistem & Konfigurasi',
      icon: '⚙️',
      items: [
        { label: 'Pengaturan & Profil', href: '/settings', icon: '⚙️' },
        { label: 'Manajemen Pengguna', href: '/settings?tab=users', icon: '🔐', roles: ['SUPER_ADMIN'] }
      ]
    }
  ];

  function canAccess(itemRoles?: UserRole[]) {
    if (!itemRoles || itemRoles.length === 0) return true;
    return itemRoles.includes($user.role);
  }

  function isActive(href: string) {
    if (href === '/dashboard') {
      return $page.url.pathname === '/dashboard' || $page.url.pathname === '/';
    }
    const cleanHref = href.split('?')[0];
    return $page.url.pathname.startsWith(cleanHref);
  }
</script>

<!-- Mobile Backdrop -->
{#if isOpen}
  <button
    type="button"
    aria-label="Tutup sidebar"
    class="fixed inset-0 bg-slate-900/60 backdrop-blur-xs z-40 lg:hidden border-0 cursor-default"
    on:click={() => (isOpen = false)}
  ></button>
{/if}

<!-- Sidebar Container -->
<aside
  class="fixed lg:static inset-y-0 left-0 z-50 w-72 bg-slate-900 text-slate-100 flex flex-col transition-transform duration-300 ease-in-out shadow-2xl lg:shadow-none
         {isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
>
  <!-- Brand Header -->
  <div class="h-16 flex items-center justify-between px-6 border-b border-slate-800 bg-slate-950/40">
    <a href="/dashboard" class="flex items-center gap-3 group">
      <div class="w-9 h-9 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform">
        BY
      </div>
      <div>
        <span class="text-sm font-extrabold tracking-wide text-white block leading-tight">ACCOUNTING ERP</span>
        <span class="text-[10px] text-slate-400 block leading-tight truncate max-w-[150px]">{$appSettings.companyName}</span>
      </div>
    </a>
    <button
      type="button"
      on:click={() => (isOpen = false)}
      class="lg:hidden text-slate-400 hover:text-white p-1"
      aria-label="Close sidebar"
    >
      ✕
    </button>
  </div>

  <!-- Role Badge in Sidebar -->
  <div class="px-5 py-3 bg-slate-800/40 border-b border-slate-800/80 flex items-center justify-between">
    <div class="flex items-center gap-2">
      <span class="w-2 h-2 rounded-full bg-emerald-400 animate-pulse"></span>
      <span class="text-xs font-medium text-slate-300">Akses Pengguna:</span>
    </div>
    <span class="text-[11px] font-bold text-blue-400 uppercase tracking-wider">
      {$user.role.replace('_', ' ')}
    </span>
  </div>

  <!-- Navigation Links -->
  <nav class="flex-1 px-4 py-4 space-y-6 overflow-y-auto custom-scrollbar text-sm">
    <!-- Single Dashboard Link -->
    <div>
      <a
        href="/dashboard"
        class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all
               {isActive('/dashboard')
                 ? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
                 : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}"
      >
        <span class="text-base">📊</span>
        <span>Dashboard</span>
      </a>
    </div>

    <!-- Grouped Sections -->
    {#each sections as section}
      {@const visibleItems = section.items.filter((item) => canAccess(item.roles))}
      {#if visibleItems.length > 0}
        <div>
          <div class="px-3 pb-2 text-[11px] font-bold uppercase tracking-wider text-slate-400 flex items-center gap-2">
            <span>{section.icon}</span>
            <span>{section.title}</span>
          </div>
          <div class="space-y-1">
            {#each visibleItems as item}
              <a
                href={item.href}
                class="flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs transition-colors
                       {isActive(item.href)
                         ? 'bg-blue-600 text-white font-semibold shadow-xs'
                         : 'text-slate-300 hover:bg-slate-800/70 hover:text-white'}"
              >
                <span class="text-sm">{item.icon}</span>
                <span class="truncate">{item.label}</span>
              </a>
            {/each}
          </div>
        </div>
      {/if}
    {/each}
  </nav>

  <!-- Sidebar Footer User Card -->
  <div class="p-4 border-t border-slate-800 bg-slate-950/30">
    <div class="flex items-center gap-3">
      <div class="w-9 h-9 rounded-full bg-blue-600/30 border border-blue-500/30 text-blue-300 flex items-center justify-center font-bold text-xs">
        {$user.name ? $user.name.charAt(0) : 'U'}
      </div>
      <div class="flex-1 min-w-0">
        <p class="text-xs font-semibold text-white truncate">{$user.name}</p>
        <p class="text-[10px] text-slate-400 truncate">{$user.email}</p>
      </div>
      <a href="/settings" class="text-slate-400 hover:text-white p-1 text-xs" title="Pengaturan Akun">
        ⚙️
      </a>
    </div>
  </div>
</aside>
