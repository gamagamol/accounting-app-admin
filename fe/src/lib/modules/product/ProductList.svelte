<script lang="ts">
  import DataTable from '$lib/components/ui/DataTable.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import ProductFormModal from './ProductFormModal.svelte';
  import { products, productActions } from '$lib/stores/dataStore';
  import { formatCurrency, formatNumber } from '$lib/utils/formatters';
  import type { Product, TableColumn } from '$lib/types';

  let isFormOpen = false;
  let productToEdit: Product | null = null;

  const columns: TableColumn[] = [
    { key: 'name', label: 'Nama Produk', sortable: true },
    { key: 'category', label: 'Kategori', sortable: true },
    { key: 'unit', label: 'Satuan', align: 'center' },
    { key: 'price', label: 'Harga Satuan', sortable: true, align: 'right', format: (v) => formatCurrency(v || 0) },
    { key: 'stock', label: 'Stok', sortable: true, align: 'center', format: (v, r) => `${formatNumber(v || 0)} ${r.unit || ''}` },
    { key: 'description', label: 'Keterangan' }
  ];

  function openCreate() {
    productToEdit = null;
    isFormOpen = true;
  }

  function openEdit(product: Product) {
    productToEdit = product;
    isFormOpen = true;
  }

  function handleDelete(product: Product) {
    if (confirm(`Apakah Anda yakin ingin menghapus produk ${product.name}?`)) {
      productActions.delete(product.id);
    }
  }
</script>

<div class="space-y-6">
  <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
    <PageHeader
      title="Master Data Produk & Jasa"
      description="Katalog inventaris barang, spesifikasi teknis, harga jual, dan sisa stok fisik"
    />
    <Button variant="primary" on:click={openCreate}>
      <span class="text-base font-bold">+</span>
      <span>Tambah Produk</span>
    </Button>
  </div>

  <DataTable
    {columns}
    data={$products}
    searchPlaceholder="Cari produk berdasarkan nama atau kategori..."
    searchKeys={['name', 'category', 'description']}
  >
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

  <ProductFormModal bind:isOpen={isFormOpen} {productToEdit} />
</div>
