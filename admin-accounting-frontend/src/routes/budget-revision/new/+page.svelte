<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import { annualBudgets, budgetRevisions, budgetingActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import {
		buildBudgetRevisionFields,
		buildBudgetRevisionPayload
	} from '$lib/modules/budgeting/budgetRevisionFields';

	$: fields = buildBudgetRevisionFields(
		$annualBudgets,
		$user?.name ?? '',
		`REV/2024/${String($budgetRevisions.length + 1).padStart(3, '0')}`
	);

	async function handleSubmit(payload: Record<string, any>) {
		const fullPayload = buildBudgetRevisionPayload(payload, $annualBudgets, 'pending');
		await budgetingApi.createRevision(fullPayload);
		const created = budgetingActions.addRevision(fullPayload);
		auditLogActions.record({
			module: 'budgeting',
			entityType: 'budget_revision',
			entityId: created.id,
			documentNumber: created.revisionNo,
			action: 'create',
			actor: $user?.name || 'Budget Owner',
			summary: `Created budget revision ${created.revisionNo} for ${created.budgetNo}.`,
			after: created as unknown as Record<string, unknown>
		});
		goto(`/budget-revision/${created.id}`);
	}
</script>

<EntityFormPage
	title="New Budget Revision Request"
	description="Request additional budget or reallocation on a dedicated page."
	backHref="/budget-revision"
	backLabel="Back to budget revisions"
	eyebrow="Budgeting / Budget Revision"
	documentNumber="New revision request"
	fields={fields}
	values={{}}
	submitLabel="Submit Revision Request"
	onSubmit={handleSubmit}
/>
