<script lang="ts">
  import Badge from '$lib/components/ui/Badge.svelte';
  import { salesOrders, billPayments, systemAlerts } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
</script>

<div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
  <!-- Recent Sales Orders -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-bold text-gray-900">Pesanan Penjualan Terbaru (SO)</h4>
      <a href="/sales" class="text-xs text-blue-600 hover:underline font-semibold">Semua SO &rarr;</a>
    </div>

    <div class="divide-y divide-gray-100">
      {#each $salesOrders.slice(0, 5) as so}
        <div class="py-3 flex items-center justify-between text-xs">
          <div>
            <div class="flex items-center gap-2">
              <span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
                {so.salesNo}
              </span>
              <span class="font-semibold text-gray-900">{so.customerName}</span>
            </div>
            <p class="text-gray-500 text-[11px] mt-0.5">{formatDate(so.date)} • Oleh: {so.preparedBy}</p>
          </div>
          <div class="text-right">
            <p class="font-mono font-bold text-gray-900">{formatCurrency(so.total)}</p>
            <Badge status={so.status} label={so.status} />
          </div>
        </div>
      {/each}
    </div>
  </div>

  <!-- Notification Alerts & Receivables -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <div class="flex items-center justify-between mb-4">
      <h4 class="text-sm font-bold text-gray-900">Peringatan Jatuh Tempo & Penagihan</h4>
      <span class="text-xs text-amber-700 font-semibold bg-amber-50 px-2 py-0.5 rounded-full border border-amber-200">
        {$systemAlerts.length} Pemberitahuan
      </span>
    </div>

    <div class="space-y-3">
      {#each $systemAlerts as alert}
        <div class="p-3 rounded-xl border border-gray-100 bg-gray-50/70 text-xs flex items-start gap-3">
          <span class="text-lg mt-0.5">
            {alert.type === 'debt' ? '⚠️' : alert.type === 'receivable' ? '🔔' : 'ℹ️'}
          </span>
          <div class="flex-1">
            <p class="font-bold text-gray-900">{alert.title}</p>
            <p class="text-gray-600 mt-0.5">{alert.message}</p>
            <a href={alert.link} class="inline-block mt-1 text-blue-600 hover:underline font-semibold text-[11px]">
              Tindak Lanjut &rarr;
            </a>
          </div>
        </div>
      {/each}
    </div>
  </div>
</div>
