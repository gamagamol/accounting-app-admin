<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { billPayments } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  interface AgingRow {
    invoiceNo: string;
    customerName: string;
    date: string;
    current: number;
    days1_30: number;
    days31_60: number;
    days61_90: number;
    daysOver90: number;
    total: number;
  }

  $: agingData = $billPayments.map((b, i) => {
    const isPaid = b.status === 'paid';
    const amount = isPaid ? 0 : b.amount;
    
    // Distribute into realistic aging buckets based on index for dummy presentation
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let daysOver90 = 0;

    if (i % 5 === 0) current = amount;
    else if (i % 5 === 1) days1_30 = amount;
    else if (i % 5 === 2) days31_60 = amount;
    else if (i % 5 === 3) days61_90 = amount;
    else daysOver90 = amount;

    return {
      invoiceNo: b.billNo,
      customerName: b.supplierName,
      date: b.date,
      current,
      days1_30,
      days31_60,
      days61_90,
      daysOver90,
      total: amount
    };
  });

  $: totalAll = agingData.reduce((acc, row) => ({
    current: acc.current + row.current,
    days1_30: acc.days1_30 + row.days1_30,
    days31_60: acc.days31_60 + row.days31_60,
    days61_90: acc.days61_90 + row.days61_90,
    daysOver90: acc.daysOver90 + row.daysOver90,
    total: acc.total + row.total
  }), { current: 0, days1_30: 0, days31_60: 0, days61_90: 0, daysOver90: 0, total: 0 });

  const columns: TableColumn[] = [
    { key: 'invoiceNo', label: 'No. Faktur', sortable: true },
    { key: 'customerName', label: 'Customer / Pelanggan', sortable: true },
    { key: 'date', label: 'Tgl Faktur', format: (v) => formatDate(v) },
    { key: 'current', label: 'Belum Jatuh Tempo', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'days1_30', label: '1 - 30 Hari', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'days31_60', label: '31 - 60 Hari', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'days61_90', label: '61 - 90 Hari', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'daysOver90', label: '> 90 Hari', align: 'right', format: (v) => formatCurrency(v) },
    { key: 'total', label: 'Total Piutang', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
  ];
</script>

<div class="space-y-6">
  <!-- Summary Cards -->
  <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
    <div class="bg-white p-3.5 rounded-xl border border-gray-200">
      <span class="text-[11px] font-semibold text-gray-500 uppercase">Lancar (Current)</span>
      <p class="text-sm font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(totalAll.current)}</p>
    </div>
    <div class="bg-white p-3.5 rounded-xl border border-gray-200">
      <span class="text-[11px] font-semibold text-gray-500 uppercase">1 - 30 Hari</span>
      <p class="text-sm font-bold text-blue-700 mt-1 font-mono">{formatCurrency(totalAll.days1_30)}</p>
    </div>
    <div class="bg-white p-3.5 rounded-xl border border-gray-200">
      <span class="text-[11px] font-semibold text-gray-500 uppercase">31 - 60 Hari</span>
      <p class="text-sm font-bold text-amber-700 mt-1 font-mono">{formatCurrency(totalAll.days31_60)}</p>
    </div>
    <div class="bg-white p-3.5 rounded-xl border border-gray-200">
      <span class="text-[11px] font-semibold text-gray-500 uppercase">61 - 90 Hari</span>
      <p class="text-sm font-bold text-orange-700 mt-1 font-mono">{formatCurrency(totalAll.days61_90)}</p>
    </div>
    <div class="bg-white p-3.5 rounded-xl border border-gray-200">
      <span class="text-[11px] font-semibold text-gray-500 uppercase">&gt; 90 Hari (Macet)</span>
      <p class="text-sm font-bold text-rose-700 mt-1 font-mono">{formatCurrency(totalAll.daysOver90)}</p>
    </div>
    <div class="bg-slate-900 text-white p-3.5 rounded-xl">
      <span class="text-[11px] font-semibold text-slate-400 uppercase">Total Piutang Usaha</span>
      <p class="text-sm font-bold text-white mt-1 font-mono">{formatCurrency(totalAll.total)}</p>
    </div>
  </div>

  <div class="flex justify-end gap-2">
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Cetak / Print Jadwal Umur Piutang
    </Button>
  </div>

  <DataTable
    {columns}
    data={agingData}
    searchPlaceholder="Cari berdasarkan nomor invoice atau customer..."
    searchKeys={['invoiceNo', 'customerName']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'daysOver90' && value > 0}
        <span class="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">
          {formatCurrency(value)}
        </span>
      {:else if column.key === 'total'}
        <span class="font-mono font-bold text-gray-900">
          {formatCurrency(value)}
        </span>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
