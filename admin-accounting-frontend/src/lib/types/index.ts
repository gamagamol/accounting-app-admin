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

// Department
export interface Department {
	id: string;
	code: string;
	name: string;
	manager: string;
	costCenter: string;
	status: 'active' | 'inactive';
}

// Cost Center
export interface CostCenter {
	id: string;
	code: string;
	name: string;
	department: string;
	status: 'active' | 'inactive';
}

// Product Category
export interface ProductCategory {
	id: string;
	code: string;
	name: string;
	description: string;
}

// Payroll Component
export interface PayrollComponent {
	id: string;
	code: string;
	name: string;
	componentType: 'earning' | 'deduction' | 'employer_contribution';
	taxable: 'yes' | 'no';
	coaCode: string;
	isActive: 'active' | 'inactive';
}

// Application configuration (masterdata_config)
export interface AppConfigEntry {
	id: string;
	key: string;
	value: string;
	group: string;
	dataType: 'string' | 'number' | 'boolean' | 'json' | 'date';
	description: string;
	isPublic: 'yes' | 'no';
	isEditable: 'yes' | 'no';
}

// Chart of Account
export interface ChartOfAccount {
	id: string;
	code: string;
	name: string;
	category: 'Asset' | 'Liability' | 'Equity' | 'Revenue' | 'Expense';
	balance: number;
}

