<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { formatDate } from '$lib/utils/formatters';
  import type { Delivery } from '$lib/types';

  export let isOpen: boolean = false;
  export let delivery: Delivery | null = null;

  let isPrintOpen = false;
  let printDocType: 'delivery' | 'sticker' = 'delivery';

  function openPrintDO() {
    printDocType = 'delivery';
    isPrintOpen = true;
  }

  function openPrintSticker() {
    printDocType = 'sticker';
    isPrintOpen = true;
  }
</script>

<Modal bind:isOpen title="Delivery Order Details" size="3xl">
  {#if delivery}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-cyan-600 bg-cyan-50 px-2 py-0.5 rounded border border-cyan-200">
            {delivery.deliveryNo}
          </span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{delivery.customerName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. Sales Order: {delivery.salesNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status={delivery.status} label={delivery.status} />
          <Button size="sm" variant="secondary" on:click={openPrintDO}>
            📄 Print DO
          </Button>
          <Button size="sm" variant="warning" on:click={openPrintSticker}>
            🏷️ Print Label
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Delivery Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(delivery.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Courier / Driver:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{delivery.preparedBy}</p>
        </div>
      </div>

      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-slate-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2.5 text-center w-10">No</th>
              <th class="p-2.5 text-left">Product Name</th>
              <th class="p-2.5 text-center w-20">Qty Shipped</th>
              <th class="p-2.5 text-center w-20">Unit</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each delivery.items as itm, i}
              <tr>
                <td class="p-2.5 text-center text-gray-400 font-mono">{i + 1}</td>
                <td class="p-2.5 font-medium text-gray-800">{itm.productName}</td>
                <td class="p-2.5 text-center font-bold text-blue-600">{itm.quantity}</td>
                <td class="p-2.5 text-center text-gray-500">{itm.unit}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
  </svelte:fragment>
</Modal>

{#if delivery}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType={printDocType}
    documentNo={delivery.deliveryNo}
    date={delivery.date}
    customerOrSupplierName={delivery.customerName}
    items={delivery.items}
    preparedBy={delivery.preparedBy}
  />
{/if}
