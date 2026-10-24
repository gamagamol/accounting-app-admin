<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import EntityDetailPage from '$lib/components/transactions/EntityDetailPage.svelte';
	import {
		budgetRevisions,
		budgetingActions,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { budgetRevisionDetailFields } from '$lib/modules/budgeting/budgetRevisionFields';
	import { getErrorMessage } from '$lib/utils/errors';

	let errorMessage = '';

	$: revisionId = $page.params.id ?? '';
	$: revision = $budgetRevisions.find((item) => item.id === revisionId) ?? null;

	async function handleDelete() {
		if (!revision) return;
		if (!confirm(`Delete revision ${revision.revisionNo}? This action cannot be undone.`)) return;
		try {
			await budgetingApi.deleteRevision(revision.id);
			auditLogActions.record({
				module: 'budgeting',
				entityType: 'budget_revision',
				entityId: revision.id,
				documentNumber: revision.revisionNo,
				action: 'delete',
				actor: $user?.name || 'Budget Owner',
				summary: `Deleted budget revision ${revision.revisionNo}.`,
				before: revision as unknown as Record<string, unknown>
			});
			budgetingActions.deleteRevision(revision.id);
			goto('/budget-revision');
		} catch (error) {
			errorMessage = getErrorMessage(error, 'Failed to delete revision.');
		}
	}
</script>

<EntityDetailPage
	title="Budget Revision Details"
	description="Review the revision request, approve or reject it, and inspect the audit trail."
	backHref="/budget-revision"
	backLabel="Back to budget revisions"
	eyebrow="Budgeting / Budget Revision"
	documentNumber={revision?.revisionNo ?? ''}
	fields={budgetRevisionDetailFields}
	row={revision}
	auditEntityType="budget_revision"
	auditEntityId={revision?.id ?? ''}
>
	<svelte:fragment slot="actions">
		{#if revision}
			<Button variant="secondary" href={`/budget-revision/${revision.id}/edit`}>Edit</Button>
			<Button variant="danger" on:click={handleDelete}>Delete</Button>
		{/if}
	</svelte:fragment>

	{#if errorMessage}
		<p class="text-sm text-rose-600 dark:text-rose-400">{errorMessage}</p>
	{/if}
</EntityDetailPage>
