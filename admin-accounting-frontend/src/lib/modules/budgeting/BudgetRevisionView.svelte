<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import {
		annualBudgets,
		budgetRevisions,
		budgetingActions,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { buildBudgetRevisionFields } from '$lib/modules/budgeting/budgetRevisionFields';
	import { formatCurrency } from '$lib/utils/formatters';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'revisionNo', label: 'Revision No', sortable: true },
		{ key: 'budgetNo', label: 'Budget No', sortable: true },
		dateColumn('date', 'Date'),
		{ key: 'requestedBy', label: 'Requested By' },
		currencyColumn('currentAmount', 'Current'),
		currencyColumn('requestedAmount', 'Requested'),
		{
			key: 'difference',
			label: 'Difference',
			align: 'right',
			format: (value) => `${Number(value) >= 0 ? '+' : ''}${formatCurrency(Number(value) || 0)}`
		},
		statusColumn()
	];

	$: fields = buildBudgetRevisionFields(
		$annualBudgets,
		$user?.name ?? '',
		`REV/2024/${String($budgetRevisions.length + 1).padStart(3, '0')}`
	);

	async function deleteRevision(id: string) {
		const revision = $budgetRevisions.find((item) => item.id === id);
		if (!revision) return;
		if (!confirm(`Delete revision ${revision.revisionNo}? This action cannot be undone.`)) return;
		try {
			await budgetingApi.deleteRevision(id);
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
			budgetingActions.deleteRevision(id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete budget revision.'));
		}
	}


</script>

<EntityManager
	title="Budget Revision / Over-budget Request"
	description="Request additional budget or reallocation when actual demand exceeds the approved annual plan."
	entityName="budget revision"
	createLabel="New Revision Request"
	columns={columns}
	data={$budgetRevisions}
	fields={fields}
	searchKeys={['revisionNo', 'budgetNo', 'requestedBy', 'reason', 'status']}
	searchPlaceholder="Search revision, budget or requester..."
	displayKey="revisionNo"
	formSize="2xl"
	createHref="/budget-revision/new"
	viewHref={(row) => `/budget-revision/${row.id}`}
	editHref={(row) => `/budget-revision/${row.id}/edit`}
	onDelete={deleteRevision}
/>
