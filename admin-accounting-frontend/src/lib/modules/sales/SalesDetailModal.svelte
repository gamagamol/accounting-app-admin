<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { salesActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { SalesOrder } from '$lib/types';

  export let isOpen: boolean = false;
  export let sales: SalesOrder | null = null;

  let isPrintOpen = false;

  function handleCreateDelivery() {
    if (!sales) return;
    if (confirm(`Create a Delivery Order for sales order ${sales.salesNo}?`)) {
      salesActions.createDelivery(sales.id);
      isOpen = false;
      alert('Delivery Order (DO) created successfully and forwarded to logistics.');
    }
  }

  function handleCreateBill() {
    if (!sales) return;
    if (confirm(`Issue an invoice for sales order ${sales.salesNo}?`)) {
      salesActions.createBill(sales.id);
      isOpen = false;
      alert('The invoice has been issued to the finance department.');
    }
  }
</script>

<Modal bind:isOpen title="Sales Order Details" size="3xl">
  {#if sales}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-indigo-600 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">
            {sales.salesNo}
          </span>
          <h3 class="text-lg font-bold text-gray-900 mt-1">{sales.customerName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. Transaksi: {sales.transactionNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status={sales.status} label={sales.status === 'pending' ? 'Awaiting Shipment' : sales.status === 'delivered' ? 'Delivered' : 'Completed'} />
          <Button size="sm" variant="secondary" on:click={() => (isPrintOpen = true)}>
            🖨️ Print SO
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-3 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Order Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(sales.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Prepared By:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{sales.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Order Total:</span>
          <p class="font-bold text-indigo-700 font-mono mt-0.5">{formatCurrency(sales.total)}</p>
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
              <th class="p-2.5 text-right w-28">Unit Price</th>
              <th class="p-2.5 text-center w-16">Discount</th>
              <th class="p-2.5 text-right w-32">Total</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each sales.items as itm, i}
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
            <span class="font-mono">{formatCurrency(sales.subtotal)}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>VAT 11%:</span>
            <span class="font-mono">{formatCurrency(sales.tax)}</span>
          </div>
          <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1">
            <span>Total:</span>
            <span class="font-mono text-indigo-700">{formatCurrency(sales.total)}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
    {#if sales}
      <Button variant="warning" on:click={handleCreateDelivery}>
        🚚 Create Delivery Order
      </Button>
      <Button variant="primary" on:click={handleCreateBill}>
        🧾 Issue Invoice
      </Button>
    {/if}
  </svelte:fragment>
</Modal>

{#if sales}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType="sales"
    documentNo={sales.salesNo}
    date={sales.date}
    customerOrSupplierName={sales.customerName}
    items={sales.items}
    subtotal={sales.subtotal}
    tax={sales.tax}
    total={sales.total}
    preparedBy={sales.preparedBy}
  />
{/if}
