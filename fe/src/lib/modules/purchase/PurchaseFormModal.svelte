<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { suppliers, products, purchaseActions } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import type { PurchaseOrder, TransactionItem } from '$lib/types';

  export let isOpen: boolean = false;
  export let purchaseToEdit: PurchaseOrder | null = null;

  let supplierId = '';
  let date = new Date().toISOString().split('T')[0];
  let items: TransactionItem[] = [];

  $: if (isOpen) {
    if (purchaseToEdit) {
      supplierId = purchaseToEdit.supplierId;
      date = purchaseToEdit.date;
      items = [...purchaseToEdit.items];
    } else {
      supplierId = $suppliers[0]?.id || '';
      date = new Date().toISOString().split('T')[0];
      items = [
        {
          id: 'item-1',
          productId: $products[0]?.id || '',
          productName: $products[0]?.name || '',
          quantity: 20,
          unit: $products[0]?.unit || 'Pcs',
          unitPrice: $products[0]?.price ? Math.round($products[0].price * 0.7) : 100000,
          discount: 0,
          total: 20 * ($products[0]?.price ? Math.round($products[0].price * 0.7) : 100000)
        }
      ];
    }
  }

  function addItem() {
    const defaultProduct = $products[0];
    items = [
      ...items,
      {
        id: `item-${Date.now()}`,
        productId: defaultProduct?.id || '',
        productName: defaultProduct?.name || 'Item Baru',
        quantity: 1,
        unit: defaultProduct?.unit || 'Pcs',
        unitPrice: 80000,
        discount: 0,
        total: 80000
      }
    ];
  }

  function removeItem(index: number) {
    items = items.filter((_, i) => i !== index);
  }

  function handleProductChange(index: number, prdId: string) {
    const prd = $products.find((p) => p.id === prdId);
    if (prd) {
      items[index].productId = prd.id;
      items[index].productName = prd.name;
      items[index].unit = prd.unit;
      items[index].unitPrice = Math.round(prd.price * 0.7);
      calculateItemTotal(index);
    }
  }

  function calculateItemTotal(index: number) {
    const itm = items[index];
    const sub = (itm.quantity || 0) * (itm.unitPrice || 0);
    const discAmount = (sub * (itm.discount || 0)) / 100;
    items[index].total = Math.max(0, sub - discAmount);
    items = [...items];
  }

  $: subtotal = items.reduce((sum, i) => sum + (i.total || 0), 0);
  $: tax = Math.round(subtotal * 0.11);
  $: total = subtotal + tax;

  function handleSubmit() {
    const sup = $suppliers.find((s) => s.id === supplierId);
    if (!sup) {
      alert('Pilih supplier terlebih dahulu');
      return;
    }
    if (items.length === 0) {
      alert('Tambahkan minimal 1 item pembelian');
      return;
    }

    if (purchaseToEdit) {
      purchaseActions.update(purchaseToEdit.id, {
        supplierId,
        supplierName: sup.companyName,
        date,
        items,
        subtotal,
        tax,
        total
      });
    } else {
      purchaseActions.add({
        purchaseNo: `PO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        date,
        supplierId,
        supplierName: sup.companyName,
        preparedBy: 'Ahmad Fauzi',
        items,
        subtotal,
        tax,
        total,
        status: 'pending'
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={purchaseToEdit ? 'Edit Purchase Order (PO)' : 'Buat Purchase Order Baru'}
  size="3xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nama Supplier / Pemasok" name="supplier" required>
        <select
          id="supplier"
          bind:value={supplierId}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each $suppliers as sup}
            <option value={sup.id}>{sup.companyName}</option>
          {/each}
        </select>
      </FormField>

      <FormField label="Tanggal Purchase Order" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>
    </div>

    <div>
      <div class="flex items-center justify-between mb-2">
        <h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider">Item Barang yang Dibeli</h4>
        <Button size="sm" variant="secondary" on:click={addItem}>+ Tambah Baris Item</Button>
      </div>

      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2 text-left">Produk</th>
              <th class="p-2 text-center w-20">Qty</th>
              <th class="p-2 text-center w-16">Satuan</th>
              <th class="p-2 text-right w-28">Harga Beli</th>
              <th class="p-2 text-center w-20">Diskon (%)</th>
              <th class="p-2 text-right w-32">Total</th>
              <th class="p-2 text-center w-10">Aksi</th>
            </tr>
          </thead>
          <tbody class="divide-y divide-gray-100">
            {#each items as item, idx}
              <tr>
                <td class="p-2">
                  <select
                    value={item.productId}
                    on:change={(e) => handleProductChange(idx, e.currentTarget.value)}
                    class="w-full p-1.5 border border-gray-300 rounded text-xs bg-white"
                  >
                    {#each $products as prd}
                      <option value={prd.id}>{prd.name}</option>
                    {/each}
                  </select>
                </td>
                <td class="p-2">
                  <input
                    type="number"
                    min="1"
                    bind:value={item.quantity}
                    on:input={() => calculateItemTotal(idx)}
                    class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"
                  />
                </td>
                <td class="p-2 text-center text-gray-500">{item.unit}</td>
                <td class="p-2">
                  <input
                    type="number"
                    min="0"
                    bind:value={item.unitPrice}
                    on:input={() => calculateItemTotal(idx)}
                    class="w-full p-1.5 border border-gray-300 rounded text-right text-xs"
                  />
                </td>
                <td class="p-2">
                  <input
                    type="number"
                    min="0"
                    max="100"
                    bind:value={item.discount}
                    on:input={() => calculateItemTotal(idx)}
                    class="w-full p-1.5 border border-gray-300 rounded text-center text-xs"
                  />
                </td>
                <td class="p-2 text-right font-mono font-semibold">
                  {formatCurrency(item.total)}
                </td>
                <td class="p-2 text-center">
                  <button
                    type="button"
                    on:click={() => removeItem(idx)}
                    class="text-red-500 hover:text-red-700 text-sm font-bold"
                  >
                    ✕
                  </button>
                </td>
              </tr>
            {/each}
          </tbody>
        </table>
      </div>
    </div>

    <div class="flex justify-end pt-2">
      <div class="w-full sm:w-72 space-y-1.5 bg-gray-50 p-4 rounded-xl border border-gray-200 text-xs">
        <div class="flex justify-between text-gray-600">
          <span>Subtotal:</span>
          <span class="font-mono font-semibold">{formatCurrency(subtotal)}</span>
        </div>
        <div class="flex justify-between text-gray-600">
          <span>PPN 11%:</span>
          <span class="font-mono font-semibold">{formatCurrency(tax)}</span>
        </div>
        <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-200 pt-2">
          <span>Total Nilai Pembelian:</span>
          <span class="font-mono text-emerald-700">{formatCurrency(total)}</span>
        </div>
      </div>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {purchaseToEdit ? 'Simpan Perubahan' : 'Terbitkan Purchase Order'}
    </Button>
  </svelte:fragment>
</Modal>
