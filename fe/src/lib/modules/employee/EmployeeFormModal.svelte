<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import type { Employee } from '$lib/types';
  import { employeeActions } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let employeeToEdit: Employee | null = null;

  let formData = {
    name: '',
    position: 'Staff',
    email: '',
    phone: '',
    address: '',
    status: 'active' as 'active' | 'inactive'
  };

  $: if (isOpen) {
    if (employeeToEdit) {
      formData = {
        name: employeeToEdit.name,
        position: employeeToEdit.position,
        email: employeeToEdit.email,
        phone: employeeToEdit.phone,
        address: employeeToEdit.address,
        status: employeeToEdit.status
      };
    } else {
      formData = {
        name: '',
        position: 'Staff Administrasi',
        email: '',
        phone: '',
        address: '',
        status: 'active'
      };
    }
  }

  function handleSubmit() {
    if (!formData.name) {
      alert('Nama pegawai wajib diisi');
      return;
    }

    if (employeeToEdit) {
      employeeActions.update(employeeToEdit.id, formData);
    } else {
      employeeActions.add(formData);
    }
    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={employeeToEdit ? 'Edit Data Pegawai' : 'Tambah Pegawai Baru'}
  size="lg"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
      <FormField label="Nama Lengkap Pegawai" name="name" required>
        <input
          id="name"
          type="text"
          bind:value={formData.name}
          placeholder="Nama Pegawai"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Jabatan / Posisi" name="position" required>
        <input
          id="position"
          type="text"
          bind:value={formData.position}
          placeholder="Staff Finance, Manager, dll"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Email" name="email">
        <input
          id="email"
          type="email"
          bind:value={formData.email}
          placeholder="pegawai@perusahaan.com"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Nomor Telepon / WhatsApp" name="phone">
        <input
          id="phone"
          type="tel"
          bind:value={formData.phone}
          placeholder="0812-3456-7890"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Status Kepegawaian" name="status">
        <select
          id="status"
          bind:value={formData.status}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="active">Aktif</option>
          <option value="inactive">Non-Aktif / Resigned</option>
        </select>
      </FormField>
    </div>

    <FormField label="Alamat Domisili" name="address">
      <textarea
        id="address"
        rows="2"
        bind:value={formData.address}
        placeholder="Alamat tempat tinggal pegawai..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      ></textarea>
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {employeeToEdit ? 'Simpan Pegawai' : 'Tambahkan Pegawai'}
    </Button>
  </svelte:fragment>
</Modal>
