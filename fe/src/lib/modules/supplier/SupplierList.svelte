<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import SupplierFormModal from './SupplierFormModal.svelte';
  import { suppliers, supplierActions } from '$lib/stores/dataStore';
  import type { Supplier, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let supplierToEdit: Supplier | null = null;

  const columns: TableColumn[] = [
    { key: 'companyName', label: 'Nama Supplier', sortable: true },
    { key: 'contactPerson', label: 'PIC / Kontak', sortable: true },
    { key: 'city', label: 'Kota', sortable: true },
    { key: 'phone', label: 'Telepon' },
    { key: 'email', label: 'Email' },
    { key: 'address', label: 'Alamat' }
  ];

  function openCreate() {
    supplierToEdit = null;
    isFormOpen = true;
  }

  function openEdit(supplier: Supplier) {
    supplierToEdit = supplier;
    isFormOpen = true;
  }

  function handleDelete(supplier: Supplier) {
    if (confirm(`Apakah Anda yakin ingin menghapus data supplier ${supplier.companyName}?`)) {
      supplierActions.delete(supplier.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Master Data Supplier"
      description="Direktori vendor dan pemasok barang, bahan baku, dan perlengkapan industri"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah Supplier</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$suppliers}
    searchPlaceholder="Cari supplier berdasarkan nama, PIC, atau kota..."
    searchKeys={['companyName', 'contactPerson', 'city', 'phone', 'email']}
  >
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

  <SupplierFormModal bind:isOpen={isFormOpen} {supplierToEdit} />
</div>
