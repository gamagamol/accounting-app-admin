import {
	billActions,
	billPayments,
	debtPaymentActions,
	debtPayments,
	inventoryActions,
	paymentActions,
	payments,
	productAccountMappings,
	purchaseInvoiceActions,
	purchaseInvoices,
	purchaseReturnActions,
	purchaseReturns,
	salesReturnActions,
	salesReturns
} from '$lib/stores/dataStore';
import { formatCurrency, formatDate } from '$lib/utils/formatters';
import type { FieldDef } from '$lib/types/entity';
import { transactionStatusOptions } from '$lib/data/transaction-statuses';
import type { TableColumn } from '$lib/types';
import type { Readable } from 'svelte/store';

export interface CrudDefinition {
	route: string;
	module: string;
	entityType: string;
	entityName: string;
	title: string;
	createTitle: string;
	description: string;
	eyebrow: string;
	displayKey: string;
	createLabel: string;
	store: Readable<any[]>;
	fields: FieldDef[];
	columns: TableColumn[];
	searchKeys: string[];
	defaults?: () => Record<string, any>;
	createRecord: (payload: Record<string, any>) => any;
	updateRecord: (id: string, payload: Record<string, any>) => void;
	deleteRecord: (id: string) => void;
}

const today = () => new Date().toISOString().split('T')[0];
const transactionNo = () => `TRX-${Date.now().toString(36).toUpperCase()}`;
const documentNo = (prefix: string) =>
	`${prefix}/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`;

const moneyColumn = (key: string, label: string): TableColumn => ({
	key,
	label,
	sortable: true,
	align: 'right',
	format: (value) => formatCurrency(Number(value) || 0)
});

const dateColumn = (key: string, label: string): TableColumn => ({
	key,
	label,
	sortable: true,
	format: (value) => formatDate(String(value))
});

const statusOptions = (): FieldDef => ({
	key: 'status',
	label: 'Status',
	type: 'select',
	badge: true,
	options: transactionStatusOptions,
	badgeLabels: Object.fromEntries(
		transactionStatusOptions.map((option) => [option.value, option.label])
	)
});

