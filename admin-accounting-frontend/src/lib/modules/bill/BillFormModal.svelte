<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { salesOrders, billActions } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import { transactionStatusOptions } from '$lib/data/transaction-statuses';
  import type { BillPayment, TransactionStatus } from '$lib/types';

  export let isOpen: boolean = false;
  export let billToEdit: BillPayment | null = null;

  let invoiceNo = '';
  let date = new Date().toISOString().split('T')[0];
  let customerName = '';
  let amount = 0;
  let method: 'cash' | 'transfer' | 'check' = 'transfer';
  let status: TransactionStatus = 'pending';
  let wasOpen = false;

  $: if (isOpen && !wasOpen) {
    wasOpen = true;
    if (billToEdit) {
      invoiceNo = billToEdit.invoiceNo;
      date = billToEdit.date;
      customerName = billToEdit.supplierName;
      amount = billToEdit.amount;
      method = billToEdit.method;
      status = billToEdit.status;
    } else {
      const firstSO = $salesOrders[0];
      invoiceNo = firstSO?.salesNo || '';
      date = new Date().toISOString().split('T')[0];
      customerName = firstSO?.customerName || '';
      amount = firstSO?.total || 10000000;
      method = 'transfer';
      status = 'pending';
    }
  } else if (!isOpen) {
    wasOpen = false;
  }

  function handleSOChange(no: string) {
    const so = $salesOrders.find((s) => s.salesNo === no);
    if (so) {
      customerName = so.customerName;
      amount = so.total;
    }
  }

  function handleSubmit() {
    if (!customerName || amount <= 0) {
      alert('Customer name and invoice amount must be valid.');
      return;
    }

    if (billToEdit) {
      billActions.update(billToEdit.id, {
        date,
        supplierName: customerName,
        invoiceNo,
        amount,
        method,
        status
      });
    } else {
      billActions.add({
        date,
        billNo: `INV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        supplierName: customerName,
        invoiceNo,
        amount,
        method,
        status,
        preparedBy: 'Finance Dept'
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={billToEdit ? 'Edit Invoice' : 'Issue New Invoice'}
  size="xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Sales Order Reference" name="invoiceNo">
        <select
          id="invoiceNo"
          bind:value={invoiceNo}
          on:change={(e) => handleSOChange(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each $salesOrders as so}
            <option value={so.salesNo}>{so.salesNo} - {so.customerName}</option>
          {/each}
        </select>
      </FormField>

      <FormField label="Customer Name" name="customerName" required>
        <input
          id="customerName"
          type="text"
          bind:value={customerName}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Invoice Date" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Invoice Amount (IDR)" name="amount" required>
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
          <option value="transfer">Bank Transfer</option>
          <option value="cash">Cash</option>
          <option value="check">Cheque / Bank Draft</option>
        </select>
      </FormField>

      <FormField label="Payment Status" name="status">
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
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {billToEdit ? 'Save Invoice' : 'Issue Invoice'}
    </Button>
  </svelte:fragment>
</Modal>
