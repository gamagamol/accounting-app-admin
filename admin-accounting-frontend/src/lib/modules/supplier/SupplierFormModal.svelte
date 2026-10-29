<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import type { Supplier } from '$lib/types';
	import { supplierActions } from '$lib/stores/dataStore';

	export let isOpen: boolean = false;
	export let supplierToEdit: Supplier | null = null;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	let formData = {
		companyName: '',
		contactPerson: '',
		email: '',
		phone: '',
		address: '',
		city: '',
		npwp: ''
	};
	let wasOpen = false;

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (supplierToEdit) {
			formData = {
				companyName: supplierToEdit.companyName,
				contactPerson: supplierToEdit.contactPerson,
				email: supplierToEdit.email,
				phone: supplierToEdit.phone,
				address: supplierToEdit.address,
				city: supplierToEdit.city,
				npwp: supplierToEdit.npwp
			};
		} else {
			formData = {
				companyName: '',
				contactPerson: '',
				email: '',
				phone: '',
				address: '',
				city: '',
				npwp: ''
			};
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	async function handleSubmit() {
		if (!formData.companyName) {
			alert('Vendor name is required.');
			return;
		}

		try {
			if (supplierToEdit) {
				await supplierActions.update(supplierToEdit.id, formData);
			} else {
				await supplierActions.add(formData);
			}
			isOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save supplier.');
		}
	}
</script>

<Modal bind:isOpen title={supplierToEdit ? 'Edit Supplier' : 'New Supplier'} size="xl">
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<FormField label="Supplier Company Name" name="companyName" required>
				<input
					id="companyName"
					type="text"
					bind:value={formData.companyName}
					placeholder="PT Main Supplier Teknik"
					class={inputClass}
					required
				/>
			</FormField>

			<FormField label="Contact Person (PIC)" name="contactPerson" required>
				<input
					id="contactPerson"
					type="text"
					bind:value={formData.contactPerson}
					placeholder="Contact person name"
					class={inputClass}
					required
				/>
			</FormField>

			<FormField label="Email" name="email">
				<input id="email" type="email" bind:value={formData.email} placeholder="sales@supplier.com" class={inputClass} />
			</FormField>

			<FormField label="Phone Number" name="phone">
				<input id="phone" type="tel" bind:value={formData.phone} placeholder="021-98765432" class={inputClass} />
			</FormField>

			<FormField label="City" name="city">
				<input id="city" type="text" bind:value={formData.city} placeholder="Bekasi" class={inputClass} />
			</FormField>

			<FormField label="Tax ID (NPWP)" name="npwp">
				<input id="npwp" type="text" bind:value={formData.npwp} placeholder="01.999.888.7-011.000" class="{inputClass} font-mono" />
			</FormField>
		</div>

		<FormField label="Office / Warehouse Address" name="address">
			<textarea
				id="address"
				rows="3"
				bind:value={formData.address}
				placeholder="Full supplier address..."
				class={inputClass}
			></textarea>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{supplierToEdit ? 'Save Changes' : 'Create Supplier'}
		</Button>
	</svelte:fragment>
</Modal>
