<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import DataTable from '$lib/components/ui/DataTable.svelte';
	import StatCard from '$lib/components/ui/StatCard.svelte';
	import Button from '$lib/components/ui/Button.svelte';
	import { products } from '$lib/stores/dataStore';
	import { formatCurrency, formatNumber } from '$lib/utils/formatters';
	import { currencyColumn, numberColumn } from '$lib/utils/tableColumns';
	import type { TableColumn } from '$lib/types';

	interface ValuationRow {
		id: string;
		productCode: string;
		productName: string;
		category: string;
		unit: string;
		stock: number;
		unitCost: number;
		inventoryValue: number;
	}

	const columns: TableColumn[] = [
		{ key: 'productCode', label: 'Product Code', sortable: true },
		{ key: 'productName', label: 'Product', sortable: true },
		{ key: 'category', label: 'Category', sortable: true },
		{ key: 'unit', label: 'Unit', align: 'center' },
		numberColumn('stock', 'On Hand'),
		currencyColumn('unitCost', 'Unit Cost'),
		currencyColumn('inventoryValue', 'Inventory Value')
	];

	$: rows = $products
		.filter((product) => product.itemType === 'goods')
		.map((product) => {
			const unitCost = product.costPrice ?? product.price;
			return {
				id: product.id,
				productCode: product.code ?? product.id.toUpperCase(),
				productName: product.name,
				category: product.category,
				unit: product.unit,
				stock: product.stock,
				unitCost,
				inventoryValue: product.stock * unitCost
			} satisfies ValuationRow;
		});

	$: totalValue = rows.reduce((sum, row) => sum + row.inventoryValue, 0);
	$: totalUnits = rows.reduce((sum, row) => sum + row.stock, 0);
	$: categories = new Set(rows.map((row) => row.category)).size;
	$: zeroStock = rows.filter((row) => row.stock <= 0).length;
</script>

<div class="space-y-6">
	<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
		<PageHeader
			title="Inventory Valuation / Adjustment"
			description="Weighted-average inventory value by product. Use Stock Adjustment to correct quantity and valuation differences."
		/>
		<Button variant="secondary" href="/stock-adjustment">Open Stock Adjustment</Button>
	</div>

	<div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
		<StatCard title="Inventory Value" value={formatCurrency(totalValue)} icon="🏷️" color="blue" hint="On-hand quantity × unit cost" />
		<StatCard title="Total Units" value={formatNumber(totalUnits)} icon="📦" color="purple" hint="Across all goods products" />
		<StatCard title="Product Categories" value={String(categories)} icon="🗂️" color="green" hint="Valuation categories" />
		<StatCard title="Zero / Negative Stock" value={String(zeroStock)} icon="⚠️" color="red" hint="Requires adjustment review" />
	</div>

	<div class="rounded-xl border border-blue-200 dark:border-blue-500/30 bg-blue-50 dark:bg-blue-500/10 p-3 text-xs text-blue-800 dark:text-blue-200">
		<strong>API:</strong> GET /api/inventory/valuation — the backend will calculate weighted-average cost
		from stock movements. Quantity corrections are sent to POST /api/inventory/adjustments.
	</div>

	<DataTable
		columns={columns}
		data={rows}
		searchKeys={['productCode', 'productName', 'category']}
		searchPlaceholder="Search product or category..."
		emptyMessage="No inventory valuation records found"
	/>
</div>
