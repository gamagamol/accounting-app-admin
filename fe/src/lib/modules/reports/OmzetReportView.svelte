<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { salesOrders, purchaseOrders } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  const monthlyOmzet = [
    { period: 'Januari 2024', grossSales: 125400000, cogs: 82500000, margin: 42900000, marginPct: 34.2, orders: 12 },
    { period: 'Februari 2024', grossSales: 148200000, cogs: 96300000, margin: 51900000, marginPct: 35.0, orders: 15 },
    { period: 'Maret 2024', grossSales: 185600000, cogs: 118400000, margin: 67200000, marginPct: 36.2, orders: 18 },
    { period: 'April 2024 (Berjalan)', grossSales: 162900000, cogs: 104500000, margin: 58400000, marginPct: 35.8, orders: 14 }
  ];

  $: totalGross = monthlyOmzet.reduce((s, m) => s + m.grossSales, 0);
  $: totalCogs = monthlyOmzet.reduce((s, m) => s + m.cogs, 0);
  $: totalMargin = monthlyOmzet.reduce((s, m) => s + m.margin, 0);
  $: avgMarginPct = Math.round((totalMargin / totalGross) * 100);

  const columns: TableColumn[] = [
    { key: 'period', label: 'Periode Bulan', sortable: true },
    { key: 'orders', label: 'Volume Transaksi', align: 'center', sortable: true, format: (v) => `${v} Pesanan` },
    { key: 'grossSales', label: 'Omzet Penjualan Kotor', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'cogs', label: 'Harga Pokok (HPP)', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'margin', label: 'Laba Kotor (Gross Profit)', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'marginPct', label: 'Margin (%)', align: 'center', sortable: true, format: (v) => `${v}%` }
  ];
</script>

<div class="space-y-6">
  <!-- Key Performance Indicators -->
  <div class="grid grid-cols-1 sm:grid-cols-4 gap-4">
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Total Akumulasi Omzet</span>
      <p class="text-xl font-bold text-blue-700 mt-1 font-mono">{formatCurrency(totalGross)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Beban Pokok Penjualan (HPP)</span>
      <p class="text-xl font-bold text-amber-700 mt-1 font-mono">{formatCurrency(totalCogs)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Laba Kotor (Gross Margin)</span>
      <p class="text-xl font-bold text-emerald-700 mt-1 font-mono">{formatCurrency(totalMargin)}</p>
    </div>
    <div class="bg-white p-4 rounded-xl border border-gray-200">
      <span class="text-xs font-semibold text-gray-500 uppercase">Rata-rata Margin</span>
      <p class="text-xl font-bold text-indigo-700 mt-1 font-mono">{avgMarginPct}%</p>
    </div>
  </div>

  <div class="flex justify-end gap-2">
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Export / Cetak Laporan Omzet Bulanan
    </Button>
  </div>

  <DataTable
    {columns}
    data={monthlyOmzet}
    searchPlaceholder="Cari periode bulan..."
    searchKeys={['period']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'grossSales'}
        <span class="font-mono font-bold text-blue-700">{formatCurrency(value)}</span>
      {:else if column.key === 'margin'}
        <span class="font-mono font-bold text-emerald-700">{formatCurrency(value)}</span>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
