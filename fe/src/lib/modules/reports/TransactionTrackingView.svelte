<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import {
    quotations,
    salesOrders,
    purchaseOrders,
    goodsReceipts,
    deliveries,
    billPayments,
    payments
  } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';

  // Gather unique transactions across the system
  $: trackingItems = $quotations.map((q) => {
    const so = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const doItem = so ? $deliveries.find((d) => d.salesNo === so.salesNo || d.transactionNo === q.transactionNo) : null;
    const bill = so ? $billPayments.find((b) => b.invoiceNo === so.salesNo || b.transactionNo === q.transactionNo) : null;
    const pay = bill ? $payments.find((p) => p.invoiceNo === bill.billNo || p.transactionNo === q.transactionNo) : null;
    const po = $purchaseOrders[0];
    const gr = $goodsReceipts[0];

    return {
      transactionNo: q.transactionNo,
      customerName: q.customerName,
      date: q.date,
      quotation: q,
      salesOrder: so || null,
      purchaseOrder: po || null,
      goodsReceipt: gr || null,
      delivery: doItem || null,
      bill: bill || null,
      payment: pay || null
    };
  });

  let selectedTrxIndex = 0;
  $: activeTrx = trackingItems[selectedTrxIndex] || trackingItems[0];
</script>

<div class="space-y-6">
  <!-- Selector -->
  <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
    <div>
      <span class="text-xs font-semibold text-gray-500 uppercase tracking-wider">Pilih Nomor Transaksi untuk Tracking:</span>
      <select
        bind:value={selectedTrxIndex}
        class="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        {#each trackingItems as item, idx}
          <option value={idx}>{item.transactionNo} - {item.customerName}</option>
        {/each}
      </select>
    </div>

    {#if activeTrx}
      <div class="text-right">
        <span class="text-xs text-gray-500">Customer:</span>
        <p class="font-bold text-gray-900 text-sm">{activeTrx.customerName}</p>
        <span class="text-[11px] text-gray-500">Tgl Awal: {formatDate(activeTrx.date)}</span>
      </div>
    {/if}
  </div>

  {#if activeTrx}
    <!-- Flow Pipeline Visualizer -->
    <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
      <h4 class="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2">
        <span>🚀</span>
        <span>Alur Siklus Hidup Transaksi (Transaction Lifecycle)</span>
      </h4>

      <div class="grid grid-cols-1 md:grid-cols-7 gap-3 relative">
        <!-- 1. Quotation -->
        <div class="p-3 rounded-xl border {activeTrx.quotation ? 'bg-blue-50/70 border-blue-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-blue-800 uppercase">1. Quotation</span>
            <span class="text-xs">✅</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.quotation.quotationNo}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-0.5">{formatCurrency(activeTrx.quotation.total)}</p>
          <span class="inline-block mt-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold">Penawaran</span>
        </div>

        <!-- 2. Sales Order -->
        <div class="p-3 rounded-xl border {activeTrx.salesOrder ? 'bg-indigo-50/70 border-indigo-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-indigo-800 uppercase">2. Sales Order</span>
            <span>{activeTrx.salesOrder ? '✅' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.salesOrder?.salesNo || 'Belum Terbit'}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-0.5">{activeTrx.salesOrder ? formatCurrency(activeTrx.salesOrder.total) : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold">Pesanan Deal</span>
        </div>

        <!-- 3. Purchase Order -->
        <div class="p-3 rounded-xl border {activeTrx.purchaseOrder ? 'bg-emerald-50/70 border-emerald-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-emerald-800 uppercase">3. Purchase PO</span>
            <span>{activeTrx.purchaseOrder ? '✅' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.purchaseOrder?.purchaseNo || 'Belum Ada PO'}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-0.5">{activeTrx.purchaseOrder ? formatCurrency(activeTrx.purchaseOrder.total) : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold">Pengadaan</span>
        </div>

        <!-- 4. Goods Receipt -->
        <div class="p-3 rounded-xl border {activeTrx.goodsReceipt ? 'bg-teal-50/70 border-teal-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-teal-800 uppercase">4. Goods Receipt</span>
            <span>{activeTrx.goodsReceipt ? '✅' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.goodsReceipt?.receiptNo || 'Menunggu Masuk'}</p>
          <p class="text-[11px] text-gray-500 mt-0.5">{activeTrx.goodsReceipt ? 'Fisik Masuk Gudang' : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold">Gudang</span>
        </div>

        <!-- 5. Delivery -->
        <div class="p-3 rounded-xl border {activeTrx.delivery ? 'bg-cyan-50/70 border-cyan-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-cyan-800 uppercase">5. Delivery DO</span>
            <span>{activeTrx.delivery ? '✅' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.delivery?.deliveryNo || 'Menunggu Kirim'}</p>
          <p class="text-[11px] text-gray-500 mt-0.5">{activeTrx.delivery ? activeTrx.delivery.status : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-semibold">Logistik</span>
        </div>

        <!-- 6. Bill Payment -->
        <div class="p-3 rounded-xl border {activeTrx.bill ? 'bg-amber-50/70 border-amber-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-amber-800 uppercase">6. Invoice</span>
            <span>{activeTrx.bill ? '✅' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.bill?.billNo || 'Belum Ditagih'}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-0.5">{activeTrx.bill ? formatCurrency(activeTrx.bill.amount) : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold">Faktur Penagihan</span>
        </div>

        <!-- 7. Payment -->
        <div class="p-3 rounded-xl border {activeTrx.payment ? 'bg-green-50/70 border-green-300' : 'bg-gray-50 border-gray-200 opacity-50'}">
          <div class="flex items-center justify-between mb-1">
            <span class="text-[10px] font-bold text-green-800 uppercase">7. Pelunasan</span>
            <span>{activeTrx.payment ? '🎉' : '⏳'}</span>
          </div>
          <p class="font-mono text-xs font-bold text-gray-900 truncate">{activeTrx.payment?.paymentNo || 'Pending Bayar'}</p>
          <p class="text-[11px] text-gray-500 font-mono mt-0.5">{activeTrx.payment ? formatCurrency(activeTrx.payment.amount) : '-'}</p>
          <span class="inline-block mt-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">
            {activeTrx.payment ? 'Lunas Kas Masuk' : 'Tertunggak'}
          </span>
        </div>
      </div>
    </div>
  {/if}
</div>
