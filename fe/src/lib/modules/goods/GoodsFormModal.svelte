<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { purchaseOrders, goodsReceiptActions } from '$lib/stores/dataStore';
  import type { GoodsReceipt, TransactionItem } from '$lib/types';

  export let isOpen: boolean = false;
  export let goodsToEdit: GoodsReceipt | null = null;

  let purchaseNo = '';
  let date = new Date().toISOString().split('T')[0];
  let supplierName = '';
  let items: TransactionItem[] = [];

  $: if (isOpen) {
    if (goodsToEdit) {
      purchaseNo = goodsToEdit.purchaseNo;
      date = goodsToEdit.date;
      supplierName = goodsToEdit.supplierName;
      items = [...goodsToEdit.items];
    } else {
      const firstPO = $purchaseOrders[0];
      purchaseNo = firstPO?.purchaseNo || '';
      date = new Date().toISOString().split('T')[0];
      supplierName = firstPO?.supplierName || '';
      items = firstPO ? [...firstPO.items] : [];
    }
  }

  function handlePOChange(poNo: string) {
    const po = $purchaseOrders.find((p) => p.purchaseNo === poNo);
    if (po) {
      supplierName = po.supplierName;
      items = [...po.items];
    }
  }

  function handleSubmit() {
    if (!purchaseNo) {
      alert('Pilih nomor PO terlebih dahulu');
      return;
    }

    if (goodsToEdit) {
      goodsReceiptActions.update(goodsToEdit.id, {
        date,
        purchaseNo,
        supplierName,
        items
      });
    } else {
      goodsReceiptActions.add({
        receiptNo: `GR/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        purchaseNo,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        supplierName,
        preparedBy: 'Admin Gudang',
        date,
        items,
        status: 'received'
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={goodsToEdit ? 'Edit Penerimaan Barang' : 'Catat Penerimaan Barang Masuk (Goods Receipt)'}
  size="2xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nomor Purchase Order (PO)" name="purchaseNo" required>
        <select
          id="purchaseNo"
          bind:value={purchaseNo}
          on:change={(e) => handlePOChange(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each $purchaseOrders as po}
            <option value={po.purchaseNo}>{po.purchaseNo} - {po.supplierName}</option>
          {/each}
        </select>
      </FormField>

      <FormField label="Tanggal Diterima Gudang" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>
    </div>

    <div>
      <h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider mb-2">Item Barang Fisik yang Masuk</h4>
      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2.5 text-center w-10">No</th>
              <th class="p-2.5 text-left">Nama Produk</th>
              <th class="p-2.5 text-center w-24">Qty Diterima</th>
              <th class="p-2.5 text-center w-20">Satuan</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each items as item, i}
              <tr>
                <td class="p-2.5 text-center font-mono">{i + 1}</td>
                <td class="p-2.5 font-medium">{item.productName}</td>
                <td class="p-2.5">
                  <input
                    type="number"
                    min="1"
                    bind:value={item.quantity}
                    class="w-full p-1 border rounded text-center text-xs"
                  />
                </td>
                <td class="p-2.5 text-center text-gray-500">{item.unit}</td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {goodsToEdit ? 'Simpan Perubahan' : 'Konfirmasi Penerimaan Barang'}
    </Button>
  </svelte:fragment>
</Modal>
