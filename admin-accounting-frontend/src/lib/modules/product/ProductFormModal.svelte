<script lang="ts">
	import Modal from '$lib/components/ui/Modal.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import type { Product } from '$lib/types';
	import { productActions, productCategories, unitsOfMeasurement } from '$lib/stores/dataStore';
	import { formatCurrency } from '$lib/utils/formatters';

	export let isOpen: boolean = false;
	export let productToEdit: Product | null = null;

	let formData: Omit<Product, 'id'> = {
		code: '',
		name: '',
		itemType: 'goods',
		category: '',
		unit: 'PCS',
		secondaryUnit: '',
		conversionRate: 0,
		weightKg: 0,
		barcode: '',
		price: 0,
		costPrice: 0,
		stock: 0,
		minStock: 0,
		description: ''
	};

	let showMeasurement = true;
	let wasOpen = false;

	$: baseUnitOptions = $unitsOfMeasurement.filter((unit) =>
		formData.itemType === 'goods'
			? unit.category !== 'Service'
			: unit.category === 'Service' || unit.category === 'Time'
	);

	$: secondaryUnitOptions = $unitsOfMeasurement.filter((unit) => unit.category !== 'Service');

	function defaultCategoryFor(_type: 'goods' | 'service'): string {
		return $productCategories[0]?.name ?? '';
	}

	$: if (isOpen && !wasOpen) {
		wasOpen = true;
		if (productToEdit) {
			const baseUnit =
				$unitsOfMeasurement.find(
					(unit) =>
						unit.code.toLowerCase() === (productToEdit.unit ?? '').toLowerCase() ||
						unit.name.toLowerCase() === (productToEdit.unit ?? '').toLowerCase()
				)?.code ?? productToEdit.unit ?? 'PCS';

			formData = {
				code: productToEdit.code ?? '',
				name: productToEdit.name,
				itemType: productToEdit.itemType ?? 'goods',
				category: productToEdit.category,
				unit: baseUnit,
				secondaryUnit: productToEdit.secondaryUnit ?? '',
				conversionRate: productToEdit.conversionRate ?? 0,
				weightKg: productToEdit.weightKg ?? 0,
				barcode: productToEdit.barcode ?? '',
				price: productToEdit.price,
				costPrice: productToEdit.costPrice ?? 0,
				stock: productToEdit.stock,
				minStock: productToEdit.minStock ?? 0,
				description: productToEdit.description
			};
			showMeasurement = true;
		} else {
			formData = {
				code: '',
				name: '',
				itemType: 'goods',
				category: defaultCategoryFor('goods'),
				unit: 'PCS',
				secondaryUnit: '',
				conversionRate: 0,
				weightKg: 0,
				barcode: '',
				price: 0,
				costPrice: 0,
				stock: 0,
				minStock: 0,
				description: ''
			};
			showMeasurement = true;
		}
	} else if (!isOpen) {
		wasOpen = false;
	}

	function selectType(type: 'goods' | 'service') {
		formData.itemType = type;
		if (type === 'service') {
			formData.unit = 'SERVICE';
			formData.secondaryUnit = '';
			formData.conversionRate = 0;
			formData.weightKg = 0;
			formData.stock = 0;
			formData.minStock = 0;
			formData.category = defaultCategoryFor('service');
		} else {
			formData.unit = 'PCS';
			formData.category = defaultCategoryFor('goods');
		}
	}

	async function handleSubmit() {
		if (!formData.name) {
			alert('Product name is required.');
			return;
		}
		if (!formData.unit) {
			alert('Please select a unit of measurement.');
			return;
		}

		const payload: Omit<Product, 'id'> = {
			...formData,
			code:
				formData.code ||
				`PRD-${Math.random().toString(36).slice(2, 6).toUpperCase()}${Date.now().toString().slice(-3)}`,
			secondaryUnit: formData.itemType === 'goods' ? formData.secondaryUnit : '',
			conversionRate: formData.itemType === 'goods' ? Number(formData.conversionRate) || 0 : 0,
			weightKg: formData.itemType === 'goods' ? Number(formData.weightKg) || 0 : 0,
			minStock: formData.itemType === 'goods' ? Number(formData.minStock) || 0 : 0
		};

		try {
			if (productToEdit) {
				await productActions.update(productToEdit.id, payload);
			} else {
				await productActions.add(payload);
			}
			isOpen = false;
		} catch (error) {
			alert(error instanceof Error ? error.message : 'Failed to save product.');
		}
	}
