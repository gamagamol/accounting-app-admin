// User & Auth types
export interface User {
	id: string;
	name: string;
	email: string;
	role: UserRole;
	avatar?: string;
}

export type UserRole = 'SUPER_ADMIN' | 'SALES_ADMIN' | 'ACCOUNTING_ADMIN' | 'OWNER';

// Customer
export interface Customer {
	id: string;
	companyName: string;
	city: string;
	contactPerson: string;
	email: string;
	phone: string;
	nb: string;
	npwp: string;
	npwpAddress: string;
	address: string;
	termOfPayment: number;
	notes: string;
}

// Product with Goods/Service selection and expandable UoM fields
export interface Product {
	id: string;
	code?: string;
	name: string;
	itemType: 'goods' | 'service'; // Goods (Barang) or Service (Jasa)
	category: string;
	unit: string; // Base UoM
	secondaryUnit?: string;
	conversionRate?: number;
	weightKg?: number;
	barcode?: string;
	price: number;
	costPrice?: number;
	stock: number;
	minStock?: number;
	description: string;
}

// Supplier
export interface Supplier {
	id: string;
	companyName: string;
	contactPerson: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	npwp: string;
}

// Employee
export interface Employee {
	id: string;
	name: string;
	position: string;
	email: string;
	phone: string;
	address: string;
	status: 'active' | 'inactive';
}

// Chart of Account
export interface ChartOfAccount {
	id: string;
	code: string;
	name: string;
	category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
	balance: number;
}

// Warehouse / Location
export interface Warehouse {
	id: string;
	code: string;
	name: string;
	location: string;
	manager: string;
	capacity: string;
	status: 'active' | 'inactive';
}

// Tax Rate
export interface TaxRate {
	id: string;
	code: string;
	name: string;
	rate: number;
	type: 'sales' | 'purchase' | 'withholding';
	description: string;
}

// Term of Payment
export interface PaymentTerm {
	id: string;
	code: string;
	name: string;
	days: number;
	description: string;
}

// Bank & Cash Account
export interface BankAccount {
	id: string;
	code: string;
	bankName: string;
	accountNumber: string;
	accountHolder: string;
	currency: string;
	balance: number;
}

// Transaction Items
export interface TransactionItem {
	id: string;
	productId: string;
	productName: string;
	quantity: number;
	unit: string;
	unitPrice: number;
	discount: number;
	total: number;
}

// Quotation
export interface Quotation {
	id: string;
	date: string;
	quotationNo: string;
	transactionNo: string;
	customerId: string;
	customerName: string;
	preparedBy: string;
	salesPerson: string;
	status: 'quotation' | 'sales' | 'completed';
	items: TransactionItem[];
	subtotal: number;
	tax: number;
	total: number;
	notes: string;
}

// Sales Order
export interface SalesOrder {
	id: string;
	date: string;
	salesNo: string;
	transactionNo: string;
	customerId: string;
	customerName: string;
	preparedBy: string;
	items: TransactionItem[];
	subtotal: number;
	tax: number;
	total: number;
	status: 'pending' | 'delivered' | 'completed';
}

// Purchase Order
export interface PurchaseOrder {
	id: string;
	date: string;
	purchaseNo: string;
	transactionNo: string;
	supplierId: string;
	supplierName: string;
	preparedBy: string;
	items: TransactionItem[];
	subtotal: number;
	tax: number;
	total: number;
	status: 'pending' | 'received' | 'completed';
}

// Delivery Order
export interface Delivery {
	id: string;
	date: string;
	deliveryNo: string;
	salesNo: string;
	transactionNo: string;
	customerName: string;
	preparedBy: string;
	items: TransactionItem[];
	status: 'pending' | 'shipped' | 'delivered';
}

// Goods Receipt
export interface GoodsReceipt {
	id: string;
	date: string;
	receiptNo: string;
	purchaseNo: string;
	transactionNo: string;
	supplierName: string;
	preparedBy: string;
	items: TransactionItem[];
	status: 'pending' | 'received';
}

