<script lang="ts">
  import Modal from './Modal.svelte';
  import Button from './Button.svelte';
  import { formatCurrency, formatDate } from '$lib/utils/formatters';
  import { appSettings } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let title: string = 'Cetak Dokumen';
  export let documentType: 'quotation' | 'sales' | 'purchase' | 'delivery' | 'bill' | 'payment' | 'sticker' = 'quotation';
  export let documentNo: string = '';
  export let date: string = '';
  export let customerOrSupplierName: string = '';
  export let address: string = '';
  export let items: any[] = [];
  export let subtotal: number = 0;
  export let tax: number = 0;
  export let total: number = 0;
  export let notes: string = '';
  export let preparedBy: string = '';

  function handlePrint() {
    window.print();
  }
</script>

<Modal bind:isOpen {title} size="4xl">
  <div class="print:p-0 p-4 max-h-[75vh] overflow-y-auto">
    <!-- Printable Document Frame -->
    <div id="printable-area" class="bg-white border border-gray-300 p-8 shadow-sm text-gray-900 font-sans">
      <!-- Header -->
      <div class="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6">
        <div>
          <h1 class="text-2xl font-black tracking-tight text-blue-900 uppercase">{$appSettings.companyName}</h1>
          <p class="text-xs text-gray-600 mt-1 max-w-sm">{$appSettings.companyAddress}</p>
          <p class="text-xs text-gray-600">Telp: {$appSettings.companyPhone} | Email: {$appSettings.companyEmail}</p>
          <p class="text-xs text-gray-600 font-mono">NPWP: {$appSettings.companyNpwp}</p>
        </div>
        <div class="text-right">
          <span class="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">
            {#if documentType === 'quotation'}
              SURAT PENAWARAN HARGA
            {:else if documentType === 'sales'}
              SALES ORDER (SURAT PESANAN)
            {:else if documentType === 'purchase'}
              PURCHASE ORDER (PO PEMBELIAN)
            {:else if documentType === 'delivery'}
              SURAT JALAN / DELIVERY ORDER
            {:else if documentType === 'bill'}
              FAKTUR TAGIHAN / INVOICE
            {:else if documentType === 'payment'}
              KUITANSI / BUKTI PEMBAYARAN
            {:else if documentType === 'sticker'}
              LABEL PENGIRIMAN
            {/if}
          </span>
          <p class="text-base font-bold text-gray-800 mt-2 font-mono">{documentNo}</p>
          <p class="text-xs text-gray-500">Tanggal: {date ? formatDate(date) : '-'}</p>
        </div>
      </div>

      <!-- Parties Info -->
      <div class="grid grid-cols-2 gap-6 mb-6 text-sm">
        <div class="border rounded-lg p-3 bg-gray-50/50">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">
            {#if ['purchase'].includes(documentType)}
              Kepada Supplier / Vendor:
            {:else}
              Kepada Customer / Yth:
            {/if}
          </p>
          <p class="font-bold text-gray-900 text-base">{customerOrSupplierName || '-'}</p>
          {#if address}
            <p class="text-xs text-gray-600 mt-1">{address}</p>
          {/if}
        </div>
        <div class="border rounded-lg p-3 bg-gray-50/50">
          <p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">Informasi Transaksi:</p>
          <div class="grid grid-cols-2 gap-1 text-xs">
            <span class="text-gray-500">Nomor Dokumen:</span>
            <span class="font-semibold text-gray-800 font-mono">{documentNo}</span>
            <span class="text-gray-500">Dibuat Oleh:</span>
            <span class="font-semibold text-gray-800">{preparedBy || '-'}</span>
            <span class="text-gray-500">Mata Uang:</span>
            <span class="font-semibold text-gray-800">{$appSettings.currency}</span>
          </div>
        </div>
      </div>

      <!-- Items Table -->
      {#if documentType !== 'payment' && items && items.length > 0}
        <table class="w-full text-xs border border-gray-300 mb-6">
          <thead class="bg-slate-100 border-b border-gray-300">
            <tr>
              <th class="p-2 border-r border-gray-300 text-center w-10">No</th>
              <th class="p-2 border-r border-gray-300 text-left">Nama Produk / Jasa</th>
              <th class="p-2 border-r border-gray-300 text-center w-20">Qty</th>
              <th class="p-2 border-r border-gray-300 text-center w-16">Satuan</th>
              {#if documentType !== 'delivery' && documentType !== 'sticker'}
                <th class="p-2 border-r border-gray-300 text-right w-28">Harga Satuan</th>
                <th class="p-2 border-r border-gray-300 text-right w-20">Diskon</th>
                <th class="p-2 text-right w-32">Total</th>
              {/if}
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-200">
            {#each items as item, i}
              <tr>
                <td class="p-2 border-r border-gray-300 text-center font-mono">{i + 1}</td>
                <td class="p-2 border-r border-gray-300 font-medium">{item.productName || item.name}</td>
                <td class="p-2 border-r border-gray-300 text-center">{item.quantity}</td>
                <td class="p-2 border-r border-gray-300 text-center text-gray-600">{item.unit || 'Pcs'}</td>
                {#if documentType !== 'delivery' && documentType !== 'sticker'}
                  <td class="p-2 border-r border-gray-300 text-right font-mono">{formatCurrency(item.unitPrice || item.price || 0)}</td>
                  <td class="p-2 border-r border-gray-300 text-right">{item.discount ? item.discount + '%' : '-'}</td>
                  <td class="p-2 text-right font-mono font-semibold">{formatCurrency(item.total || ((item.quantity * item.unitPrice) * (1 - (item.discount || 0)/100)))}</td>
                {/if}
              </tr>
            {/each}
          </tbody>
        </table>
      {/if}

      <!-- Totals / Payment Summary -->
      {#if documentType !== 'delivery' && documentType !== 'sticker'}
        <div class="flex justify-between items-start gap-6 mb-8 text-xs">
          <div class="flex-1">
            <p class="font-bold text-gray-700 mb-1">Catatan / Ketentuan:</p>
            <p class="text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-200">
              {notes || 'Terima kasih atas kerja samanya. Dokumen ini sah dan dikeluarkan secara resmi oleh sistem komputerisasi.'}
            </p>
          </div>
          <div class="w-64 space-y-1.5 border border-gray-300 rounded p-3 bg-gray-50/50">
            <div class="flex justify-between text-gray-600">
              <span>Subtotal:</span>
              <span class="font-mono font-semibold">{formatCurrency(subtotal || total)}</span>
            </div>
            {#if tax > 0}
              <div class="flex justify-between text-gray-600">
                <span>PPN 11%:</span>
                <span class="font-mono font-semibold">{formatCurrency(tax)}</span>
              </div>
            {/if}
            <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5 mt-1.5">
              <span>Total:</span>
              <span class="font-mono text-blue-900">{formatCurrency(total || subtotal)}</span>
            </div>
          </div>
        </div>
      {/if}

      <!-- Signatures Area -->
      <div class="grid grid-cols-3 gap-6 text-center text-xs pt-4 border-t border-gray-200">
        <div>
          <p class="text-gray-500 mb-16">Dibuat Oleh,</p>
          <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">
            {preparedBy || 'Staff Administrasi'}
          </p>
        </div>
        <div>
          <p class="text-gray-500 mb-16">Mengetahui / Finance,</p>
          <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">
            Supervisor
          </p>
        </div>
        <div>
          <p class="text-gray-500 mb-16">Diterima / Disetujui,</p>
          <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">
            {customerOrSupplierName || 'Pihak Terkait'}
          </p>
        </div>
      </div>
    </div>
  </div>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Tutup</Button>
    <Button variant="primary" on:click={handlePrint}>
      <svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z" />
      </svg>
      Cetak / Print
    </Button>
  </svelte:fragment>
</Modal>
