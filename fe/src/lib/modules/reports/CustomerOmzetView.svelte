<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import { customers, salesOrders } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  interface CustomerOmzetRow {
    customerId: string;
    companyName: string;
    city: string;
    orderCount: number;
    totalOmzet: number;
    contributionPercentage: number;
  }

  $: totalAllSales = $salesOrders.reduce((sum, so) => sum + so.total, 0);

  $: omzetData = $customers.map((cust) => {
    const custOrders = $salesOrders.filter((so) => so.customerId === cust.id || so.customerName === cust.companyName);
    const totalOmzet = custOrders.reduce((sum, o) => sum + o.total, 0);
    const contributionPercentage = totalAllSales > 0 ? Math.round((totalOmzet / totalAllSales) * 100) : 0;

    return {
      customerId: cust.id,
      companyName: cust.companyName,
      city: cust.city,
      orderCount: custOrders.length,
      totalOmzet,
      contributionPercentage
    };
  }).sort((a, b) => b.totalOmzet - a.totalOmzet);

  const columns: TableColumn[] = [
    { key: 'companyName', label: 'Nama Perusahaan Pelanggan', sortable: true },
    { key: 'city', label: 'Kota', sortable: true },
    { key: 'orderCount', label: 'Jml Transaksi SO', align: 'center', sortable: true },
    { key: 'contributionPercentage', label: 'Kontribusi Omzet', align: 'center', sortable: true, format: (v) => `${v}%` },
    { key: 'totalOmzet', label: 'Total Omzet Penjualan', align: 'right', sortable: true, format: (v) => formatCurrency(v) }
  ];
</script>

<div class="space-y-6">
  <div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
    <div>
      <span class="text-xs uppercase tracking-wider font-semibold text-blue-200">Total Akumulasi Omzet Perusahaan</span>
      <h3 class="text-2xl sm:text-3xl font-extrabold font-mono mt-1">{formatCurrency(totalAllSales)}</h3>
      <p class="text-xs text-blue-100 mt-1">Dihitung dari seluruh pesanan penjualan yang telah disetujui</p>
    </div>
    <Button variant="secondary" size="md" on:click={() => window.print()}>
      📥 Export / Cetak Laporan Omzet
    </Button>
  </div>

  <DataTable
    {columns}
    data={omzetData}
    searchPlaceholder="Cari customer atau kota..."
    searchKeys={['companyName', 'city']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'totalOmzet'}
        <span class="font-mono font-bold text-gray-900 text-sm">
          {formatCurrency(value)}
        </span>
      {:else if column.key === 'contributionPercentage'}
        <div class="flex items-center justify-center gap-2">
          <div class="w-16 bg-gray-200 rounded-full h-2 overflow-hidden">
            <div class="bg-blue-600 h-2 rounded-full" style="width: {value}%"></div>
          </div>
          <span class="font-bold text-xs font-mono">{value}%</span>
        </div>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>
  </DataTable>
</div>
