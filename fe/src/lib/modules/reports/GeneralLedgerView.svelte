<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { journalEntries, chartOfAccounts } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  const columns: TableColumn[] = [
    { key: 'date', label: 'Tanggal Jurnal', sortable: true, format: (v) => formatDate(v) },
    { key: 'reference', label: 'No. Dokumen Ref', sortable: true },
    { key: 'description', label: 'Keterangan Transaksi', sortable: true },
    { key: 'debitAccount', label: 'Akun Debet', sortable: true },
    { key: 'creditAccount', label: 'Akun Kredit', sortable: true },
    { key: 'amount', label: 'Nominal (IDR)', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
  ];

  $: totalJournalAmount = $journalEntries.reduce((s, j) => s + j.amount, 0);
</script>

<div class="space-y-6">
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Total Mutasi Jurnal Umum</span>
      <p class="text-xl font-bold text-gray-900 mt-1 font-mono">{formatCurrency(totalJournalAmount)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Total Akun Aktif (COA)</span>
      <p class="text-xl font-bold text-blue-700 mt-1 font-mono">{$chartOfAccounts.length} Akun</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Keseimbangan Pembukuan</span>
      <p class="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-2">
        <span>Balance (Seimbang)</span>
        <span class="text-sm">⚖️</span>
      </p>
    </div>
  </div>

  <div class="flex justify-between items-center">
    <p class="text-xs text-gray-500">Daftar ayat jurnal umum pembukuan transaksi keuangan dan operasional</p>
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Cetak Buku Jurnal Umum
    </Button>
  </div>

  <DataTable
    {columns}
    data={$journalEntries}
    searchPlaceholder="Cari jurnal berdasarkan keterangan, akun, atau nomor referensi..."
    searchKeys={['description', 'reference', 'debitAccount', 'creditAccount']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'reference'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else if column.key === 'debitAccount'}
        <span class="font-medium text-emerald-800">{value}</span>
      {:else if column.key === 'creditAccount'}
        <span class="font-medium text-rose-800">{value}</span>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
