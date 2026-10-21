<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import type { Customer } from '$lib/types';
  import { customerActions } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let customerToEdit: Customer | null = null;

  let formData = {
    companyName: '',
    city: '',
    contactPerson: '',
    email: '',
    phone: '',
    nb: '',
    npwp: '',
    npwpAddress: '',
    address: '',
    termOfPayment: 30,
    notes: ''
  };

  $: if (isOpen) {
    if (customerToEdit) {
      formData = {
        companyName: customerToEdit.companyName,
        city: customerToEdit.city,
        contactPerson: customerToEdit.contactPerson,
        email: customerToEdit.email,
        phone: customerToEdit.phone,
        nb: customerToEdit.nb,
        npwp: customerToEdit.npwp,
        npwpAddress: customerToEdit.npwpAddress,
        address: customerToEdit.address,
        termOfPayment: customerToEdit.termOfPayment,
        notes: customerToEdit.notes
      };
    } else {
      formData = {
        companyName: '',
        city: '',
        contactPerson: '',
        email: '',
        phone: '',
        nb: 'NB-' + Math.floor(Math.random() * 900 + 100),
        npwp: '',
        npwpAddress: '',
        address: '',
        termOfPayment: 30,
        notes: ''
      };
    }
  }

  function handleSubmit() {
    if (!formData.companyName) {
      alert('Nama perusahaan wajib diisi');
      return;
    }

    if (customerToEdit) {
      customerActions.update(customerToEdit.id, formData);
    } else {
      customerActions.add(formData);
    }
    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={customerToEdit ? 'Edit Data Customer' : 'Tambah Customer Baru'}
  size="2xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nama Perusahaan" name="companyName" required>
        <input
          id="companyName"
          type="text"
          bind:value={formData.companyName}
          placeholder="PT Contoh Sukses Mandiri"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Contact Person (PIC)" name="contactPerson" required>
        <input
          id="contactPerson"
          type="text"
          bind:value={formData.contactPerson}
          placeholder="Nama PIC"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Email" name="email">
        <input
          id="email"
          type="email"
          bind:value={formData.email}
          placeholder="kontak@perusahaan.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Nomor Telepon" name="phone">
        <input
          id="phone"
          type="tel"
          bind:value={formData.phone}
          placeholder="021-12345678"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Kota" name="city">
        <input
          id="city"
          type="text"
          bind:value={formData.city}
          placeholder="Jakarta"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Term of Payment (Hari)" name="termOfPayment">
        <input
          id="termOfPayment"
          type="number"
          min="0"
          bind:value={formData.termOfPayment}
          placeholder="30"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="NPWP" name="npwp">
        <input
          id="npwp"
          type="text"
          bind:value={formData.npwp}
          placeholder="01.234.567.8-091.000"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Kode NB" name="nb">
        <input
          id="nb"
          type="text"
          bind:value={formData.nb}
          placeholder="NB-001"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>
    </div>

    <FormField label="Alamat Operasional" name="address">
      <textarea
        id="address"
        rows="2"
        bind:value={formData.address}
        placeholder="Alamat lengkap pengiriman dan operasional..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      ></textarea>
    </FormField>

    <FormField label="Alamat NPWP" name="npwpAddress">
      <textarea
        id="npwpAddress"
        rows="2"
        bind:value={formData.npwpAddress}
        placeholder="Alamat yang tertera pada faktur pajak..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      ></textarea>
    </FormField>

    <FormField label="Catatan Tambahan" name="notes">
      <input
        id="notes"
        type="text"
        bind:value={formData.notes}
        placeholder="Catatan khusus pelanggan..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      />
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {customerToEdit ? 'Simpan Perubahan' : 'Tambahkan Customer'}
    </Button>
  </svelte:fragment>
</Modal>
