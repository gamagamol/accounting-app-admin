<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import PrintPreviewModal from '$lib/components/ui/PrintPreviewModal.svelte';
  import { billActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import type { BillPayment } from '$lib/types';

  export let isOpen: boolean = false;
  export let bill: BillPayment | null = null;

  let isPrintOpen = false;

  function handleRecordPayment() {
    if (!bill) return;
    if (confirm(`Catat pelunasan pembayaran piutang untuk tagihan ${bill.billNo}?`)) {
      billActions.recordPayment(bill.id);
      isOpen = false;
      alert('Pembayaran berhasil dicatat. Status tagihan berubah menjadi LUNAS.');
    }
  }
</script>

<Modal bind:isOpen title="Detail Faktur Tagihan (Invoice Penjualan)" size="2xl">
  {#if bill}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
        <div>
          <span class="text-xs font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
            {bill.billNo}
          </span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{bill.supplierName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. Pesanan: {bill.invoiceNo}</p>
        </div>
        <div class="flex items-center gap-2">
          <Badge status={bill.status} label={bill.status === 'paid' ? 'Lunas' : 'Belum Lunas'} />
          <Button size="sm" variant="secondary" on:click={() => (isPrintOpen = true)}>
            🖨️ Cetak Faktur
          </Button>
        </div>
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Tanggal Faktur:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(bill.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Metode Penagihan:</span>
          <p class="font-semibold text-gray-800 uppercase mt-0.5">{bill.method}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Diterbitkan Oleh:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{bill.preparedBy}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Total Nilai Tagihan:</span>
          <p class="font-bold text-base text-blue-700 font-mono mt-0.5">{formatCurrency(bill.amount)}</p>
        </div>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Tutup</Button>
    {#if bill && bill.status === 'pending'}
      <Button variant="success" on:click={handleRecordPayment}>
        💵 Catat Pelunasan Tagihan
      </Button>
    {/if}
  </svelte:fragment>
</Modal>

{#if bill}
  <PrintPreviewModal
    bind:isOpen={isPrintOpen}
    documentType="bill"
    documentNo={bill.billNo}
    date={bill.date}
    customerOrSupplierName={bill.supplierName}
    subtotal={bill.amount}
    total={bill.amount}
    preparedBy={bill.preparedBy}
  />
{/if}
