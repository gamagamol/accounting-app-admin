<script lang="ts">
	import { page } from '$app/stores';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Tabs from '$lib/components/ui/Tabs.svelte';
	import ProfileSettingsView from '$lib/modules/settings/ProfileSettingsView.svelte';
	import CompanySettingsView from '$lib/modules/settings/CompanySettingsView.svelte';
	import UserManagementView from '$lib/modules/settings/UserManagementView.svelte';
	import AppearanceSettingsView from '$lib/modules/settings/AppearanceSettingsView.svelte';
	import { user } from '$lib/stores/auth';
	import type { TabItem } from '$lib/types';

	$: tabs = [
		{ id: 'profile', label: 'My Profile', icon: '👤' },
		{ id: 'company', label: 'Company & Tax Profile', icon: '🏢' },
		{ id: 'appearance', label: 'Appearance & Theme', icon: '🎨' },
		...($user.role === 'SUPER_ADMIN'
			? [{ id: 'users', label: 'User Management', icon: '👥' }]
			: [])
	] as TabItem[];

	let activeTab = $page.url.searchParams.get('tab') || 'profile';
</script>

<div class="space-y-6">
	<PageHeader
		title="System & User Settings"
		description="Configure staff accounts, official company profile, tax information and workspace appearance."
	/>

	<Tabs {tabs} bind:activeTab />

	<div class="pt-2">
		{#if activeTab === 'profile'}
			<ProfileSettingsView />
		{:else if activeTab === 'company'}
			<CompanySettingsView />
		{:else if activeTab === 'appearance'}
			<AppearanceSettingsView />
		{:else if activeTab === 'users'}
			<UserManagementView />
		{/if}
	</div>
</div>
