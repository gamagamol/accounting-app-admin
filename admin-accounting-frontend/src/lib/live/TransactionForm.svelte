<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { liveApi, type MasterDataOptions } from '$lib/api/live';
	import { getTransactionConfig } from './transaction-config';
	import { formatCurrency, formatDate } from '$lib/utils/formatters';

	export let type: string;

	$: config = getTransactionConfig(type);
	$: isPayment = config.lineMode === 'payment';
	$: isProduct = config.lineMode === 'product';
	$: isPartial = config.lineMode === 'partial';
	$: isReceipt = type === 'goods-receipt';
	$: isSalesFlow =
		type === 'quotation' ||
		type === 'sales-order' ||
		type === 'delivery' ||
		type === 'sales-invoice' ||
		type === 'customer-receipt';

	interface ProductLine {
		productId: number | '';
		quantity: number;
		unitPrice: number;
		discountPercent: number;
		taxRateId: number | '';
		uomId: number | '';
	}

	const today = () => new Date().toISOString().split('T')[0];
	const todayPlus = (days: number) => {
		const date = new Date();
		date.setDate(date.getDate() + days);
		return date.toISOString().split('T')[0];
	};

	let options: MasterDataOptions | null = null;
	let loading = true;
	let submitting = false;
	let error = '';

	let documentDate = today();
	let dueDate = todayPlus(30);
	let expectedDate = todayPlus(7);
	let validUntil = todayPlus(14);
	let customerId: number | '' = '';
	let supplierId: number | '' = '';
	let warehouseId: number | '' = '';
	let paymentTermId: number | '' = '';
	let taxRateId: number | '' = '';
	let preparedBy: number | '' = '';
	let salespersonId: number | '' = '';
	let bankAccountId: number | '' = '';
	let paymentMethod = 'transfer';
	let notes = '';

	let parentId: number | '' = '';
	let parentOptions: Record<string, any>[] = [];
	let parentLoading = false;

	interface ParentLine {
		id: number;
		productId: number | null;
		description: string;
		quantity: number;
		fulfilled: number;
		remaining: number;
		uomId: number | null;
		unitPrice: number;
		discountPercent: number;
		taxRateId: number | null;
		sendQuantity: number;
	}

	let parentLines: ParentLine[] = [];
	let parentLinesLoading = false;

	let productLines: ProductLine[] = [newProductLine()];
	let paymentInvoiceId: number | '' = '';
	let paymentAmount = 0;
	let paymentInvoices: Record<string, any>[] = [];

	function newProductLine(): ProductLine {
		return {
			productId: '',
			quantity: 1,
			unitPrice: 0,
			discountPercent: 0,
			taxRateId: '',
			uomId: ''
		};
	}

	function productName(id: number | '' | null | undefined): string {
		if (!options || !id) return '-';
		const product = options.products.find((item) => item.id === Number(id));
		return product ? `${product.code} - ${product.name}` : '-';
	}

	function defaultTaxRateId(): number | '' {
		if (!options || options.taxRates.length === 0) return '';
		const preferredType = isSalesFlow ? 'sales' : 'purchase';
		const preferred = options.taxRates.find((tax) => tax.taxType === preferredType);
		return preferred?.id ?? options.taxRates[0].id;
	}

	function invoiceNumber(id: number | '' | null | undefined): string {
		if (!id) return '-';
		const invoice = paymentInvoices.find((item) => Number(item.id) === Number(id));
		return invoice ? invoice.document_number : `#${id}`;
	}

	function partyName(row: Record<string, any> | undefined): string {
		if (!options || !row) return '-';
		if (row.customer_id) {
			const customer = options.customers.find((item) => item.id === Number(row.customer_id));
			if (customer) return customer.name;
		}
		if (row.supplier_id) {
			const supplier = options.suppliers.find((item) => item.id === Number(row.supplier_id));
			if (supplier) return supplier.name;
		}
		return '-';
	}

	$: selectedParent = parentOptions.find((row) => Number(row.id) === Number(parentId));
	$: selectedInvoice = paymentInvoices.find((row) => Number(row.id) === Number(paymentInvoiceId));
	$: parentReferenceKey =
		config.parentType === 'delivery'
			? 'sales_order_number'
			: config.parentType === 'goods-receipt'
				? 'purchase_order_number'
				: null;
	$: parentReferenceLabel =
		config.parentType === 'delivery'
			? 'SO'
			: config.parentType === 'goods-receipt'
				? 'PO'
				: '';

	$: lineSubtotal = productLines.reduce((sum, line) => {
		const gross = Number(line.quantity || 0) * Number(line.unitPrice || 0);
		const discount = gross * (Number(line.discountPercent || 0) / 100);
		return sum + gross - discount;
	}, 0);

	$: lineTax = productLines.reduce((sum, line) => {
		const gross = Number(line.quantity || 0) * Number(line.unitPrice || 0);
		const discount = gross * (Number(line.discountPercent || 0) / 100);
		const net = gross - discount;
		const tax = options?.taxRates.find((item) => item.id === Number(line.taxRateId));
		return sum + net * (Number(tax?.rate || 0) / 100);
	}, 0);

	$: grandTotal = lineSubtotal + lineTax;

	$: partialSubtotal = parentLines.reduce((sum, line) => {
		const gross = Number(line.sendQuantity || 0) * Number(line.unitPrice || 0);
		const discount = gross * (Number(line.discountPercent || 0) / 100);
		return sum + gross - discount;
	}, 0);

	$: partialTax = parentLines.reduce((sum, line) => {
		const gross = Number(line.sendQuantity || 0) * Number(line.unitPrice || 0);
		const discount = gross * (Number(line.discountPercent || 0) / 100);
		const net = gross - discount;
		const tax = options?.taxRates.find((item) => item.id === Number(line.taxRateId));
		return sum + net * (Number(tax?.rate || 0) / 100);
	}, 0);

	$: partialTotal = partialSubtotal + partialTax;

	function onProductChange(line: ProductLine) {
		if (!options || !line.productId) return;
		const product = options.products.find((item) => item.id === Number(line.productId));
		if (!product) return;
		line.unitPrice = type === 'purchase-order' ? product.costPrice : product.sellingPrice;
		line.uomId = product.uomId;
		if (!line.taxRateId) {
			line.taxRateId = defaultTaxRateId();
		}
		productLines = [...productLines];
	}

	function addLine() {
		productLines = [
			...productLines,
			{ ...newProductLine(), taxRateId: defaultTaxRateId() }
		];
	}

	function removeLine(index: number) {
		productLines = productLines.filter((_, idx) => idx !== index);
		if (productLines.length === 0) productLines = [newProductLine()];
	}

	function onInvoiceChange() {
		if (!selectedInvoice) {
			paymentAmount = 0;
			return;
		}
		paymentAmount = Number(selectedInvoice.outstanding_amount || 0);
	}

	async function load() {
		loading = true;
		error = '';
		try {
			const result = await liveApi.options();
			options = result.data;
			preparedBy = options.users[0]?.id ?? '';
			warehouseId = options.warehouses[0]?.id ?? '';
			paymentTermId = options.paymentTerms[0]?.id ?? '';
			const taxDefault = defaultTaxRateId();
			taxRateId = taxDefault;
			salespersonId = options.users[0]?.id ?? '';
			bankAccountId = options.bankAccounts[0]?.id ?? '';
			productLines = productLines.map((line) => ({
				...line,
				taxRateId: line.taxRateId || taxDefault
			}));

			if (config.parentType) {
				await loadParentOptions();
			}
			if (isPayment) {
				await loadPaymentInvoices();
			}

			const queryParent = Number($page.url.searchParams.get('parent') ?? 0);
			if (queryParent > 0 && config.parentType) {
				if (parentOptions.some((row) => Number(row.id) === queryParent)) {
					parentId = queryParent;
				} else {
					error =
						'The selected parent transaction is already completed or not eligible for this step.';
				}
			}
			if (isPartial && parentId) {
				await loadParentLines();
			}
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load form data';
		} finally {
			loading = false;
		}
	}

	async function loadParentOptions() {
		if (!config.parentType) return;
		parentLoading = true;
		try {
			const result = await liveApi.list(config.parentType, { limit: 100 });
			const eligibleStatuses =
				config.parentType === 'quotation' ||
				config.parentType === 'sales-order' ||
				config.parentType === 'purchase-order'
					? ['approved']
					: ['completed'];
			parentOptions = result.data.filter((row) => {
				if (!eligibleStatuses.includes(String(row.status))) return false;
				switch (config.parentType) {
					case 'quotation':
						return row.is_converted !== true;
					case 'sales-order':
						return row.has_remaining_delivery === true;
					case 'purchase-order':
						return row.has_remaining_receipt === true;
					case 'delivery':
					case 'goods-receipt':
						return row.has_remaining_invoice === true;
					default:
						return true;
				}
			});
		} finally {
			parentLoading = false;
		}
	}

	async function loadPaymentInvoices() {
		const invoiceType = type === 'customer-receipt' ? 'sales-invoice' : 'purchase-invoice';
		const result = await liveApi.list(invoiceType, { limit: 100 });
		paymentInvoices = result.data.filter((row) => Number(row.outstanding_amount || 0) > 0);
		if (paymentInvoices.length > 0 && !paymentInvoiceId) {
			paymentInvoiceId = paymentInvoices[0].id;
			paymentAmount = Number(paymentInvoices[0].outstanding_amount || 0);
		}
	}

	async function loadParentLines() {
		parentLines = [];
		if (!isPartial || !parentId || !config.parentType) return;
		parentLinesLoading = true;
		error = '';
		try {
			const result = await liveApi.get(config.parentType, Number(parentId));
			parentLines = result.data.lines.map((line) => {
				const quantity = Number(line.quantity ?? 0);
				const fulfilled = Number(
					isReceipt ? (line.quantity_received ?? 0) : (line.quantity_delivered ?? 0)
				);
				const remaining = Math.max(0, quantity - fulfilled);
				return {
					id: Number(line.id),
					productId: line.product_id ? Number(line.product_id) : null,
					description: String(line.description ?? ''),
					quantity,
					fulfilled,
					remaining,
					uomId: line.uom_id ? Number(line.uom_id) : null,
					unitPrice: Number(line.unit_price ?? 0),
					discountPercent: Number(line.discount_percent ?? 0),
					taxRateId: line.tax_rate_id ? Number(line.tax_rate_id) : null,
					sendQuantity: remaining
				};
			});
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to load parent document lines';
		} finally {
			parentLinesLoading = false;
		}
	}

	async function onParentChange() {
		error = '';
		await loadParentLines();
	}

	function fillRemaining() {
		parentLines = parentLines.map((line) => ({ ...line, sendQuantity: line.remaining }));
	}

	function validate(): string {
		if (!documentDate) return 'Document date is required';
		if (config.parentField && !parentId) return `${config.parentLabel ?? 'Parent document'} is required`;
		if (isProduct) {
			if (config.party === 'customer' && !customerId) return 'Customer is required';
			if (config.party === 'supplier' && !supplierId) return 'Supplier is required';
			if (productLines.length === 0) return 'At least one line is required';
			for (const line of productLines) {
				if (!line.productId) return 'Every line must have a product';
				if (Number(line.quantity) <= 0) return 'Quantity must be greater than zero';
			}
		}
		if (isPayment) {
			if (!paymentInvoiceId) return 'Invoice is required';
			if (Number(paymentAmount) <= 0) return 'Payment amount must be greater than zero';
		}
		if (isPartial) {
			if (parentLines.length === 0) {
				return `Selected ${config.parentLabel?.toLowerCase() ?? 'parent document'} has no lines`;
			}
			const selectedLines = parentLines.filter((line) => Number(line.sendQuantity) > 0);
			if (selectedLines.length === 0) {
				return `Enter at least one quantity to ${isReceipt ? 'receive' : 'deliver'}`;
			}
			for (const line of selectedLines) {
				if (Number(line.sendQuantity) > line.remaining + 0.0001) {
					return `Quantity for ${productName(line.productId)} exceeds the remaining quantity`;
				}
			}
		}
		if (config.showWarehouse && !warehouseId) return 'Warehouse is required';
		if (config.showDueDate && !dueDate) return 'Due date is required';
		return '';
	}

	function buildPayload(): Record<string, unknown> {
		const actor = options?.users.find((user) => user.id === Number(preparedBy))?.name;
		const payload: Record<string, unknown> = {
			document_date: documentDate,
			notes: notes || undefined,
			prepared_by: preparedBy || undefined,
			actor: actor ?? 'Frontend User'
		};

		if (config.parentField) {
			payload[config.parentField] = Number(parentId);
		}

		if (config.party === 'customer' && !config.parentField && !isPayment) {
			payload.customer_id = Number(customerId);
		}
		if (config.party === 'supplier' && !config.parentField && !isPayment) {
			payload.supplier_id = Number(supplierId);
		}

		if (config.showWarehouse) payload.warehouse_id = Number(warehouseId);
		if (config.showDueDate) payload.due_date = dueDate;
		if (config.showExpectedDate) payload.expected_date = expectedDate;
		if (config.showValidUntil) payload.valid_until = validUntil;
		if (type === 'quotation' || type === 'purchase-order') {
			if (paymentTermId) payload.payment_term_id = Number(paymentTermId);
			if (taxRateId) payload.tax_rate_id = Number(taxRateId);
		}
		if (type === 'quotation' && salespersonId) {
			payload.salesperson_id = Number(salespersonId);
		}
		if (isPayment) {
			payload.payment_method = paymentMethod;
			if (bankAccountId) payload.bank_account_id = Number(bankAccountId);
		}

		if (isProduct) {
			payload.lines = productLines.map((line) => ({
				product_id: Number(line.productId),
				quantity: Number(line.quantity),
				unit_price: Number(line.unitPrice),
				discount_percent: Number(line.discountPercent),
				uom_id: line.uomId ? Number(line.uomId) : undefined,
				tax_rate_id: line.taxRateId ? Number(line.taxRateId) : undefined
			}));
		}

		if (isPayment) {
			payload.lines = [
				type === 'customer-receipt'
					? { sales_invoice_id: Number(paymentInvoiceId), amount: Number(paymentAmount) }
					: { purchase_invoice_id: Number(paymentInvoiceId), amount: Number(paymentAmount) }
			];
		}

		if (isPartial) {
			payload.lines = parentLines
				.filter((line) => Number(line.sendQuantity) > 0)
				.map((line) => ({
					parent_detail_id: line.id,
					quantity: Number(line.sendQuantity)
				}));
		}

		return payload;
	}

	async function submit() {
		const validationError = validate();
		if (validationError) {
			error = validationError;
			return;
		}

		submitting = true;
		error = '';
		try {
			const result = await liveApi.create(type, buildPayload());
			await goto(`/${config.route}/${result.data.header.id}`);
		} catch (err) {
			error = err instanceof Error ? err.message : 'Failed to create transaction';
		} finally {
			submitting = false;
		}
	}

	onMount(load);
