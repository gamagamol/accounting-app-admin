<script lang="ts">
	import EntityManager from '$lib/components/ui/EntityManager.svelte';
	import ApprovalActions from '$lib/components/ui/ApprovalActions.svelte';
	import { annualBudgets, budgetRevisions, budgetingActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import { budgetRevisionStatusOptions } from '$lib/data/accounting-options';
	import { formatCurrency } from '$lib/utils/formatters';
	import { currencyColumn, dateColumn, statusColumn } from '$lib/utils/tableColumns';
	import { getErrorMessage } from '$lib/utils/errors';
	import type { BudgetRevision, TableColumn } from '$lib/types';
	import type { FieldDef } from '$lib/types/entity';
	import type { CreateBudgetRevisionPayload } from '$lib/api/types';

	let workingId = '';

	$: budgetOptions = $annualBudgets.map((budget) => ({
		value: budget.budgetNo,
		label: `${budget.budgetNo} — ${budget.name}`
	}));

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

	$: fields = [
		{
			key: 'revisionNo',
			label: 'Revision No',
			type: 'text',
			required: true,
			defaultValue: `REV/2024/${String($budgetRevisions.length + 1).padStart(3, '0')}`
		},
		{ key: 'budgetNo', label: 'Budget', type: 'select', required: true, options: budgetOptions },
		{ key: 'date', label: 'Request Date', type: 'date', required: true, defaultValue: new Date().toISOString().split('T')[0] },
		{ key: 'requestedBy', label: 'Requested By', type: 'text', required: true, defaultValue: $user?.name ?? '' },
		{ key: 'requestedAmount', label: 'Requested Amount (IDR)', type: 'currency', required: true },
		{
			key: 'status',
			label: 'Status',
			type: 'select',
			badge: true,
			options: budgetRevisionStatusOptions
		},
		{ key: 'reason', label: 'Revision Reason', type: 'textarea', required: true, colSpan: 'full' }
	] satisfies FieldDef[];

	async function saveRevision(payload: Record<string, any>, id?: string) {
		const budget = $annualBudgets.find((item) => item.budgetNo === payload.budgetNo);
		const currentAmount = budget?.totalAmount ?? 0;
		const requestedAmount = Number(payload.requestedAmount) || 0;

		const fullPayload: CreateBudgetRevisionPayload = {
			revisionNo: String(payload.revisionNo),
			budgetId: budget?.id ?? '',
			budgetNo: String(payload.budgetNo),
			date: String(payload.date),
			requestedBy: String(payload.requestedBy),
			currentAmount,
			requestedAmount,
			difference: requestedAmount - currentAmount,
			reason: String(payload.reason ?? ''),
			status: (payload.status as BudgetRevision['status']) ?? 'pending'
		};

		try {
			if (id) {
				await budgetingApi.updateRevision(id, fullPayload);
				budgetingActions.updateRevision(id, fullPayload);
			} else {
				await budgetingApi.createRevision(fullPayload);
				budgetingActions.addRevision(fullPayload);
			}
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to save budget revision.'));
		}
	}

	async function deleteRevision(id: string) {
		try {
			await budgetingApi.deleteRevision(id);
			budgetingActions.deleteRevision(id);
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to delete budget revision.'));
		}
	}

	async function decide(revision: BudgetRevision, decision: 'approve' | 'reject') {
		workingId = revision.id;
		try {
			if (decision === 'approve') {
				await budgetingApi.approveRevision(revision.id);
				budgetingActions.approveRevision(revision.id);
			} else {
				await budgetingApi.rejectRevision(revision.id);
				budgetingActions.rejectRevision(revision.id);
			}
		} catch (error) {
			alert(getErrorMessage(error, 'Failed to update revision status.'));
		} finally {
			workingId = '';
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
	onSave={saveRevision}
	onDelete={deleteRevision}
>
	<svelte:fragment slot="extra-actions" let:row>
		{#if row.status === 'pending'}
			<ApprovalActions
				disabled={workingId === row.id}
				onApprove={() => decide(row, 'approve')}
				onReject={() => decide(row, 'reject')}
			/>
		{/if}
	</svelte:fragment>
</EntityManager>
