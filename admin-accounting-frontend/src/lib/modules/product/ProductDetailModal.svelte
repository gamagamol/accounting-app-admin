<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import Badge from '$lib/components/ui/Badge.svelte';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import type { Product } from '$lib/types';

	export let isOpen: boolean = false;
	export let product: Product | null = null;
</script>

<Modal bind:isOpen title="Product Details" size="2xl">
	{#if product}
		<div class="space-y-5 text-sm">
			<div class="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 p-4 flex items-start justify-between gap-3">
				<div>
					<p class="text-[11px] font-mono text-blue-600 dark:text-blue-300">{product.code || '-'}</p>
					<h4 class="text-lg font-bold text-gray-900 dark:text-white">{product.name}</h4>
					<p class="text-xs text-gray-500 dark:text-slate-400">{product.category}</p>
				</div>
				<Badge status={product.itemType} label={product.itemType === 'goods' ? 'Goods' : 'Service'} />
			</div>

			<div class="grid grid-cols-2 sm:grid-cols-3 gap-3">
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Selling Price</p>
					<p class="mt-1 font-bold text-gray-900 dark:text-white">{formatCurrency(product.price)}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Cost Price</p>
					<p class="mt-1 font-bold text-gray-900 dark:text-white">{formatCurrency(product.costPrice ?? 0)}</p>
				</div>
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Base Unit</p>
					<p class="mt-1 font-bold text-gray-900 dark:text-white">{product.unit || '-'}</p>
				</div>

				{#if product.itemType === 'goods'}
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
						<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Current Stock</p>
						<p class="mt-1 font-bold text-gray-900 dark:text-white">{formatNumber(product.stock || 0)} {product.unit}</p>
					</div>
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
						<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Minimum Stock</p>
						<p class="mt-1 font-bold text-gray-900 dark:text-white">{formatNumber(product.minStock ?? 0)} {product.unit}</p>
					</div>
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
						<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Stock Value</p>
						<p class="mt-1 font-bold text-gray-900 dark:text-white">
							{formatCurrency((product.stock || 0) * (product.costPrice ?? 0))}
						</p>
					</div>
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
						<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Secondary Unit</p>
						<p class="mt-1 font-bold text-gray-900 dark:text-white">
							{product.secondaryUnit || '-'}
							{#if product.secondaryUnit && product.conversionRate}
								<span class="text-[11px] text-gray-500 dark:text-slate-400">
									(1 {product.secondaryUnit} = {product.conversionRate} {product.unit})
								</span>
							{/if}
						</p>
					</div>
					<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
						<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Weight / Unit</p>
						<p class="mt-1 font-bold text-gray-900 dark:text-white">{product.weightKg ?? 0} kg</p>
					</div>
				{/if}
			</div>

			{#if product.barcode}
				<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
					<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Barcode / SKU</p>
					<p class="mt-1 font-mono text-gray-800 dark:text-slate-100">{product.barcode}</p>
				</div>
			{/if}

			<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3">
				<p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400">Description</p>
				<p class="mt-1 text-gray-700 dark:text-slate-200">{product.description || '-'}</p>
			</div>
		</div>
	{/if}

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Close</Button>
	</svelte:fragment>
</Modal>
