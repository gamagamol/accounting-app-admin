<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import type { Employee } from '$lib/types';
	import { employeeActions } from '$lib/stores/dataStore';

	export let isOpen: boolean = false;
	export let employeeToEdit: Employee | null = null;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	let formData = {
		name: '',
		position: 'Staff',
		email: '',
		phone: '',
		address: '',
		status: 'active' as 'active' | 'inactive'
	};
	let wasOpen = false;

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (employeeToEdit) {
			formData = {
				name: employeeToEdit.name,
				position: employeeToEdit.position,
				email: employeeToEdit.email,
				phone: employeeToEdit.phone,
				address: employeeToEdit.address,
				status: employeeToEdit.status
			};
		} else {
			formData = {
				name: '',
				position: 'Administration Staff',
				email: '',
				phone: '',
				address: '',
				status: 'active'
			};
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	async function handleSubmit() {
		if (!formData.name) {
			alert('Employee name is required.');
			return;
		}

		try {
			if (employeeToEdit) {
				await employeeActions.update(employeeToEdit.id, formData);
			} else {
				await employeeActions.add(formData);
			}
			isOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save employee.');
		}
	}
</script>

<Modal bind:isOpen title={employeeToEdit ? 'Edit Employee' : 'New Employee'} size="lg">
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<FormField label="Employee Full Name" name="name" required>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					placeholder="Employee name"
					class={inputClass}
					required
				/>
			</FormField>

			<FormField label="Position / Job Title" name="position" required>
				<input
					id="position"
					type="text"
					bind:value={formData.position}
					placeholder="Finance Staff, Manager, etc."
					class={inputClass}
					required
				/>
			</FormField>

			<FormField label="Email" name="email">
				<input id="email" type="email" bind:value={formData.email} placeholder="employee@company.com" class={inputClass} />
			</FormField>

			<FormField label="Phone / WhatsApp" name="phone">
				<input id="phone" type="tel" bind:value={formData.phone} placeholder="0812-3456-7890" class={inputClass} />
			</FormField>

			<FormField label="Employment Status" name="status">
				<select id="status" bind:value={formData.status} class={inputClass}>
					<option value="active">Active</option>
					<option value="inactive">Inactive / Resigned</option>
				</select>
			</FormField>
		</div>

		<FormField label="Residential Address" name="address">
			<textarea
				id="address"
				rows="2"
				bind:value={formData.address}
				placeholder="Employee residential address..."
				class={inputClass}
			></textarea>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{employeeToEdit ? 'Save Changes' : 'Create Employee'}
		</Button>
	</svelte:fragment>
</Modal>
