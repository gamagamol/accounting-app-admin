<script lang="ts">
  import Modal from '$lib/components/ui/Modal.svelte';
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import type { Product } from '$lib/types';
  import { productActions } from '$lib/stores/dataStore';

  export let isOpen: boolean = false;
  export let productToEdit: Product | null = null;

  let formData = {
    name: '',
    category: 'Material',
    unit: 'Pcs',
    price: 0,
    stock: 0,
    description: ''
  };

  $: if (isOpen) {
    if (productToEdit) {
      formData = {
        name: productToEdit.name,
        category: productToEdit.category,
        unit: productToEdit.unit,
        price: productToEdit.price,
        stock: productToEdit.stock,
        description: productToEdit.description
      };
    } else {
      formData = {
        name: '',
        category: 'Material',
        unit: 'Pcs',
        price: 0,
        stock: 0,
        description: ''
      };
    }
  }

  function handleSubmit() {
    if (!formData.name) {
      alert('Nama produk wajib diisi');
      return;
    }

    if (productToEdit) {
      productActions.update(productToEdit.id, formData);
    } else {
      productActions.add(formData);
    }
    isOpen = false;
  }
</script>

<Modal
  bind:isOpen
  title={productToEdit ? 'Edit Produk' : 'Tambah Produk Baru'}
  size="lg"
>
  <form on:submit|preventDefault={handleSubmit} class="space-y-4">
    <FormField label="Nama Produk / Item" name="name" required>
      <input
        id="name"
        type="text"
        bind:value={formData.name}
        placeholder="Contoh: Steel Plate 10mm x 4 x 8"
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        required
      />
    </FormField>

    <div class="grid grid-cols-2 gap-4">
      <FormField label="Kategori" name="category">
        <select
          id="category"
          bind:value={formData.category}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="Material">Material</option>
          <option value="Hardware">Hardware</option>
          <option value="Electronic">Electronic</option>
          <option value="Tools">Tools</option>
          <option value="Consumable">Consumable</option>
        </select>
      </FormField>

      <FormField label="Satuan (Unit)" name="unit">
        <select
          id="unit"
          bind:value={formData.unit}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"
        >
          <option value="Pcs">Pcs</option>
          <option value="Kg">Kg</option>
          <option value="Batang">Batang</option>
          <option value="Lembar">Lembar</option>
          <option value="Roll">Roll</option>
          <option value="Box">Box</option>
          <option value="Unit">Unit</option>
        </select>
      </FormField>

      <FormField label="Harga Satuan (IDR)" name="price" required>
        <input
          id="price"
          type="number"
          min="0"
          bind:value={formData.price}
          placeholder="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>

      <FormField label="Jumlah Stok" name="stock" required>
        <input
          id="stock"
          type="number"
          min="0"
          bind:value={formData.stock}
          placeholder="0"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        />
      </FormField>
    </div>

    <FormField label="Deskripsi / Spesifikasi" name="description">
      <textarea
        id="description"
        rows="3"
        bind:value={formData.description}
        placeholder="Spesifikasi teknis produk atau keterangan tambahan..."
        class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
      ></textarea>
    </FormField>
  </form>

  <svelte:fragment slot="footer">
    <Button variant="secondary" on:click={() => (isOpen = false)}>Batal</Button>
    <Button variant="primary" on:click={handleSubmit}>
      {productToEdit ? 'Simpan Perubahan' : 'Tambahkan Produk'}
    </Button>
  </svelte:fragment>
</Modal>
