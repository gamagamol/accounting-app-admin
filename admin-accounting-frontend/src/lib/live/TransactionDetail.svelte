<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import Badge from '$lib/components/ui/Badge.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import { liveApi, type MasterDataOptions } from '$lib/api/live';
	import { getTransactionConfig } from './transaction-config';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let type: string;
	export let id: number | string;

	$: config = getTransactionConfig(type);
	$: isPayment = config.lineMode === 'payment';
	$: isLogistics = type === 'delivery' || type === 'goods-receipt';

	let options: MasterDataOptions | null = null;
	let transaction: { header: Record<string, any>; lines: Record<string, any>[] } | null = null;
	let invoiceLookup: Record<string, any>[] = [];
	let loading = true;
	let approving = false;
	let error = '';

	$: canCreateNext = (() => {
		if (!transaction) return false;
		const status = String(transaction.header.status ?? '');
		switch (type) {
			case 'quotation':
				return status === 'approved' && transaction.header.is_converted !== true;
			case 'sales-order':
				return status === 'approved' && transaction.header.has_remaining_delivery !== false;
			case 'purchase-order':
				return status === 'approved' && transaction.header.has_remaining_receipt !== false;
			case 'delivery':
			case 'goods-receipt':
				return (
					['completed', 'approved'].includes(status) &&
					transaction.header.has_remaining_invoice !== false
				);
			case 'sales-invoice':
			case 'purchase-invoice':
				return (
					['completed', 'approved'].includes(status) &&
					Number(transaction.header.outstanding_amount || 0) > 0
				);
			default:
				return true;
		}
	})();

	function customerName(customerId: number | null | undefined): string {
		if (!options || !customerId) return '-';
		const customer = options.customers.find((item) => item.id === Number(customerId));
		return customer ? customer.name : `#${customerId}`;
	}

	function supplierName(supplierId: number | null | undefined): string {
		if (!options || !supplierId) return '-';
		const supplier = options.suppliers.find((item) => item.id === Number(supplierId));
		return supplier ? supplier.name : `#${supplierId}`;
	}

	function productName(productId: number | null | undefined): string {
		if (!options || !productId) return '-';
		const product = options.products.find((item) => item.id === Number(productId));
		return product ? `${product.code} — ${product.name}` : `#${productId}`;
	}

	function uomName(uomId: number | null | undefined): string {
		if (!options || !uomId) return '-';
		const uom = options.uoms.find((item) => item.id === Number(uomId));
		return uom ? uom.name : `#${uomId}`;
	}

	function invoiceNumber(invoiceId: number | null | undefined): string {
		if (!invoiceId) return '-';
		const invoice = invoiceLookup.find((item) => Number(item.id) === Number(invoiceId));
		return invoice ? invoice.document_number : `#${invoiceId}`;
	}

	function money(value: unknown): string {
		return formatCurrency(Number(value ?? 0));
	}

	function date(value: unknown): string {
		return value ? formatDate(String(value)) : '-';
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const [optionsResult, transactionResult] = await Promise.all([
				liveApi.options(),
				liveApi.get(type, id)
			]);
			options = optionsResult.data;
			transaction = transactionResult.data;

			if (isPayment) {
				const invoiceType = type === 'customer-receipt' ? 'sales-invoice' : 'purchase-invoice';
				const invoiceResult = await liveApi.list(invoiceType, { limit: 100 });
				invoiceLookup = invoiceResult.data;
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load transaction';
		} finally {
			loading = false;
		}
	}

	function actorName(preparedBy: unknown): string {
		return options?.users.find((user) => user.id === Number(preparedBy))?.name ?? 'Frontend User';
	}

	async function approve() {
		approving = true;
		error = '';
		try {
			await liveApi.approve(type, id, actorName(transaction?.header?.prepared_by));
			await load();
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to approve transaction';
		} finally {
			approving = false;
		}
	}

	function createNext() {
		if (!transaction || !config.next) return;
		goto(`/${config.next.route}/new?parent=${transaction.header.id}`);
	}

	onMount(load);
</script>

