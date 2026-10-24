<script lang="ts">
	import { goto } from '$app/navigation';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import { deliveries, deliveryActions, auditLogActions } from '$lib/stores/dataStore';
	import { user } from '$lib/stores/auth';
	import { formatDate } from '$lib/utils/formatters';
	import type { Delivery, TableColumn } from '$lib/types';

	const columns: TableColumn[] = [
		{ key: 'deliveryNo', label: 'Delivery Order No', sortable: true },
		{ key: 'salesNo', label: 'Sales Order No', sortable: true },
		{ key: 'date', label: 'Delivery Date', sortable: true, format: (v) => formatDate(v) },
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'preparedBy', label: 'Courier / Staff' },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		goto('/delivery/new');
	}

	function openEdit(item: Delivery) {
		goto(`/delivery/${item.id}/edit`);
	}

	function openDetail(item: Delivery) {
		goto(`/delivery/${item.id}`);
	}

	function handleDelete(item: Delivery) {
		if (!confirm(`Delete delivery order ${item.deliveryNo}? This action cannot be undone.`)) return;
		auditLogActions.record({
			module: 'sales',
			entityType: 'delivery_order',
			entityId: item.id,
			documentNumber: item.deliveryNo,
			action: 'delete',
			actor: $user?.name || 'Logistics Team',
			summary: `Deleted delivery order ${item.deliveryNo}.`,
			before: item as unknown as Record<string, unknown>
		});
		deliveryActions.delete(item.id);
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Delivery Orders"
			description="Manage delivery notes for physical products shipped to customer addresses and print package labels."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>New Delivery Order</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$deliveries}
		searchPlaceholder="Search delivery orders by DO number, SO or customer..."
		searchKeys={['deliveryNo', 'salesNo', 'customerName', 'preparedBy']}
	>
		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'deliveryNo'}
				<span class="font-mono font-bold text-cyan-700 dark:text-cyan-300 bg-cyan-50 dark:bg-cyan-500/10 px-2 py-0.5 rounded border border-cyan-200 dark:border-cyan-500/20">
					{value}
				</span>
			{:else if column.key === 'status'}
				<Badge
					status={value}
					label={value === 'completed' ? 'Delivered' : value === 'created' ? 'Shipped' : 'Processing'}
				/>
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onPrint={() => openDetail(row)}
				printTitle="View and print delivery order"
				onEdit={() => openEdit(row)}
				editTitle="Edit delivery order"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete delivery order"
			/>
		</svelte:fragment>
	</DataTable>
</div>
