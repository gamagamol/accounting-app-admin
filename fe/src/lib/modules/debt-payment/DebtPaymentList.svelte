<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import DebtPaymentFormModal from './DebtPaymentFormModal.svelte';
  import DebtPaymentDetailModal from './DebtPaymentDetailModal.svelte';
  import { debtPayments, debtPaymentActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { DebtPayment, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedDebt: DebtPayment | null = null;
  let debtToEdit: DebtPayment | null = null;

  const columns: TableColumn[] = [
    { key: 'paymentNo', label: 'No. Bukti Kas Keluar', sortable: true },
    { key: 'date', label: 'Tanggal Kas', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Nama Vendor / Supplier', sortable: true },
    { key: 'purchaseNo', label: 'No. PO (Ref)' },
    { key: 'method', label: 'Metode' },
    { key: 'amount', label: 'Nominal Keluar', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    debtToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: DebtPayment) {
    debtToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: DebtPayment) {
    selectedDebt = item;
    isDetailOpen = true;
  }

  function handleDelete(item: DebtPayment) {
    if (confirm(`Hapus data pembayaran hutang ${item.paymentNo}?`)) {
      debtPaymentActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Pembayaran Hutang Vendor (Debt Payment)"
      description="Pencatatan pengeluaran kas pelunasan tagihan supplier atas pesanan pembelian (PO)"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Catat Bayar Hutang</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$debtPayments}
    searchPlaceholder="Cari pembayaran hutang berdasarkan nomor, supplier, PO..."
    searchKeys={['paymentNo', 'supplierName', 'purchaseNo', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'paymentNo'}
        <span class="font-mono font-bold text-rose-700 bg-rose-50 px-2 py-0.5 rounded border border-rose-200">
          {value}
        </span>
      {:else if column.key === 'method'}
        <span class="uppercase text-xs font-semibold text-gray-600 bg-gray-100 px-2 py-0.5 rounded">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label="Lunas" />
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
          title="Detail Bukti"
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

  <DebtPaymentFormModal bind:isOpen={isFormOpen} {debtToEdit} />
  <DebtPaymentDetailModal bind:isOpen={isDetailOpen} debt={selectedDebt} />
</div>
