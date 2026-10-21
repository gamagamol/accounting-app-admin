<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
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
    { key: 'companyName', label: 'Nama Perusahaan', sortable: true },
    { key: 'contactPerson', label: 'PIC / Kontak', sortable: true },
    { key: 'city', label: 'Kota', sortable: true },
    { key: 'phone', label: 'Telepon' },
    { key: 'termOfPayment', label: 'TOP (Hari)', sortable: true, align: 'center', format: (val) => `${val || 0} Hari` }
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
    if (confirm(`Apakah Anda yakin ingin menghapus data customer ${customer.companyName}?`)) {
      customerActions.delete(customer.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Master Data Customer"
      description="Kelola direktori pelanggan, ketentuan pembayaran (TOP), dan data perpajakan"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah Customer</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$customers}
    searchPlaceholder="Cari customer berdasarkan nama, kota, atau PIC..."
    searchKeys={['companyName', 'contactPerson', 'city', 'phone', 'email']}
  >
    <svelte:fragment slot="actions" let:row>
      <div class="flex items-center justify-end gap-1.5">
        <button
          type="button"
          on:click={() => openDetail(row)}
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold"
          title="Lihat Detail"
        >
          Detail
        </button>
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

  <!-- Modals -->
  <CustomerFormModal bind:isOpen={isFormOpen} {customerToEdit} />
  <CustomerDetailModal bind:isOpen={isDetailOpen} customer={selectedCustomer} />
</div>
