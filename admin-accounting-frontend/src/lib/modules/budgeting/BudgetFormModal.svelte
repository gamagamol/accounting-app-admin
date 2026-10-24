<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import { annualBudgets, budgetingActions, departments } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import type { AnnualBudget } from '$lib/types';
	import type { CreateAnnualBudgetPayload } from '$lib/api/types';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';

	export let isOpen = false;
	export let budget: AnnualBudget | null = null;
	export let onSaved: () => void = () => {};

	let form: CreateAnnualBudgetPayload & { fiscalYear: number } = blankForm();
	let lastKey = '';
	let saving = false;

	$: departmentOptions = $departments.map((dept) => ({
		value: dept.code,
		label: `${dept.code} — ${dept.name}`
	}));

	function nextBudgetNo() {
		const year = 2024;
		const seq = $annualBudgets.length + 1;
		return `BUD/${year}/${String(seq).padStart(3, '0')}`;
	}

	function blankForm(): CreateAnnualBudgetPayload & { fiscalYear: number } {
		return {
			budgetNo: nextBudgetNo(),
			fiscalYear: 2024,
			name: '',
			departmentCode: $departments[0]?.code ?? '',
			departmentName: $departments[0]?.name ?? '',
			totalAmount: 0,
			status: 'draft',
			preparedBy: $user?.name ?? '',
			notes: ''
		};
	}

	$: if (!isOpen) {
		lastKey = '';
	} else {
		const key = budget?.id ?? 'new';
		if (lastKey !== key) {
			lastKey = key;
			if (budget) {
				form = {
					budgetNo: budget.budgetNo,
					fiscalYear: budget.fiscalYear,
					name: budget.name,
					departmentCode: budget.departmentCode,
					departmentName: budget.departmentName,
					totalAmount: budget.totalAmount,
					status: budget.status,
					preparedBy: budget.preparedBy,
					notes: budget.notes
				};
			} else {
				form = blankForm();
			}
		}
	}

	function handleDepartmentChange() {
		const selected = $departments.find((dept) => dept.code === form.departmentCode);
		form.departmentName = selected?.name ?? '';
	}

	async function save() {
		if (!form.budgetNo.trim() || !form.name.trim() || !form.departmentCode) {
			alert('Budget number, name and department are required.');
			return;
		}
		if (Number(form.totalAmount) <= 0) {
			alert('Total budget must be greater than zero.');
			return;
		}

		saving = true;
		try {
			if (budget) {
				await budgetingApi.updateBudget(budget.id, form);
				budgetingActions.updateBudget(budget.id, form);
			} else {
				await budgetingApi.createBudget(form);
				budgetingActions.addBudget({
					...form,
					createdAt: new Date().toISOString().split('T')[0],
					approvedBy: ''
				});
			}
			isOpen = false;
			onSaved();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save budget.');
		} finally {
			saving = false;
		}
	}
</script>

<Modal bind:isOpen title={budget ? 'Edit Annual Budget' : 'New Annual Budget'} size="2xl">
	<form on:submit|preventDefault={save}>
		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
			<FormField label="Budget No" name="budgetNo" required>
				<input
					id="budgetNo"
					bind:value={form.budgetNo}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="BUD/2024/006"
				/>
			</FormField>

			<FormField label="Fiscal Year" name="fiscalYear" required>
				<input
					id="fiscalYear"
					type="number"
					bind:value={form.fiscalYear}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<div class="sm:col-span-2">
				<FormField label="Budget Name" name="name" required>
					<input
						id="name"
						bind:value={form.name}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Operations Annual Budget 2024"
					/>
				</FormField>
			</div>

			<FormField label="Department / Cost Center" name="departmentCode" required>
				<select
					id="departmentCode"
					bind:value={form.departmentCode}
					on:change={handleDepartmentChange}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each departmentOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Total Budget (IDR)" name="totalAmount" required>
				<input
					id="totalAmount"
					type="number"
					min="0"
					bind:value={form.totalAmount}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<FormField label="Status" name="status">
				<select
					id="status"
					bind:value={form.status}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each transactionStatusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Prepared By" name="preparedBy">
				<input
					id="preparedBy"
					bind:value={form.preparedBy}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<div class="sm:col-span-2">
				<FormField label="Notes" name="notes">
					<textarea
						id="notes"
						rows="3"
						bind:value={form.notes}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Scope, assumptions and approval notes..."
					></textarea>
				</FormField>
			</div>
		</div>

		<p class="text-[11px] text-gray-500 dark:text-slate-400">
			Budget lines by COA and department are maintained in <strong>Budget Allocation</strong>. This
			form only prepares the annual budget header payload.
		</p>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={save} disabled={saving}>
			{saving ? 'Saving…' : budget ? 'Save Changes' : 'Create Budget'}
		</Button>
	</svelte:fragment>
</Modal>
