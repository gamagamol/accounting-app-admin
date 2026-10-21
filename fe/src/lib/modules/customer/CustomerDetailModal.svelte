<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import type { Customer } from '$lib/types';

  export let isOpen: boolean = false;
  export let customer: Customer | null = null;
</script>

<Modal bind:isOpen title="Detail Customer" size="xl">
  {#if customer}
    <div class="space-y-6 text-sm">
      <div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-start justify-between">
        <div>
          <h4 class="text-lg font-bold text-gray-900">{customer.companyName}</h4>
          <p class="text-xs text-blue-700 font-mono mt-0.5">Kode: {customer.nb || '-'}</p>
        </div>
        <span class="px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">
          TOP: {customer.termOfPayment} Hari
        </span>
      </div>

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div class="border rounded-lg p-3">
          <p class="text-xs text-gray-500">Contact Person (PIC)</p>
          <p class="font-medium text-gray-800 mt-1">{customer.contactPerson || '-'}</p>
        </div>
        <div class="border rounded-lg p-3">
          <p class="text-xs text-gray-500">Kota</p>
          <p class="font-medium text-gray-800 mt-1">{customer.city || '-'}</p>
        </div>
        <div class="border rounded-lg p-3">
          <p class="text-xs text-gray-500">Email</p>
          <p class="font-medium text-gray-800 mt-1">{customer.email || '-'}</p>
        </div>
        <div class="border rounded-lg p-3">
          <p class="text-xs text-gray-500">Nomor Telepon</p>
          <p class="font-medium text-gray-800 mt-1">{customer.phone || '-'}</p>
        </div>
        <div class="border rounded-lg p-3 sm:col-span-2">
          <p class="text-xs text-gray-500">NPWP</p>
          <p class="font-medium text-gray-800 mt-1 font-mono">{customer.npwp || '-'}</p>
        </div>
      </div>

      <div class="space-y-3">
        <div>
          <p class="text-xs font-semibold text-gray-700">Alamat Lengkap</p>
          <p class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1">
            {customer.address || 'Tidak ada data alamat operasional'}
          </p>
        </div>
        <div>
          <p class="text-xs font-semibold text-gray-700">Alamat NPWP</p>
          <p class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1">
            {customer.npwpAddress || 'Tidak ada data alamat NPWP'}
          </p>
        </div>
        {#if customer.notes}
          <div>
            <p class="text-xs font-semibold text-gray-700">Catatan Pelanggan</p>
            <p class="text-xs text-gray-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 mt-1">
              {customer.notes}
            </p>
          </div>
        {/if}
      </div>
    </div>
  {/if}

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Tutup</Button>
  </svelte:fragment>
</Modal>
