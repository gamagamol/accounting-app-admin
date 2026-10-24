<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { customers, products, quotationActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { Quotation, TransactionItem } from '$lib/types';

	export let quotation: Quotation | null = null;

	let customerId = '';
	let date = new Date().toISOString().split('T')[0];
	let salesPerson = 'Budi Santoso';
	let notes = 'Prices are valid for 14 working days from the date of issue.';
	let description = 'Price proposal prepared for customer review.';
	let items: TransactionItem[] = [];
	let initializedKey = '';

	$: backHref = quotation ? `/quotation/${quotation.id}` : '/quotation';
	$: title = quotation ? 'Edit Quotation' : 'New Quotation';
	$: documentNumber = quotation?.quotationNo ?? 'Draft document';

	$: {
		const key = quotation?.id ?? 'new';
		if (key !== initializedKey) {
			initializedKey = key;
			if (quotation) {
				customerId = quotation.customerId;
				date = quotation.date;
				salesPerson = quotation.salesPerson;
				notes = quotation.notes;
				description = quotation.description ?? quotation.message ?? '';
				items = quotation.items.map((item) => ({ ...item }));
			} else {
				const firstProduct = $products[0];
				customerId = $customers[0]?.id ?? '';
				date = new Date().toISOString().split('T')[0];
				salesPerson = 'Budi Santoso';
				notes = 'Prices are valid for 14 working days from the date of issue.';
				description = 'Price proposal prepared for customer review.';
				items = [
					{
						id: 'item-1',
						productId: firstProduct?.id ?? '',
						productName: firstProduct?.name ?? '',
						quantity: 10,
						unit: firstProduct?.unit ?? 'Pcs',
						unitPrice: firstProduct?.price ?? 150000,
						discount: 0,
						total: 10 * (firstProduct?.price ?? 150000)
					}
				];
			}
		}
	}

	function addItem() {
		const defaultProduct = $products[0];
		items = [
			...items,
			{
				id: `item-${Date.now()}`,
				productId: defaultProduct?.id ?? '',
				productName: defaultProduct?.name ?? 'New Item',
				quantity: 1,
				unit: defaultProduct?.unit ?? 'Pcs',
				unitPrice: defaultProduct?.price ?? 100000,
				discount: 0,
				total: defaultProduct?.price ?? 100000
			}
		];
	}

	function removeItem(index: number) {
		items = items.filter((_, itemIndex) => itemIndex !== index);
	}

	function handleProductChange(index: number, productId: string) {
		const product = $products.find((item) => item.id === productId);
		if (!product) return;
		items[index].productId = product.id;
		items[index].productName = product.name;
		items[index].unit = product.unit;
		items[index].unitPrice = product.price;
		calculateItemTotal(index);
	}

	function calculateItemTotal(index: number) {
		const item = items[index];
		const sub = (item.quantity || 0) * (item.unitPrice || 0);
		const discountAmount = (sub * (item.discount || 0)) / 100;
		items[index].total = Math.max(0, sub - discountAmount);
		items = [...items];
	}

	$: subtotal = items.reduce((sum, item) => sum + (item.total || 0), 0);
	$: tax = Math.round(subtotal * 0.11);
	$: total = subtotal + tax;

	function handleSubmit() {
		const customer = $customers.find((item) => item.id === customerId);
		if (!customer) {
			alert('Please select a customer first.');
			return;
		}
		if (items.length === 0) {
			alert('Add at least one quotation item.');
			return;
		}

		const changes = {
			customerId,
			customerName: customer.companyName,
			date,
			salesPerson,
			notes,
			description,
			items: items.map((item) => ({ ...item })),
			subtotal,
			tax,
			total,
			status: quotation
				? quotation.status === 'completed'
					? ('reopen' as const)
					: quotation.status
				: ('created' as const)
		};

		const reopened = Boolean(quotation && quotation.status === 'completed');
		const before = quotation ? ({ ...quotation } as unknown as Record<string, unknown>) : null;
		let saved: Quotation;

		if (quotation) {
			quotationActions.update(quotation.id, changes);
			saved = { ...quotation, ...changes };
		} else {
			saved = quotationActions.add({
				quotationNo: `QUO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
				transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
				preparedBy: $user?.name || 'Sales Admin',
				...changes
			});
		}

		auditLogActions.record({
			module: 'sales',
			entityType: 'quotation',
			entityId: saved.id,
			documentNumber: saved.quotationNo,
			action: quotation ? (reopened ? 'reopen' : 'update') : 'create',
			actor: $user?.name || 'Sales Admin',
			summary: reopened
				? `Reopened completed quotation ${saved.quotationNo} and recorded a correction.`
				: `${quotation ? 'Updated' : 'Created'} quotation ${saved.quotationNo} for ${saved.customerName}.`,
			description,
			before,
			after: saved as unknown as Record<string, unknown>
		});

		goto(`/quotation/${saved.id}`);
	}
</script>

<TransactionPageShell {title} description="Prepare price proposals on a dedicated page. Line items, VAT and terms are saved with the quotation header." {backHref} backLabel="Back to quotations" eyebrow="Sales / Quotation" {documentNumber}>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-3">
			<FormField label="Customer Name" name="customer" required>
				<select
					id="customer"
					bind:value={customerId}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				>
					{#each $customers as customer}
						<option value={customer.id}>{customer.companyName}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Quotation Date" name="date" required>
				<input
					id="date"
					type="date"
					bind:value={date}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<FormField label="Sales Person" name="salesPerson">
				<input
					id="salesPerson"
					bind:value={salesPerson}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>
		</div>

		<div>
			<div class="mb-2 flex items-center justify-between">
				<h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Quotation Items</h4>
				<Button size="sm" variant="secondary" on:click={addItem}>+ Add Item Row</Button>
			</div>

			<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
				<table class="min-w-full text-xs">
					<thead class="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
						<tr>
							<th class="p-2 text-left">Product</th>
							<th class="w-20 p-2 text-center">Qty</th>
							<th class="w-16 p-2 text-center">Unit</th>
							<th class="w-28 p-2 text-right">Price (IDR)</th>
							<th class="w-20 p-2 text-center">Discount (%)</th>
							<th class="w-32 p-2 text-right">Total</th>
							<th class="w-10 p-2 text-center">Action</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						{#each items as item, index}
							<tr>
								<td class="p-2">
									<select
										value={item.productId}
										on:change={(event) => handleProductChange(index, event.currentTarget.value)}
										class="w-full rounded border border-gray-300 bg-white p-1.5 text-xs dark:border-slate-700 dark:bg-slate-900"
									>
										{#each $products as product}
											<option value={product.id}>{product.name}</option>
										{/each}
									</select>
								</td>
								<td class="p-2">
									<input
										type="number"
										min="1"
										bind:value={item.quantity}
										on:input={() => calculateItemTotal(index)}
										class="w-full rounded border border-gray-300 p-1.5 text-center text-xs dark:border-slate-700 dark:bg-slate-900"
									/>
								</td>
								<td class="p-2 text-center text-gray-500 dark:text-slate-400">{item.unit}</td>
								<td class="p-2">
									<input
										type="number"
										min="0"
										bind:value={item.unitPrice}
										on:input={() => calculateItemTotal(index)}
										class="w-full rounded border border-gray-300 p-1.5 text-right text-xs dark:border-slate-700 dark:bg-slate-900"
									/>
								</td>
								<td class="p-2">
									<input
										type="number"
										min="0"
										max="100"
										bind:value={item.discount}
										on:input={() => calculateItemTotal(index)}
										class="w-full rounded border border-gray-300 p-1.5 text-center text-xs dark:border-slate-700 dark:bg-slate-900"
									/>
								</td>
								<td class="p-2 text-right font-mono font-semibold">{formatCurrency(item.total)}</td>
								<td class="p-2 text-center">
									<button
										type="button"
										on:click={() => removeItem(index)}
										class="text-sm font-bold text-red-500 hover:text-red-700"
										aria-label="Remove item"
									>
										✕
									</button>
								</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<FormField
			label="Description / Message"
			name="description"
			hint="Optional note copied into the audit trail for this quotation."
		>
			<textarea
				id="description"
				rows="2"
				bind:value={description}
				placeholder="Explain the purpose of this quotation or the reason for the change..."
				class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
			></textarea>
		</FormField>

		<div class="grid grid-cols-1 gap-4 sm:grid-cols-2">
			<FormField label="Notes / Terms & Conditions" name="notes">
				<textarea
					id="notes"
					rows="3"
					bind:value={notes}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				></textarea>
			</FormField>

			<div class="space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60">
				<div class="flex justify-between text-gray-600 dark:text-slate-300">
					<span>Subtotal:</span>
					<span class="font-mono font-semibold">{formatCurrency(subtotal)}</span>
				</div>
				<div class="flex justify-between text-gray-600 dark:text-slate-300">
					<span>VAT 11%:</span>
					<span class="font-mono font-semibold">{formatCurrency(tax)}</span>
				</div>
				<div class="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-slate-800 dark:text-white">
					<span>Quotation Total:</span>
					<span class="font-mono text-blue-700 dark:text-blue-300">{formatCurrency(total)}</span>
				</div>
			</div>
		</div>

		<div class="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" href={backHref}>Cancel</Button>
			<Button variant="primary" type="submit">{quotation ? 'Save Changes' : 'Create Quotation'}</Button>
		</div>
	</form>

	<AuditLogPanel entityType="quotation" entityId={quotation?.id ?? 'new'} />
</TransactionPageShell>
