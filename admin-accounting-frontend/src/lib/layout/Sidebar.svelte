<script lang="ts">
	import { page } from '$app/stores';
	import { tick } from 'svelte';
	import { user } from '$lib/stores/auth';
	import { appSettings } from '$lib/stores/dataStore';
	import { navGroups, mainNavItems } from '$lib/data/navigation';
	import { theme, toggleTheme } from '$lib/stores/theme';

	export let isOpen: boolean = false;
	export let collapsed: boolean = false;

	let expanded: Record<string, boolean> = {};
	let navEl: HTMLElement;
	let lastRouteKey = '';

	$: currentPath = $page.url.pathname;
	$: currentSearch = $page.url.search;
	$: routeKey = `${currentPath}${currentSearch}`;

	function routeMatches(href: string, path: string, search: string): boolean {
		const [hrefPath, query] = href.split('?');

		if (query) {
			return path === hrefPath && search.includes(query);
		}
		if (hrefPath === '/settings') {
			return (
				path === '/settings' &&
				!search.includes('tab=users') &&
				!search.includes('tab=appearance')
			);
		}
		if (hrefPath === '/dashboard') {
			return path === '/dashboard' || path === '/';
		}
		return path === hrefPath;
	}

	function buildActiveHrefs(path: string, search: string): Set<string> {
		return new Set(
			[...mainNavItems, ...navGroups.flatMap((group) => group.items)]
				.filter((item) => routeMatches(item.href, path, search))
				.map((item) => item.href)
		);
	}

	$: activeHrefs = buildActiveHrefs(currentPath, currentSearch);

	$: activeGroupLabel =
		navGroups.find((group) => group.items.some((item) => activeHrefs.has(item.href)))?.label ?? '';

	async function scrollActiveIntoView() {
		await tick();
		if (!navEl) return;

		const active = navEl.querySelector<HTMLElement>('[data-nav-active="true"]');
		if (!active) return;

		const navRect = navEl.getBoundingClientRect();
		const activeRect = active.getBoundingClientRect();
		const target =
			navEl.scrollTop + (activeRect.top - navRect.top) - (navEl.clientHeight - activeRect.height) / 2;

		navEl.scrollTo({ top: Math.max(0, target), behavior: 'smooth' });
	}

	// Keep the active module open and bring the active menu item into view
	// whenever the route (including query string) changes.
	$: if (routeKey && routeKey !== lastRouteKey) {
		lastRouteKey = routeKey;
		if (activeGroupLabel) {
			expanded = { ...expanded, [activeGroupLabel]: true };
		}
		scrollActiveIntoView();
	}

	function toggleGroup(label: string) {
		// In the compact desktop sidebar the group icon is the quickest way
		// to reopen the full sidebar on that section.
		if (collapsed) {
			collapsed = false;
			expanded = { ...expanded, [label]: true };
			scrollActiveIntoView();
			return;
		}

		expanded = { ...expanded, [label]: !expanded[label] };
		if (expanded[label]) scrollActiveIntoView();
	}

	function closeMobile() {
		isOpen = false;
	}
</script>

