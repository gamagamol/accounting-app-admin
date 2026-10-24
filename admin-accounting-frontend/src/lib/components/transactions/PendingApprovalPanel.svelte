<script lang="ts">
	import { onMount } from 'svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Modal from '$lib/components/ui/Modal.svelte';
	import { user } from '$lib/stores/auth';
	import { pendingActions, pendingRequests } from '$lib/stores/dataStore';
	import { canApproveTransactions, pendingTransactionLabel } from '$lib/data/pending';
	import type {
		PendingRequest,
		PendingTransactionType,
		TransactionStatus
	} from '$lib/types';

	export let transactionType: PendingTransactionType;
	export let transactionId: string;
	export let transactionNumber: string = '';
	export let status: TransactionStatus = 'draft';
	export let title: string = 'Pending Approval';
	export let description: string =
		'Request approval, review the pending history, or approve/reject with a message.';

	let isRequestOpen = false;
	let isDecisionOpen = false;
	let decisionType: 'approve' | 'reject' = 'approve';
	let message = '';
	let errorMessage = '';
	let working = false;

	onMount(() => {
		if (transactionType && transactionId) {
			void pendingActions.load(transactionType, transactionId);
		}
	});

	$: requests = $pendingRequests
		.filter(
			(request) =>
				request.transactionType === transactionType && request.transactionId === transactionId
		)
		.sort(
			(left, right) =>
				new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime()
		);
	$: activeRequest = requests.find((request) => request.status === 'pending') ?? null;
	$: isPending = status === 'pending';
	$: canDecide = canApproveTransactions($user?.role);
	$: documentLabel = transactionNumber || transactionId;
	$: typeLabel = pendingTransactionLabel(transactionType);

	function formatTimestamp(value?: string) {
		if (!value) return '—';
		return new Date(value).toLocaleString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		});
	}

	function openRequest() {
		decisionType = 'approve';
		message = '';
		errorMessage = '';
		isRequestOpen = true;
	}

	function openDecision(type: 'approve' | 'reject') {
		decisionType = type;
		message = '';
		errorMessage = '';
		isDecisionOpen = true;
	}

	function closeRequest() {
		if (working) return;
		isRequestOpen = false;
		message = '';
		errorMessage = '';
	}

	function closeDecision() {
		if (working) return;
		isDecisionOpen = false;
		message = '';
		errorMessage = '';
	}

	async function submitRequest() {
		const pendingMessage = message.trim();
		if (!pendingMessage) {
			errorMessage = 'Please explain why this transaction should be pending.';
			return;
		}

		working = true;
		errorMessage = '';
		try {
			await pendingActions.request({
				transactionType,
				transactionId,
				transactionNumber: documentLabel,
				requestedBy: $user?.name || 'System User',
				pendingMessage,
				actorRole: $user?.role
			});
			isRequestOpen = false;
			message = '';
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to save the pending request.';
		} finally {
			working = false;
		}
	}

	async function submitDecision() {
		if (!activeRequest) {
			errorMessage = 'No pending request record was found for this transaction.';
			return;
		}

		const decisionMessage = message.trim();
		if (!decisionMessage) {
			errorMessage =
				decisionType === 'approve'
					? 'Please add a note explaining the approval.'
					: 'Please add a note explaining the rejection.';
			return;
		}

		working = true;
		errorMessage = '';
		try {
			await pendingActions.decide(activeRequest, decisionType, {
				actor: $user?.name || 'System User',
				actorRole: $user?.role || '',
				decisionMessage
			});
			isDecisionOpen = false;
			message = '';
		} catch (error) {
			errorMessage =
				error instanceof Error ? error.message : 'Unable to save the pending decision.';
		} finally {
			working = false;
		}
	}

	function decisionActor(request: PendingRequest): string {
		return request.status === 'approved'
			? request.approvedBy || '—'
			: request.status === 'rejected'
				? request.rejectedBy || '—'
				: 'Waiting for approver';
	}

	function decisionAt(request: PendingRequest): string {
		return request.status === 'approved'
			? formatTimestamp(request.approvedAt)
			: request.status === 'rejected'
				? formatTimestamp(request.rejectedAt)
				: '—';
	}

	function decisionMessage(request: PendingRequest): string {
		if (request.status === 'approved') return request.approvalMessage || '—';
		if (request.status === 'rejected') return request.rejectionMessage || '—';
		return '—';
	}

	function decisionLabel(request: PendingRequest): string {
		if (request.status === 'approved') return 'Approved';
		if (request.status === 'rejected') return 'Rejected';
		return 'Pending';
	}
