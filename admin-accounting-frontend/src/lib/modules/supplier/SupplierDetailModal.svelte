<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import type { Supplier } from '$lib/types';

	export let isOpen: boolean = false;
	export let supplier: Supplier | null = null;
</script>

<Modal bind:isOpen title="Supplier Details" size="xl">
	{#if supplier}
		<div class="space-y-6 text-sm">
			<div class="bg-emerald-50/60 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20">
				<h4 class="text-lg font-bold text-gray-900 dark:text-white">{supplier.companyName}</h4>
				<p class="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">{supplier.city || 'No city recorded'}</p>
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Contact Person (PIC)</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{supplier.contactPerson || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Phone Number</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{supplier.phone || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Email</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">{supplier.email || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Tax ID (NPWP)</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1 font-mono">{supplier.npwp || '-'}</p>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold text-gray-700 dark:text-slate-200">Office / Warehouse Address</p>
				<p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">
					{supplier.address || 'No address recorded'}
				</p>
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
