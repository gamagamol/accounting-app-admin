<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import UserFormModal from './UserFormModal.svelte';
  import { systemUsers, deleteSystemUser, user } from '$lib/stores/auth';
  import type { User, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let userToEdit: User | null = null;

  const columns: TableColumn[] = [
    { key: 'name', label: 'Nama Pengguna', sortable: true },
    { key: 'email', label: 'Alamat Email', sortable: true },
    { key: 'role', label: 'Hak Akses / Role', sortable: true, align: 'center' }
  ];

  function openCreate() {
    userToEdit = null;
    isFormOpen = true;
  }

  function openEdit(u: User) {
    userToEdit = u;
    isFormOpen = true;
  }

  function handleDelete(u: User) {
    if (u.id === $user.id) {
      alert('Anda tidak dapat menghapus akun Anda sendiri yang sedang aktif');
      return;
    }
    if (confirm(`Apakah Anda yakin ingin menghapus akses pengguna ${u.name}?`)) {
      deleteSystemUser(u.id);
    }
  }

  function getRoleBadge(role: string) {
    switch (role) {
      case 'SUPER_ADMIN': return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'SALES_ADMIN': return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'ACCOUNTING_ADMIN': return 'bg-emerald-100 text-emerald-800 border-emerald-200';
      case 'OWNER': return 'bg-amber-100 text-amber-800 border-amber-200';
      default: return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex justify-between items-center">
    <div>
      <h3 class="text-base font-bold text-gray-900">Daftar Akun Pengguna Sistem (User Management)</h3>
      <p class="text-xs text-gray-500">Kelola akun staf, hak akses per modul, dan kredensial login</p>
    </div>
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah User Baru</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$systemUsers}
    searchPlaceholder="Cari pengguna berdasarkan nama atau email..."
    searchKeys={['name', 'email', 'role']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'role'}
        <span class="px-2.5 py-1 rounded-full text-xs font-bold border {getRoleBadge(value)}">
          {value.replace('_', ' ')}
        </span>
      {:else}
        {column.format ? column.format(value, row) : value}
      {/if}
    </svelte:fragment>

    <svelte:fragment slot="actions" let:row>
      <div class="flex items-center justify-end gap-1.5">
        <button
          type="button"
          on:click={() => openEdit(row)}
          class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold"
          title="Edit"
        >
          Edit
        </button>
        {#if row.id !== $user.id}
          <button
            type="button"
            on:click={() => handleDelete(row)}
            class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
            title="Hapus"
          >
            Hapus
          </button>
        {/if}
      </div>
    </svelte:fragment>
  </DataTable>

  <UserFormModal bind:isOpen={isFormOpen} {userToEdit} />
</div>
