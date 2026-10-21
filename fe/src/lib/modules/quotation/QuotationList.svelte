<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import QuotationFormModal from './QuotationFormModal.svelte';
  import QuotationDetailModal from './QuotationDetailModal.svelte';
  import { quotations, quotationActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { Quotation, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedQuotation: Quotation | null = null;
  let quotationToEdit: Quotation | null = null;

  const columns: TableColumn[] = [
    { key: 'quotationNo', label: 'No. Quotation', sortable: true },
    { key: 'date', label: 'Tanggal', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'salesPerson', label: 'Sales Person' },
    { key: 'total', label: 'Total Nominal', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'status', label: 'Status', align: 'center', sortable: true }
  ];

  function openCreate() {
    quotationToEdit = null;
    isFormOpen = true;
  }

  function openEdit(item: Quotation) {
    quotationToEdit = item;
    isFormOpen = true;
  }

  function openDetail(item: Quotation) {
    selectedQuotation = item;
    isDetailOpen = true;
  }

  function handleDelete(item: Quotation) {
    if (confirm(`Apakah Anda yakin ingin menghapus penawaran ${item.quotationNo}?`)) {
      quotationActions.delete(item.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Surat Penawaran Harga (Quotation)"
      description="Manajemen proposal penawaran harga ke prospek & pelanggan sebelum menjadi pesanan (SO)"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Buat Quotation Baru</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$quotations}
    searchPlaceholder="Cari penawaran berdasarkan nomor, customer, sales..."
    searchKeys={['quotationNo', 'customerName', 'salesPerson', 'transactionNo']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'quotationNo'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge status={value} label={value === 'quotation' ? 'Penawaran' : value === 'sales' ? 'Diproses SO' : 'Selesai'} />
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

  <QuotationFormModal bind:isOpen={isFormOpen} {quotationToEdit} />
  <QuotationDetailModal bind:isOpen={isDetailOpen} quotation={selectedQuotation} />
</div>
