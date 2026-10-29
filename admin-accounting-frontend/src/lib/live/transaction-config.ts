export type PartyKind = 'customer' | 'supplier' | null;
export type LineMode = 'product' | 'payment' | 'partial' | 'none';

export interface TransactionConfig {
	type: string;
	route: string;
	title: string;
	singular: string;
	description: string;
	party: PartyKind;
	parentType?: string;
	parentField?: string;
	parentLabel?: string;
	lineMode: LineMode;
	approvable: boolean;
	showWarehouse?: boolean;
	showDueDate?: boolean;
	showExpectedDate?: boolean;
	showValidUntil?: boolean;
	showPayment?: boolean;
	referenceKey?: string;
	referenceLabel?: string;
	referenceRoute?: string;
	referenceIdKey?: string;
	next?: { type: string; route: string; label: string };
}

export const transactionConfigs: Record<string, TransactionConfig> = {
	quotation: {
		type: 'quotation',
		route: 'quotation',
		title: 'Sales Quotations',
		singular: 'Quotation',
		description: 'Create a price proposal and approve it before converting it to a sales order.',
		party: 'customer',
		lineMode: 'product',
		approvable: true,
		showValidUntil: true,
		next: { type: 'sales-order', route: 'sales', label: 'Create Sales Order' }
	},
	'sales-order': {
		type: 'sales-order',
		route: 'sales',
		title: 'Sales Orders',
		singular: 'Sales Order',
		description: 'Confirm an approved quotation. Revenue, receivable, COGS and stock are posted immediately.',
		party: 'customer',
		parentType: 'quotation',
		parentField: 'quotation_id',
		parentLabel: 'Approved Quotation',
		lineMode: 'none',
		approvable: true,
		showWarehouse: true,
		referenceKey: 'quotation_number',
		referenceLabel: 'Quotation No',
		referenceRoute: 'quotation',
		referenceIdKey: 'quotation_id',
		next: { type: 'delivery', route: 'delivery', label: 'Create Delivery' }
	},
	delivery: {
		type: 'delivery',
		route: 'delivery',
		title: 'Deliveries',
		singular: 'Delivery',
		description: 'Record shipment against an approved sales order. Inventory and COGS were posted when the sales order was created.',
		party: 'customer',
		parentType: 'sales-order',
		parentField: 'sales_order_id',
		parentLabel: 'Approved Sales Order',
		lineMode: 'partial',
		approvable: false,
		showWarehouse: true,
		referenceKey: 'sales_order_number',
		referenceLabel: 'Sales Order No',
		referenceRoute: 'sales',
		referenceIdKey: 'sales_order_id',
		next: { type: 'sales-invoice', route: 'sales-invoice', label: 'Create Sales Invoice' }
	},
	'sales-invoice': {
		type: 'sales-invoice',
		route: 'sales-invoice',
		title: 'Sales Invoices',
		singular: 'Sales Invoice',
		description: 'Invoice a completed delivery ticket. The customer receivable was recognized when the sales order was created.',
		party: 'customer',
		parentType: 'delivery',
		parentField: 'delivery_id',
		parentLabel: 'Completed Delivery Ticket',
		lineMode: 'none',
		approvable: false,
		showDueDate: true,
		referenceKey: 'sales_order_number',
		referenceLabel: 'Sales Order No',
		referenceRoute: 'sales',
		referenceIdKey: 'sales_order_id',
		next: { type: 'customer-receipt', route: 'customer-receipt', label: 'Record Customer Receipt' }
	},
	'customer-receipt': {
		type: 'customer-receipt',
		route: 'customer-receipt',
		title: 'Customer Receipts',
		singular: 'Customer Receipt',
		description: 'Record incoming customer payment against an outstanding sales invoice.',
		party: 'customer',
		lineMode: 'payment',
		approvable: false,
		showPayment: true
	},
	'purchase-order': {
		type: 'purchase-order',
		route: 'purchase',
		title: 'Purchase Orders',
		singular: 'Purchase Order',
		description: 'Create a vendor order. Inventory, VAT and payable are posted immediately.',
		party: 'supplier',
		lineMode: 'product',
		approvable: true,
		showWarehouse: true,
		showExpectedDate: true,
		next: { type: 'goods-receipt', route: 'goods', label: 'Create Goods Receipt' }
	},
	'goods-receipt': {
		type: 'goods-receipt',
		route: 'goods',
		title: 'Goods Receipts',
		singular: 'Goods Receipt',
		description: 'Record goods received against an approved purchase order. Inventory was posted when the purchase order was created.',
		party: 'supplier',
		parentType: 'purchase-order',
		parentField: 'purchase_order_id',
		parentLabel: 'Approved Purchase Order',
		lineMode: 'partial',
		approvable: false,
		showWarehouse: true,
		referenceKey: 'purchase_order_number',
		referenceLabel: 'Purchase Order No',
		referenceRoute: 'purchase',
		referenceIdKey: 'purchase_order_id',
		next: { type: 'purchase-invoice', route: 'purchase-invoice', label: 'Create Purchase Invoice' }
	},
	'purchase-invoice': {
		type: 'purchase-invoice',
		route: 'purchase-invoice',
		title: 'Purchase Invoices',
		singular: 'Purchase Invoice',
		description: 'Record the vendor invoice for received goods. The payable was recognized when the purchase order was created.',
		party: 'supplier',
		parentType: 'goods-receipt',
		parentField: 'goods_receipt_id',
		parentLabel: 'Completed Goods Receipt',
		lineMode: 'none',
		approvable: false,
		showDueDate: true,
		referenceKey: 'purchase_order_number',
		referenceLabel: 'Purchase Order No',
		referenceRoute: 'purchase',
		referenceIdKey: 'purchase_order_id',
		next: { type: 'vendor-payment', route: 'vendor-payment', label: 'Record Vendor Payment' }
	},
	'vendor-payment': {
		type: 'vendor-payment',
		route: 'vendor-payment',
		title: 'Vendor Payments',
		singular: 'Vendor Payment',
		description: 'Pay an outstanding purchase invoice and settle the vendor payable.',
		party: 'supplier',
		lineMode: 'payment',
		approvable: false,
		showPayment: true
	}
};

export function getTransactionConfig(type: string): TransactionConfig {
	const config = transactionConfigs[type];
	if (!config) throw new Error(`Unknown transaction type: ${type}`);
	return config;
}