<div class="space-y-6">
	<PageHeader
		title={transaction?.header?.document_number ?? config.singular}
		description={`${config.singular} detail and workflow actions`}
	>
		<Button variant="secondary" href={`/${config.route}`}>Back to list</Button>
		{#if config.next && canCreateNext}
			<Button variant="primary" on:click={createNext}>{config.next.label}</Button>
		{/if}
	</PageHeader>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading transaction...
		</div>
	{:else if transaction}
		<div class="grid grid-cols-1 gap-6 xl:grid-cols-3">
			<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900 xl:col-span-2">
				<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
					<h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
						Document information
					</h2>
					<Badge status={transaction.header.status} />
				</div>

				<dl class="grid grid-cols-1 gap-4 text-sm sm:grid-cols-2 lg:grid-cols-3">
					<div>
						<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Document date</dt>
						<dd class="font-medium text-gray-900 dark:text-white">{date(transaction.header.document_date)}</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Prepared by</dt>
						<dd class="font-medium text-gray-900 dark:text-white">
							{options?.users.find((user) => user.id === Number(transaction?.header.prepared_by))?.name ?? '-'}
						</dd>
					</div>
					<div>
						<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Currency</dt>
						<dd class="font-medium text-gray-900 dark:text-white">{transaction.header.currency_code ?? 'IDR'}</dd>
					</div>

					{#if transaction.header.customer_id}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Customer</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{customerName(transaction.header.customer_id)}</dd>
						</div>
					{/if}

					{#if transaction.header.supplier_id}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Supplier</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{supplierName(transaction.header.supplier_id)}</dd>
						</div>
					{/if}

					{#if config.referenceKey && transaction.header[config.referenceKey]}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">{config.referenceLabel}</dt>
							<dd class="font-medium text-gray-900 dark:text-white">
								{#if config.referenceRoute && config.referenceIdKey && transaction.header[config.referenceIdKey]}
									<a
										href={`/${config.referenceRoute}/${transaction.header[config.referenceIdKey]}`}
										class="font-mono font-semibold text-indigo-700 hover:underline dark:text-indigo-300"
									>
										{transaction.header[config.referenceKey]}
									</a>
								{:else}
									<span class="font-mono">{transaction.header[config.referenceKey]}</span>
								{/if}
							</dd>
						</div>
					{/if}

					{#if transaction.header.warehouse_id}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Warehouse</dt>
							<dd class="font-medium text-gray-900 dark:text-white">
								{options?.warehouses.find((warehouse) => warehouse.id === Number(transaction?.header.warehouse_id))?.name ?? '-'}
							</dd>
						</div>
					{/if}

					{#if transaction.header.due_date}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Due date</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{date(transaction.header.due_date)}</dd>
						</div>
					{/if}

					{#if transaction.header.valid_until}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Valid until</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{date(transaction.header.valid_until)}</dd>
						</div>
					{/if}

					{#if transaction.header.expected_date}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Expected date</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{date(transaction.header.expected_date)}</dd>
						</div>
					{/if}

					{#if transaction.header.payment_method}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Payment method</dt>
							<dd class="font-medium text-gray-900 dark:text-white">{transaction.header.payment_method}</dd>
						</div>
					{/if}

					{#if transaction.header.bank_account_id}
						<div>
							<dt class="text-xs uppercase tracking-wide text-gray-400 dark:text-slate-500">Bank account</dt>
							<dd class="font-medium text-gray-900 dark:text-white">
								{options?.bankAccounts.find((account) => account.id === Number(transaction?.header.bank_account_id))?.name ?? '-'}
							</dd>
						</div>
					{/if}
				</dl>

				{#if transaction.header.notes}
					<div class="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm text-gray-700 dark:bg-slate-950/60 dark:text-slate-200">
						<span class="font-medium">Notes:</span> {transaction.header.notes}
					</div>
				{/if}
			</section>

			<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
					Summary
				</h2>
				<div class="space-y-2 text-sm">
					{#if transaction.header.subtotal !== undefined}
						<div class="flex justify-between text-gray-600 dark:text-slate-300">
							<span>Subtotal</span>
							<span class="font-mono">{money(transaction.header.subtotal)}</span>
						</div>
					{/if}
					{#if transaction.header.discount_total !== undefined}
						<div class="flex justify-between text-gray-600 dark:text-slate-300">
							<span>Discount</span>
							<span class="font-mono">{money(transaction.header.discount_total)}</span>
						</div>
					{/if}
					{#if transaction.header.tax_total !== undefined}
						<div class="flex justify-between text-gray-600 dark:text-slate-300">
							<span>Tax</span>
							<span class="font-mono">{money(transaction.header.tax_total)}</span>
						</div>
					{/if}
					{#if transaction.header.grand_total !== undefined}
						<div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-slate-800 dark:text-white">
							<span>Grand total</span>
							<span class="font-mono">{money(transaction.header.grand_total)}</span>
						</div>
					{/if}
					{#if transaction.header.total_amount !== undefined}
						<div class="flex justify-between border-t border-gray-200 pt-2 font-semibold text-gray-900 dark:border-slate-800 dark:text-white">
							<span>Total amount</span>
							<span class="font-mono">{money(transaction.header.total_amount)}</span>
						</div>
					{/if}
					{#if transaction.header.paid_amount !== undefined}
						<div class="flex justify-between text-emerald-600 dark:text-emerald-400">
							<span>Paid</span>
							<span class="font-mono">{money(transaction.header.paid_amount)}</span>
						</div>
					{/if}
					{#if transaction.header.outstanding_amount !== undefined}
						<div class="flex justify-between text-rose-600 dark:text-rose-400">
							<span>Outstanding</span>
							<span class="font-mono">{money(transaction.header.outstanding_amount)}</span>
						</div>
					{/if}
				</div>

				{#if config.approvable && transaction.header.status === 'draft'}
					<div class="mt-5">
						<Button variant="success" disabled={approving} on:click={approve}>
							{approving ? 'Approving...' : `Approve ${config.singular}`}
						</Button>
					</div>
				{/if}
			</section>
		</div>

		<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
			<h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
				{isPayment ? 'Payment allocation' : 'Line items'}
			</h2>

			<div class="overflow-x-auto">
				<table class="min-w-full text-sm">
					<thead>
						<tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:text-slate-400">
							<th class="px-2 py-2">#</th>
							{#if isPayment}
								<th class="px-2 py-2">Invoice</th>
								<th class="px-2 py-2 text-right">Amount</th>
							{:else}
								<th class="px-2 py-2">Product</th>
								<th class="px-2 py-2">Description</th>
								<th class="px-2 py-2 text-right">Qty</th>
								<th class="px-2 py-2">UoM</th>
								{#if !isLogistics}
									<th class="px-2 py-2 text-right">Unit price</th>
									<th class="px-2 py-2 text-right">Discount</th>
									<th class="px-2 py-2 text-right">Tax</th>
									<th class="px-2 py-2 text-right">Total</th>
								{/if}
							{/if}
						</tr>
					</thead>
					<tbody>
						{#each transaction.lines as line, index}
							<tr class="border-b border-gray-100 dark:border-slate-800/70">
								<td class="px-2 py-2 text-gray-500 dark:text-slate-400">{line.line_number ?? index + 1}</td>
								{#if isPayment}
									<td class="px-2 py-2 font-medium text-gray-900 dark:text-white">
										{invoiceNumber(line.sales_invoice_id ?? line.purchase_invoice_id)}
									</td>
									<td class="px-2 py-2 text-right font-mono">{money(line.amount)}</td>
								{:else}
									<td class="px-2 py-2 font-medium text-gray-900 dark:text-white">{productName(line.product_id)}</td>
									<td class="px-2 py-2 text-gray-600 dark:text-slate-300">{line.description ?? '-'}</td>
									<td class="px-2 py-2 text-right font-mono">{Number(line.quantity ?? 0)}</td>
									<td class="px-2 py-2 text-gray-600 dark:text-slate-300">{uomName(line.uom_id)}</td>
									{#if !isLogistics}
										<td class="px-2 py-2 text-right font-mono">{money(line.unit_price)}</td>
										<td class="px-2 py-2 text-right font-mono">{money(line.discount_amount)}</td>
										<td class="px-2 py-2 text-right font-mono">{money(line.tax_amount)}</td>
										<td class="px-2 py-2 text-right font-mono font-semibold">{money(line.total)}</td>
									{/if}
								{/if}
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</section>

		<AuditLogPanel
			entityType={type}
			entityId={String(transaction.header.id)}
			title="Transaction audit log"
			description="Every create, post, and approval action for this transaction is recorded here with its document reference and amount."
		/>
	{:else}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Transaction not found.
		</div>
	{/if}
</div>
