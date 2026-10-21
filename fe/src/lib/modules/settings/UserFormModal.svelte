<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import { addSystemUser, updateSystemUser } from '$lib/stores/auth';
  import type { User, UserRole } from '$lib/types';

  export let isOpen: boolean = false;
  export let userToEdit: User | null = null;

  let name = '';
  let email = '';
  let role: UserRole = 'SALES_ADMIN';

  $: if (isOpen) {
    if (userToEdit) {
      name = userToEdit.name;
      email = userToEdit.email;
      role = userToEdit.role;
    } else {
      name = '';
      email = '';
      role = 'SALES_ADMIN';
    }
  }

  function handleSubmit() {
    if (!name || !email) {
      alert('Nama dan email wajib diisi');
      return;
    }

    if (userToEdit) {
      updateSystemUser(userToEdit.id, { name, email, role });
    } else {
      addSystemUser({ name, email, role, avatar: '' });
    }

    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={userToEdit ? 'Edit Pengguna Sistem' : 'Tambah Pengguna Baru (User Management)'}
  size="md"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <FormField label="Nama Pengguna" name="userName" required>
      <input
        id="userName"
        type="text"
        bind:value={name}
        placeholder="Nama Lengkap"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </FormField>

    <FormField label="Alamat Email (Username Login)" name="userEmail" required>
      <input
        id="userEmail"
        type="email"
        bind:value={email}
        placeholder="user@byond.co.id"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </FormField>

    <FormField label="Hak Akses / Peran (Role)" name="userRole" required>
      <select
        id="userRole"
        bind:value={role}
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
      >
        <option value="SUPER_ADMIN">SUPER ADMIN (Semua Akses & Manajemen User)</option>
        <option value="SALES_ADMIN">SALES ADMIN (Penjualan, Customer, Quotation)</option>
        <option value="ACCOUNTING_ADMIN">ACCOUNTING ADMIN (Keuangan, Tagihan, Buku Besar)</option>
        <option value="OWNER">OWNER / DIREKSI (Pemantauan Laporan & Omzet)</option>
      </select>
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {userToEdit ? 'Simpan Perubahan' : 'Tambahkan Pengguna'}
    </Button>
  </svelte:fragment>
</Modal>
