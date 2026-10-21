<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import BillFormModal from './BillFormModal.svelte';
  import BillDetailModal from './BillDetailModal.svelte';
  import { billPayments, billActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { BillPayment, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedBill: BillPayment | null = null;
  let billToEdit: BillPayment | null = null;

  const columns: TableColumn[] = [
    { key: 'billNo', label: 'No. Faktur (Invoice)', sortable: true },
    { key: 'invoiceNo', label: 'No. Pesanan (SO)', sortable: true },
    { key: 'date', label: 'Tanggal Faktur', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Customer', sortable: true },
    { key: 'method', label: 'Metode' },
    { key: 'amount', label: 'Nomor Tagihan', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    billToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: BillPayment) {
    billToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: BillPayment) {
    selectedBill = item;
    isDetailOpen = true;
  }

  function handleDelete(item: BillPayment) {
    if (confirm(`Hapus faktur tagihan ${item.billNo}?`)) {
      billActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Faktur Tagihan (Bill Payment / Invoice)"
      description="Penerbitan faktur piutang penjualan ke customer dan pemantauan status pelunasan"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Terbitkan Tagihan Baru</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$billPayments}
    searchPlaceholder="Cari faktur berdasarkan no invoice, SO, atau customer..."
    searchKeys={['billNo', 'invoiceNo', 'supplierName', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'billNo'}
        <span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
          {value}
        </span>
      {:else if column.key === 'method'}
        <span class="uppercase text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'paid' ? 'Lunas' : 'Belum Lunas'} />
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
          title="Detail & Pelunasan"
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

  <BillFormModal bind:isOpen={isFormOpen} {billToEdit} />
  <BillDetailModal bind:isOpen={isDetailOpen} bill={selectedBill} />
</div>
