<script lang="ts">
	import { goto } from '$app/navigation';
	import EntityFormPage from '$lib/components/transactions/EntityFormPage.svelte';
	import {
		annualBudgets,
		chartOfAccounts,
		departments,
		hydrateBudgetingData
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import {
		buildBudgetAllocationFields,
		mapBudgetAllocationToApi
	} from '$lib/modules/budgeting/budgetAllocationFields';

	$: fields = buildBudgetAllocationFields($annualBudgets, $chartOfAccounts, $departments);
	$: firstAccount = $chartOfAccounts.find((account) => account.category === 'Expense');
	$: initialValues = {
		budgetNo: $annualBudgets[0]?.budgetNo ?? '',
		accountCode: firstAccount?.code ?? '',
		departmentCode: $departments[0]?.code ?? '',
		allocatedAmount: 0,
		usedAmount: 0,
		notes: ''
	};

	async function handleSubmit(payload: Record<string, any>) {
		const preparedBy = Number($user?.id);
		const apiPayload = mapBudgetAllocationToApi(
			payload,
			$annualBudgets,
			$chartOfAccounts,
			$departments,
			Number.isSafeInteger(preparedBy) && preparedBy > 0 ? preparedBy : null
		);
		const result = await budgetingApi.createAllocation(apiPayload);
		await hydrateBudgetingData();
		goto(`/budget-allocation/${result.data.id}`);
	}
</script>

<EntityFormPage
	title="Add Budget Allocation"
	description="Allocate an annual budget to an expense account and department on a dedicated page."
	backHref="/budget-allocation"
	backLabel="Back to budget allocations"
	eyebrow="Budgeting / Budget Allocation"
	documentNumber="New allocation"
	fields={fields}
	values={initialValues}
	submitLabel="Create Allocation"
	onSubmit={handleSubmit}
/>
