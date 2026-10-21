<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import PurchaseFormModal from './PurchaseFormModal.svelte';
  import PurchaseDetailModal from './PurchaseDetailModal.svelte';
  import { purchaseOrders, purchaseActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { PurchaseOrder, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedPurchase: PurchaseOrder | null = null;
  let purchaseToEdit: PurchaseOrder | null = null;

  const columns: TableColumn[] = [
    { key: 'purchaseNo', label: 'No. PO', sortable: true },
    { key: 'date', label: 'Tanggal', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
    { key: 'preparedBy', label: 'Purchasing' },
    { key: 'total', label: 'Total Nominal', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    purchaseToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: PurchaseOrder) {
    purchaseToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: PurchaseOrder) {
    selectedPurchase = item;
    isDetailOpen = true;
  }

  function handleDelete(item: PurchaseOrder) {
    if (confirm(`Apakah Anda yakin ingin menghapus PO ${item.purchaseNo}?`)) {
      purchaseActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Pesanan Pembelian (Purchase Order - PO)"
      description="Pengadaan barang dan bahan baku industri kepada supplier & vendor rekanan"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Buat PO Baru</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$purchaseOrders}
    searchPlaceholder="Cari PO berdasarkan nomor, supplier, atau nomor transaksi..."
    searchKeys={['purchaseNo', 'supplierName', 'transactionNo', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'purchaseNo'}
        <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'pending' ? 'Menunggu' : value === 'received' ? 'Diterima' : 'Selesai'} />
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
          title="Detail & Penerimaan"
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

  <PurchaseFormModal bind:isOpen={isFormOpen} {purchaseToEdit} />
  <PurchaseDetailModal bind:isOpen={isDetailOpen} purchase={selectedPurchase} />
</div>
