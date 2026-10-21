<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import type { Supplier } from '$lib/types';
  import { supplierActions } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let supplierToEdit: Supplier | null = null;

  let formData = {
    companyName: '',
    contactPerson: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    npwp: ''
  };

  $: if (isOpen) {
    if (supplierToEdit) {
      formData = {
        companyName: supplierToEdit.companyName,
        contactPerson: supplierToEdit.contactPerson,
        email: supplierToEdit.email,
        phone: supplierToEdit.phone,
        address: supplierToEdit.address,
        city: supplierToEdit.city,
        npwp: supplierToEdit.npwp
      };
    } else {
      formData = {
        companyName: '',
        contactPerson: '',
        email: '',
        phone: '',
        address: '',
        city: '',
        npwp: ''
      };
    }
  }

  function handleSubmit() {
    if (!formData.companyName) {
      alert('Nama supplier wajib diisi');
      return;
    }

    if (supplierToEdit) {
      supplierActions.update(supplierToEdit.id, formData);
    } else {
      supplierActions.add(formData);
    }
    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={supplierToEdit ? 'Edit Data Supplier' : 'Tambah Supplier Baru'}
  size="xl"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nama Perusahaan Supplier" name="companyName" required>
        <input
          id="companyName"
          type="text"
          bind:value={formData.companyName}
          placeholder="PT Supplier Utama Teknik"
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
          placeholder="sales@supplier.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Nomor Telepon" name="phone">
        <input
          id="phone"
          type="tel"
          bind:value={formData.phone}
          placeholder="021-98765432"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Kota" name="city">
        <input
          id="city"
          type="text"
          bind:value={formData.city}
          placeholder="Bekasi"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="NPWP" name="npwp">
        <input
          id="npwp"
          type="text"
          bind:value={formData.npwp}
          placeholder="01.999.888.7-011.000"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>
    </div>

    <FormField label="Alamat Kantor / Gudang" name="address">
      <textarea
        id="address"
        rows="3"
        bind:value={formData.address}
        placeholder="Alamat lengkap supplier..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      ></textarea>
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {supplierToEdit ? 'Simpan Perubahan' : 'Tambahkan Supplier'}
    </Button>
  </svelte:fragment>
</Modal>
