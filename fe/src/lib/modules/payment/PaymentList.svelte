<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import PaymentFormModal from './PaymentFormModal.svelte';
  import PaymentDetailModal from './PaymentDetailModal.svelte';
  import { payments, paymentActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { Payment, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedPayment: Payment | null = null;
  let paymentToEdit: Payment | null = null;

  const columns: TableColumn[] = [
    { key: 'paymentNo', label: 'No. Kuitansi', sortable: true },
    { key: 'date', label: 'Tanggal Kas', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Nama Customer', sortable: true },
    { key: 'invoiceNo', label: 'No. Faktur (Ref)' },
    { key: 'method', label: 'Metode' },
    { key: 'amount', label: 'Nominal Masuk', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    paymentToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: Payment) {
    paymentToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: Payment) {
    selectedPayment = item;
    isDetailOpen = true;
  }

  function handleDelete(item: Payment) {
    if (confirm(`Hapus kuitansi pembayaran ${item.paymentNo}?`)) {
      paymentActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Penerimaan Kas (Pelunasan Piutang)"
      description="Pencatatan uang masuk dari customer, penerbitan kuitansi, dan update saldo piutang buku besar"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Catat Penerimaan Kas</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$payments}
    searchPlaceholder="Cari kuitansi berdasarkan nomor, customer, atau invoice..."
    searchKeys={['paymentNo', 'customerName', 'invoiceNo', 'preparedBy']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'paymentNo'}
        <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
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

  <PaymentFormModal bind:isOpen={isFormOpen} {paymentToEdit} />
  <PaymentDetailModal bind:isOpen={isDetailOpen} payment={selectedPayment} />
</div>
