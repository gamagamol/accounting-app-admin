<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Customer } from '$lib/types';

	export let isOpen: boolean = false;
	export let customer: Customer | null = null;
</script>

<Modal bind:isOpen title="Customer Details" size="xl">
	{#if customer}
		<div class="space-y-6 text-sm">
			<div class="bg-blue-50/60 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-start justify-between gap-3">
				<div>
					<h4 class="text-lg font-bold text-gray-900 dark:text-white">{customer.companyName}</h4>
					<p class="text-xs text-blue-700 dark:text-blue-300 font-mono mt-0.5">Code: {customer.nb || '-'}</p>
				</div>
				<span class="px-2.5 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-bold whitespace-nowrap">
					TOP: {customer.termOfPayment} days
				</span>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Contact Person (PIC)</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{customer.contactPerson || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">City</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{customer.city || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Email</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">{customer.email || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Phone Number</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{customer.phone || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3 sm:col-span-2">
					<p class="text-xs text-gray-500 dark:text-slate-400">Tax ID (NPWP)</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1 font-mono">{customer.npwp || '-'}</p>
				</div>
			</div>

			<div class="space-y-3">
				<div>
					<p class="text-xs font-semibold text-gray-700 dark:text-slate-200">Full Address</p>
					<p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">
						{customer.address || 'No operational address recorded'}
					</p>
				</div>
				<div>
					<p class="text-xs font-semibold text-gray-700 dark:text-slate-200">Tax Address (NPWP)</p>
					<p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">
						{customer.npwpAddress || 'No tax address recorded'}
					</p>
				</div>
				{#if customer.notes}
					<div>
						<p class="text-xs font-semibold text-gray-700 dark:text-slate-200">Customer Notes</p>
						<p class="text-xs text-gray-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-500/10 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/20 mt-1">
							{customer.notes}
						</p>
					</div>
				{/if}
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
