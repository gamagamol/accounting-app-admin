<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { appSettings, hydrateMasterData, taxRates } from '$lib/stores/dataStore';
	import { masterDataApi } from '$lib/api/master';

	let companyName = $appSettings.companyName;
	let companyAddress = $appSettings.companyAddress;
	let companyPhone = $appSettings.companyPhone;
	let companyEmail = $appSettings.companyEmail;
	let companyNpwp = $appSettings.companyNpwp;
	let currency = $appSettings.currency;
	let taxRate = $appSettings.taxRate;
	let showSuccess = false;
	let isSaving = false;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	async function handleSaveCompany() {
		isSaving = true;
		try {
			const profileResult = await masterDataApi.list<Record<string, any>>('company-profile');
			const profile = profileResult.data?.[0];
			const defaultTaxRateId =
				$taxRates.find((rate) => Number(rate.rate) === Number(taxRate))?.id ?? null;
			const payload = {
				companyName,
				address: companyAddress,
				phone: companyPhone,
				email: companyEmail,
				npwp: companyNpwp,
				currency,
				defaultTaxRateId
			};

			if (profile?.id) {
				await masterDataApi.update('company-profile', profile.id, payload);
			} else {
				await masterDataApi.create('company-profile', payload);
			}

			await hydrateMasterData();
			appSettings.set({ companyName, companyAddress, companyPhone, companyEmail, companyNpwp, currency, taxRate });
			showSuccess = true;
			setTimeout(() => (showSuccess = false), 3000);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save company profile.');
		} finally {
			isSaving = false;
		}
	}
</script>

<div class="space-y-6 max-w-4xl">
	{#if showSuccess}
		<Alert type="success" message="Company and tax information updated successfully." />
	{/if}

	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
			Company Identity & Accounting Document Profile
		</h4>

		<form on:submit|preventDefault={handleSaveCompany} class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField label="Registered Company Name" name="compName" required>
					<input id="compName" type="text" bind:value={companyName} class={inputClass} required />
				</FormField>

				<FormField label="Company Tax ID (NPWP)" name="compNpwp" required>
					<input id="compNpwp" type="text" bind:value={companyNpwp} class="{inputClass} font-mono" required />
				</FormField>

				<FormField label="Office Phone Number" name="compPhone">
					<input id="compPhone" type="text" bind:value={companyPhone} class={inputClass} />
				</FormField>

				<FormField label="Correspondence Email" name="compEmail">
					<input id="compEmail" type="email" bind:value={companyEmail} class={inputClass} />
				</FormField>

				<FormField label="Base Currency" name="currency">
					<input id="currency" type="text" bind:value={currency} class="{inputClass} font-mono" />
				</FormField>

				<FormField label="Standard VAT Rate (%)" name="taxRate">
					<input id="taxRate" type="number" min="0" max="100" bind:value={taxRate} class="{inputClass} font-mono" />
				</FormField>
			</div>

			<FormField label="Office & Tax Address" name="compAddress" required>
				<textarea id="compAddress" rows="3" bind:value={companyAddress} class={inputClass} required></textarea>
			</FormField>

			<div class="flex justify-end pt-2">
				<Button type="submit" variant="primary" disabled={isSaving}>
					{isSaving ? 'Saving...' : 'Save Company Configuration'}
				</Button>
			</div>
		</form>
	</div>
</div>
