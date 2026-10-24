<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { quotationActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { Quotation } from '$lib/types';

  export let isOpen: boolean = false;
  export let quotation: Quotation | null = null;

  let isPrintOpen = false;

  function handleConvertToSales() {
    if (!quotation) return;
    if (confirm(`Convert quotation ${quotation.quotationNo} into a Sales Order (SO)?`)) {
      quotationActions.convertToSalesOrder(quotation.id);
      isOpen = false;
      alert('Success! The Sales Order has been created and is ready for processing.');
    }
  }
</script>

<Modal bind:isOpen title="Quotation Details" size="3xl">
  {#if quotation}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {quotation.quotationNo}
          </span>
          <h3 class="text-lg font-bold text-gray-900 mt-1">{quotation.customerName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. Transaksi: {quotation.transactionNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status={quotation.status} />
          <Button size="sm" variant="secondary" on:click={() => (isPrintOpen = true)}>
            🖨️ Print
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(quotation.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Prepared By:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{quotation.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Sales Person:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{quotation.salesPerson}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Total Amount:</span>
          <p class="font-bold text-blue-700 font-mono mt-0.5">{formatCurrency(quotation.total)}</p>
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
            {#each quotation.items as itm, i}
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

      <div class="flex flex-col sm:flex-row justify-between items-start gap-4">
        <div class="flex-1 bg-gray-50 p-3 rounded-lg border border-gray-200 text-xs">
          <span class="font-bold text-gray-700">Notes:</span>
          <p class="text-gray-600 mt-1 italic">{quotation.notes || '-'}</p>
        </div>
        <div class="w-full sm:w-64 space-y-1 text-xs">
          <div class="flex justify-between text-gray-600">
            <span>Subtotal:</span>
            <span class="font-mono">{formatCurrency(quotation.subtotal)}</span>
          </div>
          <div class="flex justify-between text-gray-600">
            <span>VAT 11%:</span>
            <span class="font-mono">{formatCurrency(quotation.tax)}</span>
          </div>
          <div class="flex justify-between font-bold text-sm text-gray-900 border-t pt-1">
            <span>Total:</span>
            <span class="font-mono text-blue-700">{formatCurrency(quotation.total)}</span>
          </div>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
    {#if quotation && (quotation.status === 'draft' || quotation.status === 'created')}
      <Button variant="success" on:click={handleConvertToSales}>
        🛒 Jadikan Sales Order (SO)
      </Button>
    {/if}
  </svelte:fragment>
</Modal>

{#if quotation}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType="quotation"
    documentNo={quotation.quotationNo}
    date={quotation.date}
    customerOrSupplierName={quotation.customerName}
    items={quotation.items}
    subtotal={quotation.subtotal}
    tax={quotation.tax}
    total={quotation.total}
    notes={quotation.notes}
    preparedBy={quotation.preparedBy}
  />
{/if}
