<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import EmployeeFormModal from './EmployeeFormModal.svelte';
	import EmployeeDetailModal from './EmployeeDetailModal.svelte';
	import { employees, employeeActions } from '$lib/stores/dataStore';
	import type { Employee, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedEmployee: Employee | null = null;
	let employeeToEdit: Employee | null = null;

	const columns: TableColumn[] = [
		{ key: 'name', label: 'Employee Name', sortable: true },
		{ key: 'position', label: 'Position / Division', sortable: true },
		{ key: 'email', label: 'Email' },
		{ key: 'phone', label: 'Phone' },
		{ key: 'status', label: 'Status', align: 'center', sortable: true }
	];

	function openCreate() {
		employeeToEdit = null;
		isFormOpen = true;
	}

	function openEdit(emp: Employee) {
		employeeToEdit = emp;
		isFormOpen = true;
	}

	function openDetail(emp: Employee) {
		selectedEmployee = emp;
		isDetailOpen = true;
	}

	function handleDelete(emp: Employee) {
		if (confirm(`Delete employee "${emp.name}"? This action cannot be undone.`)) {
			employeeActions.delete(emp.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Employees"
			description="Internal employee records, job positions and employment status."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Employee</span>
		</Button>
	</div>

	<DataTable
		{columns}
		data={$employees}
		searchPlaceholder="Search employees by name, position or email..."
		searchKeys={['name', 'position', 'email', 'phone']}
	>
		<svelte:fragment slot="cell" let:column let:value>
			{#if column.key === 'status'}
				<Badge status={value} label={value === 'active' ? 'Active' : 'Inactive'} />
			{:else}
				{value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View employee details"
				onEdit={() => openEdit(row)}
				editTitle="Edit employee"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete employee"
			/>
		</svelte:fragment>
	</DataTable>

	<EmployeeFormModal bind:isOpen={isFormOpen} {employeeToEdit} />
	<EmployeeDetailModal bind:isOpen={isDetailOpen} employee={selectedEmployee} />
</div>
