import type { FieldDef } from '$lib/types/entity';
import type { StockAdjustment, StockMovement } from '$lib/types';
import { transactionStatusOptions } from '$lib/data/transaction-statuses';

export const stockMovementFields: FieldDef[] = [
	{ key: 'date', label: 'Movement Date', type: 'date', required: true },
	{ key: 'docNo', label: 'Document No', type: 'text', required: true, placeholder: 'GR/2024/001' },
	{ key: 'productCode', label: 'Product Code', type: 'text' },
	{ key: 'productName', label: 'Product Name', type: 'text', required: true },
	{
		key: 'type',
		label: 'Movement Type',
		type: 'select',
		badge: true,
		badgeLabels: { IN: 'Stock In', OUT: 'Stock Out', ADJUST: 'Adjustment', TRANSFER: 'Transfer' },
		options: [
			{ value: 'IN', label: 'Stock In' },
			{ value: 'OUT', label: 'Stock Out' },
			{ value: 'ADJUST', label: 'Adjustment' },
			{ value: 'TRANSFER', label: 'Transfer' }
		]
	},
	{ key: 'warehouse', label: 'Warehouse', type: 'text' },
	{ key: 'quantity', label: 'Quantity', type: 'number', required: true },
	{ key: 'unit', label: 'Unit', type: 'text', placeholder: 'Pcs' },
	{ key: 'reference', label: 'Reference Document', type: 'text', colSpan: 'full' },
	{
		key: 'status',
		label: 'Status',
		type: 'select',
		badge: true,
		defaultValue: 'completed',
		badgeLabels: Object.fromEntries(
			transactionStatusOptions.map((option) => [option.value, option.label])
		),
		options: transactionStatusOptions
	}
];

export const stockAdjustmentFields: FieldDef[] = [
	{ key: 'date', label: 'Adjustment Date', type: 'date', required: true },
	{ key: 'adjustmentNo', label: 'Adjustment No', type: 'text', required: true, placeholder: 'ADJ/2024/001' },
	{ key: 'warehouse', label: 'Warehouse', type: 'text' },
	{ key: 'productName', label: 'Product Name', type: 'text', required: true },
	{ key: 'systemQty', label: 'System Quantity', type: 'number' },
	{ key: 'actualQty', label: 'Actual Quantity', type: 'number' },
	{ key: 'diffQty', label: 'Difference', type: 'number' },
	{
		key: 'status',
		label: 'Status',
		type: 'select',
		badge: true,
		badgeLabels: Object.fromEntries(
			transactionStatusOptions.map((option) => [option.value, option.label])
		),
		options: transactionStatusOptions
	},
	{ key: 'reason', label: 'Adjustment Reason', type: 'textarea', colSpan: 'full' }
];

export function blankStockMovement(): Omit<StockMovement, 'id'> {
	return {
		date: new Date().toISOString().split('T')[0],
		docNo: '',
		productCode: '',
		productName: '',
		type: 'IN',
		warehouse: '',
		quantity: 0,
		unit: 'Pcs',
		reference: '',
		status: 'completed'
	};
}

export function blankStockAdjustment(): Omit<StockAdjustment, 'id'> {
	return {
		date: new Date().toISOString().split('T')[0],
		adjustmentNo: '',
		warehouse: '',
		productName: '',
		systemQty: 0,
		actualQty: 0,
		diffQty: 0,
		reason: '',
		status: 'pending'
	};
}
