<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import CoaFormModal from './CoaFormModal.svelte';
  import { chartOfAccounts, coaActions } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
  import type { ChartOfAccount, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let coaToEdit: ChartOfAccount | null = null;

  const columns: TableColumn[] = [
    { key: 'code', label: 'Kode Akun', sortable: true },
    { key: 'name', label: 'Nama Akun', sortable: true },
    { key: 'category', label: 'Kategori', sortable: true },
    { key: 'balance', label: 'Saldo (IDR)', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) }
  ];

  function openCreate() {
    coaToEdit = null;
    isFormOpen = true;
  }

  function openEdit(coa: ChartOfAccount) {
    coaToEdit = coa;
    isFormOpen = true;
  }

  function handleDelete(coa: ChartOfAccount) {
    if (confirm(`Apakah Anda yakin ingin menghapus akun ${coa.code} - ${coa.name}?`)) {
      coaActions.delete(coa.id);
    }
  }

  function getCategoryColor(cat: string) {
    switch (cat) {
      case 'Asset': return 'bg-emerald-50 text-emerald-700 border-emerald-200';
      case 'Liability': return 'bg-rose-50 text-rose-700 border-rose-200';
      case 'Equity': return 'bg-purple-50 text-purple-700 border-purple-200';
      case 'Revenue': return 'bg-blue-50 text-blue-700 border-blue-200';
      case 'Expense': return 'bg-amber-50 text-amber-700 border-amber-200';
      default: return 'bg-gray-50 text-gray-700 border-gray-200';
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Bagan Akun (Chart of Account - COA)"
      description="Struktur rekening pembukuan akuntansi: Aktiva, Kewajiban, Ekuitas, Pendapatan, dan Beban"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah Akun</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$chartOfAccounts}
    searchPlaceholder="Cari berdasarkan kode akun atau nama akun..."
    searchKeys={['code', 'name', 'category']}
  >
    <svelte:fragment slot="cell" let:column let:value let:row>
      {#if column.key === 'code'}
        <span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
          {value}
        </span>
      {:else if column.key === 'category'}
        <span class="px-2 py-0.5 rounded-full text-xs font-semibold border {getCategoryColor(value)}">
          {value}
        </span>
      {:else if column.key === 'balance'}
        <span class="font-mono font-semibold text-gray-900">
          {formatCurrency(value)}
        </span>
      {:else}
        {value}
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
        <button
          type="button"
          on:click={() => handleDelete(row)}
          class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold"
          title="Hapus"
        >
          Hapus
        </button>
      </div>
    </svelte:fragment>
  </DataTable>

  <CoaFormModal bind:isOpen={isFormOpen} {coaToEdit} />
</div>
