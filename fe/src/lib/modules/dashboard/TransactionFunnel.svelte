<script lang="ts">
  import {
    quotations,
    salesOrders,
    purchaseOrders,
    goodsReceipts,
    deliveries,
    billPayments,
    payments
  } from '$lib/stores/dataStore';

  $: steps = [
    { label: 'Quotation', count: $quotations.length, color: 'bg-blue-500', href: '/quotation', icon: '📄' },
    { label: 'Sales Order', count: $salesOrders.length, color: 'bg-indigo-500', href: '/sales', icon: '🛒' },
    { label: 'Purchase Order', count: $purchaseOrders.length, color: 'bg-emerald-500', href: '/purchase', icon: '🛍️' },
    { label: 'Goods Receipt', count: $goodsReceipts.length, color: 'bg-teal-500', href: '/goods', icon: '📥' },
    { label: 'Delivery', count: $deliveries.length, color: 'bg-cyan-500', href: '/delivery', icon: '🚚' },
    { label: 'Bill Payment', count: $billPayments.length, color: 'bg-amber-500', href: '/bill', icon: '🧾' },
    { label: 'Payment', count: $payments.length, color: 'bg-green-500', href: '/payment', icon: '💵' }
  ];
</script>

<div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
  <div class="flex items-center justify-between mb-5">
    <div>
      <h3 class="text-base font-bold text-gray-900">Alur Funnel Transaksi (Pipeline Status)</h3>
      <p class="text-xs text-gray-500">Jumlah berkas aktif di setiap tahapan siklus bisnis</p>
    </div>
    <a href="/report?tab=tracking" class="text-xs text-blue-600 hover:underline font-semibold">
      Lihat Detail Tracking &rarr;
    </a>
  </div>

  <div class="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-7 gap-3">
    {#each steps as step}
      <a
        href={step.href}
        class="p-3.5 rounded-xl border border-gray-100 hover:border-gray-300 hover:shadow-md transition-all flex flex-col items-center text-center group bg-slate-50/50"
      >
        <span class="text-2xl mb-1 group-hover:scale-110 transition-transform">{step.icon}</span>
        <span class="text-[11px] font-semibold text-gray-600 truncate w-full">{step.label}</span>
        <span class="text-xl font-black text-gray-900 font-mono mt-1">{step.count}</span>
        <span class="text-[10px] text-gray-400 mt-0.5">Dokumen</span>
      </a>
    {/each}
  </div>
</div>
