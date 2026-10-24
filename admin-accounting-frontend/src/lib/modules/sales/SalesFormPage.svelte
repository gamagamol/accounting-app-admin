<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { customers, products, salesActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatCurrency } from '$lib/utils/formatters';
	import type { SalesOrder, TransactionItem } from '$lib/types';

	export let sale: SalesOrder | null = null;

	let customerId = '';
	let date = new Date().toISOString().split('T')[0];
	let description = 'Sales order prepared from the customer purchase request.';
	let items: TransactionItem[] = [];
	let initializedKey = '';

	$: backHref = sale ? `/sales/${sale.id}` : '/sales';
	$: eyebrow = 'Sales / Sales Order';
	$: title = sale ? 'Edit Sales Order' : 'New Sales Order';
	$: documentNumber = sale?.salesNo ?? 'Draft document';

	$: {
		const key = sale?.id ?? 'new';
		if (key !== initializedKey) {
			initializedKey = key;
			if (sale) {
				customerId = sale.customerId;
				date = sale.date;
				description = sale.description ?? sale.message ?? '';
				items = sale.items.map((item) => ({ ...item }));
			} else {
				const firstProduct = $products[0];
				customerId = $customers[0]?.id ?? '';
				date = new Date().toISOString().split('T')[0];
				description = 'Sales order prepared from the customer purchase request.';
				items = [
					{
						id: 'item-1',
						productId: firstProduct?.id ?? '',
						productName: firstProduct?.name ?? '',
						quantity: 5,
						unit: firstProduct?.unit ?? 'Pcs',
						unitPrice: firstProduct?.price ?? 150000,
						discount: 0,
						total: 5 * (firstProduct?.price ?? 150000)
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
			alert('Add at least one order item.');
			return;
		}

		const changes = {
			customerId,
			customerName: customer.companyName,
			date,
			description,
			items: items.map((item) => ({ ...item })),
			subtotal,
			tax,
			total,
			status: sale
				? sale.status === 'completed'
					? ('reopen' as const)
					: sale.status
				: ('pending' as const)
		};

		const reopened = Boolean(sale && sale.status === 'completed');
		const before = sale ? ({ ...sale } as unknown as Record<string, unknown>) : null;
		let saved: SalesOrder;

		if (sale) {
			salesActions.update(sale.id, changes);
			saved = { ...sale, ...changes };
		} else {
			saved = salesActions.add({
				salesNo: `SO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
				transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
				date,
				customerId,
				customerName: customer.companyName,
				preparedBy: $user?.name || 'Sales Admin',
				description,
				items: items.map((item) => ({ ...item })),
				subtotal,
				tax,
				total,
				status: 'pending'
			});
		}

		auditLogActions.record({
			module: 'sales',
			entityType: 'sales_order',
			entityId: saved.id,
			documentNumber: saved.salesNo,
			action: sale ? (reopened ? 'reopen' : 'update') : 'create',
			actor: $user?.name || 'Sales Admin',
			summary: reopened
				? `Reopened completed sales order ${saved.salesNo} and recorded a correction.`
				: `${sale ? 'Updated' : 'Created'} sales order ${saved.salesNo} for ${saved.customerName}.`,
			description,
			before,
			after: saved as unknown as Record<string, unknown>
		});

		goto(`/sales/${saved.id}`);
	}

	function handleCancel() {
		goto(backHref);
	}
</script>

<TransactionPageShell {title} description="Create or edit a sales order on a dedicated page. Line items are saved with the order header." {backHref} backLabel="Back to sales orders" {eyebrow} {documentNumber}>
	<form on:submit|preventDefault={handleSubmit} class="rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
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

			<FormField label="Order Date" name="date" required>
				<input
					id="date"
					type="date"
					bind:value={date}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>
		</div>

		<div class="mt-2">
			<div class="mb-2 flex items-center justify-between">
				<h4 class="text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Order Items</h4>
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

		<div class="mt-4">
			<FormField
				label="Description / Message"
				name="description"
				hint="Optional note copied into the audit trail for this sales order."
			>
				<textarea
					id="description"
					rows="2"
					bind:value={description}
					placeholder="Explain the purpose of this sales order or the reason for the change..."
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				></textarea>
			</FormField>
		</div>

		<div class="mt-4 flex flex-col-reverse gap-4 sm:flex-row sm:items-end sm:justify-between">
			<div class="text-xs text-gray-500 dark:text-slate-400">
				<p>Prepared by: <span class="font-semibold text-gray-700 dark:text-slate-200">{$user?.name || 'Sales Admin'}</span></p>
				<p class="mt-1">VAT is calculated at 11% of the item subtotal.</p>
			</div>
			<div class="w-full space-y-1.5 rounded-xl border border-gray-200 bg-gray-50 p-4 text-xs dark:border-slate-800 dark:bg-slate-950/60 sm:w-72">
				<div class="flex justify-between text-gray-600 dark:text-slate-300">
					<span>Subtotal:</span>
					<span class="font-mono font-semibold">{formatCurrency(subtotal)}</span>
				</div>
				<div class="flex justify-between text-gray-600 dark:text-slate-300">
					<span>VAT 11%:</span>
					<span class="font-mono font-semibold">{formatCurrency(tax)}</span>
				</div>
				<div class="flex justify-between border-t border-gray-200 pt-2 text-base font-bold text-gray-900 dark:border-slate-800 dark:text-white">
					<span>Order Total:</span>
					<span class="font-mono text-blue-700 dark:text-blue-300">{formatCurrency(total)}</span>
				</div>
			</div>
		</div>

		<div class="mt-5 flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" on:click={handleCancel}>Cancel</Button>
			<Button variant="primary" type="submit">{sale ? 'Save Changes' : 'Create Sales Order'}</Button>
		</div>
	</form>

	{#if sale}
		<AuditLogPanel entityType="sales_order" entityId={sale.id} />
	{/if}
</TransactionPageShell>