// Bill Payment (Sales Invoice)
export interface BillPayment {
	id: string;
	date: string;
	billNo: string;
	transactionNo: string;
	supplierName: string; // Used as counterparty
	invoiceNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: 'pending' | 'paid';
	preparedBy: string;
}

// Customer Receipt / Payment
export interface Payment {
	id: string;
	date: string;
	paymentNo: string;
	transactionNo: string;
	customerName: string;
	invoiceNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: 'pending' | 'paid';
	preparedBy: string;
}

// Vendor Payment / Debt Payment
export interface DebtPayment {
	id: string;
	date: string;
	paymentNo: string;
	transactionNo: string;
	supplierName: string;
	purchaseNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: 'pending' | 'paid';
	preparedBy: string;
}

// Sales Return / Credit Note
export interface SalesReturn {
	id: string;
	returnNo: string;
	date: string;
	salesNo: string;
	customerName: string;
	reason: string;
	total: number;
	status: 'pending' | 'approved' | 'completed';
}

// Purchase Return / Debit Note
export interface PurchaseReturn {
	id: string;
	returnNo: string;
	date: string;
	purchaseNo: string;
	supplierName: string;
	reason: string;
	total: number;
	status: 'pending' | 'approved' | 'completed';
}

// Inventory Movements
export interface StockMovement {
	id: string;
	date: string;
	docNo: string;
	productCode: string;
	productName: string;
	type: 'IN' | 'OUT' | 'ADJUST' | 'TRANSFER';
	warehouse: string;
	quantity: number;
	unit: string;
	reference: string;
}

// Stock Adjustment
export interface StockAdjustment {
	id: string;
	date: string;
	adjustmentNo: string;
	warehouse: string;
	productName: string;
	systemQty: number;
	actualQty: number;
	diffQty: number;
	reason: string;
	status: 'pending' | 'approved';
}

// Product Account Mapping
export interface ProductAccountMapping {
	id: string;
	category: string;
	inventoryAccount: string;
	salesAccount: string;
	cogsAccount: string;
	returnAccount: string;
}

// Expenses
export interface ExpenseEntry {
	id: string;
	date: string;
	expenseNo: string;
	category: string;
	accountCode: string;
	description: string;
	amount: number;
	paymentMethod: string;
	paidTo: string;
}

// Bank Reconciliation
export interface BankReconciliation {
	id: string;
	date: string;
	bankAccount: string;
	statementBalance: number;
	glBalance: number;
	difference: number;
	status: 'reconciled' | 'discrepancy';
}

// Manual Journal Entry
export interface JournalEntry {
	id: string;
	date: string;
	description: string;
	debitAccount: string;
	creditAccount: string;
	amount: number;
	reference: string;
}

// General Ledger Entry
export interface LedgerEntry {
	id: string;
	date: string;
	accountCode: string;
	accountName: string;
	description: string;
	debit: number;
	credit: number;
	balance: number;
}

// Dashboard Stats
export interface DashboardStats {
	sales: number;
	payable: number;
	receivable: number;
	paymentPercentage: number;
}

// Transaction Progress Funnel
export interface TransactionProgress {
	quotation: number;
	sales: number;
	purchase: number;
	goodsReceipt: number;
	delivery: number;
	billPayment: number;
	payment: number;
}

// Navigation types
export interface NavItem {
	label: string;
	href: string;
	icon: string;
	roles?: UserRole[];
}

export interface NavGroup {
	label: string;
	icon: string;
	items: NavItem[];
	roles?: UserRole[];
}

// Table Column definition
export interface TableColumn {
	key: string;
	label: string;
	sortable?: boolean;
	align?: 'left' | 'center' | 'right';
	format?: (value: any, row?: any) => string;
}

// Tab item definition
export interface TabItem {
	id: string;
	label: string;
	icon?: string;
	badge?: number | string;
}

// System Settings
export interface AppSettings {
	companyName: string;
	companyAddress: string;
	companyPhone: string;
	companyEmail: string;
	companyNpwp: string;
	currency: string;
	taxRate: number;
}
