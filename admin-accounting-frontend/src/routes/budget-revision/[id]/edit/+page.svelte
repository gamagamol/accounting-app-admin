<script lang="ts">
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import {
		annualBudgets,
		budgetRevisions,
		budgetingActions,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import {
		buildBudgetRevisionFields,
		buildBudgetRevisionPayload,
		budgetRevisionValues
	} from '$lib/modules/budgeting/budgetRevisionFields';

	$: revisionId = $page.params.id ?? '';
	$: revision = $budgetRevisions.find((item) => item.id === revisionId) ?? null;
	$: fields = buildBudgetRevisionFields(
		$annualBudgets,
		$user?.name ?? '',
		`REV/2024/${String($budgetRevisions.length + 1).padStart(3, '0')}`
	);
	$: values = revision ? budgetRevisionValues(revision) : {};

	async function handleSubmit(payload: Record<string, any>) {
		if (!revision) return;
		const before = revision as unknown as Record<string, unknown>;
		const fullPayload = buildBudgetRevisionPayload(payload, $annualBudgets, revision.status);
		await budgetingApi.updateRevision(revision.id, fullPayload);
		budgetingActions.updateRevision(revision.id, fullPayload);
		auditLogActions.record({
			module: 'budgeting',
			entityType: 'budget_revision',
			entityId: revision.id,
			documentNumber: fullPayload.revisionNo,
			action: 'update',
			actor: $user?.name || 'Budget Owner',
			summary: `Updated budget revision ${fullPayload.revisionNo}.`,
			before,
			after: { ...revision, ...fullPayload } as unknown as Record<string, unknown>
		});
		goto(`/budget-revision/${revision.id}`);
	}
</script>

{#if revision}
	<EntityFormPage
		title="Edit Budget Revision"
		description="Update the revision request. Every change is recorded in the audit trail."
		backHref={`/budget-revision/${revision.id}`}
		backLabel="Back to revision details"
		eyebrow="Budgeting / Budget Revision"
		documentNumber={revision.revisionNo}
		fields={fields}
		values={values}
		submitLabel="Save Changes"
		onSubmit={handleSubmit}
		auditEntityType="budget_revision"
		auditEntityId={revision.id}
	/>
{:else}
	<TransactionPageShell
		title="Budget Revision Not Found"
		description="The revision may have been deleted or the link is invalid."
		backHref="/budget-revision"
		backLabel="Back to budget revisions"
	>
		<div class="rounded-2xl border border-dashed border-gray-300 bg-white p-10 text-center dark:border-slate-700 dark:bg-slate-900">
			<p class="text-sm font-semibold text-gray-700 dark:text-slate-200">No budget revision matches this ID.</p>
		</div>
	</TransactionPageShell>
{/if}
