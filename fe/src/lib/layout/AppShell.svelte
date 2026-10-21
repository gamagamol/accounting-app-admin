<script lang="ts">
  import Sidebar from './Sidebar.svelte';
  import Header from './Header.svelte';

  let isSidebarOpen = false;
</script>

<div class="min-h-screen flex bg-slate-50 font-sans text-slate-800 antialiased">
  <!-- Sidebar -->
  <Sidebar bind:isOpen={isSidebarOpen} />

  <!-- Main Content Container -->
  <div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
    <!-- Header -->
    <Header bind:isSidebarOpen on:toggleSidebar={(e) => (isSidebarOpen = e.detail)} />

    <!-- Scrollable Main View -->
    <main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
      <div class="max-w-7xl mx-auto space-y-6">
        <slot />
      </div>
    </main>
  </div>
</div>