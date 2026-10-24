<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { apiBaseUrl, apiCalls, clearApiCalls, isApiConfigured } from '$lib/api';

	const endpointGroups = [
		{
			name: 'Master Data — Departments',
			rows: [
				{ method: 'GET', path: '/api/master/departments', purpose: 'List departments / cost centers' },
				{ method: 'POST', path: '/api/master/departments', purpose: 'Create department' },
				{ method: 'PUT', path: '/api/master/departments/:id', purpose: 'Update department' },
				{ method: 'DELETE', path: '/api/master/departments/:id', purpose: 'Delete department' }
			]
		},
		{
			name: 'Budgeting',
			rows: [
				{ method: 'GET', path: '/api/budgeting/budgets', purpose: 'List annual budgets' },
				{ method: 'POST', path: '/api/budgeting/budgets', purpose: 'Create annual budget header' },
				{ method: 'PUT', path: '/api/budgeting/budgets/:id', purpose: 'Update annual budget' },
				{ method: 'DELETE', path: '/api/budgeting/budgets/:id', purpose: 'Delete budget and its lines' },
				{ method: 'POST', path: '/api/budgeting/budgets/:id/submit', purpose: 'Submit budget for approval' },
				{ method: 'POST', path: '/api/budgeting/budgets/:id/approve', purpose: 'Approve budget' },
				{ method: 'POST', path: '/api/budgeting/budgets/:id/reject', purpose: 'Reject budget' },
				{ method: 'GET', path: '/api/budgeting/allocations', purpose: 'List budget allocations by COA & department' },
				{ method: 'POST', path: '/api/budgeting/allocations', purpose: 'Create budget allocation line' },
				{ method: 'PUT', path: '/api/budgeting/allocations/:id', purpose: 'Update allocation line' },
				{ method: 'DELETE', path: '/api/budgeting/allocations/:id', purpose: 'Delete allocation line' },
				{ method: 'GET', path: '/api/budgeting/revisions', purpose: 'List budget revisions' },
				{ method: 'POST', path: '/api/budgeting/revisions', purpose: 'Create over-budget / revision request' },
				{ method: 'POST', path: '/api/budgeting/revisions/:id/approve', purpose: 'Approve revision' },
				{ method: 'POST', path: '/api/budgeting/revisions/:id/reject', purpose: 'Reject revision' },
				{ method: 'GET', path: '/api/budgeting/budget-vs-actual', purpose: 'Budget vs actual report' }
			]
		},
		{
			name: 'Expenses',
			rows: [
				{ method: 'GET', path: '/api/expenses', purpose: 'List expense entries' },
				{ method: 'POST', path: '/api/expenses', purpose: 'Create salary / purchase / ATK / other expense' },
				{ method: 'PUT', path: '/api/expenses/:id', purpose: 'Update expense' },
				{ method: 'DELETE', path: '/api/expenses/:id', purpose: 'Delete expense' },
				{ method: 'POST', path: '/api/expenses/:id/submit', purpose: 'Submit expense for approval' },
				{ method: 'POST', path: '/api/expenses/:id/approve', purpose: 'Approve expense' },
				{ method: 'POST', path: '/api/expenses/:id/reject', purpose: 'Reject expense' },
				{ method: 'POST', path: '/api/expenses/:id/post', purpose: 'Post expense to general ledger' },
				{ method: 'GET', path: '/api/expenses/posted', purpose: 'List posted expenses' }
			]
		},
		{
			name: 'Inventory',
			rows: [
				{ method: 'GET', path: '/api/inventory/valuation', purpose: 'Inventory valuation report' },
				{ method: 'POST', path: '/api/inventory/adjustments', purpose: 'Post quantity / valuation adjustment' }
			]
		},
		{
			name: 'Pending Approvals',
			rows: [
				{ method: 'GET', path: '/api/pending', purpose: 'List pending history by transactionType' },
				{ method: 'POST', path: '/api/pending', purpose: 'Request pending approval with a pending message' },
				{ method: 'GET', path: '/api/pending/:transactionType/:id', purpose: 'Get one pending row' },
				{ method: 'POST', path: '/api/pending/:transactionType/:id/approve', purpose: 'Approve with an approval message' },
				{ method: 'POST', path: '/api/pending/:transactionType/:id/reject', purpose: 'Reject with a rejection message' }
			]
		}
	];

	const sampleBudget = {
		budgetNo: 'BUD/2024/006',
		fiscalYear: 2024,
		name: 'Marketing Campaign Budget 2024',
		departmentCode: 'SAL',
		departmentName: 'Sales & Marketing',
		totalAmount: 150000000,
		status: 'draft',
		preparedBy: 'Rina Kusuma',
		notes: 'Digital campaign and exhibition'
	};

	const sampleAllocation = {
		budgetId: 'bud-002',
		budgetNo: 'BUD/2024/002',
		fiscalYear: 2024,
		accountCode: '6-9000',
		accountName: 'Other Operating Expenses',
		departmentCode: 'SAL',
		departmentName: 'Sales & Marketing',
		allocatedAmount: 50000000,
		usedAmount: 0,
		notes: 'Digital campaign allocation'
	};

	const sampleExpense = {
		date: '2024-04-30',
		expenseNo: 'EXP/2024/010',
		expenseType: 'office_supplies',
		category: 'Office Supplies (ATK)',
		accountCode: '6-1200',
		accountName: 'Office Supplies (ATK)',
		departmentCode: 'FIN',
		departmentName: 'Finance & Accounting',
		budgetId: 'bud-003',
		budgetNo: 'BUD/2024/003',
		employeeId: '',
		employeeName: '',
		supplierName: 'PT Sumber ATK Nusantara',
		description: 'Monthly stationery restock',
		amount: 2750000,
		taxAmount: 302500,
		totalAmount: 3052500,
		paymentMethod: 'Petty Cash',
		bankAccount: 'PETTY-01',
		paidTo: 'PT Sumber ATK Nusantara',
		status: 'draft',
		attachmentUrl: 'atk-invoice.pdf',
		notes: '',
		submittedBy: 'Nurul Hidayah',
		approvedBy: '',
		postedAt: '',
		glReference: ''
	};

	const sampleRevision = {
		revisionNo: 'REV/2024/004',
		budgetId: 'bud-001',
		budgetNo: 'BUD/2024/001',
		date: '2024-04-30',
		requestedBy: 'Dedi Kurniawan',
		currentAmount: 720000000,
		requestedAmount: 780000000,
		difference: 60000000,
		reason: 'Additional preventive maintenance for aging CNC machines.',
		status: 'pending'
	};

	const samplePending = {
		transactionType: 'quotation',
		transactionId: 'qt-001',
		transactionNumber: 'QUO/2024/001',
		requestedBy: 'Ahmad Fauzi',
		pendingMessage: 'Customer requested a revised unit price before we continue.',
		actorRole: 'SALES_ADMIN'
	};

	const samplePendingDecision = {
		actor: 'Dewi Sartika',
		actorRole: 'OWNER',
		decisionMessage: 'Approved after checking the margin.'
	};

	const samples = [
		{ label: 'POST /api/budgeting/budgets', payload: sampleBudget },
		{ label: 'POST /api/budgeting/allocations', payload: sampleAllocation },
		{ label: 'POST /api/expenses', payload: sampleExpense },
		{ label: 'POST /api/budgeting/revisions', payload: sampleRevision },
		{ label: 'POST /api/pending', payload: samplePending },
		{ label: 'POST /api/pending/:type/:id/approve', payload: samplePendingDecision }
	];
