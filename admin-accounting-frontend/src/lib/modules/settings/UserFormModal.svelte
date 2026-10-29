<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import { addSystemUser, updateSystemUser } from '$lib/stores/auth';
	import type { User, UserRole } from '$lib/types';

	export let isOpen: boolean = false;
	export let userToEdit: User | null = null;

	let name = '';
	let email = '';
	let role: UserRole = 'SALES_ADMIN';
	let wasOpen = false;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (userToEdit) {
			name = userToEdit.name;
			email = userToEdit.email;
			role = userToEdit.role;
		} else {
			name = '';
			email = '';
			role = 'SALES_ADMIN';
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	function handleSubmit() {
		if (!name || !email) {
			alert('Name and email are required.');
			return;
		}

		if (userToEdit) {
			updateSystemUser(userToEdit.id, { name, email, role });
		} else {
			addSystemUser({ name, email, role, avatar: '' });
		}

		isOpen = false;
	}
</script>

<Modal bind:isOpen title={userToEdit ? 'Edit System User' : 'Add New User'} size="md">
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<FormField label="User Name" name="userName" required>
			<input id="userName" type="text" bind:value={name} placeholder="Full name" class={inputClass} required />
		</FormField>

		<FormField label="Email Address (Login Username)" name="userEmail" required>
			<input id="userEmail" type="email" bind:value={email} placeholder="user@byond.co.id" class={inputClass} required />
		</FormField>

		<FormField label="Access Role" name="userRole" required>
			<select id="userRole" bind:value={role} class={inputClass}>
				<option value="SUPER_ADMIN">SUPER ADMIN (Full Access & User Management)</option>
				<option value="SALES_ADMIN">SALES ADMIN (Sales, Customers, Quotations)</option>
				<option value="ACCOUNTING_ADMIN">ACCOUNTING ADMIN (Finance, Billing, General Ledger)</option>
				<option value="OWNER">OWNER / DIRECTOR (Reports & Revenue Monitoring)</option>
			</select>
		</FormField>

		{#if !userToEdit}
			<p class="rounded-lg border border-blue-200 bg-blue-50 px-3 py-2 text-xs text-blue-700 dark:border-blue-500/30 dark:bg-blue-500/10 dark:text-blue-300">
				New users can sign in with the temporary password <code class="font-semibold">changeme</code>.
			</p>
		{/if}
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{userToEdit ? 'Save Changes' : 'Add User'}
		</Button>
	</svelte:fragment>
</Modal>
