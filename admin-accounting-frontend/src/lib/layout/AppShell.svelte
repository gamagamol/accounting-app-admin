<script lang="ts">
	import Sidebar from './Sidebar.svelte';
	import Header from './Header.svelte';

	let isSidebarOpen = false;
	let isSidebarCollapsed = false;
</script>

<div class="min-h-screen flex bg-slate-50 dark:bg-slate-950 font-sans text-slate-800 dark:text-slate-200 antialiased transition-colors">
	<!-- Sidebar -->
	<Sidebar bind:isOpen={isSidebarOpen} bind:collapsed={isSidebarCollapsed} />

	<!-- Main Content Container -->
	<div class="flex-1 flex flex-col min-w-0 h-screen overflow-hidden">
		<!-- Header -->
		<Header
			bind:isSidebarOpen
			sidebarCollapsed={isSidebarCollapsed}
			on:toggleSidebar={(e) => (isSidebarOpen = e.detail)}
			on:toggleSidebarCollapse={() => (isSidebarCollapsed = !isSidebarCollapsed)}
		/>

		<!-- Scrollable Main View -->
		<main class="flex-1 overflow-y-auto p-4 sm:p-6 lg:p-8">
			<div class="max-w-7xl mx-auto space-y-6">
				<slot />
			</div>
		</main>
	</div>
</div>
