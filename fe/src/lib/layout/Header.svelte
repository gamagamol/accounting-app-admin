<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { user, switchRole } from '$lib/stores/auth';
  import { systemAlerts, alertActions } from '$lib/stores/dataStore';
  import type { UserRole } from '$lib/types';

  export let isSidebarOpen: boolean = false;

  const dispatch = createEventDispatcher();

  let showNotifications: boolean = false;
  let showUserMenu: boolean = false;
  let showRoleSelector: boolean = false;

  const availableRoles: { role: UserRole; label: string; desc: string }[] = [
    { role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Akses penuh seluruh modul sistem' },
    { role: 'SALES_ADMIN', label: 'Sales Admin', desc: 'Akses Penjualan, Customer, Quotation' },
    { role: 'ACCOUNTING_ADMIN', label: 'Accounting Admin', desc: 'Akses Keuangan, COA, Bill, Laporan' },
    { role: 'OWNER', label: 'Owner / Direksi', desc: 'Akses Laporan & Dashboard Pemantauan' }
  ];

  $: unreadAlerts = $systemAlerts.filter((a) => !a.read);

  function toggleSidebar() {
    isSidebarOpen = !isSidebarOpen;
    dispatch('toggleSidebar', isSidebarOpen);
  }

  function handleSwitchRole(newRole: UserRole) {
    switchRole(newRole);
    showRoleSelector = false;
  }
</script>

<header class="h-16 bg-white border-b border-gray-200 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-xs">
  <!-- Left Side: Mobile Menu Button & Title -->
  <div class="flex items-center gap-3">
    <button
      type="button"
      on:click={toggleSidebar}
      class="p-2 rounded-lg text-gray-500 hover:text-gray-700 hover:bg-gray-100 lg:hidden focus:outline-none"
      aria-label="Toggle menu"
    >
      <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
      </svg>
    </button>

    <div class="hidden sm:block">
      <span class="text-xs font-semibold uppercase tracking-wider text-blue-600 bg-blue-50 px-2.5 py-1 rounded-full border border-blue-200">
        {$user.role.replace('_', ' ')}
      </span>
    </div>
  </div>

  <!-- Right Side: Role Selector, Notifications, User Menu -->
  <div class="flex items-center gap-2 sm:gap-4">
    <!-- Role Switcher (Simulation) -->
    <div class="relative">
      <button
        type="button"
        on:click={() => (showRoleSelector = !showRoleSelector)}
        class="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium text-gray-700 bg-gray-100 hover:bg-gray-200 rounded-lg transition-colors border border-gray-200"
        title="Simulasi Ganti Role"
      >
        <span class="text-sm">🎭</span>
        <span class="hidden md:inline">Ganti Role:</span>
        <span class="font-bold text-blue-700">{$user.role.replace('_', ' ')}</span>
        <svg class="w-3.5 h-3.5 text-gray-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
        </svg>
      </button>

      {#if showRoleSelector}
        <div
          class="absolute right-0 mt-2 w-64 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50 animate-in fade-in slide-in-from-top-2"
        >
          <div class="px-3 py-1 text-xs font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 mb-1">
            Pilih Role Pengguna
          </div>
          {#each availableRoles as item}
            <button
              type="button"
              on:click={() => handleSwitchRole(item.role)}
              class="w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-blue-50 transition-colors
                     {$user.role === item.role ? 'bg-blue-50/70 border-l-4 border-blue-600 pl-2' : ''}"
            >
              <span class="font-bold text-gray-900">
                {item.label}
                {#if $user.role === item.role}
                  <span class="text-blue-600 ml-1">✓</span>
                {/if}
              </span>
              <span class="text-gray-500 text-[11px] mt-0.5">{item.desc}</span>
            </button>
          {/each}
        </div>
      {/if}
    </div>

    <!-- Notification Dropdown -->
    <div class="relative">
      <button
        type="button"
        on:click={() => (showNotifications = !showNotifications)}
        class="relative p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
        aria-label="Pemberitahuan"
      >
        <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
        </svg>
        {#if unreadAlerts.length > 0}
          <span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white">
            {unreadAlerts.length}
          </span>
        {/if}
      </button>

      {#if showNotifications}
        <div class="absolute right-0 mt-2 w-80 sm:w-96 bg-white rounded-xl shadow-xl border border-gray-200 py-2 z-50">
          <div class="px-4 py-2 border-b border-gray-100 flex items-center justify-between">
            <h4 class="text-sm font-bold text-gray-800">Alerts & Notifikasi</h4>
            <span class="text-xs text-gray-500 font-mono">{unreadAlerts.length} Belum Dibaca</span>
          </div>
          <div class="max-h-72 overflow-y-auto divide-y divide-gray-100">
            {#if $systemAlerts.length === 0}
              <div class="p-6 text-center text-xs text-gray-400">Tidak ada notifikasi</div>
            {:else}
              {#each $systemAlerts as alert}
                <div class="p-3 hover:bg-gray-50 transition-colors text-xs flex gap-3 {alert.read ? 'opacity-60' : ''}">
                  <div class="mt-0.5">
                    {#if alert.type === 'debt'}
                      <span class="p-1.5 bg-red-100 text-red-600 rounded-lg inline-block">⚠️</span>
                    {:else if alert.type === 'receivable'}
                      <span class="p-1.5 bg-amber-100 text-amber-600 rounded-lg inline-block">🔔</span>
                    {:else}
                      <span class="p-1.5 bg-blue-100 text-blue-600 rounded-lg inline-block">ℹ️</span>
                    {/if}
                  </div>
                  <div class="flex-1">
                    <p class="font-bold text-gray-800">{alert.title}</p>
                    <p class="text-gray-600 mt-0.5">{alert.message}</p>
                    <div class="mt-1 flex items-center gap-2">
                      <a href={alert.link} on:click={() => (showNotifications = false)} class="text-blue-600 hover:underline font-semibold">
                        Lihat Data &rarr;
                      </a>
                      {#if !alert.read}
                        <button
                          type="button"
                          on:click={() => alertActions.markAsRead(alert.id)}
                          class="text-gray-400 hover:text-gray-700"
                        >
                          Tandai Dibaca
                        </button>
                      {/if}
                    </div>
                  </div>
                </div>
              {/each}
            {/if}
          </div>
        </div>
      {/if}
    </div>

    <!-- User Profile Dropdown -->
    <div class="relative">
      <button
        type="button"
        on:click={() => (showUserMenu = !showUserMenu)}
        class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 transition-colors"
      >
        <div class="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-xs">
          {$user.name ? $user.name.charAt(0) : 'U'}
        </div>
        <div class="hidden md:block text-left text-xs">
          <p class="font-semibold text-gray-800 leading-tight">{$user.name}</p>
          <p class="text-[10px] text-gray-500 leading-tight">{$user.email}</p>
        </div>
      </button>

      {#if showUserMenu}
        <div class="absolute right-0 mt-2 w-56 bg-white rounded-xl shadow-xl border border-gray-200 py-1.5 z-50">
          <div class="px-4 py-2 border-b border-gray-100">
            <p class="text-xs font-bold text-gray-900">{$user.name}</p>
            <p class="text-[11px] text-gray-500">{$user.email}</p>
            <span class="inline-block mt-1 text-[10px] font-semibold text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
              {$user.role.replace('_', ' ')}
            </span>
          </div>

          <a
            href="/settings"
            on:click={() => (showUserMenu = false)}
            class="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <span>⚙️</span>
            <span>Pengaturan Akun & Profil</span>
          </a>

          <a
            href="/settings?tab=users"
            on:click={() => (showUserMenu = false)}
            class="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 hover:bg-gray-50"
          >
            <span>👥</span>
            <span>Manajemen Pengguna (User)</span>
          </a>

          <div class="border-t border-gray-100 my-1"></div>

          <button
            type="button"
            on:click={() => {
              showUserMenu = false;
              alert('Anda telah keluar dari sesi.');
            }}
            class="w-full text-left flex items-center gap-2 px-4 py-2 text-xs text-red-600 hover:bg-red-50"
          >
            <span>🚪</span>
            <span>Keluar (Logout)</span>
          </button>
        </div>
      {/if}
    </div>
  </div>
</header>