</script>

<div class="space-y-6">
	<PageHeader
		title={`New ${config.singular}`}
		description={config.description}
	>
		<Button variant="secondary" href={`/${config.route}`}>Back to list</Button>
	</PageHeader>

	{#if error}
		<div class="rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700 dark:border-rose-500/30 dark:bg-rose-500/10 dark:text-rose-200">
			{error}
		</div>
	{/if}

	{#if loading}
		<div class="rounded-2xl border border-gray-200 bg-white p-10 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-900 dark:text-slate-400">
			Loading form data...
		</div>
	{:else}
		<form class="space-y-6" on:submit|preventDefault={submit}>
			<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
				<h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
					Document information
				</h2>

				<div class="grid grid-cols-1 gap-4 md:grid-cols-2 xl:grid-cols-3">
					<label class="space-y-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-slate-200">Document date</span>
						<input
							type="date"
							bind:value={documentDate}
							class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
						/>
					</label>

					{#if config.parentType}
						<label class="space-y-1 text-sm md:col-span-2">
							<span class="font-medium text-gray-700 dark:text-slate-200">{config.parentLabel}</span>
							<select
								bind:value={parentId}
								on:change={onParentChange}
								disabled={parentLoading}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select {config.parentLabel?.toLowerCase()}</option>
								{#each parentOptions as parent}
									<option value={parent.id}>
										{#if parentReferenceKey && parent[parentReferenceKey]}
											{parentReferenceLabel} {parent[parentReferenceKey]} — {parent.document_number} — {formatDate(parent.document_date)}
										{:else}
											{parent.document_number} — {formatDate(parent.document_date)} — {formatCurrency(Number(parent.grand_total ?? parent.total_amount ?? 0))}
										{/if}
									</option>
								{/each}
							</select>
							{#if !parentLoading && parentOptions.length === 0}
								<p class="text-xs text-amber-600 dark:text-amber-400">
									No open {config.parentLabel?.toLowerCase()} found. All previous transactions are already completed or fully processed.
								</p>
							{/if}
						</label>
					{/if}

					{#if config.party === 'customer' && !config.parentField && !isPayment}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Customer</span>
							<select
								bind:value={customerId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select customer</option>
								{#each options?.customers ?? [] as customer}
									<option value={customer.id}>{customer.code} — {customer.name}</option>
								{/each}
							</select>
						</label>
					{/if}

					{#if config.party === 'supplier' && !config.parentField && !isPayment}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Supplier</span>
							<select
								bind:value={supplierId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select supplier</option>
								{#each options?.suppliers ?? [] as supplier}
									<option value={supplier.id}>{supplier.code} — {supplier.name}</option>
								{/each}
							</select>
						</label>
					{/if}

					{#if config.showWarehouse}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Warehouse</span>
							<select
								bind:value={warehouseId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select warehouse</option>
								{#each options?.warehouses ?? [] as warehouse}
									<option value={warehouse.id}>{warehouse.code} — {warehouse.name}</option>
								{/each}
							</select>
						</label>
					{/if}

					{#if config.showValidUntil}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Valid until</span>
							<input
								type="date"
								bind:value={validUntil}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							/>
						</label>
					{/if}

					{#if config.showExpectedDate}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Expected date</span>
							<input
								type="date"
								bind:value={expectedDate}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							/>
						</label>
					{/if}

					{#if config.showDueDate}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Due date</span>
							<input
								type="date"
								bind:value={dueDate}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							/>
						</label>
					{/if}

					{#if type === 'quotation' || type === 'purchase-order'}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Payment term</span>
							<select
								bind:value={paymentTermId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select payment term</option>
								{#each options?.paymentTerms ?? [] as term}
									<option value={term.id}>{term.name} ({term.days} days)</option>
								{/each}
							</select>
						</label>

						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Default tax rate</span>
							<select
								bind:value={taxRateId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">No tax</option>
								{#each options?.taxRates ?? [] as tax}
									<option value={tax.id}>{tax.name} ({tax.rate}%)</option>
								{/each}
							</select>
						</label>
					{/if}

					{#if type === 'quotation'}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Salesperson</span>
							<select
								bind:value={salespersonId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select salesperson</option>
								{#each options?.users ?? [] as user}
									<option value={user.id}>{user.name}</option>
								{/each}
							</select>
						</label>
					{/if}

					{#if config.showPayment}
						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Payment method</span>
							<select
								bind:value={paymentMethod}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="transfer">Bank transfer</option>
								<option value="cash">Cash</option>
								<option value="cheque">Cheque</option>
							</select>
						</label>

						<label class="space-y-1 text-sm">
							<span class="font-medium text-gray-700 dark:text-slate-200">Bank account</span>
							<select
								bind:value={bankAccountId}
								class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
							>
								<option value="">Select bank account</option>
								{#each options?.bankAccounts ?? [] as account}
									<option value={account.id}>{account.code} — {account.name}</option>
								{/each}
							</select>
						</label>
					{/if}

					<label class="space-y-1 text-sm">
						<span class="font-medium text-gray-700 dark:text-slate-200">Prepared by</span>
						<select
							bind:value={preparedBy}
							class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
						>
							<option value="">Select user</option>
							{#each options?.users ?? [] as user}
								<option value={user.id}>{user.name}</option>
							{/each}
						</select>
					</label>

					<label class="space-y-1 text-sm md:col-span-2 xl:col-span-3">
						<span class="font-medium text-gray-700 dark:text-slate-200">Notes</span>
						<textarea
							rows="2"
							bind:value={notes}
							placeholder="Optional notes for this document..."
							class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
						></textarea>
					</label>
				</div>

				{#if selectedParent}
					<div class="mt-4 rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950/60">
						<div class="flex flex-wrap items-center gap-x-6 gap-y-1 text-gray-600 dark:text-slate-300">
							<span>Parent: <strong class="text-gray-900 dark:text-white">{selectedParent.document_number}</strong></span>
							{#if parentReferenceKey && selectedParent[parentReferenceKey]}
								<span>
									{parentReferenceLabel}:
									<strong class="font-mono text-indigo-700 dark:text-indigo-300">{selectedParent[parentReferenceKey]}</strong>
								</span>
							{/if}
							<span>Party: <strong class="text-gray-900 dark:text-white">{partyName(selectedParent)}</strong></span>
							{#if !parentReferenceKey}
								<span>Total: <strong class="text-gray-900 dark:text-white">{formatCurrency(Number(selectedParent.grand_total ?? selectedParent.total_amount ?? 0))}</strong></span>
							{/if}
						</div>
					</div>
				{/if}
			</section>

			{#if isProduct}
				<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div class="mb-4 flex items-center justify-between gap-3">
						<h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
							Product lines
						</h2>
						<Button size="sm" variant="secondary" on:click={addLine}>+ Add line</Button>
					</div>

					<div class="overflow-x-auto">
						<table class="min-w-full text-sm">
							<thead>
								<tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:text-slate-400">
									<th class="px-2 py-2">Product</th>
									<th class="px-2 py-2 w-24">Qty</th>
									<th class="px-2 py-2 w-32">Unit price</th>
									<th class="px-2 py-2 w-24">Disc %</th>
									<th class="px-2 py-2 w-40">Tax</th>
									<th class="px-2 py-2 w-32 text-right">Line total</th>
									<th class="px-2 py-2 w-10"></th>
								</tr>
							</thead>
							<tbody>
								{#each productLines as line, index}
									<tr class="border-b border-gray-100 align-top dark:border-slate-800/70">
										<td class="px-2 py-2">
											<select
												bind:value={line.productId}
												on:change={() => onProductChange(line)}
												class="w-full min-w-[14rem] rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
											>
												<option value="">Select product</option>
												{#each options?.products ?? [] as product}
													<option value={product.id}>{product.code} — {product.name}</option>
												{/each}
											</select>
											{#if line.productId}
												<p class="mt-1 text-xs text-gray-400 dark:text-slate-500">{productName(line.productId)}</p>
											{/if}
										</td>
										<td class="px-2 py-2">
											<input
												type="number"
												min="0.0001"
												step="any"
												bind:value={line.quantity}
												class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
											/>
										</td>
										<td class="px-2 py-2">
											<input
												type="number"
												min="0"
												step="any"
												bind:value={line.unitPrice}
												class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
											/>
										</td>
										<td class="px-2 py-2">
											<input
												type="number"
												min="0"
												max="100"
												step="any"
												bind:value={line.discountPercent}
												class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
											/>
										</td>
										<td class="px-2 py-2">
											<select
												bind:value={line.taxRateId}
												class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-sm dark:border-slate-700 dark:bg-slate-950"
											>
												<option value="">No tax</option>
												{#each options?.taxRates ?? [] as tax}
													<option value={tax.id}>{tax.name} ({tax.rate}%)</option>
												{/each}
											</select>
										</td>
										<td class="px-2 py-2 text-right font-mono">
											{formatCurrency(
												Number(line.quantity || 0) *
													Number(line.unitPrice || 0) *
													(1 - Number(line.discountPercent || 0) / 100)
											)}
										</td>
										<td class="px-2 py-2 text-center">
											<button
												type="button"
												on:click={() => removeLine(index)}
												class="text-sm font-bold text-rose-500 hover:text-rose-700"
												aria-label="Remove line"
											>
												✕
											</button>
										</td>
									</tr>
								{/each}
							</tbody>
						</table>
					</div>

					<div class="mt-4 flex justify-end">
						<div class="w-full max-w-xs space-y-1 text-sm">
							<div class="flex justify-between text-gray-600 dark:text-slate-300">
								<span>Subtotal</span>
								<span class="font-mono">{formatCurrency(lineSubtotal)}</span>
							</div>
							<div class="flex justify-between text-gray-600 dark:text-slate-300">
								<span>Tax</span>
								<span class="font-mono">{formatCurrency(lineTax)}</span>
							</div>
							<div class="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900 dark:border-slate-800 dark:text-white">
								<span>Grand total</span>
								<span class="font-mono">{formatCurrency(grandTotal)}</span>
							</div>
						</div>
					</div>
				</section>
			{/if}

			{#if isPartial}
				<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<div class="mb-4 flex flex-wrap items-center justify-between gap-3">
						<div>
							<h2 class="text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
								{isReceipt ? 'Receipt lines' : 'Delivery lines'}
							</h2>
							<p class="mt-1 text-xs text-gray-500 dark:text-slate-400">
								Adjust the quantity per line to create a partial {isReceipt ? 'receipt' : 'delivery'} ticket.
							</p>
						</div>
						{#if parentLines.length > 0}
							<Button size="sm" variant="secondary" on:click={fillRemaining}>Fill remaining</Button>
						{/if}
					</div>

					{#if parentLinesLoading}
						<div class="rounded-xl border border-gray-200 bg-gray-50 px-4 py-6 text-center text-sm text-gray-500 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-400">
							Loading {config.parentLabel?.toLowerCase()} lines...
						</div>
					{:else if !parentId}
						<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
							Select an approved {config.parentLabel?.toLowerCase()} to load the remaining quantities.
						</div>
					{:else if parentLines.length === 0}
						<div class="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700 dark:border-emerald-500/30 dark:bg-emerald-500/10 dark:text-emerald-200">
							This document has no remaining quantity to {isReceipt ? 'receive' : 'deliver'}.
						</div>
					{:else}
						<div class="overflow-x-auto">
							<table class="min-w-full text-sm">
								<thead>
									<tr class="border-b border-gray-200 text-left text-xs uppercase tracking-wide text-gray-500 dark:border-slate-800 dark:text-slate-400">
										<th class="px-2 py-2">Product</th>
										<th class="px-2 py-2 text-right">Ordered</th>
										<th class="px-2 py-2 text-right">{isReceipt ? 'Received' : 'Delivered'}</th>
										<th class="px-2 py-2 text-right">Remaining</th>
										<th class="px-2 py-2 w-32 text-right">{isReceipt ? 'Qty to receive' : 'Qty to deliver'}</th>
										<th class="px-2 py-2 text-right">Unit price</th>
										<th class="px-2 py-2 text-right">Line total</th>
									</tr>
								</thead>
								<tbody>
									{#each parentLines as line}
										<tr class="border-b border-gray-100 align-middle dark:border-slate-800/70">
											<td class="px-2 py-2">
												<p class="font-medium text-gray-900 dark:text-white">{productName(line.productId)}</p>
												{#if line.description}
													<p class="text-xs text-gray-400 dark:text-slate-500">{line.description}</p>
												{/if}
											</td>
											<td class="px-2 py-2 text-right font-mono">{line.quantity}</td>
											<td class="px-2 py-2 text-right font-mono">{line.fulfilled}</td>
											<td class="px-2 py-2 text-right font-mono font-semibold">{line.remaining}</td>
											<td class="px-2 py-2">
												<input
													type="number"
													min="0"
													max={line.remaining}
													step="any"
													bind:value={line.sendQuantity}
													disabled={line.remaining <= 0}
													class="w-full rounded-lg border border-gray-300 bg-white px-2 py-1.5 text-right text-sm disabled:opacity-50 dark:border-slate-700 dark:bg-slate-950"
												/>
											</td>
											<td class="px-2 py-2 text-right font-mono">{formatCurrency(line.unitPrice)}</td>
											<td class="px-2 py-2 text-right font-mono font-semibold">
												{formatCurrency(
													Number(line.sendQuantity || 0) *
														line.unitPrice *
														(1 - Number(line.discountPercent || 0) / 100)
												)}
											</td>
										</tr>
									{/each}
								</tbody>
							</table>
						</div>

						<div class="mt-4 flex justify-end">
							<div class="w-full max-w-xs space-y-1 text-sm">
								<div class="flex justify-between text-gray-600 dark:text-slate-300">
									<span>Subtotal</span>
									<span class="font-mono">{formatCurrency(partialSubtotal)}</span>
								</div>
								<div class="flex justify-between text-gray-600 dark:text-slate-300">
									<span>Tax</span>
									<span class="font-mono">{formatCurrency(partialTax)}</span>
								</div>
								<div class="flex justify-between border-t border-gray-200 pt-1 font-semibold text-gray-900 dark:border-slate-800 dark:text-white">
									<span>Ticket total</span>
									<span class="font-mono">{formatCurrency(partialTotal)}</span>
								</div>
							</div>
						</div>
					{/if}
				</section>
			{/if}

			{#if isPayment}
				<section class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
					<h2 class="mb-4 text-sm font-semibold uppercase tracking-wide text-gray-500 dark:text-slate-400">
						Outstanding invoice
					</h2>

					{#if paymentInvoices.length === 0}
						<div class="rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm text-amber-700 dark:border-amber-500/30 dark:bg-amber-500/10 dark:text-amber-200">
							No outstanding invoice found. Create and complete the previous transaction first.
						</div>
					{:else}
						<div class="grid grid-cols-1 gap-4 md:grid-cols-2">
							<label class="space-y-1 text-sm md:col-span-2">
								<span class="font-medium text-gray-700 dark:text-slate-200">Invoice</span>
								<select
									bind:value={paymentInvoiceId}
									on:change={onInvoiceChange}
									class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm dark:border-slate-700 dark:bg-slate-950"
								>
									<option value="">Select invoice</option>
									{#each paymentInvoices as invoice}
										<option value={invoice.id}>
											{invoice.document_number} — {formatDate(invoice.document_date)} — outstanding {formatCurrency(Number(invoice.outstanding_amount || 0))}
										</option>
									{/each}
								</select>
							</label>

							<label class="space-y-1 text-sm">
								<span class="font-medium text-gray-700 dark:text-slate-200">Payment amount</span>
								<input
									type="number"
									min="0.01"
									step="any"
									bind:value={paymentAmount}
									class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-right text-sm dark:border-slate-700 dark:bg-slate-950"
								/>
							</label>

							{#if selectedInvoice}
								<div class="rounded-xl bg-slate-50 px-4 py-3 text-sm dark:bg-slate-950/60">
									<div class="text-gray-600 dark:text-slate-300">
										Invoice total: <strong class="text-gray-900 dark:text-white">{formatCurrency(Number(selectedInvoice.grand_total ?? 0))}</strong>
									</div>
									<div class="text-gray-600 dark:text-slate-300">
										Outstanding: <strong class="text-gray-900 dark:text-white">{formatCurrency(Number(selectedInvoice.outstanding_amount ?? 0))}</strong>
									</div>
								</div>
							{/if}
						</div>
					{/if}
				</section>
			{/if}

			<div class="flex flex-wrap items-center justify-end gap-3">
				<Button variant="secondary" href={`/${config.route}`}>Cancel</Button>
				<Button type="submit" variant="primary" disabled={submitting || (isPayment && paymentInvoices.length === 0)}>
					{submitting ? 'Saving...' : `Create ${config.singular}`}
				</Button>
			</div>
		</form>
	{/if}
</div>