export const salesInvoiceDefinition: CrudDefinition = {
	route: 'sales-invoice',
	module: 'sales',
	entityType: 'sales_invoice',
	entityName: 'sales invoice',
	title: 'Sales Invoices',
	createTitle: 'Sales Invoice',
	description: 'Issue customer receivables invoices on a dedicated page and monitor settlement status.',
	eyebrow: 'Sales / Sales Invoice',
	displayKey: 'billNo',
	createLabel: 'Issue New Invoice',
	store: billPayments,
	fields: [
		{ key: 'billNo', label: 'Invoice No', type: 'text', required: true, placeholder: 'INV/2024/001' },
		{ key: 'date', label: 'Invoice Date', type: 'date', required: true },
		{ key: 'invoiceNo', label: 'Sales Order Reference', type: 'text', placeholder: 'SO/2024/001' },
		{ key: 'supplierName', label: 'Customer Name', type: 'text', required: true },
		{ key: 'amount', label: 'Invoice Amount', type: 'currency', required: true },
		{
			key: 'method',
			label: 'Payment Method',
			type: 'select',
			options: [
				{ value: 'transfer', label: 'Bank Transfer' },
				{ value: 'cash', label: 'Cash' },
				{ value: 'check', label: 'Cheque' }
			]
		},
		statusOptions(),
		{ key: 'preparedBy', label: 'Prepared By', type: 'text' }
	],
	columns: [
		{ key: 'billNo', label: 'Invoice No', sortable: true },
		dateColumn('date', 'Invoice Date'),
		{ key: 'supplierName', label: 'Customer', sortable: true },
		{ key: 'invoiceNo', label: 'SO Reference' },
		moneyColumn('amount', 'Invoice Amount'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['billNo', 'invoiceNo', 'supplierName', 'preparedBy'],
	defaults: () => ({
		billNo: documentNo('INV'),
		date: today(),
		method: 'transfer',
		status: 'pending',
		preparedBy: 'Finance Team'
	}),
	createRecord: (payload) =>
		billActions.add({
			...(payload as any),
			transactionNo: transactionNo(),
			preparedBy: payload.preparedBy || 'Finance Team'
		}),
	updateRecord: (id, payload) => billActions.update(id, payload),
	deleteRecord: (id) => billActions.delete(id)
};

export const customerReceiptDefinition: CrudDefinition = {
	route: 'customer-receipt',
	module: 'sales',
	entityType: 'customer_receipt',
	entityName: 'customer receipt',
	title: 'Customer Receipts',
	createTitle: 'Customer Receipt',
	description: 'Record incoming customer payments and issue receipts on a dedicated page.',
	eyebrow: 'Sales / Customer Receipt',
	displayKey: 'paymentNo',
	createLabel: 'Record Receipt',
	store: payments,
	fields: [
		{ key: 'paymentNo', label: 'Receipt No', type: 'text', required: true, placeholder: 'PAY/2024/001' },
		{ key: 'date', label: 'Payment Date', type: 'date', required: true },
		{ key: 'customerName', label: 'Customer Name', type: 'text', required: true },
		{ key: 'invoiceNo', label: 'Invoice Reference', type: 'text' },
		{ key: 'amount', label: 'Amount Received', type: 'currency', required: true },
		{
			key: 'method',
			label: 'Payment Method',
			type: 'select',
			options: [
				{ value: 'transfer', label: 'Bank Transfer' },
				{ value: 'cash', label: 'Cash' },
				{ value: 'check', label: 'Cheque' }
			]
		},
		statusOptions(),
		{ key: 'preparedBy', label: 'Prepared By', type: 'text' }
	],
	columns: [
		{ key: 'paymentNo', label: 'Receipt No', sortable: true },
		dateColumn('date', 'Payment Date'),
		{ key: 'customerName', label: 'Customer', sortable: true },
		{ key: 'invoiceNo', label: 'Invoice Reference' },
		moneyColumn('amount', 'Amount Received'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['paymentNo', 'customerName', 'invoiceNo', 'preparedBy'],
	defaults: () => ({
		paymentNo: documentNo('PAY'),
		date: today(),
		method: 'transfer',
		status: 'completed',
		preparedBy: 'Finance Team'
	}),
	createRecord: (payload) =>
		paymentActions.add({
			...(payload as any),
			transactionNo: transactionNo(),
			preparedBy: payload.preparedBy || 'Finance Team'
		}),
	updateRecord: (id, payload) => paymentActions.update(id, payload),
	deleteRecord: (id) => paymentActions.delete(id)
};

export const salesReturnDefinition: CrudDefinition = {
	route: 'sales-return',
	module: 'sales',
	entityType: 'sales_return',
	entityName: 'sales return',
	title: 'Sales Return / Credit Note',
	createTitle: 'Sales Return',
	description: 'Record returned goods and issue credit notes on a dedicated page.',
	eyebrow: 'Sales / Sales Return',
	displayKey: 'returnNo',
	createLabel: 'New Sales Return',
	store: salesReturns,
	fields: [
		{ key: 'returnNo', label: 'Return / Credit Note No', type: 'text', required: true, placeholder: 'SR/2024/001' },
		{ key: 'date', label: 'Return Date', type: 'date', required: true },
		{ key: 'salesNo', label: 'Sales Order Reference', type: 'text' },
		{ key: 'customerName', label: 'Customer Name', type: 'text', required: true },
		{ key: 'reason', label: 'Return Reason', type: 'textarea', colSpan: 'full' },
		{ key: 'total', label: 'Credit Amount', type: 'currency', required: true },
		statusOptions()
	],
	columns: [
		{ key: 'returnNo', label: 'Return No', sortable: true },
		dateColumn('date', 'Date'),
		{ key: 'salesNo', label: 'Sales Order Ref', sortable: true },
		{ key: 'customerName', label: 'Customer', sortable: true },
		moneyColumn('total', 'Credit Amount'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['returnNo', 'salesNo', 'customerName', 'reason', 'status'],
	defaults: () => ({
		returnNo: documentNo('SR'),
		date: today(),
		status: 'pending'
	}),
	createRecord: (payload) => salesReturnActions.add(payload as any),
	updateRecord: (id, payload) => salesReturnActions.update(id, payload),
	deleteRecord: (id) => salesReturnActions.delete(id)
};

export const purchaseInvoiceDefinition: CrudDefinition = {
	route: 'purchase-invoice',
	module: 'purchase',
	entityType: 'purchase_invoice',
	entityName: 'purchase invoice',
	title: 'Purchase Invoice',
	createTitle: 'Purchase Invoice',
	description: 'Record vendor invoices on a dedicated page and monitor due dates and payables.',
	eyebrow: 'Purchasing / Purchase Invoice',
	displayKey: 'invoiceNo',
	createLabel: 'Add Purchase Invoice',
	store: purchaseInvoices,
	fields: [
		{ key: 'invoiceNo', label: 'Vendor Invoice No', type: 'text', required: true, placeholder: 'PI/2024/001' },
		{ key: 'date', label: 'Invoice Date', type: 'date', required: true },
		{ key: 'purchaseNo', label: 'Purchase Order Reference', type: 'text' },
		{ key: 'supplierName', label: 'Vendor Name', type: 'text', required: true },
		{ key: 'dueDate', label: 'Due Date', type: 'date', required: true },
		{ key: 'amount', label: 'Invoice Amount', type: 'currency', required: true },
		statusOptions(),
		{ key: 'preparedBy', label: 'Prepared By', type: 'text' }
	],
	columns: [
		{ key: 'invoiceNo', label: 'Invoice No', sortable: true },
		dateColumn('date', 'Invoice Date'),
		{ key: 'purchaseNo', label: 'PO Reference', sortable: true },
		{ key: 'supplierName', label: 'Vendor', sortable: true },
		dateColumn('dueDate', 'Due Date'),
		moneyColumn('amount', 'Amount'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['invoiceNo', 'purchaseNo', 'supplierName', 'status', 'preparedBy'],
	defaults: () => ({
		invoiceNo: documentNo('PI'),
		date: today(),
		dueDate: today(),
		status: 'pending',
		preparedBy: 'Procurement Team'
	}),
	createRecord: (payload) => purchaseInvoiceActions.add(payload as any),
	updateRecord: (id, payload) => purchaseInvoiceActions.update(id, payload),
	deleteRecord: (id) => purchaseInvoiceActions.delete(id)
};

export const vendorPaymentDefinition: CrudDefinition = {
	route: 'vendor-payment',
	module: 'purchase',
	entityType: 'vendor_payment',
	entityName: 'vendor payment',
	title: 'Vendor Payments',
	createTitle: 'Vendor Payment',
	description: 'Record cash disbursements settling supplier invoices on a dedicated page.',
	eyebrow: 'Purchasing / Vendor Payment',
	displayKey: 'paymentNo',
	createLabel: 'Record Vendor Payment',
	store: debtPayments,
	fields: [
		{ key: 'paymentNo', label: 'Payment Voucher No', type: 'text', required: true, placeholder: 'VP/2024/001' },
		{ key: 'date', label: 'Payment Date', type: 'date', required: true },
		{ key: 'supplierName', label: 'Vendor / Supplier', type: 'text', required: true },
		{ key: 'purchaseNo', label: 'Purchase Order Reference', type: 'text' },
		{ key: 'amount', label: 'Amount Paid', type: 'currency', required: true },
		{
			key: 'method',
			label: 'Payment Method',
			type: 'select',
			options: [
				{ value: 'transfer', label: 'Bank Transfer' },
				{ value: 'cash', label: 'Cash' },
				{ value: 'check', label: 'Cheque' }
			]
		},
		statusOptions(),
		{ key: 'preparedBy', label: 'Prepared By', type: 'text' }
	],
	columns: [
		{ key: 'paymentNo', label: 'Payment Voucher No', sortable: true },
		dateColumn('date', 'Payment Date'),
		{ key: 'supplierName', label: 'Vendor / Supplier', sortable: true },
		{ key: 'purchaseNo', label: 'PO Reference' },
		moneyColumn('amount', 'Amount Paid'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['paymentNo', 'supplierName', 'purchaseNo', 'preparedBy'],
	defaults: () => ({
		paymentNo: documentNo('VP'),
		date: today(),
		method: 'transfer',
		status: 'completed',
		preparedBy: 'Finance Team'
	}),
	createRecord: (payload) =>
		debtPaymentActions.add({
			...(payload as any),
			transactionNo: transactionNo(),
			preparedBy: payload.preparedBy || 'Finance Team'
		}),
	updateRecord: (id, payload) => debtPaymentActions.update(id, payload),
	deleteRecord: (id) => debtPaymentActions.delete(id)
};

export const purchaseReturnDefinition: CrudDefinition = {
	route: 'purchase-return',
	module: 'purchase',
	entityType: 'purchase_return',
	entityName: 'purchase return',
	title: 'Purchase Return / Debit Note',
	createTitle: 'Purchase Return',
	description: 'Record goods returned to vendors and issue debit notes on a dedicated page.',
	eyebrow: 'Purchasing / Purchase Return',
	displayKey: 'returnNo',
	createLabel: 'New Purchase Return',
	store: purchaseReturns,
	fields: [
		{ key: 'returnNo', label: 'Return / Debit Note No', type: 'text', required: true, placeholder: 'PR/2024/001' },
		{ key: 'date', label: 'Return Date', type: 'date', required: true },
		{ key: 'purchaseNo', label: 'Purchase Order Reference', type: 'text' },
		{ key: 'supplierName', label: 'Vendor Name', type: 'text', required: true },
		{ key: 'reason', label: 'Return Reason', type: 'textarea', colSpan: 'full' },
		{ key: 'total', label: 'Debit Amount', type: 'currency', required: true },
		statusOptions()
	],
	columns: [
		{ key: 'returnNo', label: 'Return No', sortable: true },
		dateColumn('date', 'Date'),
		{ key: 'purchaseNo', label: 'Purchase Order Ref', sortable: true },
		{ key: 'supplierName', label: 'Vendor', sortable: true },
		moneyColumn('total', 'Debit Amount'),
		{ key: 'status', label: 'Status', align: 'center', sortable: true, badge: true }
	],
	searchKeys: ['returnNo', 'purchaseNo', 'supplierName', 'reason', 'status'],
	defaults: () => ({
		returnNo: documentNo('PR'),
		date: today(),
		status: 'pending'
	}),
	createRecord: (payload) => purchaseReturnActions.add(payload as any),
	updateRecord: (id, payload) => purchaseReturnActions.update(id, payload),
	deleteRecord: (id) => purchaseReturnActions.delete(id)
};

export const productAccountMappingDefinition: CrudDefinition = {
	route: 'product-account-mapping',
	module: 'inventory',
	entityType: 'product_account_mapping',
	entityName: 'account mapping',
	title: 'Product Account Mapping',
	createTitle: 'Product Account Mapping',
	description: 'Map product categories to inventory, revenue, COGS and return accounts on a dedicated page.',
	eyebrow: 'Inventory / Product Account Mapping',
	displayKey: 'category',
	createLabel: 'Add Mapping',
	store: productAccountMappings,
	fields: [
		{ key: 'category', label: 'Product Category', type: 'text', required: true, placeholder: 'Raw Materials' },
		{ key: 'inventoryAccount', label: 'Inventory Account', type: 'text' },
		{ key: 'salesAccount', label: 'Sales Account', type: 'text' },
		{ key: 'cogsAccount', label: 'COGS Account', type: 'text' },
		{ key: 'returnAccount', label: 'Return Account', type: 'text' }
	],
	columns: [
		{ key: 'category', label: 'Product Category', sortable: true },
		{ key: 'inventoryAccount', label: 'Inventory Account' },
		{ key: 'salesAccount', label: 'Sales Account' },
		{ key: 'cogsAccount', label: 'COGS Account' },
		{ key: 'returnAccount', label: 'Return Account' }
	],
	searchKeys: ['category', 'inventoryAccount', 'salesAccount', 'cogsAccount', 'returnAccount'],
	defaults: () => ({ category: '' }),
	createRecord: (payload) => inventoryActions.addMapping(payload as any),
	updateRecord: (id, payload) => inventoryActions.updateMapping(id, payload),
	deleteRecord: (id) => inventoryActions.deleteMapping(id)
};
