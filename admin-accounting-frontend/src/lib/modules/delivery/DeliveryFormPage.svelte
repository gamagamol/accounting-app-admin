<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { salesOrders, deliveryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';
	import type { Delivery, TransactionItem, TransactionStatus } from '$lib/types';

	export let delivery: Delivery | null = null;

	let salesNo = '';
	let date = new Date().toISOString().split('T')[0];
	let customerName = '';
	let status: TransactionStatus = 'created';
	let description = 'Shipment prepared according to the confirmed sales order.';
	let items: TransactionItem[] = [];
	let initializedKey = '';

	$: backHref = delivery ? `/delivery/${delivery.id}` : '/delivery';
	$: title = delivery ? 'Edit Delivery Order' : 'New Delivery Order';
	$: documentNumber = delivery?.deliveryNo ?? 'Draft document';

	$: {
		const key = delivery?.id ?? 'new';
		if (key !== initializedKey) {
			initializedKey = key;
			if (delivery) {
				salesNo = delivery.salesNo;
				date = delivery.date;
				customerName = delivery.customerName;
				status = delivery.status === 'completed' ? 'reopen' : delivery.status;
				description = delivery.description ?? delivery.message ?? '';
				items = delivery.items.map((item) => ({ ...item }));
			} else {
				const firstOrder = $salesOrders[0];
				salesNo = firstOrder?.salesNo ?? '';
				date = new Date().toISOString().split('T')[0];
				customerName = firstOrder?.customerName ?? '';
				status = 'created';
				description = 'Shipment prepared according to the confirmed sales order.';
				items = firstOrder ? firstOrder.items.map((item) => ({ ...item })) : [];
			}
		}
	}

	function handleOrderChange(value: string) {
		const order = $salesOrders.find((item) => item.salesNo === value);
		if (!order) return;
		customerName = order.customerName;
		items = order.items.map((item) => ({ ...item }));
	}

	function handleSubmit() {
		if (!salesNo) {
			alert('Please select a Sales Order number first.');
			return;
		}

		const changes = { date, salesNo, customerName, status, description, items: items.map((item) => ({ ...item })) };
		const reopened = Boolean(delivery && delivery.status === 'completed');
		const before = delivery ? ({ ...delivery } as unknown as Record<string, unknown>) : null;
		let saved: Delivery;

		if (delivery) {
			deliveryActions.update(delivery.id, changes);
			saved = { ...delivery, ...changes };
		} else {
			saved = deliveryActions.add({
				deliveryNo: `DO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
				transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
				preparedBy: $user?.name || 'Logistics Team',
				...changes
			});
		}

		auditLogActions.record({
			module: 'sales',
			entityType: 'delivery_order',
			entityId: saved.id,
			documentNumber: saved.deliveryNo,
			action: delivery ? (reopened ? 'reopen' : 'update') : 'create',
			actor: $user?.name || 'Logistics Team',
			summary: reopened
				? `Reopened completed delivery order ${saved.deliveryNo} and recorded a correction.`
				: `${delivery ? 'Updated' : 'Created'} delivery order ${saved.deliveryNo} for ${saved.customerName}.`,
			description,
			before,
			after: saved as unknown as Record<string, unknown>
		});

		goto(`/delivery/${saved.id}`);
	}
</script>

<TransactionPageShell {title} description="Prepare the delivery order on a dedicated page and confirm the shipped quantities." {backHref} backLabel="Back to delivery orders" eyebrow="Sales / Delivery Order" {documentNumber}>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
			<FormField label="Sales Order Number" name="salesNo" required>
				<select
					id="salesNo"
					bind:value={salesNo}
					on:change={(event) => handleOrderChange(event.currentTarget.value)}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				>
					{#each $salesOrders as order}
						<option value={order.salesNo}>{order.salesNo} — {order.customerName}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Delivery Date" name="date" required>
				<input
					id="date"
					type="date"
					bind:value={date}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<FormField label="Delivery Status" name="status">
				<select
					id="status"
					bind:value={status}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				>
					{#each transactionStatusOptions as option}
						<option value={option.value}>{option.label}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Customer" name="customerName">
				<input
					id="customerName"
					bind:value={customerName}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>
		</div>

		<div>
			<h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Shipped Items</h4>
			<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
				<table class="min-w-full text-xs">
					<thead class="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
						<tr>
							<th class="w-10 p-2.5 text-center">No</th>
							<th class="p-2.5 text-left">Product Name</th>
							<th class="w-28 p-2.5 text-center">Qty Shipped</th>
							<th class="w-20 p-2.5 text-center">Unit</th>
						</tr>
					</thead>
					<tbody class="divide-y divide-gray-100 dark:divide-slate-800">
						{#each items as item, index}
							<tr>
								<td class="p-2.5 text-center font-mono text-gray-400">{index + 1}</td>
								<td class="p-2.5 font-medium text-gray-800 dark:text-slate-100">{item.productName}</td>
								<td class="p-2.5">
									<input
										type="number"
										min="1"
										bind:value={item.quantity}
										class="w-full rounded border border-gray-300 p-1 text-center text-xs dark:border-slate-700 dark:bg-slate-900"
									/>
								</td>
								<td class="p-2.5 text-center text-gray-500 dark:text-slate-400">{item.unit}</td>
							</tr>
						{:else}
							<tr>
								<td colspan="4" class="p-6 text-center text-gray-500 dark:text-slate-400">Select a sales order to load its items.</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<FormField
			label="Description / Message"
			name="description"
			hint="Optional note copied into the audit trail for this delivery order."
		>
			<textarea
				id="description"
				rows="2"
				bind:value={description}
				placeholder="Explain the purpose of this delivery or the reason for the change..."
				class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
			></textarea>
		</FormField>

		<div class="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" href={backHref}>Cancel</Button>
			<Button variant="primary" type="submit">{delivery ? 'Save Changes' : 'Issue Delivery Order'}</Button>
		</div>
	</form>

	<AuditLogPanel entityType="delivery_order" entityId={delivery?.id ?? 'new'} />
</TransactionPageShell>
