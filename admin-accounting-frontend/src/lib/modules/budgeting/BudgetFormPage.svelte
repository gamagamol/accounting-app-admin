<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import {
		annualBudgets,
		budgetingActions,
		departments,
		auditLogActions
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { budgetingApi } from '$lib/api';
	import type { AnnualBudget } from '$lib/types';
	import type { CreateAnnualBudgetPayload } from '$lib/api/types';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';

	export let budget: AnnualBudget | null = null;

	let form: CreateAnnualBudgetPayload & { fiscalYear: number } = blankForm();
	let initializedKey = '';
	let saving = false;

	$: backHref = budget ? `/budgets/${budget.id}` : '/budgets';
	$: eyebrow = 'Budgeting / Annual Budget';
	$: title = budget ? 'Edit Annual Budget' : 'New Annual Budget';
	$: documentNumber = budget?.budgetNo ?? 'Draft document';
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
			notes: '',
			description: ''
		};
	}

	$: {
		const key = budget?.id ?? 'new';
		if (key !== initializedKey) {
			initializedKey = key;
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
					notes: budget.notes,
					description: budget.description ?? budget.message ?? ''
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
		const before = budget ? (budget as unknown as Record<string, unknown>) : null;
		try {
			let saved: AnnualBudget;
			if (budget) {
				await budgetingApi.updateBudget(budget.id, form);
				budgetingActions.updateBudget(budget.id, form);
				saved = { ...budget, ...form };
			} else {
				await budgetingApi.createBudget(form);
				saved = budgetingActions.addBudget({
					...form,
					createdAt: new Date().toISOString().split('T')[0],
					approvedBy: ''
				});
			}

			auditLogActions.record({
				module: 'budgeting',
				entityType: 'annual_budget',
				entityId: saved.id,
				documentNumber: saved.budgetNo,
				action: budget ? 'update' : 'create',
				actor: $user?.name || 'Budget Owner',
				summary: `${budget ? 'Updated' : 'Created'} annual budget ${saved.budgetNo} — ${saved.name}.`,
				description: form.description,
				before,
				after: saved as unknown as Record<string, unknown>
			});

			goto(`/budgets/${saved.id}`);
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save budget.');
		} finally {
			saving = false;
		}
	}

	function handleCancel() {
		goto(backHref);
	}
</script>

<TransactionPageShell {title} description="Prepare the annual budget header on a dedicated page. Allocation lines are maintained separately." {backHref} backLabel="Back to annual budgets" {eyebrow} {documentNumber}>
	<form on:submit|preventDefault={save} class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
			<FormField label="Budget No" name="budgetNo" required>
				<input
					id="budgetNo"
					bind:value={form.budgetNo}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
					placeholder="BUD/2024/006"
				/>
			</FormField>

			<FormField label="Fiscal Year" name="fiscalYear" required>
				<input
					id="fiscalYear"
					type="number"
					bind:value={form.fiscalYear}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<div class="sm:col-span-2">
				<FormField label="Budget Name" name="name" required>
					<input
						id="name"
						bind:value={form.name}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
						placeholder="Operations Annual Budget 2024"
					/>
				</FormField>
			</div>

			<FormField label="Department / Cost Center" name="departmentCode" required>
				<select
					id="departmentCode"
					bind:value={form.departmentCode}
					on:change={handleDepartmentChange}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
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
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 font-mono text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<FormField label="Status" name="status">
				<select
					id="status"
					bind:value={form.status}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
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
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<div class="sm:col-span-2">
				<FormField
					label="Description / Message"
					name="description"
					hint="Optional note copied into the audit trail for this budget."
				>
					<textarea
						id="description"
						rows="2"
						bind:value={form.description}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
						placeholder="Explain the purpose of this budget or the reason for the change..."
					></textarea>
				</FormField>
			</div>

			<div class="sm:col-span-2">
				<FormField label="Notes" name="notes">
					<textarea
						id="notes"
						rows="4"
						bind:value={form.notes}
						class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
						placeholder="Scope, assumptions and approval notes..."
					></textarea>
				</FormField>
			</div>
		</div>

		<p class="text-[11px] text-gray-500 dark:text-slate-400">
			Budget lines by COA and department are maintained in <strong>Budget Allocation</strong>. This form only prepares the annual budget header payload.
		</p>

		<div class="mt-5 flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" on:click={handleCancel}>Cancel</Button>
			<Button variant="primary" type="submit" disabled={saving}>
				{saving ? 'Saving…' : budget ? 'Save Changes' : 'Create Budget'}
			</Button>
		</div>
	</form>

	{#if budget}
		<AuditLogPanel entityType="annual_budget" entityId={budget.id} />
	{/if}
</TransactionPageShell>
