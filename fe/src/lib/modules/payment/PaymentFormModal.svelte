<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { billPayments, paymentActions } from '$lib/stores/dataStore';
  import type { Payment } from '$lib/types';

  export let isOpen: boolean = false;
  export let paymentToEdit: Payment | null = null;

  let invoiceNo = '';
  let customerName = '';
  let date = new Date().toISOString().split('T')[0];
  let amount = 0;
  let method: 'cash' | 'transfer' | 'check' = 'transfer';

  $: if (isOpen) {
    if (paymentToEdit) {
      invoiceNo = paymentToEdit.invoiceNo;
      customerName = paymentToEdit.customerName;
      date = paymentToEdit.date;
      amount = paymentToEdit.amount;
      method = paymentToEdit.method;
    } else {
      const pendingBill = $billPayments.find((b) => b.status === 'pending') || $billPayments[0];
      invoiceNo = pendingBill?.billNo || '';
      customerName = pendingBill?.supplierName || '';
      date = new Date().toISOString().split('T')[0];
      amount = pendingBill?.amount || 5000000;
      method = 'transfer';
    }
  }

  function handleBillChange(billNo: string) {
    const b = $billPayments.find((bill) => bill.billNo === billNo);
    if (b) {
      customerName = b.supplierName;
      amount = b.amount;
    }
  }

  function handleSubmit() {
    if (amount <= 0 || !customerName) {
      alert('Isi data pembayaran dengan lengkap');
      return;
    }

    if (paymentToEdit) {
      paymentActions.update(paymentToEdit.id, {
        date,
        customerName,
        invoiceNo,
        amount,
        method
      });
    } else {
      paymentActions.add({
        date,
        paymentNo: `PAY/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
        transactionNo: `TRX-${Date.now().toString(36).toUpperCase()}`,
        customerName,
        invoiceNo,
        amount,
        method,
        status: 'paid',
        preparedBy: 'Kasir / Finance'
      });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={paymentToEdit ? 'Edit Pembayaran Piutang' : 'Catat Penerimaan Pembayaran (Kuitansi)'}
  size="xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nomor Faktur (Invoice) Terkait" name="invoiceNo">
        <select
          id="invoiceNo"
          bind:value={invoiceNo}
          on:change={(e) => handleBillChange(e.currentTarget.value)}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          {#each $billPayments as b}
            <option value={b.billNo}>{b.billNo} - {b.supplierName}</option>
          {/each}
        </select>
      </FormField>

      <FormField label="Nama Pelanggan (Customer)" name="customerName" required>
        <input
          id="customerName"
          type="text"
          bind:value={customerName}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Tanggal Penerimaan Kas" name="date" required>
        <input
          id="date"
          type="date"
          bind:value={date}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Jumlah Pembayaran Diterima (IDR)" name="amount" required>
        <input
          id="amount"
          type="number"
          min="1"
          bind:value={amount}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Cara Bayar" name="method">
        <select
          id="method"
          bind:value={method}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="transfer">Transfer Rekening Bank</option>
          <option value="cash">Uang Tunai (Cash)</option>
          <option value="check">Bilyet Giro / Cek Mundur</option>
        </select>
      </FormField>
    </div>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {paymentToEdit ? 'Simpan Pembayaran' : 'Terbitkan Kuitansi Pembayaran'}
    </Button>
  </svelte:fragment>
</Modal>
