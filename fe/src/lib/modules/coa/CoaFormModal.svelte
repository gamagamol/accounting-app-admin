<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import type { ChartOfAccount } from '$lib/types';
  import { coaActions } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let coaToEdit: ChartOfAccount | null = null;

  let formData = {
    code: '',
    name: '',
    category: 'Asset' as ChartOfAccount['category'],
    balance: 0
  };

  $: if (isOpen) {
    if (coaToEdit) {
      formData = {
        code: coaToEdit.code,
        name: coaToEdit.name,
        category: coaToEdit.category,
        balance: coaToEdit.balance
      };
    } else {
      formData = {
        code: '',
        name: '',
        category: 'Asset',
        balance: 0
      };
    }
  }

  function handleSubmit() {
    if (!formData.code || !formData.name) {
      alert('Kode dan Nama Akun wajib diisi');
      return;
    }

    if (coaToEdit) {
      coaActions.update(coaToEdit.id, formData);
    } else {
      coaActions.add(formData);
    }
    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={coaToEdit ? 'Edit Bagan Akun (COA)' : 'Tambah Bagan Akun Baru'}
  size="md"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <FormField label="Kode Akun (Account Code)" name="code" required>
      <input
        id="code"
        type="text"
        bind:value={formData.code}
        placeholder="Contoh: 1-1000 atau 4-1000"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </FormField>

    <FormField label="Nama Akun" name="name" required>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        placeholder="Contoh: Kas Kecil, Piutang Usaha"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </FormField>

    <FormField label="Kategori Akun" name="category">
      <select
        id="category"
        bind:value={formData.category}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="Asset">Asset (Aset / Harta)</option>
        <option value="Liability">Liability (Kewajiban / Hutang)</option>
        <option value="Equity">Equity (Modal / Ekuitas)</option>
        <option value="Revenue">Revenue (Pendapatan)</option>
        <option value="Expense">Expense (Beban Pokok & Operasional)</option>
      </select>
    </FormField>

    <FormField label="Saldo Awal / Berjalan (IDR)" name="balance">
      <input
        id="balance"
        type="number"
        bind:value={formData.balance}
        placeholder="0"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {coaToEdit ? 'Simpan Akun' : 'Tambahkan Akun'}
    </Button>
  </svelte:fragment>
</Modal>
