<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { ChartOfAccount } from '$lib/types';

	export let isOpen: boolean = false;
	export let account: ChartOfAccount | null = null;
</script>

<Modal bind:isOpen title="Account Details" size="md">
	{#if account}
		<div class="space-y-5 text-sm">
			<div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800">
				<p class="text-xs font-mono text-blue-700 dark:text-blue-300">{account.code}</p>
				<h4 class="text-lg font-bold text-gray-900 dark:text-white mt-0.5">{account.name}</h4>
				<p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{account.category}</p>
			</div>

			<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
				<p class="text-xs text-gray-500 dark:text-slate-400">Current Balance</p>
				<p class="text-xl font-black font-mono text-gray-900 dark:text-white mt-1">
					{formatCurrency(account.balance)}
				</p>
			</div>

			<p class="text-[11px] text-gray-500 dark:text-slate-400">
				Accounts are used across journals, invoices, expense postings and financial statements.
				Changing the balance manually should be done through a journal adjustment.
			</p>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
