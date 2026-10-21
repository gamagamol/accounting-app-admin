<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import CustomerFormModal from './CustomerFormModal.svelte';
	import CustomerDetailModal from './CustomerDetailModal.svelte';
	import { customers, customerActions } from '$lib/stores/dataStore';
	import type { Customer, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedCustomer: Customer | null = null;
	let customerToEdit: Customer | null = null;

	const columns: TableColumn[] = [
		{ key: 'companyName', label: 'Company Name', sortable: true },
		{ key: 'contactPerson', label: 'Contact Person', sortable: true },
		{ key: 'city', label: 'City', sortable: true },
		{ key: 'phone', label: 'Phone' },
		{
			key: 'termOfPayment',
			label: 'Payment Term',
			sortable: true,
			align: 'center',
			format: (val) => `${val || 0} days`
		}
	];

	function openCreate() {
		customerToEdit = null;
		isFormOpen = true;
	}

	function openEdit(customer: Customer) {
		customerToEdit = customer;
		isFormOpen = true;
	}

	function openDetail(customer: Customer) {
		selectedCustomer = customer;
		isDetailOpen = true;
	}

	function handleDelete(customer: Customer) {
		if (confirm(`Delete customer "${customer.companyName}"? This action cannot be undone.`)) {
			customerActions.delete(customer.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Customers"
			description="Manage the customer directory, payment terms and tax registration details."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Customer</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$customers}
		searchPlaceholder="Search customers by name, city, contact person or email..."
		searchKeys={['companyName', 'contactPerson', 'city', 'phone', 'email']}
	>
		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View customer details"
				onEdit={() => openEdit(row)}
				editTitle="Edit customer"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete customer"
			/>
		</svelte:fragment>
	</DataTable>

	<CustomerFormModal bind:isOpen={isFormOpen} {customerToEdit} />
	<CustomerDetailModal bind:isOpen={isDetailOpen} customer={selectedCustomer} />
</div>
