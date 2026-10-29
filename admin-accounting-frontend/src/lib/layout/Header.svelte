<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { user, switchRole } from '$lib/stores/auth';
	import { systemAlerts, alertActions } from '$lib/stores/dataStore';
	import {
		availableFiscalYears,
		currentFiscalYear,
		selectedFiscalYear
	} from '$lib/stores/fiscal';
	import { theme, toggleTheme } from '$lib/stores/theme';
	import type { UserRole } from '$lib/types';

	export let isSidebarOpen: boolean = false;
	export let sidebarCollapsed: boolean = false;

	const dispatch = createEventDispatcher();

	let showNotifications: boolean = false;
	let showUserMenu: boolean = false;
	let showRoleSelector: boolean = false;

	const availableRoles: { role: UserRole; label: string; desc: string }[] = [
		{ role: 'SUPER_ADMIN', label: 'Super Admin', desc: 'Full access to every module and setting' },
		{ role: 'SALES_ADMIN', label: 'Sales Admin', desc: 'Sales, customers and quotation access' },
		{ role: 'ACCOUNTING_ADMIN', label: 'Accounting Admin', desc: 'Finance, COA, invoices and reports' },
		{ role: 'OWNER', label: 'Owner / Director', desc: 'Read-only dashboards and management reports' }
	];

	$: unreadAlerts = $systemAlerts.filter((alert) => !alert.read);

	function toggleSidebar() {
		isSidebarOpen = !isSidebarOpen;
		dispatch('toggleSidebar', isSidebarOpen);
	}

	function handleSwitchRole(newRole: UserRole) {
		switchRole(newRole);
		showRoleSelector = false;
	}

	function handleFiscalYear(event: Event) {
		const value = Number((event.currentTarget as HTMLSelectElement).value);
		selectedFiscalYear.set(Number.isFinite(value) ? value : currentFiscalYear);
	}
</script>

<header
	class="h-16 bg-white dark:bg-slate-900 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between px-4 sm:px-6 sticky top-0 z-30 shadow-sm transition-colors"
