<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import type { Customer } from '$lib/types';
	import { customerActions } from '$lib/stores/dataStore';

	export let isOpen: boolean = false;
	export let customerToEdit: Customer | null = null;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	let wasOpen = false;
	let formData = {
		companyName: '',
		city: '',
		contactPerson: '',
		email: '',
		phone: '',
		nb: '',
		npwp: '',
		npwpAddress: '',
		address: '',
		termOfPayment: 30,
		notes: ''
	};

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (customerToEdit) {
			formData = {
				companyName: customerToEdit.companyName,
				city: customerToEdit.city,
				contactPerson: customerToEdit.contactPerson,
				email: customerToEdit.email,
				phone: customerToEdit.phone,
				nb: customerToEdit.nb,
				npwp: customerToEdit.npwp,
				npwpAddress: customerToEdit.npwpAddress,
				address: customerToEdit.address,
				termOfPayment: customerToEdit.termOfPayment,
				notes: customerToEdit.notes
			};
		} else {
			formData = {
				companyName: '',
				city: '',
				contactPerson: '',
				email: '',
				phone: '',
				nb: 'NB-' + Math.floor(Math.random() * 900 + 100),
				npwp: '',
				npwpAddress: '',
				address: '',
				termOfPayment: 30,
				notes: ''
			};
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	async function handleSubmit() {
		if (!formData.companyName) {
			alert('Company name is required.');
			return;
		}
		if (!formData.contactPerson) {
			alert('Contact person is required.');
			return;
		}

		try {
			if (customerToEdit) {
				await customerActions.update(customerToEdit.id, formData);
			} else {
				await customerActions.add(formData);
			}
			isOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save customer.');
		}
	}
</script>

<Modal bind:isOpen title={customerToEdit ? 'Edit Customer' : 'New Customer'} size="2xl">
	<form on:submit|preventDefault={handleSubmit} class="space-y-4">
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
			<FormField label="Company Name" name="companyName" required>
				<input
					id="companyName"
					type="text"
					bind:value={formData.companyName}
					placeholder="PT Example Success Mandiri"
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
				<input id="email" type="email" bind:value={formData.email} placeholder="contact@company.com" class={inputClass} />
			</FormField>

			<FormField label="Phone Number" name="phone">
				<input id="phone" type="tel" bind:value={formData.phone} placeholder="021-12345678" class={inputClass} />
			</FormField>

			<FormField label="City" name="city">
				<input id="city" type="text" bind:value={formData.city} placeholder="Jakarta" class={inputClass} />
			</FormField>

			<FormField label="Term of Payment (days)" name="termOfPayment">
				<input
					id="termOfPayment"
					type="number"
					min="0"
					bind:value={formData.termOfPayment}
					placeholder="30"
					class={inputClass}
				/>
			</FormField>

			<FormField label="Tax ID (NPWP)" name="npwp">
				<input id="npwp" type="text" bind:value={formData.npwp} placeholder="01.234.567.8-091.000" class="{inputClass} font-mono" />
			</FormField>

			<FormField label="Customer Code (NB)" name="nb">
				<input id="nb" type="text" bind:value={formData.nb} placeholder="NB-001" class="{inputClass} font-mono" />
			</FormField>
		</div>

		<FormField label="Operational Address" name="address">
			<textarea
				id="address"
				rows="2"
				bind:value={formData.address}
				placeholder="Full delivery and operational address..."
				class={inputClass}
			></textarea>
		</FormField>

		<FormField label="Tax Address (NPWP Address)" name="npwpAddress">
			<textarea
				id="npwpAddress"
				rows="2"
				bind:value={formData.npwpAddress}
				placeholder="Address printed on tax invoices..."
				class={inputClass}
			></textarea>
		</FormField>

		<FormField label="Additional Notes" name="notes">
			<input
				id="notes"
				type="text"
				bind:value={formData.notes}
				placeholder="Special customer notes..."
				class={inputClass}
			/>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{customerToEdit ? 'Save Changes' : 'Create Customer'}
		</Button>
	</svelte:fragment>
</Modal>
