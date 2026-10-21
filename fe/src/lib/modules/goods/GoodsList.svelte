<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import GoodsFormModal from './GoodsFormModal.svelte';
  import GoodsDetailModal from './GoodsDetailModal.svelte';
  import { goodsReceipts, goodsReceiptActions } from '$lib/stores/dataStore';
  import { formatDate } from '$lib/utils/formatters';
  import type { GoodsReceipt, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedGoods: GoodsReceipt | null = null;
  let goodsToEdit: GoodsReceipt | null = null;

  const columns: TableColumn[] = [
    { key: 'receiptNo', label: 'No. Penerimaan', sortable: true },
    { key: 'purchaseNo', label: 'No. PO Asal', sortable: true },
    { key: 'date', label: 'Tanggal Masuk', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
    { key: 'preparedBy', label: 'Penerima Gudang' },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    goodsToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: GoodsReceipt) {
    goodsToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: GoodsReceipt) {
    selectedGoods = item;
    isDetailOpen = true;
  }

  function handleDelete(item: GoodsReceipt) {
    if (confirm(`Hapus pencatatan penerimaan barang ${item.receiptNo}?`)) {
      goodsReceiptActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Penerimaan Barang (Goods Receipt)"
      description="Pemeriksaan fisik barang masuk dari vendor berdasarkan Purchase Order (PO)"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Catat Penerimaan Barang</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$goodsReceipts}
    searchPlaceholder="Cari penerimaan barang berdasarkan no penerimaan, PO, atau supplier..."
    searchKeys={['receiptNo', 'purchaseNo', 'supplierName', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'receiptNo'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else if column.key === 'purchaseNo'}
        <span class="font-mono text-gray-700 font-semibold">{value}</span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'received' ? 'Diterima' : 'Diproses'} />
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
          title="Detail"
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

  <GoodsFormModal bind:isOpen={isFormOpen} {goodsToEdit} />
  <GoodsDetailModal bind:isOpen={isDetailOpen} goods={selectedGoods} />
</div>