>
	<!-- Left: sidebar controls + current role -->
	<div class="flex items-center gap-3">
		<button
			type="button"
			on:click={toggleSidebar}
			class="p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 lg:hidden focus:outline-none"
			aria-label="Toggle navigation"
		>
			<svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
				<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
			</svg>
		</button>

		<button
			type="button"
			on:click={() => dispatch('toggleSidebarCollapse')}
			class="hidden lg:inline-flex p-2 rounded-lg text-gray-500 hover:text-gray-700 dark:text-slate-400 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 focus:outline-none"
			aria-label={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
			title={sidebarCollapsed ? 'Open sidebar' : 'Collapse sidebar'}
		>
			{#if sidebarCollapsed}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				</svg>
			{/if}
		</button>

		<div class="hidden sm:block">
			<span
				class="text-xs font-semibold uppercase tracking-wider text-blue-600 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-1 rounded-full border border-blue-200 dark:border-blue-500/20"
			>
				{$user.role.replace('_', ' ')}
			</span>
		</div>
	</div>

	<!-- Right: actions -->
	<div class="flex items-center gap-1.5 sm:gap-3">
		<!-- Fiscal year selector -->
		<div class="flex items-center gap-1.5 sm:gap-2 rounded-lg border border-gray-200 dark:border-slate-700 bg-gray-50 dark:bg-slate-800 px-2 py-1.5 sm:px-2.5">
			<span class="hidden sm:inline text-[10px] font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">
				Fiscal Year
			</span>
			<select
				value={$selectedFiscalYear}
				on:change={handleFiscalYear}
				class="bg-transparent text-xs font-bold text-gray-800 dark:text-slate-100 focus:outline-none"
				aria-label="Select fiscal year"
			>
				<option value={currentFiscalYear}>Current Financial Year</option>
				{#each $availableFiscalYears.filter((year) => year !== currentFiscalYear) as year}
					<option value={year}>{year}</option>
				{/each}
			</select>
		</div>

		<!-- Theme -->
		<button
			type="button"
			on:click={toggleTheme}
			class="p-2 text-gray-500 dark:text-slate-400 hover:text-gray-800 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
			title={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
			aria-label="Toggle color theme"
		>
			{#if $theme === 'dark'}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v2m0 14v2m9-9h-2M5 12H3m15.364 6.364-1.414-1.414M6.05 6.05 4.636 4.636m12.728 0-1.414 1.414M6.05 17.95l-1.414 1.414M16 12a4 4 0 11-8 0 4 4 0 018 0z" />
				</svg>
			{:else}
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
				</svg>
			{/if}
		</button>

		<!-- Role switcher -->
		<div class="relative">
			<button
				type="button"
				on:click={() => (showRoleSelector = !showRoleSelector)}
				class="flex items-center gap-1.5 px-2.5 sm:px-3 py-1.5 text-xs font-medium text-gray-700 dark:text-slate-200 bg-gray-100 dark:bg-slate-800 hover:bg-gray-200 dark:hover:bg-slate-700 rounded-lg transition-colors border border-gray-200 dark:border-slate-700"
				title="Simulate another role"
			>
				<span class="text-sm">🎭</span>
				<span class="hidden md:inline">Role:</span>
				<span class="font-bold text-blue-700 dark:text-blue-300">{$user.role.replace('_', ' ')}</span>
				<svg class="w-3.5 h-3.5 text-gray-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
				</svg>
			</button>

			{#if showRoleSelector}
				<div
					class="absolute right-0 mt-2 w-72 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50"
				>
					<div class="px-3 py-1 text-[10px] font-semibold text-gray-400 uppercase tracking-wider border-b border-gray-100 dark:border-slate-800 mb-1">
						Select user role
					</div>
					{#each availableRoles as item}
						<button
							type="button"
							on:click={() => handleSwitchRole(item.role)}
							class="w-full text-left px-3 py-2 text-xs flex flex-col hover:bg-blue-50 dark:hover:bg-slate-800 transition-colors
							       {$user.role === item.role ? 'bg-blue-50/70 dark:bg-blue-500/10 border-l-4 border-blue-600 pl-2' : ''}"
						>
							<span class="font-bold text-gray-900 dark:text-white">
								{item.label}
								{#if $user.role === item.role}
									<span class="text-blue-600 dark:text-blue-300 ml-1">✓</span>
								{/if}
							</span>
							<span class="text-gray-500 dark:text-slate-400 text-[11px] mt-0.5">{item.desc}</span>
						</button>
					{/each}
				</div>
			{/if}
		</div>

		<!-- Notifications -->
		<div class="relative">
			<button
				type="button"
				on:click={() => (showNotifications = !showNotifications)}
				class="relative p-2 text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:bg-gray-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
				aria-label="Notifications"
			>
				<svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9" />
				</svg>
				{#if unreadAlerts.length > 0}
					<span class="absolute top-1 right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white ring-2 ring-white dark:ring-slate-900">
						{unreadAlerts.length}
					</span>
				{/if}
			</button>

			{#if showNotifications}
				<div class="absolute right-0 mt-2 w-80 sm:w-96 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-2 z-50">
					<div class="px-4 py-2 border-b border-gray-100 dark:border-slate-800 flex items-center justify-between">
						<h4 class="text-sm font-bold text-gray-800 dark:text-white">Alerts & Notifications</h4>
						<span class="text-xs text-gray-500 dark:text-slate-400 font-mono">{unreadAlerts.length} unread</span>
					</div>
					<div class="max-h-72 overflow-y-auto divide-y divide-gray-100 dark:divide-slate-800">
						{#if $systemAlerts.length === 0}
							<div class="p-6 text-center text-xs text-gray-400">No notifications</div>
						{:else}
							{#each $systemAlerts as alert}
								<div class="p-3 hover:bg-gray-50 dark:hover:bg-slate-800/60 transition-colors text-xs flex gap-3 {alert.read ? 'opacity-60' : ''}">
									<div class="mt-0.5">
										{#if alert.type === 'debt'}
											<span class="p-1.5 bg-red-100 dark:bg-red-500/15 text-red-600 dark:text-red-300 rounded-lg inline-block">⚠️</span>
										{:else if alert.type === 'receivable'}
											<span class="p-1.5 bg-amber-100 dark:bg-amber-500/15 text-amber-600 dark:text-amber-300 rounded-lg inline-block">🔔</span>
										{:else}
											<span class="p-1.5 bg-blue-100 dark:bg-blue-500/15 text-blue-600 dark:text-blue-300 rounded-lg inline-block">ℹ️</span>
										{/if}
									</div>
									<div class="flex-1">
										<p class="font-bold text-gray-800 dark:text-white">{alert.title}</p>
										<p class="text-gray-600 dark:text-slate-400 mt-0.5">{alert.message}</p>
										<div class="mt-1 flex items-center gap-2">
											<a
												href={alert.link}
												on:click={() => (showNotifications = false)}
												class="text-blue-600 dark:text-blue-300 hover:underline font-semibold"
											>
												View data →
											</a>
											{#if !alert.read}
												<button
													type="button"
													on:click={() => alertActions.markAsRead(alert.id)}
													class="text-gray-400 hover:text-gray-700 dark:hover:text-white"
												>
													Mark as read
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

		<!-- User menu -->
		<div class="relative">
			<button
				type="button"
				on:click={() => (showUserMenu = !showUserMenu)}
				class="flex items-center gap-2 p-1.5 rounded-lg hover:bg-gray-100 dark:hover:bg-slate-800 transition-colors"
			>
				<div class="h-8 w-8 bg-gradient-to-br from-blue-600 to-indigo-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-sm">
					{$user.name ? $user.name.charAt(0) : 'U'}
				</div>
				<div class="hidden md:block text-left text-xs">
					<p class="font-semibold text-gray-800 dark:text-white leading-tight">{$user.name}</p>
					<p class="text-[10px] text-gray-500 dark:text-slate-400 leading-tight">{$user.email}</p>
				</div>
			</button>

			{#if showUserMenu}
				<div class="absolute right-0 mt-2 w-60 bg-white dark:bg-slate-900 rounded-xl shadow-xl border border-gray-200 dark:border-slate-800 py-1.5 z-50">
					<div class="px-4 py-2 border-b border-gray-100 dark:border-slate-800">
						<p class="text-xs font-bold text-gray-900 dark:text-white">{$user.name}</p>
						<p class="text-[11px] text-gray-500 dark:text-slate-400">{$user.email}</p>
						<span class="inline-block mt-1 text-[10px] font-semibold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2 py-0.5 rounded">
							{$user.role.replace('_', ' ')}
						</span>
					</div>

					<a href="/settings" on:click={() => (showUserMenu = false)} class="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">
						<span>⚙️</span><span>Account & profile settings</span>
					</a>
					<a href="/settings?tab=appearance" on:click={() => (showUserMenu = false)} class="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">
						<span>🎨</span><span>Appearance & theme</span>
					</a>
					<a href="/settings?tab=users" on:click={() => (showUserMenu = false)} class="flex items-center gap-2 px-4 py-2 text-xs text-gray-700 dark:text-slate-200 hover:bg-gray-50 dark:hover:bg-slate-800">
						<span>👥</span><span>User management</span>
					</a>
				</div>
			{/if}
		</div>
	</div>
</header>
