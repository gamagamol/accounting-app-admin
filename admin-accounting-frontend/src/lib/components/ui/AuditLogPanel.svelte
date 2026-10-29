<script lang="ts">
	import { onMount } from 'svelte';
	import Modal from './Modal.svelte';
	import Button from './Button.svelte';
	import { auditLogActions, auditLogs } from '$lib/stores/dataStore';
	import type { AuditLogEntry, AuditTransactionStatus } from '$lib/types';

	export let entityType: string;
	export let entityId: string;
	export let title: string = 'Audit Log';
	export let description: string = 'Immutable record of changes made to this transaction.';
	export let compact: boolean = false;

	let isDetailOpen = false;
	let selectedEntry: AuditLogEntry | null = null;

	onMount(() => {
		if (entityType && entityId) {
			void auditLogActions.load(entityType, entityId);
		}
	});

	const actionLabels: Record<string, string> = {
		create: 'Create',
		update: 'Update',
		delete: 'Delete',
		submit: 'Submit',
		approve: 'Approve',
		reject: 'Reject',
		post: 'Post',
		void: 'Void',
		close: 'Close',
		reopen: 'Reopen',
		export: 'Export'
	};

	const actionStyles: Record<string, string> = {
		create: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		update: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		delete: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		submit: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200',
		approve: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		reject: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		post: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200',
		void: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
		close: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
		reopen: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
		export: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200'
	};

	const statusLabels: Record<AuditTransactionStatus, string> = {
		draft: 'Draft',
		created: 'Created',
		approved: 'Approved',
		rejected: 'Rejected',
		pending: 'Pending',
		completed: 'Completed',
		reopen: 'Reopen'
	};

	const statusStyles: Record<AuditTransactionStatus, string> = {
		draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
		created: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
		completed: 'bg-teal-100 text-teal-800 dark:bg-teal-500/15 dark:text-teal-200',
		reopen: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200'
	};

	$: recordedEntries = $auditLogs
		.filter((entry) => entry.entityType === entityType && entry.entityId === entityId)
		.sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());
	$: entries = recordedEntries;

	function formatTimestamp(value: string) {
		return new Date(value).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function formatValue(value: unknown) {
		if (value === null || value === undefined || value === '') return '—';
		if (typeof value === 'object') return JSON.stringify(value);
		return String(value);
	}

	function actionLabel(action: string) {
		return actionLabels[action] ?? action.replace(/_/g, ' ');
	}

	function actionDescription(entry: AuditLogEntry) {
		if (entry.description && entry.description !== entry.summary) {
			return entry.description;
		}

		const count = entry.changes?.length ?? 0;

		if (entry.action === 'create') {
			return count > 0
				? `Added a new record with ${count} captured field(s).`
				: 'Added a new record.';
		}

		if (entry.action === 'update') {
			if (count === 0) return 'Updated the record without tracked field changes.';
			const fields = entry.changes!
				.slice(0, 3)
				.map((change) => change.field.replace(/_/g, ' '))
				.join(', ');
			return `Changed ${count} field(s): ${fields}${count > 3 ? ', …' : ''}.`;
		}

		if (entry.action === 'delete') {
			return 'Removed the record from the active list.';
		}

		return entry.summary;
	}

	function openDetails(entry: AuditLogEntry) {
		selectedEntry = entry;
		isDetailOpen = true;
	}
</script>

<section class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900">
	<div class="flex flex-col gap-1 border-b border-gray-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-center sm:justify-between">
		<div>
			<h3 class="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
			<p class="text-xs text-gray-500 dark:text-slate-400">{description}</p>
		</div>
		<span class="inline-flex w-fit items-center rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200">
			{entries.length} {entries.length === 1 ? 'entry' : 'entries'}
		</span>
	</div>

	{#if entries.length === 0}
		<div class="px-4 py-8 text-center">
			<p class="text-sm font-medium text-gray-600 dark:text-slate-300">No audit entries yet.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
				Changes will be recorded here after the transaction is saved.
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-xs">
				<thead class="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
					<tr>
						<th class="px-4 py-3">Name</th>
						<th class="px-4 py-3 whitespace-nowrap">Date</th>
						<th class="px-4 py-3">Action</th>
						<th class="px-4 py-3">Status</th>
						<th class="px-4 py-3 text-right">Fields</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
					{#each entries as entry}
						<tr class="align-top transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
							<td class="px-4 py-3 font-semibold text-gray-800 dark:text-slate-100">
								{entry.actor}
							</td>
							<td class="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-slate-400">
								{formatTimestamp(entry.timestamp)}
							</td>
							<td class="min-w-[220px] px-4 py-3">
								<div class="flex flex-col gap-1">
									<span class="w-fit rounded-full px-2 py-0.5 text-[10px] font-bold uppercase tracking-wide {actionStyles[entry.action] ?? actionStyles.update}">
										{actionLabel(entry.action)}
									</span>
									{#if !compact}
										<span class="text-gray-600 dark:text-slate-300">{actionDescription(entry)}</span>
									{/if}
								</div>
							</td>
							<td class="px-4 py-3">
								<span class="inline-flex w-fit items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold {statusStyles[entry.status] ?? statusStyles.draft}">
									{statusLabels[entry.status] ?? entry.status}
								</span>
							</td>
							<td class="px-4 py-3 text-right">
								<Button size="sm" variant="secondary" on:click={() => openDetails(entry)}>
									More...
								</Button>
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<Modal bind:isOpen={isDetailOpen} title="Audit Detail" size="2xl">
	{#if selectedEntry}
		<div class="space-y-4">
			<div class="grid grid-cols-1 gap-3 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60 sm:grid-cols-2">
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Name</p>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{selectedEntry.actor}</p>
				</div>
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Date</p>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{formatTimestamp(selectedEntry.timestamp)}</p>
				</div>
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Action</p>
					<p class="mt-0.5 font-semibold text-gray-800 dark:text-slate-100">{actionLabel(selectedEntry.action)}</p>
				</div>
				<div>
					<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Status</p>
					<p class="mt-0.5">
						<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-[11px] font-semibold {statusStyles[selectedEntry.status] ?? statusStyles.draft}">
							{statusLabels[selectedEntry.status] ?? selectedEntry.status}
						</span>
					</p>
				</div>
				<div class="sm:col-span-2">
					<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Document</p>
					<p class="mt-0.5 font-mono text-xs font-semibold text-gray-800 dark:text-slate-100">{selectedEntry.documentNumber}</p>
				</div>
			</div>

			<p class="text-xs text-gray-600 dark:text-slate-300">{selectedEntry.summary}</p>

			{#if selectedEntry.description}
				<div class="rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-500/30 dark:bg-blue-500/10">
					<p class="text-[10px] font-bold uppercase tracking-wider text-blue-700 dark:text-blue-200">Description / Message</p>
					<p class="mt-1 text-xs text-blue-900 dark:text-blue-100">{selectedEntry.description}</p>
				</div>
			{/if}

			<div class="overflow-hidden rounded-xl border border-gray-200 dark:border-slate-800">
				<div class="border-b border-gray-200 bg-gray-50 px-4 py-2 dark:border-slate-800 dark:bg-slate-950/60">
					<h4 class="text-xs font-bold text-gray-700 dark:text-slate-200">Field Changes</h4>
				</div>

				{#if selectedEntry.changes && selectedEntry.changes.length > 0}
					<div class="overflow-x-auto">
						<table class="min-w-full text-left text-xs">
							<thead class="border-b border-gray-200 text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:border-slate-800 dark:text-slate-400">
								<tr>
									<th class="px-4 py-2">Field</th>
									<th class="px-4 py-2">Before</th>
									<th class="px-4 py-2">After</th>
								</tr>
							</thead>
							<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
								{#each selectedEntry.changes as change}
									<tr>
										<td class="whitespace-nowrap px-4 py-2 font-mono text-[11px] font-semibold text-gray-700 dark:text-slate-200">
											{change.field}
										</td>
										<td class="px-4 py-2 text-rose-600 dark:text-rose-300">{formatValue(change.before)}</td>
										<td class="px-4 py-2 text-emerald-600 dark:text-emerald-300">{formatValue(change.after)}</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>
				{:else}
					<p class="px-4 py-6 text-center text-xs text-gray-500 dark:text-slate-400">
						No field-level changes were recorded for this action.
					</p>
				{/if}
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isDetailOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
