<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { Payment } from '$lib/types';

  export let isOpen: boolean = false;
  export let payment: Payment | null = null;

  let isPrintOpen = false;
</script>

<Modal bind:isOpen title="Customer Receipt Details" size="xl">
  {#if payment}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-emerald-50/70 p-4 rounded-xl border border-emerald-200 flex justify-between items-center">
        <div>
          <span class="text-xs font-mono font-bold text-emerald-800 bg-white px-2 py-0.5 rounded border border-emerald-300">
            {payment.paymentNo}
          </span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{payment.customerName}</h3>
          <p class="text-xs text-gray-600 font-mono">No. Invoice: {payment.invoiceNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status="completed" />
          <Button size="sm" variant="secondary" on:click={() => (isPrintOpen = true)}>
            🖨️ Print Receipt
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Payment Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(payment.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Payment Method:</span>
          <p class="font-semibold text-gray-800 uppercase mt-0.5">{payment.method}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Cashier:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{payment.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Amount Received:</span>
          <p class="font-bold text-base text-emerald-700 font-mono mt-0.5">{formatCurrency(payment.amount)}</p>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
  </svelte:fragment>
</Modal>

{#if payment}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType="payment"
    documentNo={payment.paymentNo}
    date={payment.date}
    customerOrSupplierName={payment.customerName}
    subtotal={payment.amount}
    total={payment.amount}
    preparedBy={payment.preparedBy}
  />
{/if}
