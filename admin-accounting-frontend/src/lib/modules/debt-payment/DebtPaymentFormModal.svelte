<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { purchaseOrders, debtPaymentActions } from '$lib/stores/dataStore';
  import type { DebtPayment } from '$lib/types';

  export let isOpen: boolean = false;
  export let debtToEdit: DebtPayment | null = null;

  let purchaseNo = '';
  let supplierName = '';
  let date = new Date().toISOString().split('T')[0];
  let amount = 0;
  let method: 'cash' | 'transfer' | 'check' = 'transfer';

  $: if (isOpen) {
    if (debtToEdit) {
      purchaseNo = debtToEdit.purchaseNo;
      supplierName = debtToEdit.supplierName;
      date = debtToEdit.date;
      amount = debtToEdit.amount;
      method = debtToEdit.method;
    } else {
      const firstPO = $purchaseOrders[0];
      purchaseNo = firstPO?.purchaseNo || '';
      supplierName = firstPO?.supplierName || '';
      date = new Date().toISOString().split('T')[0];
      amount = firstPO?.total || 15000000;
      method = 'transfer';
    }
  }

  function handlePOChange(poNo: string) {
    const po = $purchaseOrders.find((p) => p.purchaseNo === poNo);
    if (po) {
      supplierName = po.supplierName;
      amount = po.total;
    }
  }

  function handleSubmit() {
    if (amount <= 0 || !supplierName) {
      alert('Please complete the vendor payment details.');
      return;
    }

    if (debtToEdit) {
      debtPaymentActions.update(debtToEdit.id, {
        date,
        supplierName,
        purchaseNo,
        amount,
        method
      });
    } else {
      debtPaymentActions.add({
        date,
        paymentNo: `DP/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        supplierName,
        purchaseNo,
        amount,
        method,
        status: 'paid',
        preparedBy: 'Finance Dept'
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={debtToEdit ? 'Edit Vendor Payment' : 'Record Vendor Payment'}
  size="xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Purchase Order Number" name="purchaseNo">
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

      <FormField label="Vendor / Supplier Name" name="supplierName" required>
        <input
          id="supplierName"
          type="text"
          bind:value={supplierName}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Payment Date" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Payment Amount (IDR)" name="amount" required>
        <input
          id="amount"
          type="number"
          min="1"
          bind:value={amount}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Payment Method" name="method">
        <select
          id="method"
          bind:value={method}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="transfer">Company Bank Transfer</option>
          <option value="cash">Petty Cash</option>
          <option value="check">Cheque / Bank Draft</option>
        </select>
      </FormField>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {debtToEdit ? 'Save Changes' : 'Record Payment'}
    </Button>
  </svelte:fragment>
</Modal>
