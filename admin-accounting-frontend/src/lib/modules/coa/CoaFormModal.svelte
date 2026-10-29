<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import type { ChartOfAccount } from '$lib/types';
	import { coaActions } from '$lib/stores/dataStore';

	export let isOpen: boolean = false;
	export let coaToEdit: ChartOfAccount | null = null;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	let formData = {
		code: '',
		name: '',
		category: 'Asset' as ChartOfAccount['category'],
		balance: 0
	};
	let wasOpen = false;

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (coaToEdit) {
			formData = {
				code: coaToEdit.code,
				name: coaToEdit.name,
				category: coaToEdit.category,
				balance: coaToEdit.balance
			};
		} else {
			formData = {
				code: '',
				name: '',
				category: 'Asset',
				balance: 0
			};
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	async function handleSubmit() {
		if (!formData.code || !formData.name) {
			alert('Account code and account name are required.');
			return;
		}

		try {
			if (coaToEdit) {
				await coaActions.update(coaToEdit.id, formData);
			} else {
				await coaActions.add(formData);
			}
			isOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save account.');
		}
	}
</script>

<Modal bind:isOpen title={coaToEdit ? 'Edit Account' : 'New Account'} size="md">
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<FormField label="Account Code" name="code" required>
			<input
				id="code"
				type="text"
				bind:value={formData.code}
				placeholder="e.g. 1-1000 or 4-1000"
				class="{inputClass} font-mono"
				required
			/>
		</FormField>

		<FormField label="Account Name" name="name" required>
			<input
				id="name"
				type="text"
				bind:value={formData.name}
				placeholder="e.g. Petty Cash, Accounts Receivable"
				class={inputClass}
				required
			/>
		</FormField>

		<FormField label="Account Category" name="category">
			<select id="category" bind:value={formData.category} class={inputClass}>
				<option value="Asset">Asset</option>
				<option value="Liability">Liability</option>
				<option value="Equity">Equity</option>
				<option value="Revenue">Revenue</option>
				<option value="Expense">Expense</option>
			</select>
		</FormField>

		<FormField label="Opening / Current Balance (IDR)" name="balance">
			<input
				id="balance"
				type="number"
				bind:value={formData.balance}
				placeholder="0"
				class="{inputClass} font-mono"
			/>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{coaToEdit ? 'Save Changes' : 'Create Account'}
		</Button>
	</svelte:fragment>
</Modal>
