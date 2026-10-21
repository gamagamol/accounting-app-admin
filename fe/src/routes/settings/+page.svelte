<script lang="ts">
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import ProfileSettingsView from '$lib/modules/settings/ProfileSettingsView.svelte';
  import CompanySettingsView from '$lib/modules/settings/CompanySettingsView.svelte';
  import UserManagementView from '$lib/modules/settings/UserManagementView.svelte';
  import { user } from '$lib/stores/auth';
  import type { TabItem } from '$lib/types';

  $: tabs = [
    { id: 'profile', label: 'Profil Saya', icon: '👤' },
    { id: 'company', label: 'Profil Perusahaan & Pajak', icon: '🏢' },
    ...($user.role === 'SUPER_ADMIN'
      ? [{ id: 'users', label: 'Manajemen Pengguna (User Management)', icon: '👥' }]
      : [])
  ] as TabItem[];

  let activeTab = $page.url.searchParams.get('tab') || 'profile';
</script>

<div class="space-y-6">
  <PageHeader
    title="Pengaturan Sistem & Pengguna"
    description="Konfigurasi akun staf pengguna, profil resmi perusahaan, dan data administrasi"
  />

  <Tabs {tabs} bind:activeTab />

  <div class="pt-2">
    {#if activeTab === 'profile'}
      <ProfileSettingsView />
    {:else if activeTab === 'company'}
      <CompanySettingsView />
    {:else if activeTab === 'users'}
      <UserManagementView />
    {/if}
  </div>
</div>