</script>

<Modal bind:isOpen title={productToEdit ? 'Edit Product' : 'New Product'} size="2xl">
	<form on:submit|preventDefault={handleSubmit} class="space-y-5">
		<!-- Item type -->
		<div>
			<p class="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide">Item Type</p>
			<div class="grid grid-cols-2 gap-3">
				<button
					type="button"
					on:click={() => selectType('goods')}
					class="flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all
					       {formData.itemType === 'goods'
					       	? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
					       	: 'border-gray-200 dark:border-slate-700 hover:border-blue-300'}"
				>
					<span class="text-2xl">📦</span>
					<span>
						<span class="block text-sm font-bold text-gray-900 dark:text-white">Goods</span>
						<span class="block text-[11px] text-gray-500 dark:text-slate-400">Physical inventory with stock and measurement</span>
					</span>
				</button>
				<button
					type="button"
					on:click={() => selectType('service')}
					class="flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all
					       {formData.itemType === 'service'
					       	? 'border-blue-600 bg-blue-50 dark:bg-blue-500/10'
					       	: 'border-gray-200 dark:border-slate-700 hover:border-blue-300'}"
				>
					<span class="text-2xl">🛠️</span>
					<span>
						<span class="block text-sm font-bold text-gray-900 dark:text-white">Service</span>
						<span class="block text-[11px] text-gray-500 dark:text-slate-400">Billable service without physical stock</span>
					</span>
				</button>
			</div>
		</div>

		<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
			<FormField label="Product / Service Name" name="name" required>
				<input
					id="name"
					type="text"
					bind:value={formData.name}
					placeholder="e.g. Papan Tulis Whiteboard 120x240"
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					required
				/>
			</FormField>

			<FormField label="Product Code" name="code" hint="Leave blank to generate automatically">
				<input
					id="code"
					type="text"
					bind:value={formData.code}
					placeholder="PRD-001"
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
				/>
			</FormField>

			<FormField label="Category" name="category">
				<select
					id="category"
					bind:value={formData.category}
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
				>
					{#each $productCategories as category}
						<option value={category.name}>{category.name}</option>
					{/each}
					{#if formData.category && !$productCategories.some((category) => category.name === formData.category)}
						<option value={formData.category}>{formData.category} (legacy)</option>
					{/if}
				</select>
			</FormField>

			<FormField label="Barcode / SKU" name="barcode">
				<input
					id="barcode"
					type="text"
					bind:value={formData.barcode}
					placeholder="899xxxxxxxx"
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
				/>
			</FormField>

			<FormField label={formData.itemType === 'goods' ? 'Selling Price (IDR)' : 'Service Rate (IDR)'} name="price" required>
				<input
					id="price"
					type="number"
					min="0"
					bind:value={formData.price}
					placeholder="0"
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
					required
				/>
			</FormField>

			<FormField label="Cost / Standard Rate (IDR)" name="costPrice">
				<input
					id="costPrice"
					type="number"
					min="0"
					bind:value={formData.costPrice}
					placeholder="0"
					class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"
				/>
			</FormField>
		</div>

		<!-- Expandable measurement section -->
		{#if formData.itemType === 'goods'}
			<div class="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden">
				<button
					type="button"
					on:click={() => (showMeasurement = !showMeasurement)}
					class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"
				>
					<div class="flex items-center gap-2">
						<span class="text-lg">📐</span>
						<div class="text-left">
							<p class="text-sm font-bold text-gray-800 dark:text-white">Measurement & Inventory</p>
							<p class="text-[11px] text-gray-500 dark:text-slate-400">
								Unit of Measurement, conversion and stock levels
							</p>
						</div>
					</div>
					<svg
						class="w-4 h-4 text-gray-500 transition-transform {showMeasurement ? 'rotate-180' : ''}"
						fill="none"
						stroke="currentColor"
						viewBox="0 0 24 24"
					>
						<path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
					</svg>
				</button>

				{#if showMeasurement}
					<div class="p-4 border-t border-gray-200 dark:border-slate-800">
						<div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">
							<FormField label="Base Unit of Measurement" name="unit" required>
								<select
									id="unit"
									bind:value={formData.unit}
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									{#each baseUnitOptions as unit}
										<option value={unit.code}>{unit.code} — {unit.name}</option>
									{/each}
								</select>
							</FormField>

							<FormField label="Secondary Unit (optional)" name="secondaryUnit">
								<select
									id="secondaryUnit"
									bind:value={formData.secondaryUnit}
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								>
									<option value="">No secondary unit</option>
									{#each secondaryUnitOptions as unit}
										<option value={unit.code}>{unit.code} — {unit.name}</option>
									{/each}
								</select>
							</FormField>

							<FormField label="Conversion Rate" name="conversionRate" hint="Base units per secondary unit">
								<input
									id="conversionRate"
									type="number"
									min="0"
									bind:value={formData.conversionRate}
									placeholder="e.g. 24"
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</FormField>

							<FormField label="Weight per Unit (kg)" name="weightKg">
								<input
									id="weightKg"
									type="number"
									min="0"
									step="0.01"
									bind:value={formData.weightKg}
									placeholder="0.00"
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</FormField>

							<FormField label="Current Stock" name="stock">
								<input
									id="stock"
									type="number"
									bind:value={formData.stock}
									placeholder="0"
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</FormField>

							<FormField label="Minimum Stock Alert" name="minStock">
								<input
									id="minStock"
									type="number"
									min="0"
									bind:value={formData.minStock}
									placeholder="0"
									class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
								/>
							</FormField>
						</div>

						<div class="mt-1 flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs">
							<span class="text-blue-800 dark:text-blue-200 font-medium">Estimated stock value</span>
							<span class="font-mono font-bold text-blue-900 dark:text-blue-100">
								{formatCurrency((Number(formData.stock) || 0) * (Number(formData.costPrice) || 0))}
							</span>
						</div>
					</div>
				{/if}
			</div>
		{:else}
			<div class="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 p-4">
				<p class="text-sm font-bold text-purple-800 dark:text-purple-200 mb-2">Service Measurement</p>
				<FormField label="Service Unit" name="unit" required>
					<select
						id="unit"
						bind:value={formData.unit}
						class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
					>
						{#each baseUnitOptions as unit}
							<option value={unit.code}>{unit.code} — {unit.name}</option>
						{/each}
					</select>
				</FormField>
				<p class="text-[11px] text-purple-700 dark:text-purple-300">
					Services do not track physical stock. Stock and measurement fields are hidden.
				</p>
			</div>
		{/if}

		<FormField label="Description / Specification" name="description">
			<textarea
				id="description"
				rows="3"
				bind:value={formData.description}
				placeholder="Technical specification or additional notes..."
				class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"
			></textarea>
		</FormField>
	</form>

	<svelte:fragment slot="footer">
		<Button variant="secondary" on:click={() => (isOpen = false)}>Cancel</Button>
		<Button variant="primary" on:click={handleSubmit}>
			{productToEdit ? 'Save Changes' : 'Create Product'}
		</Button>
	</svelte:fragment>
</Modal>