// Unit of Measurement
export interface UnitOfMeasurement {
	id: string;
	code: string;
	name: string;
	category: 'Count' | 'Weight' | 'Volume' | 'Length' | 'Time' | 'Service';
	description: string;
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

/**
 * Common free-form metadata carried by every business transaction.
 * `description` (or its `message` alias) is copied into the audit trail so
 * reviewers can see why a transaction was created, changed, or reopened.
 */
export interface TransactionMetadata {
	description?: string;
	message?: string;
}

/**
 * Canonical workflow status for every business transaction.
 * A reopened transaction is allowed to be edited again, but the change must
 * be recorded in the audit trail.
 */
export type TransactionStatus =
	| 'draft'
	| 'created'
	| 'approved'
	| 'rejected'
	| 'pending'
	| 'completed'
	| 'reopen';

// Quotation
export interface Quotation extends TransactionMetadata {
	id: string;
	date: string;
	quotationNo: string;
	transactionNo: string;
	customerId: string;
	customerName: string;
	preparedBy: string;
	salesPerson: string;
	status: TransactionStatus;
	items: TransactionItem[];
	subtotal: number;
	tax: number;
	total: number;
	notes: string;
}

// Sales Order
export interface SalesOrder extends TransactionMetadata {
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
	status: TransactionStatus;
}

// Purchase Order
export interface PurchaseOrder extends TransactionMetadata {
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
	status: TransactionStatus;
}

// Delivery Order
export interface Delivery extends TransactionMetadata {
	id: string;
	date: string;
	deliveryNo: string;
	salesNo: string;
	transactionNo: string;
	customerName: string;
	preparedBy: string;
	items: TransactionItem[];
	status: TransactionStatus;
}

// Goods Receipt
export interface GoodsReceipt extends TransactionMetadata {
	id: string;
	date: string;
	receiptNo: string;
	purchaseNo: string;
	transactionNo: string;
	supplierName: string;
	preparedBy: string;
	items: TransactionItem[];
	status: TransactionStatus;
}

// Bill Payment (Sales Invoice)
export interface BillPayment extends TransactionMetadata {
	id: string;
	date: string;
	billNo: string;
	transactionNo: string;
	supplierName: string; // Used as counterparty
	invoiceNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: TransactionStatus;
	preparedBy: string;
}

// Customer Receipt / Payment
export interface Payment extends TransactionMetadata {
	id: string;
	date: string;
	paymentNo: string;
	transactionNo: string;
	customerName: string;
	invoiceNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: TransactionStatus;
	preparedBy: string;
}

// Vendor Payment / Debt Payment
export interface DebtPayment extends TransactionMetadata {
	id: string;
	date: string;
	paymentNo: string;
	transactionNo: string;
	supplierName: string;
	purchaseNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	status: TransactionStatus;
	preparedBy: string;
}

// Purchase Invoice (vendor invoice)
export interface PurchaseInvoice extends TransactionMetadata {
	id: string;
	date: string;
	invoiceNo: string;
	purchaseNo: string;
	supplierName: string;
	dueDate: string;
	amount: number;
	status: TransactionStatus;
	preparedBy: string;
}

// Period Closing
export interface PeriodClosing extends TransactionMetadata {
	id: string;
	period: string;
	startDate: string;
	endDate: string;
	status: TransactionStatus;
	closedBy: string;
	closedAt: string;
	notes: string;
}

// Sales Return / Credit Note
export interface SalesReturn extends TransactionMetadata {
	id: string;
	returnNo: string;
	date: string;
	salesNo: string;
	customerName: string;
	reason: string;
	total: number;
	status: TransactionStatus;
}

// Purchase Return / Debit Note
export interface PurchaseReturn extends TransactionMetadata {
	id: string;
	returnNo: string;
	date: string;
	purchaseNo: string;
	supplierName: string;
	reason: string;
	total: number;
	status: TransactionStatus;
}

// Inventory Movements
export interface StockMovement extends TransactionMetadata {
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
	status: TransactionStatus;
}

// Stock Adjustment
export interface StockAdjustment extends TransactionMetadata {
	id: string;
	date: string;
	adjustmentNo: string;
	warehouse: string;
	productName: string;
	systemQty: number;
	actualQty: number;
	diffQty: number;
	reason: string;
	status: TransactionStatus;
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
export type ExpenseType =
	| 'salary'
	| 'purchase'
	| 'office_supplies'
	| 'utilities'
	| 'logistics'
	| 'maintenance'
	| 'travel'
	| 'other';

export type ExpenseStatus = TransactionStatus;

export interface ExpenseEntry extends TransactionMetadata {
	id: string;
	date: string;
	expenseNo: string;
	expenseType: ExpenseType;
	category: string;
	accountCode: string;
	accountName: string;
	departmentCode: string;
	departmentName: string;
	budgetId: string;
	budgetNo: string;
	employeeId: string;
	employeeName: string;
	supplierName: string;
	description: string;
	amount: number;
	taxAmount: number;
	totalAmount: number;
	paymentMethod: string;
	bankAccount: string;
	paidTo: string;
	status: ExpenseStatus;
	attachmentUrl: string;
	notes: string;
	submittedBy: string;
	approvedBy: string;
	postedAt: string;
	glReference: string;
}

// --- Budgeting ---
export type BudgetStatus = TransactionStatus;

export interface AnnualBudget extends TransactionMetadata {
	id: string;
	budgetNo: string;
	fiscalYear: number;
	name: string;
	departmentCode: string;
	departmentName: string;
	totalAmount: number;
	status: BudgetStatus;
	preparedBy: string;
	approvedBy: string;
	createdAt: string;
	notes: string;
}

export interface BudgetAllocation extends TransactionMetadata {
	id: string;
	budgetId: string;
	budgetNo: string;
	fiscalYear: number;
	accountCode: string;
	accountName: string;
	departmentCode: string;
	departmentName: string;
	allocatedAmount: number;
	usedAmount: number;
	notes: string;
}

export interface BudgetRevision extends TransactionMetadata {
	id: string;
	revisionNo: string;
	budgetId: string;
	budgetNo: string;
	date: string;
	requestedBy: string;
	currentAmount: number;
	requestedAmount: number;
	difference: number;
	reason: string;
	status: TransactionStatus;
}

// Bank Reconciliation
export interface BankReconciliation extends TransactionMetadata {
	id: string;
	date: string;
	bankAccount: string;
	statementBalance: number;
	glBalance: number;
	difference: number;
	status: TransactionStatus;
}

// Manual Journal Entry
export interface JournalEntry extends TransactionMetadata {
	id: string;
	date: string;
	description: string;
	debitAccount: string;
	creditAccount: string;
	amount: number;
	reference: string;
	status: TransactionStatus;
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
	badge?: boolean;
	badgeLabels?: Record<string, string>;
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

// Audit trail
export type AuditAction =
	| 'create'
	| 'update'
	| 'delete'
	| 'submit'
	| 'approve'
	| 'reject'
	| 'post'
	| 'void'
	| 'close'
	| 'reopen'
	| 'export';

export type AuditTransactionStatus = TransactionStatus;

export interface AuditLogChange {
	field: string;
	before: unknown;
	after: unknown;
}

export interface AuditLogEntry {
	id: string;
	module: string;
	entityType: string;
	entityId: string;
	documentNumber: string;
	action: AuditAction;
	status: AuditTransactionStatus;
	actor: string;
	timestamp: string;
	summary: string;
	description?: string;
	message?: string;
	changes?: AuditLogChange[];
}

// --- Pending approval workflow ---
export type PendingTransactionType =
	| 'quotation'
	| 'sales_order'
	| 'purchase_order'
	| 'delivery_order'
	| 'goods_receipt'
	| 'sales_invoice'
	| 'customer_receipt'
	| 'vendor_payment'
	| 'debt_payment'
	| 'purchase_invoice'
	| 'sales_return'
	| 'purchase_return'
	| 'stock_movement'
	| 'stock_adjustment'
	| 'annual_budget'
	| 'budget_revision'
	| 'expense'
	| 'journal_entry'
	| 'bank_reconciliation'
	| 'period_closing';

export type PendingStatus = 'pending' | 'approved' | 'rejected';

/**
 * One row from a `transaction_<type>_pending` PostgreSQL table.
 * The pending, approval, and rejection messages are stored separately so the
 * history can show who asked for approval and who decided it, and why.
 */
export interface PendingRequest {
	id: string;
	transactionType: PendingTransactionType;
	transactionId: string;
	transactionNumber: string;
	status: PendingStatus;
	requestedAt: string;
	requestedBy: string;
	pendingMessage: string;
	approvedAt?: string;
	approvedBy?: string;
	approvalMessage: string;
	rejectedAt?: string;
	rejectedBy?: string;
	rejectionMessage: string;
	createdAt: string;
	updatedAt: string;
}
