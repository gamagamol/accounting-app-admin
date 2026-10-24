<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { salesOrders, deliveryActions } from '$lib/stores/dataStore';
  import { transactionStatusOptions } from '$lib/data/transaction-statuses';
  import type { Delivery, TransactionItem, TransactionStatus } from '$lib/types';

  export let isOpen: boolean = false;
  export let deliveryToEdit: Delivery | null = null;

  let salesNo = '';
  let date = new Date().toISOString().split('T')[0];
  let customerName = '';
  let status: TransactionStatus = 'created';
  let items: TransactionItem[] = [];

  $: if (isOpen) {
    if (deliveryToEdit) {
      salesNo = deliveryToEdit.salesNo;
      date = deliveryToEdit.date;
      customerName = deliveryToEdit.customerName;
      status = deliveryToEdit.status;
      items = [...deliveryToEdit.items];
    } else {
      const firstSO = $salesOrders[0];
      salesNo = firstSO?.salesNo || '';
      date = new Date().toISOString().split('T')[0];
      customerName = firstSO?.customerName || '';
      status = 'created';
      items = firstSO ? [...firstSO.items] : [];
    }
  }

  function handleSOChange(no: string) {
    const so = $salesOrders.find((s) => s.salesNo === no);
    if (so) {
      customerName = so.customerName;
      items = [...so.items];
    }
  }

  function handleSubmit() {
    if (!salesNo) {
      alert('Please select a Sales Order number first.');
      return;
    }

    if (deliveryToEdit) {
      deliveryActions.update(deliveryToEdit.id, {
        date,
        salesNo,
        customerName,
        status,
        items
      });
    } else {
      deliveryActions.add({
        deliveryNo: `DO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        salesNo,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        customerName,
        preparedBy: 'Logistics Team',
        date,
        items,
        status
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={deliveryToEdit ? 'Edit Delivery Order' : 'New Delivery Order'}
  size="2xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Sales Order Number" name="salesNo" required>
        <select
          id="salesNo"
          bind:value={salesNo}
          on:change={(e) => handleSOChange(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each $salesOrders as so}
            <option value={so.salesNo}>{so.salesNo} - {so.customerName}</option>
          {/each}
        </select>
      </FormField>

      <FormField label="Delivery Date" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Delivery Status" name="status">
        <select
          id="status"
          bind:value={status}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each transactionStatusOptions as option}
            <option value={option.value}>{option.label}</option>
          {/each}
        </select>
      </FormField>
    </div>

    <div>
      <h4 class="text-xs font-bold uppercase text-gray-700 tracking-wider mb-2">Shipped Items</h4>
      <div class="border border-gray-200 rounded-xl overflow-x-auto">
        <table class="min-w-full text-xs">
          <thead class="bg-gray-50 border-b border-gray-200 text-gray-600">
            <tr>
              <th class="p-2.5 text-center w-10">No</th>
              <th class="p-2.5 text-left">Product Name</th>
              <th class="p-2.5 text-center w-24">Qty Shipped</th>
              <th class="p-2.5 text-center w-20">Unit</th>
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
    <Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {deliveryToEdit ? 'Save Changes' : 'Issue Delivery Order'}
    </Button>
  </svelte:fragment>
</Modal>
