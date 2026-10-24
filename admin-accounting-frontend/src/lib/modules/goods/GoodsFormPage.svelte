<script lang="ts">
	import { goto } from '$app/navigation';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import AuditLogPanel from '$lib/components/ui/AuditLogPanel.svelte';
	import TransactionPageShell from '$lib/components/transactions/TransactionPageShell.svelte';
	import { purchaseOrders, goodsReceiptActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { transactionStatusOptions } from '$lib/data/transaction-statuses';
	import type { GoodsReceipt, TransactionItem, TransactionStatus } from '$lib/types';

	export let goods: GoodsReceipt | null = null;

	let purchaseNo = '';
	let date = new Date().toISOString().split('T')[0];
	let supplierName = '';
	let status: TransactionStatus = 'completed';
	let description = 'Goods received and inspected against the purchase order.';
	let items: TransactionItem[] = [];
	let initializedKey = '';

	$: backHref = goods ? `/goods/${goods.id}` : '/goods';
	$: title = goods ? 'Edit Goods Receipt' : 'Record Goods Receipt';
	$: documentNumber = goods?.receiptNo ?? 'Draft document';

	$: {
		const key = goods?.id ?? 'new';
		if (key !== initializedKey) {
			initializedKey = key;
			if (goods) {
				purchaseNo = goods.purchaseNo;
				date = goods.date;
				supplierName = goods.supplierName;
				status = goods.status === 'completed' ? 'reopen' : goods.status;
				description = goods.description ?? goods.message ?? '';
				items = goods.items.map((item) => ({ ...item }));
			} else {
				const firstOrder = $purchaseOrders[0];
				purchaseNo = firstOrder?.purchaseNo ?? '';
				date = new Date().toISOString().split('T')[0];
				supplierName = firstOrder?.supplierName ?? '';
				status = 'completed';
				description = 'Goods received and inspected against the purchase order.';
				items = firstOrder ? firstOrder.items.map((item) => ({ ...item })) : [];
			}
		}
	}

	function handleOrderChange(value: string) {
		const order = $purchaseOrders.find((item) => item.purchaseNo === value);
		if (!order) return;
		supplierName = order.supplierName;
		items = order.items.map((item) => ({ ...item }));
	}

	function handleSubmit() {
		if (!purchaseNo) {
			alert('Please select a Purchase Order number first.');
			return;
		}

		const changes = { date, purchaseNo, supplierName, status, description, items: items.map((item) => ({ ...item })) };
		const reopened = Boolean(goods && goods.status === 'completed');
		const before = goods ? ({ ...goods } as unknown as Record<string, unknown>) : null;
		let saved: GoodsReceipt;

		if (goods) {
			goodsReceiptActions.update(goods.id, changes);
			saved = { ...goods, ...changes };
		} else {
			saved = goodsReceiptActions.add({
				receiptNo: `GR/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
				transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
				preparedBy: $user?.name || 'Warehouse Admin',
				...changes
			});
		}

		auditLogActions.record({
			module: 'purchase',
			entityType: 'goods_receipt',
			entityId: saved.id,
			documentNumber: saved.receiptNo,
			action: goods ? (reopened ? 'reopen' : 'update') : 'create',
			actor: $user?.name || 'Warehouse Admin',
			summary: reopened
				? `Reopened completed goods receipt ${saved.receiptNo} and recorded a correction.`
				: `${goods ? 'Updated' : 'Recorded'} goods receipt ${saved.receiptNo} from ${saved.supplierName}.`,
			description,
			before,
			after: saved as unknown as Record<string, unknown>
		});

		goto(`/goods/${saved.id}`);
	}
</script>

<TransactionPageShell {title} description="Record received goods on a dedicated page and confirm inspected quantities against the purchase order." {backHref} backLabel="Back to goods receipts" eyebrow="Purchasing / Goods Receipt" {documentNumber}>
	<form on:submit|preventDefault={handleSubmit} class="space-y-4 rounded-2xl border border-gray-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-slate-900">
		<div class="grid grid-cols-1 gap-x-5 sm:grid-cols-2">
			<FormField label="Purchase Order Number" name="purchaseNo" required>
				<select
					id="purchaseNo"
					bind:value={purchaseNo}
					on:change={(event) => handleOrderChange(event.currentTarget.value)}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				>
					{#each $purchaseOrders as order}
						<option value={order.purchaseNo}>{order.purchaseNo} — {order.supplierName}</option>
					{/each}
				</select>
			</FormField>

			<FormField label="Warehouse Received Date" name="date" required>
				<input
					id="date"
					type="date"
					bind:value={date}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<FormField label="Supplier / Vendor" name="supplierName">
				<input
					id="supplierName"
					bind:value={supplierName}
					class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
				/>
			</FormField>

			<FormField label="Receipt Status" name="status">
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
		</div>

		<div>
			<h4 class="mb-2 text-xs font-bold uppercase tracking-wider text-gray-700 dark:text-slate-300">Received Items</h4>
			<div class="overflow-x-auto rounded-xl border border-gray-200 dark:border-slate-800">
				<table class="min-w-full text-xs">
					<thead class="border-b border-gray-200 bg-gray-50 text-gray-600 dark:border-slate-800 dark:bg-slate-950/60 dark:text-slate-300">
						<tr>
							<th class="w-10 p-2.5 text-center">No</th>
							<th class="p-2.5 text-left">Product Name</th>
							<th class="w-28 p-2.5 text-center">Qty Received</th>
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
								<td colspan="4" class="p-6 text-center text-gray-500 dark:text-slate-400">Select a purchase order to load its items.</td>
							</tr>
						{/each}
					</tbody>
				</table>
			</div>
		</div>

		<FormField
			label="Description / Message"
			name="description"
			hint="Optional note copied into the audit trail for this goods receipt."
		>
			<textarea
				id="description"
				rows="2"
				bind:value={description}
				placeholder="Explain the condition of the received goods or the reason for the change..."
				class="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-slate-700 dark:bg-slate-900"
			></textarea>
		</FormField>

		<div class="flex flex-col-reverse gap-2 border-t border-gray-200 pt-4 dark:border-slate-800 sm:flex-row sm:justify-end">
			<Button variant="secondary" href={backHref}>Cancel</Button>
			<Button variant="primary" type="submit">{goods ? 'Save Changes' : 'Confirm Goods Receipt'}</Button>
		</div>
	</form>

	<AuditLogPanel entityType="goods_receipt" entityId={goods?.id ?? 'new'} />
</TransactionPageShell>
