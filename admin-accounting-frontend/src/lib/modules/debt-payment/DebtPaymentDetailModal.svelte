<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { DebtPayment } from '$lib/types';

  export let isOpen: boolean = false;
  export let debt: DebtPayment | null = null;
</script>

<Modal bind:isOpen title="Vendor Payment Details" size="xl">
  {#if debt}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-rose-50/70 p-4 rounded-xl border border-rose-200 flex justify-between items-center">
        <div>
          <span class="text-xs font-mono font-bold text-rose-800 bg-white px-2 py-0.5 rounded border border-rose-300">
            {debt.paymentNo}
          </span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{debt.supplierName}</h3>
          <p class="text-xs text-gray-600 font-mono">No. Purchase Order: {debt.purchaseNo}</p>
        </div>
        <Badge status="paid" label="PAID / DIBAYAR" />
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Payment Date:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(debt.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Disbursement Method:</span>
          <p class="font-semibold text-gray-800 uppercase mt-0.5">{debt.method}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Approved By:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{debt.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Amount Paid:</span>
          <p class="font-bold text-base text-rose-700 font-mono mt-0.5">{formatCurrency(debt.amount)}</p>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
  </svelte:fragment>
</Modal>
