<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import SalesFormModal from './SalesFormModal.svelte';
  import SalesDetailModal from './SalesDetailModal.svelte';
  import { salesOrders, salesActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { SalesOrder, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedSales: SalesOrder | null = null;
  let salesToEdit: SalesOrder | null = null;

  const columns: TableColumn[] = [
    { key: 'salesNo', label: 'No. Sales Order', sortable: true },
    { key: 'date', label: 'Tanggal', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'preparedBy', label: 'Dibuat Oleh' },
    { key: 'total', label: 'Total Pesanan', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    salesToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: SalesOrder) {
    salesToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: SalesOrder) {
    selectedSales = item;
    isDetailOpen = true;
  }

  function handleDelete(item: SalesOrder) {
    if (confirm(`Apakah Anda yakin ingin menghapus sales order ${item.salesNo}?`)) {
      salesActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Pesanan Penjualan (Sales Order)"
      description="Daftar pesanan aktif dari customer, proses alur pengiriman dan penerbitan faktur tagihan"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Buat Sales Order Baru</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$salesOrders}
    searchPlaceholder="Cari pesanan berdasarkan nomor SO, customer, atau no transaksi..."
    searchKeys={['salesNo', 'customerName', 'transactionNo', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'salesNo'}
        <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'pending' ? 'Diproses' : value === 'delivered' ? 'Terkirim' : 'Selesai'} />
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
          title="Detail & Aksi"
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

  <SalesFormModal bind:isOpen={isFormOpen} {salesToEdit} />
  <SalesDetailModal bind:isOpen={isDetailOpen} sales={selectedSales} />
</div>
