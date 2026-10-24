<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { purchaseActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { PurchaseOrder } from '$lib/types';

  export let isOpen: boolean = false;
  export let purchase: PurchaseOrder | null = null;

  let isPrintOpen = false;

  function handleCreateGoodsReceipt() {
    if (!purchase) return;
    if (confirm(`Record a Goods Receipt for PO ${purchase.purchaseNo}?`)) {
      purchaseActions.createGoodsReceipt(purchase.id);
      isOpen = false;
      alert('Goods receipt has been recorded by the warehouse team.');
    }
  }
</script>

<Modal bind:isOpen title="Purchase Order Details" size="3xl">
  {#if purchase}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
            {purchase.purchaseNo}
          </span>
          <h3 class="text-lg font-bold text-gray-900 mt-1">{purchase.supplierName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. Transaksi: {purchase.transactionNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status={purchase.status} />
          <Button size="sm" variant="secondary" on:click={() => (isPrintOpen = true)}>
            🖨️ Print PO
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">PO Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(purchase.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Prepared By:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{purchase.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Purchase Total:</span>
          <p class="font-bold text-emerald-700 font-mono mt-0.5">{formatCurrency(purchase.total)}</p>
        </div>
      </div>

      <!-- Items Table -->
      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-slate-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2.5 text-center w-10">No</th>
              <th class="p-2.5 text-left">Product Name</th>
              <th class="p-2.5 text-center w-16">Qty</th>
              <th class="p-2.5 text-center w-16">Unit</th>
              <th class="p-2.5 text-right w-28">Purchase Price</th>
              <th class="p-2.5 text-center w-16">Discount</th>
              <th class="p-2.5 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each purchase.items as itm, i}
              <tr>
                <td class="p-2.5 text-center text-gray-400 font-mono">{i + 1}</td>
                <td class="p-2.5 font-medium text-gray-800">{itm.productName}</td>
                <td class="p-2.5 text-center font-semibold">{itm.quantity}</td>
                <td class="p-2.5 text-center text-gray-500">{itm.unit}</td>
                <td class="p-2.5 text-right font-mono">{formatCurrency(itm.unitPrice)}</td>
                <td class="p-2.5 text-center">{itm.discount ? `${itm.discount}%` : '-'}</td>
                <td class="p-2.5 text-right font-mono font-semibold">{formatCurrency(itm.total)}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>

      <div class="flex justify-end">
        <div class="w-full sm:w-64 space-y-1 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span class="font-mono">{formatCurrency(purchase.subtotal)}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>VAT 11%:</span>
            <span class="font-mono">{formatCurrency(purchase.tax)}</span>
          </div>
          <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1">
            <span>Total:</span>
            <span class="font-mono text-emerald-700">{formatCurrency(purchase.total)}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
    {#if purchase && purchase.status === 'pending'}
      <Button variant="success" on:click={handleCreateGoodsReceipt}>
        📥 Record Goods Receipt
      </Button>
    {/if}
  </svelte:fragment>
</Modal>

{#if purchase}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType="purchase"
    documentNo={purchase.purchaseNo}
    date={purchase.date}
    customerOrSupplierName={purchase.supplierName}
    items={purchase.items}
    subtotal={purchase.subtotal}
    tax={purchase.tax}
    total={purchase.total}
    preparedBy={purchase.preparedBy}
  />
{/if}
