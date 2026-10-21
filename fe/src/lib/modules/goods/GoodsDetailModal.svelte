<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import Badge from '$lib/components/ui/Badge.svelte';
  import { formatDate } from '$lib/utils/formatters';
  import type { GoodsReceipt } from '$lib/types';

  export let isOpen: boolean = false;
  export let goods: GoodsReceipt | null = null;
</script>

<Modal bind:isOpen title="Detail Penerimaan Barang (Goods Receipt)" size="2xl">
  {#if goods}
    <div class="space-y-6 text-xs sm:text-sm">
      <div class="bg-slate-50 p-4 rounded-xl border border-gray-200 flex justify-between items-center">
        <div>
          <span class="text-xs font-mono font-bold text-blue-600 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
            {goods.receiptNo}
          </span>
          <h3 class="text-base font-bold text-gray-900 mt-1">{goods.supplierName}</h3>
          <p class="text-xs text-gray-500 font-mono">No. PO Referensi: {goods.purchaseNo}</p>
        </div>
        <Badge status={goods.status} label={goods.status === 'received' ? 'Diterima di Gudang' : 'Diproses'} />
      </div>

      <div class="grid grid-cols-2 gap-3 text-xs">
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Tanggal Diterima:</span>
          <p class="font-semibold text-gray-800 mt-0.5">{formatDate(goods.date)}</p>
        </div>
        <div class="p-3 border rounded-lg">
          <span class="text-gray-500">Penerima (Staff Gudang):</span>
          <p class="font-semibold text-gray-800 mt-0.5">{goods.preparedBy}</p>
        </div>
      </div>

      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-slate-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2.5 text-center w-10">No</th>
              <th class="p-2.5 text-left">Nama Produk</th>
              <th class="p-2.5 text-center w-20">Kuantitas Masuk</th>
              <th class="p-2.5 text-center w-20">Satuan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each goods.items as itm, i}
              <tr>
                <td class="p-2.5 text-center text-gray-400 font-mono">{i + 1}</td>
                <td class="p-2.5 font-medium text-gray-800">{itm.productName}</td>
                <td class="p-2.5 text-center font-bold text-emerald-600">{itm.quantity}</td>
                <td class="p-2.5 text-center text-gray-500">{itm.unit}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Tutup</Button>
  </svelte:fragment>
</Modal>