<!-- Mobile backdrop -->
{#if isOpen}
	<button
		type="button"
		aria-label="Close navigation"
		class="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-40 lg:hidden border-0 cursor-default"
		on:click={() => (isOpen = false)}
	></button>
{/if}

<aside
	class="fixed lg:static inset-y-0 left-0 z-50 w-72 h-screen shrink-0 flex flex-col overflow-hidden
	       bg-white dark:bg-slate-900 text-slate-700 dark:text-slate-100
	       border-r border-gray-200 dark:border-slate-800
	       transition-[width,transform] duration-300 ease-in-out shadow-2xl lg:shadow-none
	       {collapsed ? 'lg:w-20' : 'lg:w-72'}
	       {isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}"
>
	<!-- Brand -->
	<div
		class="h-16 flex items-center gap-2 px-3.5 border-b border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/40 shrink-0
		       {collapsed ? 'lg:justify-center lg:px-2' : 'justify-between'}"
	>
		<a href="/dashboard" class="flex items-center gap-3 min-w-0 group">
			<div
				class="w-9 h-9 shrink-0 rounded-xl bg-gradient-to-tr from-blue-600 to-indigo-500 flex items-center justify-center text-white font-black text-lg shadow-md group-hover:scale-105 transition-transform"
			>
				BY
			</div>
			<div class="min-w-0 {collapsed ? 'lg:hidden' : ''}">
				<span class="text-sm font-extrabold tracking-wide text-gray-900 dark:text-white block leading-tight">
					ACCOUNTING ERP
				</span>
				<span class="text-[10px] text-gray-500 dark:text-slate-400 block leading-tight truncate max-w-[160px]">
					{$appSettings.companyName}
				</span>
			</div>
		</a>

		<div class="flex items-center gap-1 shrink-0">
			<button
				type="button"
				on:click={() => (collapsed = !collapsed)}
				class="hidden lg:flex items-center justify-center p-1.5 rounded-lg text-gray-500 dark:text-slate-400
				       hover:text-gray-900 dark:hover:text-white hover:bg-gray-200/70 dark:hover:bg-slate-800 transition-colors
				       {collapsed ? 'lg:hidden' : ''}"
				title="Collapse sidebar"
				aria-label="Collapse sidebar"
			>
				<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
					<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
				</svg>
			</button>

			<button
				type="button"
				on:click={() => (isOpen = false)}
				class="lg:hidden text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 text-lg"
				aria-label="Close sidebar"
			>
				✕
			</button>
		</div>
	</div>

	<!-- Access badge -->
	<div
		class="px-3.5 py-2.5 bg-gray-50 dark:bg-slate-800/40 border-b border-gray-200 dark:border-slate-800/80 flex items-center justify-between shrink-0
		       {collapsed ? 'lg:hidden' : ''}"
	>
		<div class="flex items-center gap-2">
			<span class="w-2 h-2 rounded-full bg-emerald-500 dark:bg-emerald-400 animate-pulse"></span>
			<span class="text-[11px] font-medium text-gray-600 dark:text-slate-300">Access level</span>
		</div>
		<span class="text-[10px] font-bold text-blue-600 dark:text-blue-400 uppercase tracking-wider">
			{$user.role.replace('_', ' ')}
		</span>
	</div>

	<!-- Navigation -->
	<nav
		bind:this={navEl}
		class="flex-1 px-2.5 py-4 space-y-1.5 overflow-y-auto custom-scrollbar text-sm"
		aria-label="Main navigation"
	>
		{#each mainNavItems as item}
			<a
				href={item.href}
				on:click={closeMobile}
				data-nav-active={activeHrefs.has(item.href)}
				title={item.label}
				class="flex items-center gap-3 px-3.5 py-2.5 rounded-xl font-medium transition-all
				       {collapsed ? 'lg:justify-center lg:px-0' : ''}
				       {activeHrefs.has(item.href)
					? 'bg-blue-600 text-white shadow-md shadow-blue-600/30 font-semibold'
					: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'}"
			>
				<span class="text-base shrink-0">{item.icon}</span>
				<span class="{collapsed ? 'lg:hidden' : ''}">{item.label}</span>
			</a>
		{/each}

		<div class="pt-2 pb-1 px-3 {collapsed ? 'lg:hidden' : ''}">
			<p class="text-[10px] font-bold uppercase tracking-widest text-gray-400 dark:text-slate-500">Modules</p>
		</div>

		{#each navGroups as group}
			{@const active = activeGroupLabel === group.label}
			<div class="rounded-xl transition-colors {active ? 'bg-blue-50 dark:bg-slate-800/50' : ''}">
				<button
					type="button"
					on:click={() => toggleGroup(group.label)}
					class="w-full flex items-center gap-2.5 px-3 py-2.5 rounded-xl transition-colors text-left
					       {collapsed ? 'lg:justify-center lg:px-0' : ''}
					       {active
						? 'text-blue-700 dark:text-white'
						: 'text-gray-700 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-300 dark:hover:bg-slate-800/70 dark:hover:text-white'}"
					aria-expanded={!!expanded[group.label]}
					title={group.label}
				>
					<span class="text-base shrink-0">{group.icon}</span>
					<span class="flex-1 text-[12px] font-semibold leading-tight {collapsed ? 'lg:hidden' : ''}">
						{group.label}
					</span>
					<svg
						class="w-3.5 h-3.5 shrink-0 text-gray-400 dark:text-slate-400 transition-transform duration-200
						       {expanded[group.label] ? 'rotate-180' : ''} {collapsed ? 'lg:hidden' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if expanded[group.label]}
					<div class="pb-2 pl-2 pr-1.5 space-y-0.5 {collapsed ? 'lg:hidden' : ''}">
						{#each group.items as item}
							<a
								href={item.href}
								on:click={closeMobile}
								data-nav-active={activeHrefs.has(item.href)}
								title={item.label}
								class="flex items-center gap-2.5 pl-3 pr-2.5 py-2 rounded-lg text-[12px] transition-colors border-l-2
								       {activeHrefs.has(item.href)
									? 'bg-blue-600 text-white font-semibold border-blue-400 shadow-sm'
									: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900 dark:text-slate-400 dark:hover:bg-slate-800/70 dark:hover:text-white border-transparent'}"
							>
								<span class="text-sm shrink-0">{item.icon}</span>
								<span class="truncate">{item.label}</span>
							</a>
						{/each}
					</div>
				{/if}
			</div>
		{/each}
	</nav>

	<!-- Footer -->
	<div class="p-3.5 border-t border-gray-200 dark:border-slate-800 bg-gray-50 dark:bg-slate-950/30 shrink-0 space-y-2.5">
		<button
			type="button"
			on:click={toggleTheme}
			class="w-full flex items-center px-3 py-2 rounded-lg bg-gray-100 hover:bg-gray-200 text-gray-700 hover:text-gray-900
			       dark:bg-slate-800/60 dark:hover:bg-slate-800 dark:text-slate-300 dark:hover:text-white transition-colors
			       {collapsed ? 'lg:justify-center lg:px-0' : 'justify-between'}"
			title={$theme === 'dark' ? 'Switch to light mode' : 'Switch to dark mode'}
		>
			<span class="flex items-center gap-2 text-[11px] font-semibold">
				<span>{$theme === 'dark' ? '🌙' : '☀️'}</span>
				<span class="{collapsed ? 'lg:hidden' : ''}">{$theme === 'dark' ? 'Dark mode' : 'Light mode'}</span>
			</span>
			<span class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400 {collapsed ? 'lg:hidden' : ''}">
				Theme
			</span>
		</button>

		<div class="flex items-center gap-3 {collapsed ? 'lg:justify-center' : ''}">
			<div
				class="w-9 h-9 shrink-0 rounded-full bg-blue-100 dark:bg-blue-600/30 border border-blue-200 dark:border-blue-500/30
				       text-blue-700 dark:text-blue-300 flex items-center justify-center font-bold text-xs"
			>
				{$user.name ? $user.name.charAt(0) : 'U'}
			</div>
			<div class="flex-1 min-w-0 {collapsed ? 'lg:hidden' : ''}">
				<p class="text-xs font-semibold text-gray-900 dark:text-white truncate">{$user.name}</p>
				<p class="text-[10px] text-gray-500 dark:text-slate-400 truncate">{$user.email}</p>
			</div>
			<a
				href="/settings"
				class="text-gray-500 dark:text-slate-400 hover:text-gray-900 dark:hover:text-white p-1 text-xs {collapsed ? 'lg:hidden' : ''}"
				title="Account settings"
			>
				⚙️
			</a>
		</div>
	</div>
</aside>
