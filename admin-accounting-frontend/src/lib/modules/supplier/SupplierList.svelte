<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import SupplierFormModal from './SupplierFormModal.svelte';
	import SupplierDetailModal from './SupplierDetailModal.svelte';
	import { suppliers, supplierActions } from '$lib/stores/dataStore';
	import type { Supplier, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedSupplier: Supplier | null = null;
	let supplierToEdit: Supplier | null = null;

	const columns: TableColumn[] = [
		{ key: 'companyName', label: 'Vendor Name', sortable: true },
		{ key: 'contactPerson', label: 'Contact Person', sortable: true },
		{ key: 'city', label: 'City', sortable: true },
		{ key: 'phone', label: 'Phone' },
		{ key: 'email', label: 'Email' }
	];

	function openCreate() {
		supplierToEdit = null;
		isFormOpen = true;
	}

	function openEdit(supplier: Supplier) {
		supplierToEdit = supplier;
		isFormOpen = true;
	}

	function openDetail(supplier: Supplier) {
		selectedSupplier = supplier;
		isDetailOpen = true;
	}

	function handleDelete(supplier: Supplier) {
		if (confirm(`Delete vendor "${supplier.companyName}"? This action cannot be undone.`)) {
			supplierActions.delete(supplier.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Suppliers"
			description="Directory of vendors supplying goods, raw materials and industrial equipment."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Supplier</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$suppliers}
		searchPlaceholder="Search suppliers by name, contact person or city..."
		searchKeys={['companyName', 'contactPerson', 'city', 'phone', 'email']}
	>
		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View vendor details"
				onEdit={() => openEdit(row)}
				editTitle="Edit vendor"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete vendor"
			/>
		</svelte:fragment>
	</DataTable>

	<SupplierFormModal bind:isOpen={isFormOpen} {supplierToEdit} />
	<SupplierDetailModal bind:isOpen={isDetailOpen} supplier={selectedSupplier} />
</div>
