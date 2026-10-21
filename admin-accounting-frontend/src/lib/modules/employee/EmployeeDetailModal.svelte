<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import type { Employee } from '$lib/types';

	export let isOpen: boolean = false;
	export let employee: Employee | null = null;
</script>

<Modal bind:isOpen title="Employee Details" size="lg">
	{#if employee}
		<div class="space-y-5 text-sm">
			<div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex items-start justify-between gap-3">
				<div>
					<h4 class="text-lg font-bold text-gray-900 dark:text-white">{employee.name}</h4>
					<p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">{employee.position}</p>
				</div>
				<Badge status={employee.status} label={employee.status === 'active' ? 'Active' : 'Inactive'} />
			</div>

			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Email</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">{employee.email || '-'}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-xs text-gray-500 dark:text-slate-400">Phone / WhatsApp</p>
					<p class="font-medium text-gray-800 dark:text-slate-100 mt-1">{employee.phone || '-'}</p>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold text-gray-700 dark:text-slate-200">Residential Address</p>
				<p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">
					{employee.address || 'No address recorded'}
				</p>
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
