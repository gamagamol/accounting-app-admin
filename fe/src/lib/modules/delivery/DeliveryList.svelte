<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import DeliveryFormModal from './DeliveryFormModal.svelte';
  import DeliveryDetailModal from './DeliveryDetailModal.svelte';
  import { deliveries, deliveryActions } from '$lib/stores/dataStore';
  import { formatDate } from '$lib/utils/formatters';
  import type { Delivery, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedDelivery: Delivery | null = null;
  let deliveryToEdit: Delivery | null = null;

  const columns: TableColumn[] = [
    { key: 'deliveryNo', label: 'No. Surat Jalan', sortable: true },
    { key: 'salesNo', label: 'No. Sales Order', sortable: true },
    { key: 'date', label: 'Tanggal Kirim', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Customer Penerima', sortable: true },
    { key: 'preparedBy', label: 'Staff Ekspedisi' },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    deliveryToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: Delivery) {
    deliveryToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: Delivery) {
    selectedDelivery = item;
    isDetailOpen = true;
  }

  function handleDelete(item: Delivery) {
    if (confirm(`Hapus surat jalan pengiriman ${item.deliveryNo}?`)) {
      deliveryActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Pengiriman Barang (Delivery Order)"
      description="Pengelolaan surat jalan pengiriman produk fisik ke alamat pelanggan dan cetak stiker paket"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Buat Surat Jalan</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$deliveries}
    searchPlaceholder="Cari surat jalan berdasarkan nomor DO, SO, atau customer..."
    searchKeys={['deliveryNo', 'salesNo', 'customerName', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'deliveryNo'}
        <span class="font-mono font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'delivered' ? 'Terkirim' : value === 'shipped' ? 'Dikirim' : 'Diproses'} />
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions" let:row>
      <div class="flex items-center justify-end gap-1.5">
        <button
          type="button"
          on:click={() => openDetail(row)}
          class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold"
          title="Detail & Cetak"
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

  <DeliveryFormModal bind:isOpen={isFormOpen} {deliveryToEdit} />
  <DeliveryDetailModal bind:isOpen={isDetailOpen} delivery={selectedDelivery} />
</div>
