<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import UserFormModal from './UserFormModal.svelte';
	import { systemUsers, deleteSystemUser, user } from '$lib/stores/auth';
	import type { User, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let userToEdit: User | null = null;

	const columns: TableColumn[] = [
		{ key: 'name', label: 'User Name', sortable: true },
		{ key: 'email', label: 'Email Address', sortable: true },
		{ key: 'role', label: 'Access Role', sortable: true, align: 'center' }
	];

	function openCreate() {
		userToEdit = null;
		isFormOpen = true;
	}

	function openEdit(u: User) {
		userToEdit = u;
		isFormOpen = true;
	}

	function handleDelete(u: User) {
		if (u.id === $user.id) {
			alert('You cannot delete the account that is currently active.');
			return;
		}
		if (confirm(`Are you sure you want to revoke access for ${u.name}?`)) {
			deleteSystemUser(u.id);
		}
	}

	function getRoleBadge(role: string) {
		switch (role) {
			case 'SUPER_ADMIN':
				return 'bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20';
			case 'SALES_ADMIN':
				return 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20';
			case 'ACCOUNTING_ADMIN':
				return 'bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20';
			case 'OWNER':
				return 'bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20';
			default:
				return 'bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700';
		}
	}
</script>

<div class="space-y-6">
	<div class="flex justify-between items-center gap-3 flex-wrap">
		<div>
			<h3 class="text-base font-bold text-gray-900 dark:text-white">System User Accounts</h3>
			<p class="text-xs text-gray-500 dark:text-slate-400">Manage staff accounts, module access rights and login credentials.</p>
		</div>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add New User</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$systemUsers}
		searchPlaceholder="Search users by name or email..."
		searchKeys={['name', 'email', 'role']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'role'}
				<span class="px-2.5 py-1 rounded-full text-xs font-bold border {getRoleBadge(value)}">
					{value.replace('_', ' ')}
				</span>
			{:else}
				{column.format ? column.format(value, row) : value}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onEdit={() => openEdit(row)}
				editTitle="Edit user"
				onDelete={row.id !== $user.id ? () => handleDelete(row) : undefined}
				deleteTitle="Delete user"
			/>
		</svelte:fragment>
	</DataTable>

	<UserFormModal bind:isOpen={isFormOpen} {userToEdit} />
</div>
