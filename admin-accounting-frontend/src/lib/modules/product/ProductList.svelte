<script lang="ts">
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import RowActions from '$lib/components/ui/RowActions.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import ProductFormModal from './ProductFormModal.svelte';
	import ProductDetailModal from './ProductDetailModal.svelte';
	import { products, productActions } from '$lib/stores/dataStore';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import type { Product, TableColumn } from '$lib/types';

	let isFormOpen = false;
	let isDetailOpen = false;
	let selectedProduct: Product | null = null;
	let productToEdit: Product | null = null;
	let typeFilter: 'all' | 'goods' | 'service' = 'all';

	$: filteredProducts =
		typeFilter === 'all' ? $products : $products.filter((product) => product.itemType === typeFilter);

	$: goodsCount = $products.filter((p) => p.itemType === 'goods').length;
	$: serviceCount = $products.filter((p) => p.itemType === 'service').length;

	const columns: TableColumn[] = [
		{ key: 'code', label: 'Code', sortable: true },
		{ key: 'name', label: 'Product / Service', sortable: true },
		{ key: 'itemType', label: 'Type', align: 'center' },
		{ key: 'category', label: 'Category', sortable: true },
		{ key: 'unit', label: 'UoM', align: 'center' },
		{ key: 'price', label: 'Price', sortable: true, align: 'right', format: (v) => formatCurrency(Number(v) || 0) },
		{
			key: 'stock',
			label: 'Stock',
			sortable: true,
			align: 'center',
			format: (v, row) => (row.itemType === 'goods' ? `${formatNumber(Number(v) || 0)} ${row.unit ?? ''}` : '—')
		}
	];

	function openCreate() {
		productToEdit = null;
		isFormOpen = true;
	}

	function openEdit(product: Product) {
		productToEdit = product;
		isFormOpen = true;
	}

	function openDetail(product: Product) {
		selectedProduct = product;
		isDetailOpen = true;
	}

	function handleDelete(product: Product) {
		if (confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
			productActions.delete(product.id);
		}
	}
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Products & Services"
			description="Master catalogue for goods, services, unit of measurement, pricing and physical stock."
		/>
		<Button variant="primary" on:click={openCreate}>
			<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2">
				<path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4" />
			</svg>
			<span>Add Product</span>
		</Button>
	</div>

	<div class="grid grid-cols-3 gap-3">
		<div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
			<p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400">Total Items</p>
			<p class="text-xl font-black text-gray-900 dark:text-white">{$products.length}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
			<p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300">Goods</p>
			<p class="text-xl font-black text-gray-900 dark:text-white">{goodsCount}</p>
		</div>
		<div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3">
			<p class="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300">Services</p>
			<p class="text-xl font-black text-gray-900 dark:text-white">{serviceCount}</p>
		</div>
	</div>

	<DataTable
		{columns}
		data={filteredProducts}
		searchPlaceholder="Search products by name, code or category..."
		searchKeys={['code', 'name', 'category', 'description']}
		emptyMessage="No products match the selected filter"
	>
		<svelte:fragment slot="controls">
			<select
				bind:value={typeFilter}
				class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 text-xs focus:ring-1 focus:ring-blue-500"
			>
				<option value="all">All types</option>
				<option value="goods">Goods only</option>
				<option value="service">Services only</option>
			</select>
		</svelte:fragment>

		<svelte:fragment slot="cell" let:column let:value let:row>
			{#if column.key === 'itemType'}
				<Badge status={value} label={value === 'goods' ? 'Goods' : 'Service'} />
			{:else}
				{column.format ? column.format(value, row) : value ?? '-'}
			{/if}
		</svelte:fragment>

		<svelte:fragment slot="actions" let:row>
			<RowActions
				onView={() => openDetail(row)}
				viewTitle="View product details"
				onEdit={() => openEdit(row)}
				editTitle="Edit product"
				onDelete={() => handleDelete(row)}
				deleteTitle="Delete product"
			/>
		</svelte:fragment>
	</DataTable>

	<ProductFormModal bind:isOpen={isFormOpen} {productToEdit} />
	<ProductDetailModal bind:isOpen={isDetailOpen} product={selectedProduct} />
</div>
