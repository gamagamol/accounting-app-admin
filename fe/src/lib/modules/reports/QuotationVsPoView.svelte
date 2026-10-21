<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { quotations, salesOrders } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  interface QuotationVsPoRow {
    quotationNo: string;
    customerName: string;
    quotationDate: string;
    quotationTotal: number;
    salesNo: string;
    salesDate: string;
    salesTotal: number;
    variance: number;
    status: string;
  }

  $: reportData = $quotations.map((q) => {
    const matchedSO = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const salesTotal = matchedSO ? matchedSO.total : 0;
    const variance = salesTotal - q.total;

    return {
      quotationNo: q.quotationNo,
      customerName: q.customerName,
      quotationDate: q.date,
      quotationTotal: q.total,
      salesNo: matchedSO ? matchedSO.salesNo : '-',
      salesDate: matchedSO ? matchedSO.date : '-',
      salesTotal,
      variance,
      status: matchedSO ? 'Deal (SO Terbit)' : 'Pending Penawaran'
    };
  });

  $: totalQuotation = reportData.reduce((sum, r) => sum + r.quotationTotal, 0);
  $: totalSales = reportData.reduce((sum, r) => sum + r.salesTotal, 0);
  $: conversionRate = totalQuotation > 0 ? Math.round((totalSales / totalQuotation) * 100) : 0;

  const columns: TableColumn[] = [
    { key: 'quotationNo', label: 'No. Quotation', sortable: true },
    { key: 'customerName', label: 'Nama Customer', sortable: true },
    { key: 'quotationDate', label: 'Tgl Penawaran', format: (v) => formatDate(v) },
    { key: 'quotationTotal', label: 'Nilai Penawaran', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'salesNo', label: 'No. SO (Realisasi)' },
    { key: 'salesTotal', label: 'Nilai SO', align: 'right', sortable: true, format: (v) => v > 0 ? formatCurrency(v) : '-' },
    { key: 'status', label: 'Status Deal', align: 'center', sortable: true }
  ];
</script>

<div class="space-y-6">
  <!-- Metrics -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Total Nilai Penawaran</span>
      <p class="text-xl font-bold text-blue-700 mt-1 font-mono">{formatCurrency(totalQuotation)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Total Realisasi Pesanan (SO)</span>
      <p class="text-xl font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(totalSales)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Rasio Konversi Penjualan</span>
      <p class="text-xl font-bold text-indigo-700 mt-1 font-mono">{conversionRate}%</p>
    </div>
  </div>

  <div class="flex justify-end gap-2">
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Cetak / Print Laporan
    </Button>
  </div>

  <DataTable
    {columns}
    data={reportData}
    searchPlaceholder="Cari berdasarkan nomor quotation atau customer..."
    searchKeys={['quotationNo', 'customerName', 'salesNo']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'quotationNo'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else if column.key === 'salesNo' && value !== '-'}
        <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
          {value}
        </span>
      {:else if column.key === 'status'}
        <Badge
          status={value.includes('Deal') ? 'completed' : 'pending'}
          label={value}
        />
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