</script>

<div class="space-y-6">
	<PageHeader
		title="API Integration & Payloads"
		description="Contract between the accounting frontend and admin-accounting-backend. All business logic and persistence are handled by the backend."
	/>

	<div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
		<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
			<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">API Base URL</p>
			<p class="mt-1 text-sm font-bold text-gray-900 dark:text-white break-all">{apiBaseUrl || 'Not configured'}</p>
			<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
				Set <code class="font-mono">VITE_API_BASE_URL</code> in <code class="font-mono">.env</code>.
			</p>
		</div>
		<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
			<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Mode</p>
			<p class="mt-1"><Badge status={isApiConfigured ? 'active' : 'pending'} label={isApiConfigured ? 'Live API' : 'Mock capture'} /></p>
			<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">
				Mock mode logs every payload locally and keeps the UI usable until the backend is connected.
			</p>
		</div>
		<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 p-4">
			<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Captured Requests</p>
			<p class="mt-1 text-2xl font-black text-gray-900 dark:text-white">{$apiCalls.length}</p>
			<Button size="sm" variant="secondary" on:click={clearApiCalls}>Clear log</Button>
		</div>
	</div>

	{#each endpointGroups as group}
		<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
			<div class="px-4 py-3 border-b border-gray-200 dark:border-slate-800">
				<h2 class="text-sm font-bold text-gray-900 dark:text-white">{group.name}</h2>
			</div>
			<div class="overflow-x-auto">
				<table class="min-w-full text-sm">
					<thead class="bg-slate-50 dark:bg-slate-950/60 text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">
						<tr>
							<th class="px-4 py-2 text-left">Method</th>
							<th class="px-4 py-2 text-left">Path</th>
							<th class="px-4 py-2 text-left">Purpose</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						{#each group.rows as row}
							<tr>
								<td class="px-4 py-2">
									<span class="font-mono text-xs font-bold {row.method === 'GET' ? 'text-blue-600 dark:text-blue-300' : row.method === 'DELETE' ? 'text-rose-600 dark:text-rose-300' : 'text-emerald-600 dark:text-emerald-300'}">{row.method}</span>
								</td>
								<td class="px-4 py-2 font-mono text-xs text-gray-800 dark:text-slate-200">{row.path}</td>
								<td class="px-4 py-2 text-gray-600 dark:text-slate-400">{row.purpose}</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>
	{/each}

	<div class="grid grid-cols-1 xl:grid-cols-2 gap-4">
		{#each samples as sample}
			<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
				<div class="px-4 py-2.5 border-b border-gray-200 dark:border-slate-800">
					<p class="font-mono text-xs font-bold text-emerald-600 dark:text-emerald-300">{sample.label}</p>
				</div>
				<pre class="overflow-x-auto bg-slate-950 text-emerald-300 text-[11px] p-4">{JSON.stringify(sample.payload, null, 2)}</pre>
			</div>
		{/each}
	</div>

	<div class="rounded-xl border border-gray-200 dark:border-slate-800 bg-white dark:bg-slate-900 overflow-hidden">
		<div class="px-4 py-3 border-b border-gray-200 dark:border-slate-800 flex items-center justify-between">
			<h2 class="text-sm font-bold text-gray-900 dark:text-white">Recent API payload log</h2>
			<span class="text-[11px] text-gray-500 dark:text-slate-400">Latest 50 requests</span>
		</div>
		{#if $apiCalls.length === 0}
			<p class="px-4 py-8 text-sm text-center text-gray-500 dark:text-slate-400">
				No request captured yet. Open a form, save a record, and the payload will appear here.
			</p>
		{:else}
			<div class="divide-y divide-gray-100 dark:divide-slate-800">
				{#each $apiCalls as call}
					<div class="px-4 py-3">
						<div class="flex flex-wrap items-center gap-2 text-xs">
							<span class="font-mono font-bold text-gray-800 dark:text-slate-200">{call.method}</span>
							<span class="font-mono text-gray-600 dark:text-slate-400">{call.path}</span>
							<Badge status={call.status === 'error' ? 'rejected' : call.status === 'mock' ? 'pending' : 'approved'} label={call.mode} />
							<span class="text-gray-400 dark:text-slate-500">{new Date(call.at).toLocaleString('en-US')}</span>
						</div>
						{#if call.payload}
							<details class="mt-2">
								<summary class="cursor-pointer text-[11px] font-semibold text-blue-600 dark:text-blue-300">View payload</summary>
								<pre class="mt-2 overflow-x-auto rounded-lg bg-slate-950 text-emerald-300 text-[11px] p-3">{JSON.stringify(call.payload, null, 2)}</pre>
							</details>
						{/if}
					</div>
				{/each}
			</div>
		{/if}
	</div>
</div>
