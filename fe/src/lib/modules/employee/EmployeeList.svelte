<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import EmployeeFormModal from './EmployeeFormModal.svelte';
  import { employees, employeeActions } from '$lib/stores/dataStore';
  import type { Employee, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let employeeToEdit: Employee | null = null;

  const columns: TableColumn[] = [
    { key: 'name', label: 'Nama Pegawai', sortable: true },
    { key: 'position', label: 'Jabatan / Divisi', sortable: true },
    { key: 'email', label: 'Email' },
    { key: 'phone', label: 'Telepon' },
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

  function handleDelete(emp: Employee) {
    if (confirm(`Apakah Anda yakin ingin menghapus data pegawai ${emp.name}?`)) {
      employeeActions.delete(emp.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Master Data Pegawai & Karyawan"
      description="Data kepegawaian internal perusahaan, posisi jabatan, dan status operasional"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah Pegawai</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$employees}
    searchPlaceholder="Cari pegawai berdasarkan nama atau jabatan..."
    searchKeys={['name', 'position', 'email', 'phone']}
  >
    <svelte:fragment slot="cell" let:column let:value>
      {#if column.key === 'status'}
        <Badge status={value} label={value === 'active' ? 'Aktif' : 'Non-Aktif'} />
      {:else}
        {value}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions" let:row>
      <div class="flex items-center justify-end gap-1.5">
        <button
          type="button"
          on:click={() => openEdit(row)}
          class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold"
          title="Edit"
        >
          Edit
        </button>
        <button
          type="button"
          on:click={() => handleDelete(row)}
          class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
          title="Hapus"
        >
          Hapus
        </button>
      </div>
    </svelte:fragment>
  </DataTable>

  <EmployeeFormModal bind:isOpen={isFormOpen} {employeeToEdit} />
</div>
