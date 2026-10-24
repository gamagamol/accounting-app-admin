<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import {
		annualBudgets,
		bankAccounts,
		chartOfAccounts,
		departments,
		employees,
		expenses,
		expenseActions,
		suppliers
	} from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { expensesApi } from '$lib/api';
	import {
		defaultExpenseAccount,
		defaultExpenseCategory,
		expenseTypeMap,
		expenseTypeOptions,
		paymentMethodOptions
	} from '$lib/data/accounting-options';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { ExpenseEntry, ExpenseType } from '$lib/types';
	import type { CreateExpensePayload } from '$lib/api/types';

	export let isOpen = false;
	export let expense: ExpenseEntry | null = null;
	export let onSaved: () => void = () => {};

	let form: CreateExpensePayload = blankForm();
	let lastKey = '';
	let saving = false;

	$: expenseAccounts = $chartOfAccounts.filter((account) => account.category === 'Expense');
	$: accountOptions = expenseAccounts.map((account) => ({
		value: account.code,
		label: `${account.code} — ${account.name}`
	}));
	$: budgetOptions = $annualBudgets.map((budget) => ({
		value: budget.id,
		label: `${budget.budgetNo} — ${budget.name}`
	}));
	$: departmentOptions = $departments.map((department) => ({
		value: department.code,
		label: `${department.code} — ${department.name}`
	}));
	$: activeEmployees = $employees.filter((employee) => employee.status === 'active');
	$: selectedType = expenseTypeMap[form.expenseType];
	$: isEmployeeExpense = form.expenseType === 'salary' || form.expenseType === 'travel';
	$: totalAmount = (Number(form.amount) || 0) + (Number(form.taxAmount) || 0);

	$: if (!isOpen) {
		lastKey = '';
	} else {
		const key = expense?.id ?? 'new';
		if (lastKey !== key) {
			lastKey = key;
			form = expense ? fromExpense(expense) : blankForm();
		}
	}

	function nextExpenseNo() {
		const year = 2024;
		return `EXP/${year}/${String($expenses.length + 1).padStart(3, '0')}`;
	}

	function blankForm(): CreateExpensePayload {
		const type: ExpenseType = 'salary';
		const department = $departments[0];
		const budget = $annualBudgets.find((item) => item.departmentCode === department?.code) ?? $annualBudgets[0];
		const employee = $employees.find((item) => item.status === 'active');
		const account = $chartOfAccounts.find(
			(item) => item.code === defaultExpenseAccount(type) && item.category === 'Expense'
		);

		return {
			date: new Date().toISOString().split('T')[0],
			expenseNo: nextExpenseNo(),
			expenseType: type,
			category: defaultExpenseCategory(type),
			accountCode: defaultExpenseAccount(type),
			accountName: account?.name ?? defaultExpenseCategory(type),
			departmentCode: department?.code ?? '',
			departmentName: department?.name ?? '',
			budgetId: budget?.id ?? '',
			budgetNo: budget?.budgetNo ?? '',
			employeeId: employee?.id ?? '',
			employeeName: employee?.name ?? '',
			supplierName: '',
			description: '',
			amount: 0,
			taxAmount: 0,
			totalAmount: 0,
			paymentMethod: 'Bank Transfer',
			bankAccount: $bankAccounts[0]?.code ?? '',
			paidTo: employee?.name ?? '',
			status: 'draft',
			attachmentUrl: '',
			notes: '',
			submittedBy: $user?.name ?? '',
			approvedBy: '',
			postedAt: '',
			glReference: ''
		};
	}

	function fromExpense(item: ExpenseEntry): CreateExpensePayload {
		return {
			date: item.date,
			expenseNo: item.expenseNo,
			expenseType: item.expenseType,
			category: item.category,
			accountCode: item.accountCode,
			accountName: item.accountName,
			departmentCode: item.departmentCode,
			departmentName: item.departmentName,
			budgetId: item.budgetId,
			budgetNo: item.budgetNo,
			employeeId: item.employeeId,
			employeeName: item.employeeName,
			supplierName: item.supplierName,
			description: item.description,
			amount: item.amount,
			taxAmount: item.taxAmount,
			totalAmount: item.totalAmount,
			paymentMethod: item.paymentMethod,
			bankAccount: item.bankAccount,
			paidTo: item.paidTo,
			status: item.status,
			attachmentUrl: item.attachmentUrl,
			notes: item.notes,
			submittedBy: item.submittedBy,
			approvedBy: item.approvedBy,
			postedAt: item.postedAt,
			glReference: item.glReference
		};
	}

	function handleTypeChange() {
		const option = expenseTypeMap[form.expenseType];
		const account = $chartOfAccounts.find(
			(item) => item.code === option.accountCode && item.category === 'Expense'
		);
		form.category = option.category;
		form.accountCode = option.accountCode;
		form.accountName = account?.name ?? option.category;

		if (form.expenseType === 'salary' || form.expenseType === 'travel') {
			const employee = $employees.find((item) => item.id === form.employeeId) ?? $employees.find((item) => item.status === 'active');
			form.employeeId = employee?.id ?? '';
			form.employeeName = employee?.name ?? '';
			form.supplierName = '';
			form.paidTo = employee?.name ?? '';
		} else {
			form.employeeId = '';
			form.employeeName = '';
			const supplier = $suppliers[0];
			form.supplierName =
				form.expenseType === 'purchase' || form.expenseType === 'office_supplies'
					? supplier?.companyName ?? ''
					: '';
			form.paidTo = form.supplierName;
		}
	}

	function handleDepartmentChange() {
		const department = $departments.find((item) => item.code === form.departmentCode);
		form.departmentName = department?.name ?? '';
	}

	function handleBudgetChange() {
		const budget = $annualBudgets.find((item) => item.id === form.budgetId);
		form.budgetNo = budget?.budgetNo ?? '';
	}

	function handleAccountChange() {
		const account = $chartOfAccounts.find(
			(item) => item.code === form.accountCode && item.category === 'Expense'
		);
		form.accountName = account?.name ?? '';
	}

	function handleEmployeeChange() {
		const employee = $employees.find((item) => item.id === form.employeeId);
		form.employeeName = employee?.name ?? '';
		if (form.expenseType === 'salary' || form.expenseType === 'travel') {
			form.paidTo = employee?.name ?? '';
		}
	}

	function handleSupplierInput() {
		form.paidTo = form.supplierName;
	}

	async function save() {
		if (!form.date || !form.expenseNo.trim() || !form.description.trim()) {
			alert('Date, expense number and description are required.');
			return;
		}
		if (Number(form.amount) <= 0) {
			alert('Expense amount must be greater than zero.');
			return;
		}
		if (!form.departmentCode) {
			alert('Department is required for budget control.');
			return;
		}

		const payload: CreateExpensePayload = {
			...form,
			totalAmount,
			submittedBy: form.submittedBy || $user?.name || '',
			approvedBy: expense?.approvedBy ?? form.approvedBy,
			postedAt: expense?.postedAt ?? form.postedAt,
			glReference: expense?.glReference ?? form.glReference
		};

		saving = true;
		try {
			if (expense) {
				await expensesApi.update(expense.id, payload);
				expenseActions.update(expense.id, payload);
			} else {
				await expensesApi.create(payload);
				expenseActions.add(payload);
			}
			isOpen = false;
			onSaved();
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save expense.');
		} finally {
			saving = false;
		}
	}