</script>

<section
	class="rounded-2xl border border-gray-200 bg-white shadow-sm dark:border-slate-800 dark:bg-slate-900"
>
	<div
		class="flex flex-col gap-3 border-b border-gray-200 px-4 py-3 dark:border-slate-800 sm:flex-row sm:items-start sm:justify-between"
	>
		<div>
			<div class="flex flex-wrap items-center gap-2">
				<h3 class="text-sm font-bold text-gray-900 dark:text-white">{title}</h3>
				<Badge {status} />
				<span
					class="rounded-full bg-slate-100 px-2.5 py-0.5 text-[11px] font-semibold text-slate-700 dark:bg-slate-800 dark:text-slate-200"
				>
					{typeLabel}
				</span>
			</div>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">{description}</p>
		</div>

		<div class="flex flex-wrap items-center gap-2">
			{#if isPending && activeRequest && canDecide}
				<Button variant="success" size="sm" on:click={() => openDecision('approve')}>
					Approve
				</Button>
				<Button variant="danger" size="sm" on:click={() => openDecision('reject')}>
					Reject
				</Button>
			{:else if isPending && !activeRequest && canDecide}
				<Button variant="warning" size="sm" on:click={openRequest}>
					Record Pending Request
				</Button>
			{:else if isPending}
				<span
					class="rounded-full bg-amber-100 px-2.5 py-0.5 text-[11px] font-semibold text-amber-800 dark:bg-amber-500/15 dark:text-amber-200"
				>
					Waiting for an approver
				</span>
			{:else}
				<Button variant="warning" size="sm" on:click={openRequest}>Set Pending</Button>
			{/if}
		</div>
	</div>

	{#if activeRequest}
		<div
			class="border-b border-amber-200 bg-amber-50 px-4 py-3 dark:border-amber-500/30 dark:bg-amber-500/10"
		>
			<p class="text-[10px] font-bold uppercase tracking-wider text-amber-700 dark:text-amber-200">
				Pending reason
			</p>
			<p class="mt-1 whitespace-pre-line text-sm text-amber-900 dark:text-amber-100">
				{activeRequest.pendingMessage}
			</p>
			<p class="mt-1 text-[11px] text-amber-700 dark:text-amber-200">
				Requested by {activeRequest.requestedBy} · {formatTimestamp(activeRequest.requestedAt)}
			</p>
		</div>
	{/if}

	{#if requests.length === 0}
		<div class="px-4 py-8 text-center">
			<p class="text-sm font-medium text-gray-600 dark:text-slate-300">No pending requests yet.</p>
			<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
				Use Set Pending to record why this transaction needs approval.
			</p>
		</div>
	{:else}
		<div class="overflow-x-auto">
			<table class="min-w-full text-left text-xs">
				<thead
					class="border-b border-gray-200 bg-gray-50 text-[11px] font-bold uppercase tracking-wider text-gray-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400"
				>
					<tr>
						<th class="whitespace-nowrap px-4 py-3">Date</th>
						<th class="px-4 py-3">Requested By</th>
						<th class="min-w-[180px] px-4 py-3">Pending Message</th>
						<th class="min-w-[150px] px-4 py-3">Decision</th>
						<th class="min-w-[180px] px-4 py-3">Decision Message</th>
					</tr>
				</thead>
				<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
					{#each requests as request}
						<tr class="align-top transition-colors hover:bg-slate-50/80 dark:hover:bg-slate-800/40">
							<td class="whitespace-nowrap px-4 py-3 text-gray-500 dark:text-slate-400">
								{formatTimestamp(request.requestedAt)}
							</td>
							<td class="px-4 py-3 font-semibold text-gray-800 dark:text-slate-100">
								{request.requestedBy}
							</td>
							<td class="px-4 py-3 text-gray-600 dark:text-slate-300">
								{request.pendingMessage || '—'}
							</td>
							<td class="px-4 py-3">
								<div class="flex flex-col gap-1">
									<Badge status={request.status} label={decisionLabel(request)} />
									<span class="text-gray-600 dark:text-slate-300">{decisionActor(request)}</span>
									<span class="text-[11px] text-gray-500 dark:text-slate-400">
										{decisionAt(request)}
									</span>
								</div>
							</td>
							<td class="px-4 py-3 text-gray-600 dark:text-slate-300">
								{decisionMessage(request)}
							</td>
						</tr>
					{/each}
				</tbody>
			</table>
		</div>
	{/if}
</section>

<Modal bind:isOpen={isRequestOpen} title="Set Transaction Pending" size="lg">
	<div class="space-y-3">
		<p class="text-sm text-gray-600 dark:text-slate-300">
			Explain why <span class="font-semibold">{documentLabel}</span> should be pending. The message is
			stored in the pending history and can be reviewed by an approver.
		</p>
		<label class="block text-xs font-semibold text-gray-700 dark:text-slate-200" for="pending-reason">
			Pending message
		</label>
		<textarea
			id="pending-reason"
			bind:value={message}
			rows="4"
			placeholder="Example: Customer requested a revised unit price before we continue."
			class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-amber-500/20"
		></textarea>
		{#if errorMessage}
			<p class="text-xs font-semibold text-rose-600 dark:text-rose-300">{errorMessage}</p>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={closeRequest} disabled={working}>Cancel</Button>
		<Button variant="warning" on:click={submitRequest} disabled={working}>
			{working ? 'Saving...' : 'Set Pending'}
		</Button>
	</svelte:fragment>
</Modal>

<Modal
	bind:isOpen={isDecisionOpen}
	title={decisionType === 'approve' ? 'Approve Pending Request' : 'Reject Pending Request'}
	size="lg"
>
	<div class="space-y-3">
		<p class="text-sm text-gray-600 dark:text-slate-300">
			{decisionType === 'approve'
				? `Approve ${documentLabel} and record a note for the audit trail.`
				: `Reject ${documentLabel} and record the reason for the requester.`}
		</p>
		{#if activeRequest}
			<div
				class="rounded-xl border border-gray-200 bg-gray-50 p-3 text-xs dark:border-slate-800 dark:bg-slate-950/60"
			>
				<p class="font-semibold text-gray-700 dark:text-slate-200">Pending message</p>
				<p class="mt-1 whitespace-pre-line text-gray-600 dark:text-slate-300">
					{activeRequest.pendingMessage}
				</p>
				<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
					Requested by {activeRequest.requestedBy} · {formatTimestamp(activeRequest.requestedAt)}
				</p>
			</div>
		{/if}
		<label class="block text-xs font-semibold text-gray-700 dark:text-slate-200" for="pending-decision">
			{decisionType === 'approve' ? 'Approval message' : 'Rejection message'}
		</label>
		<textarea
			id="pending-decision"
			bind:value={message}
			rows="4"
			placeholder={decisionType === 'approve'
				? 'Example: Approved after checking the margin and stock availability.'
				: 'Example: Rejected because the requested discount exceeds the approved limit.'}
			class="w-full rounded-xl border border-gray-300 bg-white px-3 py-2 text-sm text-gray-800 outline-none transition focus:border-amber-500 focus:ring-2 focus:ring-amber-200 dark:border-slate-700 dark:bg-slate-950 dark:text-slate-100 dark:focus:ring-amber-500/20"
		></textarea>
		{#if errorMessage}
			<p class="text-xs font-semibold text-rose-600 dark:text-rose-300">{errorMessage}</p>
		{/if}
	</div>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={closeDecision} disabled={working}>Cancel</Button>
		<Button
			variant={decisionType === 'approve' ? 'success' : 'danger'}
			on:click={submitDecision}
			disabled={working}
		>
			{working ? 'Saving...' : decisionType === 'approve' ? 'Approve' : 'Reject'}
		</Button>
	</svelte:fragment>
</Modal>
