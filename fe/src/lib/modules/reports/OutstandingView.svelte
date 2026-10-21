<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { billPayments, salesOrders, purchaseOrders } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { TableColumn } from '$lib/types';

  $: outstandingBills = $billPayments.filter((b) => b.status === 'pending');
  $: totalOutstandingReceivable = outstandingBills.reduce((sum, b) => sum + b.amount, 0);

  $: pendingDeliveries = $salesOrders.filter((s) => s.status === 'pending');
  $: totalPendingDeliveryValue = pendingDeliveries.reduce((sum, s) => sum + s.total, 0);

  $: pendingPurchases = $purchaseOrders.filter((p) => p.status === 'pending');
  $: totalPendingPurchaseValue = pendingPurchases.reduce((sum, p) => sum + p.total, 0);

  let activeFilter: 'receivable' | 'delivery' | 'purchase' = 'receivable';

  const receivableColumns: TableColumn[] = [
    { key: 'billNo', label: 'No. Faktur (Invoice)', sortable: true },
    { key: 'date', label: 'Tanggal Terbit', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Pelanggan (Customer)', sortable: true },
    { key: 'invoiceNo', label: 'No. SO Ref' },
    { key: 'amount', label: 'Nilai Piutang Tertunggak', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status Penagihan', align: 'center' }
  ];

  const deliveryColumns: TableColumn[] = [
    { key: 'salesNo', label: 'No. Sales Order', sortable: true },
    { key: 'date', label: 'Tanggal Order', sortable: true, format: (v) => formatDate(v) },
    { key: 'customerName', label: 'Customer', sortable: true },
    { key: 'total', label: 'Nilai Barang Belum Dikirim', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status Pengiriman', align: 'center' }
  ];

  const purchaseColumns: TableColumn[] = [
    { key: 'purchaseNo', label: 'No. Purchase Order', sortable: true },
    { key: 'date', label: 'Tanggal PO', sortable: true, format: (v) => formatDate(v) },
    { key: 'supplierName', label: 'Supplier / Vendor', sortable: true },
    { key: 'total', label: 'Nilai Pembelian Tertunda', align: 'right', sortable: true, format: (v) => formatCurrency(v) },
    { key: 'status', label: 'Status Barang Masuk', align: 'center' }
  ];
</script>

<div class="space-y-6">
  <!-- Summary Cards -->
  <div class="grid grid-cols-1 sm:grid-cols-3 gap-4">
    <button
      type="button"
      on:click={() => (activeFilter = 'receivable')}
      class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'receivable' ? 'bg-amber-50/70 border-amber-300 ring-2 ring-amber-400' : 'bg-white border-gray-200 hover:border-gray-300'}"
    >
      <span class="text-xs font-semibold text-amber-800 uppercase tracking-wider">Piutang Belum Lunas</span>
      <p class="text-xl font-bold text-amber-700 mt-1 font-mono">{formatCurrency(totalOutstandingReceivable)}</p>
      <span class="text-xs text-amber-600 mt-1 block">{outstandingBills.length} Tagihan Menunggu Pembayaran</span>
    </button>

    <button
      type="button"
      on:click={() => (activeFilter = 'delivery')}
      class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'delivery' ? 'bg-blue-50/70 border-blue-300 ring-2 ring-blue-400' : 'bg-white border-gray-200 hover:border-gray-300'}"
    >
      <span class="text-xs font-semibold text-blue-800 uppercase tracking-wider">Pengiriman Belum Selesai</span>
      <p class="text-xl font-bold text-blue-700 mt-1 font-mono">{formatCurrency(totalPendingDeliveryValue)}</p>
      <span class="text-xs text-blue-600 mt-1 block">{pendingDeliveries.length} Pesanan Menunggu Kirim</span>
    </button>

    <button
      type="button"
      on:click={() => (activeFilter = 'purchase')}
      class="text-left p-4 rounded-xl border transition-all
             {activeFilter === 'purchase' ? 'bg-rose-50/70 border-rose-300 ring-2 ring-rose-400' : 'bg-white border-gray-200 hover:border-gray-300'}"
    >
      <span class="text-xs font-semibold text-rose-800 uppercase tracking-wider">Hutang / PO Pending</span>
      <p class="text-xl font-bold text-rose-700 mt-1 font-mono">{formatCurrency(totalPendingPurchaseValue)}</p>
      <span class="text-xs text-rose-600 mt-1 block">{pendingPurchases.length} PO Belum Diterima</span>
    </button>
  </div>

  <div class="flex justify-between items-center">
    <div class="text-xs font-semibold text-gray-700">
      {#if activeFilter === 'receivable'}
        Daftar Faktur Tagihan Piutang Yang Belum Lunas (Outstanding Invoices)
      {:else if activeFilter === 'delivery'}
        Daftar Pesanan Sales Order Yang Belum Dikirimkan (Pending DO)
      {:else}
        Daftar Purchase Order Menunggu Penerimaan Barang Masuk (Pending PO)
      {/if}
    </div>
    <Button variant="secondary" size="sm" on:click={() => window.print()}>
      🖨️ Cetak Laporan Outstanding
    </Button>
  </div>

  {#if activeFilter === 'receivable'}
    <DataTable
      columns={receivableColumns}
      data={outstandingBills}
      searchPlaceholder="Cari invoice piutang tertunggak..."
      searchKeys={['billNo', 'supplierName', 'invoiceNo']}
    >
      <svelte:fragment slot="cell" let:column let:value let:row>
        {#if column.key === 'billNo'}
          <span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {value}
          </span>
        {:else if column.key === 'status'}
          <Badge status="pending" label="Belum Lunas" />
        {:else}
          {column.format ? column.format(value, row) : value}
        {/if}
      </svelte:fragment>
    </DataTable>
  {:else if activeFilter === 'delivery'}
    <DataTable
      columns={deliveryColumns}
      data={pendingDeliveries}
      searchPlaceholder="Cari pesanan pengiriman tertunda..."
      searchKeys={['salesNo', 'customerName']}
    >
      <svelte:fragment slot="cell" let:column let:value let:row>
        {#if column.key === 'salesNo'}
          <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {value}
          </span>
        {:else if column.key === 'status'}
          <Badge status="pending" label="Pending Kirim" />
        {:else}
          {column.format ? column.format(value, row) : value}
        {/if}
      </svelte:fragment>
    </DataTable>
  {:else}
    <DataTable
      columns={purchaseColumns}
      data={pendingPurchases}
      searchPlaceholder="Cari purchase order tertunda..."
      searchKeys={['purchaseNo', 'supplierName']}
    >
      <svelte:fragment slot="cell" let:column let:value let:row>
        {#if column.key === 'purchaseNo'}
          <span class="font-mono font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {value}
          </span>
        {:else if column.key === 'status'}
          <Badge status="pending" label="Menunggu Barang" />
        {:else}
          {column.format ? column.format(value, row) : value}
        {/if}
      </svelte:fragment>
    </DataTable>
  {/if}
</div>