</script>

<Modal bind:isOpen title={expense ? 'Edit Expense Entry' : 'New Expense Entry'} size="4xl">
	<form on:submit|preventDefault={save} class="space-y-4">
		<div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3">
			<p class="text-xs font-semibold text-blue-800 dark:text-blue-200">
				{selectedType.icon}
				{selectedType.label}
			</p>
			<p class="mt-0.5 text-[11px] text-blue-700 dark:text-blue-300">{selectedType.hint}</p>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">
			<FormField label="Expense Type" name="expenseType" required>
				<select
					id="expenseType"
					bind:value={form.expenseType}
					on:change={handleTypeChange}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each expenseTypeOptions as option}
						<option value={option.value}>{option.icon} {option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Expense Date" name="date" required>
				<input
					id="date"
					type="date"
					bind:value={form.date}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<FormField label="Expense No" name="expenseNo" required>
				<input
					id="expenseNo"
					bind:value={form.expenseNo}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="EXP/2024/010"
				/>
			</FormField>

			<FormField label="Category" name="category" required>
				<input
					id="category"
					bind:value={form.category}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<div class="sm:col-span-2">
				<FormField label="Description" name="description" required>
					<input
						id="description"
						bind:value={form.description}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="What was this expense for?"
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

			<FormField label="Budget" name="budgetId" hint="Optional; used for budget vs actual control.">
				<select
					id="budgetId"
					bind:value={form.budgetId}
					on:change={handleBudgetChange}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					<option value="">— No budget —</option>
					{#each budgetOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Expense Account (COA)" name="accountCode" required>
				<select
					id="accountCode"
					bind:value={form.accountCode}
					on:change={handleAccountChange}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each accountOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			{#if isEmployeeExpense}
				<FormField label="Employee" name="employeeId" required={form.expenseType === 'salary'}>
					<select
						id="employeeId"
						bind:value={form.employeeId}
						on:change={handleEmployeeChange}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						<option value="">— Select employee —</option>
						{#each activeEmployees as employee}
							<option value={employee.id}>{employee.name} — {employee.position}</option>
						{/each}
					</select>
				</FormField>
			{:else}
				<FormField label="Supplier / Vendor" name="supplierName" hint="Choose from master data or type a new vendor name.">
					<input
						id="supplierName"
						list="supplier-options"
						bind:value={form.supplierName}
						on:input={handleSupplierInput}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Select or type supplier / vendor"
					/>
					<datalist id="supplier-options">
						{#each $suppliers as supplier}
							<option value={supplier.companyName}></option>
						{/each}
					</datalist>
				</FormField>
			{/if}

			<FormField label="Paid To" name="paidTo" required>
				<input
					id="paidTo"
					bind:value={form.paidTo}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="Employee, supplier or payee"
				/>
			</FormField>

			<FormField label="Amount (IDR)" name="amount" required>
				<input
					id="amount"
					type="number"
					min="0"
					bind:value={form.amount}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<FormField label="Tax / PPN (IDR)" name="taxAmount">
				<input
					id="taxAmount"
					type="number"
					min="0"
					bind:value={form.taxAmount}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm font-mono bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				/>
			</FormField>

			<div class="sm:col-span-2 rounded-lg border border-gray-200 dark:border-slate-800 bg-slate-50 dark:bg-slate-950/50 px-3 py-2 flex items-center justify-between">
				<span class="text-xs font-semibold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Expense</span>
				<span class="text-lg font-black text-gray-900 dark:text-white">{formatCurrency(totalAmount)}</span>
			</div>

			<FormField label="Payment Method" name="paymentMethod">
				<select
					id="paymentMethod"
					bind:value={form.paymentMethod}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each paymentMethodOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Bank / Cash Account" name="bankAccount">
				<select
					id="bankAccount"
					bind:value={form.bankAccount}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each $bankAccounts as account}
						<option value={account.code}>{account.code} — {account.bankName}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Attachment" name="attachmentUrl" hint="File name or URL; backend will store the uploaded document.">
				<input
					id="attachmentUrl"
					bind:value={form.attachmentUrl}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					placeholder="invoice.pdf"
				/>
			</FormField>

			<FormField label="Initial Status" name="status">
				<select
					id="status"
					bind:value={form.status}
					disabled={!!expense && !['draft', 'rejected'].includes(expense.status)}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none disabled:opacity-60"
				>
					{#if expense && !['draft', 'rejected'].includes(expense.status)}
						<option value={form.status}>{form.status.replace(/_/g, ' ')}</option>
					{:else}
						<option value="draft">Draft</option>
						<option value="pending">Pending approval</option>
					{/if}
				</select>
			</FormField>

			<div class="sm:col-span-2">
				<FormField label="Notes" name="notes">
					<textarea
						id="notes"
						rows="2"
						bind:value={form.notes}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
						placeholder="Additional approval notes..."
					></textarea>
				</FormField>
			</div>
		</div>

		<p class="text-[11px] text-gray-500 dark:text-slate-400">
			Payload will be sent to <code class="font-mono">POST /api/expenses</code>. In mock mode it is
			captured in the API payload log for backend integration.
		</p>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={save} disabled={saving}>
			{saving ? 'Saving…' : expense ? 'Save Changes' : 'Save Expense'}
		</Button>
	</svelte:fragment>
</Modal>
