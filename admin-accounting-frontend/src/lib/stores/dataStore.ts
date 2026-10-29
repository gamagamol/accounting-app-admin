import { writable, derived, type Writable } from 'svelte/store';
import type {
	Customer,
	Product,
	Supplier,
	Employee,
	ChartOfAccount,
	Warehouse,
	TaxRate,
	PaymentTerm,
	BankAccount,
	Quotation,
	SalesOrder,
	PurchaseOrder,
	GoodsReceipt,
	Delivery,
	BillPayment,
	Payment,
	DebtPayment,
	SalesReturn,
	PurchaseReturn,
	StockMovement,
	StockAdjustment,
	ProductAccountMapping,
	ExpenseEntry,
	BankReconciliation,
	JournalEntry,
	UnitOfMeasurement,
	PurchaseInvoice,
	PeriodClosing,
	Department,
	CostCenter,
	ProductCategory,
	PayrollComponent,
	AppConfigEntry,
	AnnualBudget,
	BudgetAllocation,
	BudgetRevision,
	AppSettings,
	TransactionItem,
	AuditAction,
	AuditLogChange,
	AuditLogEntry,
	AuditTransactionStatus,
	PendingRequest,
	PendingStatus,
	PendingTransactionType,
	TransactionStatus
} from '$lib/types';

import { normalizeTransactionStatus } from '$lib/data/transaction-statuses';
import { pendingAuditEntityType, pendingTransactionModule } from '$lib/data/pending';
import { auditApi } from '$lib/api/audit';
import { pendingApi } from '$lib/api/pending';
import { masterDataApi } from '$lib/api/master';
import { periodsApi } from '$lib/api/periods';
import { isApiConfigured } from '$lib/api/client';

// --- Audit Trail ---
export const auditLogs = writable<AuditLogEntry[]>([]);

// --- Pending approval history ---
// Mirrors rows from `transaction_<type>_pending`. In live mode the backend is
// the source of truth; in mock mode the same shape is kept locally so every
// screen can show a complete pending history.
export const pendingRequests = writable<PendingRequest[]>([]);

export interface AuditRecordInput {
	module: string;
	entityType: string;
	entityId: string;
	documentNumber: string;
	action: AuditAction;
	status?: AuditTransactionStatus;
	actor?: string;
	summary: string;
	/** Free-form transaction description/message copied into the audit trail. */
	description?: string;
	message?: string;
	before?: Record<string, unknown> | null;
	after?: Record<string, unknown> | null;
	changes?: AuditLogChange[];
	timestamp?: string;
}

function defaultStatusForAction(action: AuditAction): AuditTransactionStatus {
	switch (action) {
		case 'create':
			return 'created';
		case 'approve':
			return 'approved';
		case 'reject':
		case 'void':
			return 'rejected';
		case 'submit':
			return 'pending';
		case 'reopen':
			return 'reopen';
		case 'post':
		case 'close':
		case 'export':
		case 'delete':
			return 'completed';
		default:
			return 'pending';
	}
}

function diffRecord(
	before: Record<string, unknown> | null | undefined,
	after: Record<string, unknown> | null | undefined
): AuditLogChange[] {
	if (!before || !after) return [];
	const keys = new Set([...Object.keys(before), ...Object.keys(after)]);
	const changes: AuditLogChange[] = [];
	for (const key of keys) {
		const beforeValue = before[key];
		const afterValue = after[key];
		if (JSON.stringify(beforeValue) !== JSON.stringify(afterValue)) {
			changes.push({ field: key, before: beforeValue, after: afterValue });
		}
	}
	return changes;
}

function textValue(value: unknown): string | undefined {
	if (typeof value !== 'string') return undefined;
	const trimmed = value.trim();
	return trimmed.length > 0 ? trimmed : undefined;
}

function sortNewestFirst(entries: AuditLogEntry[]): AuditLogEntry[] {
	return [...entries].sort(
		(left, right) => new Date(right.timestamp).getTime() - new Date(left.timestamp).getTime()
	);
}

export const auditLogActions = {
	record(input: AuditRecordInput): AuditLogEntry {
		const description =
			textValue(input.description) ??
			textValue(input.message) ??
			textValue(input.after?.description) ??
			textValue(input.after?.message) ??
			input.summary;

		const entry: AuditLogEntry = {
			id: `audit-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
			module: input.module,
			entityType: input.entityType,
			entityId: input.entityId,
			documentNumber: input.documentNumber,
			action: input.action,
			status:
				input.status ??
				normalizeTransactionStatus(input.after?.status) ??
				normalizeTransactionStatus(input.before?.status) ??
				defaultStatusForAction(input.action),
			actor: input.actor || 'System',
			timestamp: input.timestamp || new Date().toISOString(),
			summary: input.summary,
			description,
			changes: input.changes ?? diffRecord(input.before, input.after)
		};

		auditLogs.update((list) => [entry, ...list]);

		if (isApiConfigured) {
			void auditApi.create(entry).catch((error) => {
				console.warn(`[audit] failed to persist audit entry ${entry.id}`, error);
			});
		}

		return entry;
	},

	async load(entityType: string, entityId: string, limit = 100): Promise<void> {
		if (!isApiConfigured || !entityType || !entityId) return;

		try {
			const result = await auditApi.list({ entityType, entityId, limit });
			const remoteEntries = result.data ?? [];
			if (remoteEntries.length === 0) return;

			auditLogs.update((list) => {
				const existing = new Set(list.map((entry) => entry.id));
				const merged = [...remoteEntries.filter((entry) => !existing.has(entry.id)), ...list];
				return sortNewestFirst(merged);
			});
		} catch (error) {
			console.warn(`[audit] failed to load audit entries for ${entityType}/${entityId}`, error);
		}
	},

	deleteForEntity(entityType: string, entityId: string) {
		auditLogs.update((list) =>
			list.filter((entry) => !(entry.entityType === entityType && entry.entityId === entityId))
		);

		if (isApiConfigured) {
			void auditApi.deleteForEntity(entityType, entityId).catch((error) => {
				console.warn(`[audit] failed to delete audit entries for ${entityType}/${entityId}`, error);
			});
		}
	}
};

// --- Master Data Stores ---
// Operational stores start empty. Master data is hydrated from the backend so
// the UI never shows fabricated customers, products, journals, budgets or stock.
export const customers = writable<Customer[]>([]);
export const products = writable<Product[]>([]);
export const suppliers = writable<Supplier[]>([]);
export const employees = writable<Employee[]>([]);
export const departments = writable<Department[]>([]);
export const costCenters = writable<CostCenter[]>([]);
export const productCategories = writable<ProductCategory[]>([]);
export const payrollComponents = writable<PayrollComponent[]>([]);
export const appConfigs = writable<AppConfigEntry[]>([]);
export const chartOfAccounts = writable<ChartOfAccount[]>([]);
export const warehouses = writable<Warehouse[]>([]);
export const taxRates = writable<TaxRate[]>([]);
export const paymentTerms = writable<PaymentTerm[]>([]);
export const bankAccounts = writable<BankAccount[]>([]);
export const unitsOfMeasurement = writable<UnitOfMeasurement[]>([]);

// --- Transactions ---
export const quotations = writable<Quotation[]>([]);
export const salesOrders = writable<SalesOrder[]>([]);
export const purchaseOrders = writable<PurchaseOrder[]>([]);
export const goodsReceipts = writable<GoodsReceipt[]>([]);
export const deliveries = writable<Delivery[]>([]);
export const billPayments = writable<BillPayment[]>([]);
export const payments = writable<Payment[]>([]);
export const debtPayments = writable<DebtPayment[]>([]);
export const salesReturns = writable<SalesReturn[]>([]);
export const purchaseReturns = writable<PurchaseReturn[]>([]);

// --- Inventory ---
export const stockMovements = writable<StockMovement[]>([]);
export const stockAdjustments = writable<StockAdjustment[]>([]);
export const productAccountMappings = writable<ProductAccountMapping[]>([]);

// --- Accounting & Financial Entries ---
export const expenses = writable<ExpenseEntry[]>([]);
export const annualBudgets = writable<AnnualBudget[]>([]);
export const budgetAllocations = writable<BudgetAllocation[]>([]);
export const budgetRevisions = writable<BudgetRevision[]>([]);
export const bankReconciliations = writable<BankReconciliation[]>([]);
export const purchaseInvoices = writable<PurchaseInvoice[]>([]);
export const periodClosings = writable<PeriodClosing[]>([]);
export const journalEntries = writable<JournalEntry[]>([]);

export const appSettings = writable<AppSettings>({
	companyName: 'Nama Perusahaan',
	companyAddress: 'Jakarta',
	companyPhone: '',
	companyEmail: 'info@byond.co.id',
	companyNpwp: '',
	currency: 'IDR',
	taxRate: 11
});

// --- Alerts ---
export interface SystemAlert {
	id: string;
	title: string;
	message: string;
	type: 'debt' | 'receivable' | 'warning' | 'info';
	referenceNo: string;
	link: string;
	date: string;
	read: boolean;
}

export const systemAlerts = writable<SystemAlert[]>([]);

interface ProductCategoryRow {
	id: number;
	code: string;
	name: string;
	description?: string | null;
}

function accountCategory(value: string): ChartOfAccount['category'] {
	switch (value.toLowerCase()) {
		case 'liability':
			return 'Liability';
		case 'equity':
			return 'Equity';
		case 'revenue':
			return 'Revenue';
		case 'expense':
			return 'Expense';
		default:
			return 'Asset';
	}
}

function taxType(value: string): TaxRate['type'] {
	if (value === 'purchase' || value === 'withholding') return value;
	return 'sales';
}

function uomCategory(code: string): UnitOfMeasurement['category'] {
	const normalized = code.toUpperCase();
	if (['KG', 'G'].includes(normalized)) return 'Weight';
	if (['L', 'ML'].includes(normalized)) return 'Volume';
	if (['M', 'CM'].includes(normalized)) return 'Length';
	if (['HOUR', 'DAY'].includes(normalized)) return 'Time';
	if (normalized === 'SERVICE') return 'Service';
	return 'Count';
}

function yesNo(value: unknown): 'yes' | 'no' {
	return value === true || value === 'yes' || value === 'true' || value === 1 ? 'yes' : 'no';
}

function activeFlag(value: unknown): 'active' | 'inactive' {
	return value === true || value === 'active' || value === 'true' ? 'active' : 'inactive';
}

/**
 * Load every master-data table from the backend and replace the local stores.
 * Operational data (journals, sales, purchases, inventory, budgets and
 * expenses) is always loaded from its own API and is never seeded in the
 * browser.
 */
export async function hydrateMasterData(): Promise<void> {
	if (!isApiConfigured) return;

	try {
		const [
			customersResult,
			productsResult,
			suppliersResult,
			employeesResult,
			departmentsResult,
			costCentersResult,
			categoriesResult,
			payrollResult,
			configsResult,
			coaResult,
			warehousesResult,
			taxResult,
			termsResult,
			banksResult,
			uomsResult,
			mappingsResult,
			companyResult
		] = await Promise.all([
			masterDataApi.list<Record<string, any>>('customers'),
			masterDataApi.list<Record<string, any>>('products'),
			masterDataApi.list<Record<string, any>>('suppliers'),
			masterDataApi.list<Record<string, any>>('employees'),
			masterDataApi.list<Record<string, any>>('departments'),
			masterDataApi.list<Record<string, any>>('cost-centers'),
			masterDataApi.list<ProductCategoryRow>('product-categories'),
			masterDataApi.list<Record<string, any>>('payroll-components'),
			masterDataApi.list<Record<string, any>>('app-configs'),
			masterDataApi.list<Record<string, any>>('coa'),
			masterDataApi.list<Record<string, any>>('warehouses'),
			masterDataApi.list<Record<string, any>>('tax-rates'),
			masterDataApi.list<Record<string, any>>('payment-terms'),
			masterDataApi.list<Record<string, any>>('bank-accounts'),
			masterDataApi.list<Record<string, any>>('uoms'),
			masterDataApi.list<Record<string, any>>('product-account-mappings'),
			masterDataApi.list<Record<string, any>>('company-profile')
		]);

		const customerRows = customersResult.data ?? [];
		const productRows = productsResult.data ?? [];
		const supplierRows = suppliersResult.data ?? [];
		const employeeRows = employeesResult.data ?? [];
		const departmentRows = departmentsResult.data ?? [];
		const costCenterRows = costCentersResult.data ?? [];
		const categoryRows = categoriesResult.data ?? [];
		const payrollRows = payrollResult.data ?? [];
		const configRows = configsResult.data ?? [];
		const coaRows = coaResult.data ?? [];
		const warehouseRows = warehousesResult.data ?? [];
		const taxRows = taxResult.data ?? [];
		const termRows = termsResult.data ?? [];
		const bankRows = banksResult.data ?? [];
		const uomRows = uomsResult.data ?? [];
		const mappingRows = mappingsResult.data ?? [];
		const companyRows = companyResult.data ?? [];

		customers.set(
			customerRows.map((row) => ({
				id: String(row.id),
				companyName: row.companyName ?? '',
				city: row.city ?? '',
				contactPerson: row.contactPerson ?? '',
				email: row.email ?? '',
				phone: row.phone ?? '',
				nb: row.nb ?? '',
				npwp: row.npwp ?? '',
				npwpAddress: row.npwpAddress ?? '',
				address: row.address ?? '',
				termOfPayment: Number(row.termOfPayment) || 0,
				notes: row.notes ?? ''
			}))
		);

		products.set(
			productRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				itemType: row.itemType === 'service' ? 'service' : 'goods',
				category: row.category ?? '',
				unit: row.unit ?? '',
				secondaryUnit: row.secondaryUnit ?? '',
				conversionRate: Number(row.conversionRate) || 0,
				weightKg: Number(row.weightKg) || 0,
				barcode: row.barcode ?? '',
				price: Number(row.price) || 0,
				costPrice: Number(row.costPrice) || 0,
				stock: Number(row.stock) || 0,
				minStock: Number(row.minStock) || 0,
				description: row.description ?? ''
			}))
		);

		suppliers.set(
			supplierRows.map((row) => ({
				id: String(row.id),
				companyName: row.companyName ?? '',
				contactPerson: row.contactPerson ?? '',
				email: row.email ?? '',
				phone: row.phone ?? '',
				address: row.address ?? '',
				city: row.city ?? '',
				npwp: row.npwp ?? ''
			}))
		);

		employees.set(
			employeeRows.map((row) => ({
				id: String(row.id),
				name: row.name ?? '',
				position: row.position ?? '',
				email: row.email ?? '',
				phone: row.phone ?? '',
				address: row.address ?? '',
				status: row.status === 'resigned' ? 'inactive' : row.status === 'inactive' ? 'inactive' : 'active'
			}))
		);

		departments.set(
			departmentRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				manager: row.manager ?? '',
				costCenter: row.costCenter ?? '',
				status: row.status === 'inactive' ? 'inactive' : 'active'
			}))
		);

		costCenters.set(
			costCenterRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				department: row.department ?? '',
				status: row.status === 'inactive' ? 'inactive' : 'active'
			}))
		);

		productCategories.set(
			categoryRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				description: row.description ?? ''
			}))
		);

		payrollComponents.set(
			payrollRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				componentType:
					row.componentType === 'deduction' || row.componentType === 'employer_contribution'
						? row.componentType
						: 'earning',
				taxable: yesNo(row.taxable),
				coaCode: row.coaCode ?? '',
				isActive: activeFlag(row.isActive)
			}))
		);

		appConfigs.set(
			configRows.map((row) => ({
				id: String(row.id),
				key: row.key ?? '',
				value: row.value ?? '',
				group: row.group ?? 'general',
				dataType: row.dataType ?? 'string',
				description: row.description ?? '',
				isPublic: yesNo(row.isPublic),
				isEditable: yesNo(row.isEditable)
			}))
		);

		chartOfAccounts.set(
			coaRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				category: accountCategory(String(row.category ?? row.accountType ?? '')),
				balance: Number(row.balance) || 0
			}))
		);

		warehouses.set(
			warehouseRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				location: row.location ?? '',
				manager: row.manager ?? '',
				capacity: row.capacity ?? '',
				status: row.status === 'inactive' ? 'inactive' : 'active'
			}))
		);

		taxRates.set(
			taxRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				rate: Number(row.rate) || 0,
				type: taxType(String(row.type ?? row.taxType ?? 'sales')),
				description: row.description ?? ''
			}))
		);

		paymentTerms.set(
			termRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				days: Number(row.days) || 0,
				description: row.description ?? ''
			}))
		);

		bankAccounts.set(
			bankRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				bankName: row.bankName ?? '',
				accountNumber: row.accountNumber ?? '',
				accountHolder: row.accountHolder ?? '',
				currency: row.currency ?? 'IDR',
				balance: Number(row.balance) || 0
			}))
		);

		unitsOfMeasurement.set(
			uomRows.map((row) => ({
				id: String(row.id),
				code: row.code ?? '',
				name: row.name ?? '',
				category: uomCategory(String(row.category ?? row.code ?? '')),
				description: row.description ?? ''
			}))
		);

		productAccountMappings.set(
			mappingRows.map((row) => ({
				id: String(row.id),
				category: row.category ?? '',
				inventoryAccount: row.inventoryAccount ?? '',
				salesAccount: row.salesAccount ?? '',
				cogsAccount: row.cogsAccount ?? '',
				returnAccount: row.returnAccount ?? ''
			}))
		);

		const company = companyRows[0];
		const defaultTax = company
			? taxRows.find((row) => Number(row.id) === Number(company.defaultTaxRateId))
			: undefined;
		appSettings.set({
			companyName: company?.companyName || 'Nama Perusahaan',
			companyAddress: company?.address || '',
			companyPhone: company?.phone || '',
			companyEmail: company?.email || '',
			companyNpwp: company?.npwp || '',
			currency: company?.currency || 'IDR',
			taxRate: defaultTax ? Number(defaultTax.rate) || 0 : 11
		});
	} catch (error) {
		console.warn('[master-data] failed to hydrate master data from API', error);
	}
}

/**
 * Load accounting periods (including closed periods) from the backend.
 * Closed periods stay in the store so transaction tables can show locked rows
 * instead of appearing empty.
 */
export async function hydratePeriods(): Promise<void> {
	if (!isApiConfigured) return;

	try {
		const result = await periodsApi.list();
		const rows = result.data ?? [];
		periodClosings.set(
			rows.map((row) => ({
				id: String(row.id),
				period: row.period ?? '',
				startDate: row.startDate ?? '',
				endDate: row.endDate ?? '',
				status:
					row.status === 'closed' || row.closingStatus === 'completed'
						? 'completed'
						: 'pending',
				closedBy: row.closedBy ?? '',
				closedAt: row.closedAt ? String(row.closedAt).slice(0, 10) : '',
				notes: row.notes ?? ''
			}))
		);
	} catch (error) {
		console.warn('[accounting-periods] failed to hydrate periods from API', error);
	}
}

// --- Master Data Actions (persisted through the backend) ---
async function refreshMasterData(): Promise<void> {
	await hydrateMasterData();
}

export const customerActions = {
	async add(item: Omit<Customer, 'id'>) {
		await masterDataApi.create('customers', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Customer>) {
		await masterDataApi.update('customers', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('customers', id);
		await refreshMasterData();
	}
};

export const productActions = {
	async add(item: Omit<Product, 'id'>) {
		await masterDataApi.create('products', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Product>) {
		await masterDataApi.update('products', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('products', id);
		await refreshMasterData();
	}
};

export const supplierActions = {
	async add(item: Omit<Supplier, 'id'>) {
		await masterDataApi.create('suppliers', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Supplier>) {
		await masterDataApi.update('suppliers', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('suppliers', id);
		await refreshMasterData();
	}
};

export const employeeActions = {
	async add(item: Omit<Employee, 'id'>) {
		await masterDataApi.create('employees', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Employee>) {
		await masterDataApi.update('employees', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('employees', id);
		await refreshMasterData();
	}
};

export const coaActions = {
	async add(item: Omit<ChartOfAccount, 'id'>) {
		await masterDataApi.create('coa', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<ChartOfAccount>) {
		await masterDataApi.update('coa', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('coa', id);
		await refreshMasterData();
	}
};

export const warehouseActions = {
	async add(item: Omit<Warehouse, 'id'>) {
		await masterDataApi.create('warehouses', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Warehouse>) {
		await masterDataApi.update('warehouses', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('warehouses', id);
		await refreshMasterData();
	}
};

export const taxRateActions = {
	async add(item: Omit<TaxRate, 'id'>) {
		await masterDataApi.create('tax-rates', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<TaxRate>) {
		await masterDataApi.update('tax-rates', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('tax-rates', id);
		await refreshMasterData();
	}
};

export const paymentTermActions = {
	async add(item: Omit<PaymentTerm, 'id'>) {
		await masterDataApi.create('payment-terms', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<PaymentTerm>) {
		await masterDataApi.update('payment-terms', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('payment-terms', id);
		await refreshMasterData();
	}
};

export const bankAccountActions = {
	async add(item: Omit<BankAccount, 'id'>) {
		await masterDataApi.create('bank-accounts', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<BankAccount>) {
		await masterDataApi.update('bank-accounts', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('bank-accounts', id);
		await refreshMasterData();
	}
};

export const unitActions = {
	async add(item: Omit<UnitOfMeasurement, 'id'>) {
		await masterDataApi.create('uoms', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<UnitOfMeasurement>) {
		await masterDataApi.update('uoms', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('uoms', id);
		await refreshMasterData();
	}
};

// --- Transaction Actions ---
export const billActions = {
	add(item: Omit<BillPayment, 'id'>) {
		const newBill: BillPayment = { id: `bill-${Date.now().toString(36)}`, ...item };
		billPayments.update((list) => [newBill, ...list]);
		return newBill;
	},
	update(id: string, data: Partial<BillPayment>) {
		billPayments.update((list) => list.map((b) => (b.id === id ? { ...b, ...data } : b)));
	},
	delete(id: string) {
		billPayments.update((list) => list.filter((b) => b.id !== id));
	},
	recordPayment(billId: string, method: 'cash' | 'transfer' | 'check' = 'transfer', authorName = 'Finance Team') {
		let createdPayment: Payment | null = null;
		billPayments.update((list) =>
			list.map((b) => {
				if (b.id === billId) {
					createdPayment = {
						id: `pay-${Date.now().toString(36)}`,
						date: new Date().toISOString().split('T')[0],
						paymentNo: `PAY/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
						transactionNo: b.transactionNo,
						customerName: b.supplierName,
						invoiceNo: b.billNo,
						amount: b.amount,
						method,
						status: 'completed',
						preparedBy: authorName
					};
					return { ...b, status: 'completed' };
				}
				return b;
			})
		);
		if (createdPayment) {
			payments.update((list) => [createdPayment!, ...list]);
		}
		return createdPayment;
	}
};

export const paymentActions = {
	add(item: Omit<Payment, 'id'>) {
		const newPay: Payment = { id: `pay-${Date.now().toString(36)}`, ...item };
		payments.update((list) => [newPay, ...list]);
		return newPay;
	},
	update(id: string, data: Partial<Payment>) {
		payments.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
	},
	delete(id: string) {
		payments.update((list) => list.filter((p) => p.id !== id));
	}
};

export const debtPaymentActions = {
	add(item: Omit<DebtPayment, 'id'>) {
		const newDebtPay: DebtPayment = { id: `dp-${Date.now().toString(36)}`, ...item };
		debtPayments.update((list) => [newDebtPay, ...list]);
		return newDebtPay;
	},
	update(id: string, data: Partial<DebtPayment>) {
		debtPayments.update((list) => list.map((d) => (d.id === id ? { ...d, ...data } : d)));
	},
	delete(id: string) {
		debtPayments.update((list) => list.filter((d) => d.id !== id));
	}
};

export const salesReturnActions = {
	add(item: Omit<SalesReturn, 'id'>) {
		const newSR: SalesReturn = { id: `sr-${Date.now().toString(36)}`, ...item };
		salesReturns.update((list) => [newSR, ...list]);
		return newSR;
	},
	update(id: string, data: Partial<SalesReturn>) {
		salesReturns.update((list) => list.map((sr) => (sr.id === id ? { ...sr, ...data } : sr)));
	},
	delete(id: string) {
		salesReturns.update((list) => list.filter((sr) => sr.id !== id));
	}
};

export const purchaseReturnActions = {
	add(item: Omit<PurchaseReturn, 'id'>) {
		const newPR: PurchaseReturn = { id: `pr-${Date.now().toString(36)}`, ...item };
		purchaseReturns.update((list) => [newPR, ...list]);
		return newPR;
	},
	update(id: string, data: Partial<PurchaseReturn>) {
		purchaseReturns.update((list) => list.map((pr) => (pr.id === id ? { ...pr, ...data } : pr)));
	},
	delete(id: string) {
		purchaseReturns.update((list) => list.filter((pr) => pr.id !== id));
	}
};

export const inventoryActions = {
	addMovement(item: Omit<StockMovement, 'id'>) {
		const newM: StockMovement = { id: `sm-${Date.now().toString(36)}`, ...item };
		stockMovements.update((list) => [newM, ...list]);
		return newM;
	},
	updateMovement(id: string, data: Partial<StockMovement>) {
		stockMovements.update((list) => list.map((m) => (m.id === id ? { ...m, ...data } : m)));
	},
	deleteMovement(id: string) {
		stockMovements.update((list) => list.filter((m) => m.id !== id));
	},
	addAdjustment(item: Omit<StockAdjustment, 'id'>) {
		const newA: StockAdjustment = { id: `adj-${Date.now().toString(36)}`, ...item };
		stockAdjustments.update((list) => [newA, ...list]);
		return newA;
	},
	updateAdjustment(id: string, data: Partial<StockAdjustment>) {
		stockAdjustments.update((list) => list.map((a) => (a.id === id ? { ...a, ...data } : a)));
	},
	deleteAdjustment(id: string) {
		stockAdjustments.update((list) => list.filter((a) => a.id !== id));
	},
	async addMapping(item: Omit<ProductAccountMapping, 'id'>) {
		const result = await masterDataApi.create<ProductAccountMapping>(
			'product-account-mappings',
			item as unknown as Record<string, unknown>
		);
		await refreshMasterData();
		return result.data;
	},
	async updateMapping(id: string, data: Partial<ProductAccountMapping>) {
		await masterDataApi.update(
			'product-account-mappings',
			id,
			data as unknown as Record<string, unknown>
		);
		await refreshMasterData();
	},
	async deleteMapping(id: string) {
		await masterDataApi.delete('product-account-mappings', id);
		await refreshMasterData();
	}
};

export const departmentActions = {
	async add(item: Omit<Department, 'id'>) {
		await masterDataApi.create('departments', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<Department>) {
		await masterDataApi.update('departments', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('departments', id);
		await refreshMasterData();
	}
};

export const costCenterActions = {
	async add(item: Omit<CostCenter, 'id'>) {
		await masterDataApi.create('cost-centers', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<CostCenter>) {
		await masterDataApi.update('cost-centers', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('cost-centers', id);
		await refreshMasterData();
	}
};

export const productCategoryActions = {
	async add(item: Omit<ProductCategory, 'id'>) {
		await masterDataApi.create('product-categories', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<ProductCategory>) {
		await masterDataApi.update(
			'product-categories',
			id,
			data as unknown as Record<string, unknown>
		);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('product-categories', id);
		await refreshMasterData();
	}
};

export const payrollComponentActions = {
	async add(item: Omit<PayrollComponent, 'id'>) {
		await masterDataApi.create('payroll-components', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<PayrollComponent>) {
		await masterDataApi.update(
			'payroll-components',
			id,
			data as unknown as Record<string, unknown>
		);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('payroll-components', id);
		await refreshMasterData();
	}
};

export const appConfigActions = {
	async add(item: Omit<AppConfigEntry, 'id'>) {
		await masterDataApi.create('app-configs', item as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async update(id: string, data: Partial<AppConfigEntry>) {
		await masterDataApi.update('app-configs', id, data as unknown as Record<string, unknown>);
		await refreshMasterData();
	},
	async delete(id: string) {
		await masterDataApi.delete('app-configs', id);
		await refreshMasterData();
	}
};

export const expenseActions = {
	add(item: Omit<ExpenseEntry, 'id'>) {
		const newExp: ExpenseEntry = { id: `exp-${Date.now().toString(36)}`, ...item };
		expenses.update((list) => [newExp, ...list]);
		return newExp;
	},
	update(id: string, data: Partial<ExpenseEntry>) {
		expenses.update((list) => list.map((e) => (e.id === id ? { ...e, ...data } : e)));
	},
	delete(id: string) {
		expenses.update((list) => list.filter((e) => e.id !== id));
	},
	submit(id: string, submittedBy = '') {
		expenses.update((list) =>
			list.map((e) =>
				e.id === id
					? { ...e, status: 'pending', submittedBy: submittedBy || e.submittedBy }
					: e
			)
		);
	},
	approve(id: string, approvedBy = '') {
		expenses.update((list) =>
			list.map((e) =>
				e.id === id
					? { ...e, status: 'approved', approvedBy: approvedBy || e.approvedBy }
					: e
			)
		);
	},
	reject(id: string, approvedBy = '') {
		expenses.update((list) =>
			list.map((e) =>
				e.id === id
					? { ...e, status: 'rejected', approvedBy: approvedBy || e.approvedBy }
					: e
			)
		);
	},
	post(id: string, glReference = '') {
		const postedAt = new Date().toISOString().split('T')[0];
		expenses.update((list) =>
			list.map((e) =>
				e.id === id
					? {
							...e,
							status: 'completed',
							postedAt,
							glReference: glReference || `JE/${new Date().getFullYear()}/EXP/${e.expenseNo.split('/').pop()}`
						}
					: e
			)
		);
	}
};

export const budgetingActions = {
	addBudget(item: Omit<AnnualBudget, 'id'>) {
		const newBudget: AnnualBudget = { id: `bud-${Date.now().toString(36)}`, ...item };
		annualBudgets.update((list) => [newBudget, ...list]);
		return newBudget;
	},
	updateBudget(id: string, data: Partial<AnnualBudget>) {
		annualBudgets.update((list) => list.map((b) => (b.id === id ? { ...b, ...data } : b)));
	},
	deleteBudget(id: string) {
		annualBudgets.update((list) => list.filter((b) => b.id !== id));
		budgetAllocations.update((list) => list.filter((a) => a.budgetId !== id));
		budgetRevisions.update((list) => list.filter((r) => r.budgetId !== id));
	},
	submitBudget(id: string) {
		annualBudgets.update((list) =>
			list.map((b) => (b.id === id ? { ...b, status: 'pending' } : b))
		);
	},
	approveBudget(id: string, approvedBy = '') {
		annualBudgets.update((list) =>
			list.map((b) =>
				b.id === id
					? { ...b, status: 'approved', approvedBy: approvedBy || b.approvedBy }
					: b
			)
		);
	},
	rejectBudget(id: string) {
		annualBudgets.update((list) =>
			list.map((b) => (b.id === id ? { ...b, status: 'rejected' } : b))
		);
	},
	closeBudget(id: string) {
		annualBudgets.update((list) =>
			list.map((b) => (b.id === id ? { ...b, status: 'completed' } : b))
		);
	},
	addAllocation(item: Omit<BudgetAllocation, 'id'>) {
		const newAlloc: BudgetAllocation = { id: `ball-${Date.now().toString(36)}`, ...item };
		budgetAllocations.update((list) => [newAlloc, ...list]);
		return newAlloc;
	},
	updateAllocation(id: string, data: Partial<BudgetAllocation>) {
		budgetAllocations.update((list) =>
			list.map((a) => (a.id === id ? { ...a, ...data } : a))
		);
	},
	deleteAllocation(id: string) {
		budgetAllocations.update((list) => list.filter((a) => a.id !== id));
	},
	addRevision(item: Omit<BudgetRevision, 'id'>) {
		const newRevision: BudgetRevision = { id: `brev-${Date.now().toString(36)}`, ...item };
		budgetRevisions.update((list) => [newRevision, ...list]);
		return newRevision;
	},
	updateRevision(id: string, data: Partial<BudgetRevision>) {
		budgetRevisions.update((list) =>
			list.map((r) => (r.id === id ? { ...r, ...data } : r))
		);
	},
	deleteRevision(id: string) {
		budgetRevisions.update((list) => list.filter((r) => r.id !== id));
	},
	approveRevision(id: string) {
		budgetRevisions.update((list) =>
			list.map((r) => (r.id === id ? { ...r, status: 'approved' } : r))
		);
	},
	rejectRevision(id: string) {
		budgetRevisions.update((list) =>
			list.map((r) => (r.id === id ? { ...r, status: 'rejected' } : r))
		);
	}
};

export const bankReconciliationActions = {
	add(item: Omit<BankReconciliation, 'id'>) {
		const newRec: BankReconciliation = { id: `rec-${Date.now().toString(36)}`, ...item };
		bankReconciliations.update((list) => [newRec, ...list]);
		return newRec;
	},
	update(id: string, data: Partial<BankReconciliation>) {
		bankReconciliations.update((list) => list.map((r) => (r.id === id ? { ...r, ...data } : r)));
	},
	delete(id: string) {
		bankReconciliations.update((list) => list.filter((r) => r.id !== id));
	},
	reconcile(id: string) {
		bankReconciliations.update((list) =>
			list.map((r) =>
				r.id === id
					? { ...r, status: 'completed', glBalance: r.statementBalance, difference: 0 }
					: r
			)
		);
	}
};

export const journalActions = {
	add(item: Omit<JournalEntry, 'id'>) {
		const newEntry: JournalEntry = { id: `je-${Date.now().toString(36)}`, ...item };
		journalEntries.update((list) => [newEntry, ...list]);
		return newEntry;
	},
	update(id: string, data: Partial<JournalEntry>) {
		journalEntries.update((list) => list.map((j) => (j.id === id ? { ...j, ...data } : j)));
	},
	delete(id: string) {
		journalEntries.update((list) => list.filter((j) => j.id !== id));
	}
};

export const purchaseInvoiceActions = {
	add(item: Omit<PurchaseInvoice, 'id'>) {
		const newInv: PurchaseInvoice = { id: `pinv-${Date.now().toString(36)}`, ...item };
		purchaseInvoices.update((list) => [newInv, ...list]);
		return newInv;
	},
	update(id: string, data: Partial<PurchaseInvoice>) {
		purchaseInvoices.update((list) => list.map((i) => (i.id === id ? { ...i, ...data } : i)));
	},
	delete(id: string) {
		purchaseInvoices.update((list) => list.filter((i) => i.id !== id));
	},
	markPaid(id: string) {
		purchaseInvoices.update((list) => list.map((i) => (i.id === id ? { ...i, status: 'completed' } : i)));
	}
};

export const periodClosingActions = {
	async add(item: Omit<PeriodClosing, 'id'>) {
		if (isApiConfigured) {
			const created = await periodsApi.create({
				period: item.period,
				startDate: item.startDate,
				endDate: item.endDate,
				status: 'open',
				notes: item.notes
			});
			if (item.status === 'completed' && created.data?.id) {
				await periodsApi.close(created.data.id, { actor: item.closedBy || 'Frontend User' });
			}
			await hydratePeriods();
			return;
		}
		const newPeriod: PeriodClosing = { id: `pc-${Date.now().toString(36)}`, ...item };
		periodClosings.update((list) => [newPeriod, ...list]);
		return newPeriod;
	},
	async update(id: string, data: Partial<PeriodClosing>) {
		if (isApiConfigured) {
			await periodsApi.update(Number(id), {
				period: data.period,
				startDate: data.startDate,
				endDate: data.endDate,
				status:
					data.status === undefined
						? undefined
						: data.status === 'completed'
							? 'closed'
							: 'open',
				notes: data.notes
			});
			await hydratePeriods();
			return;
		}
		periodClosings.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
	},
	async delete(id: string) {
		if (isApiConfigured) {
			await periodsApi.delete(Number(id));
			await hydratePeriods();
			return;
		}
		periodClosings.update((list) => list.filter((p) => p.id !== id));
	},
	async closePeriod(id: string, closedBy = 'Bambang Soepomo') {
		if (isApiConfigured) {
			await periodsApi.close(Number(id), { actor: closedBy });
			await hydratePeriods();
			return;
		}
		periodClosings.update((list) =>
			list.map((p) =>
				p.id === id
					? {
							...p,
							status: 'completed',
							closedBy,
							closedAt: new Date().toISOString().split('T')[0]
						}
					: p
			)
		);
	},
	async reopenPeriod(id: string) {
		if (isApiConfigured) {
			await periodsApi.reopen(Number(id));
			await hydratePeriods();
			return;
		}
		periodClosings.update((list) =>
			list.map((p) =>
				p.id === id ? { ...p, status: 'pending', closedBy: '', closedAt: '' } : p
			)
		);
	}
};

export const alertActions = {
	dismiss(id: string) {
		systemAlerts.update((list) => list.filter((a) => a.id !== id));
	},
	markAsRead(id: string) {
		systemAlerts.update((list) => list.map((a) => (a.id === id ? { ...a, read: true } : a)));
	}
};

// --- Pending Approval Actions ---
export interface CreatePendingRequestInput {
	transactionType: PendingTransactionType;
	transactionId: string;
	transactionNumber: string;
	requestedBy: string;
	pendingMessage: string;
	actorRole?: string;
}

export interface PendingDecisionInput {
	actor: string;
	actorRole: string;
	decisionMessage: string;
}

function updateTransactionStatus<T extends { id: string; status: TransactionStatus }>(
	store: Writable<T[]>,
	id: string,
	status: TransactionStatus
) {
	store.update((list) => list.map((item) => (item.id === id ? { ...item, status } : item)));
}

/**
 * Update the transaction status in the correct local store after a pending
 * request or decision. Keeping this mapping in one place prevents each detail
 * page from implementing its own status transition.
 */
export function setTransactionStatus(
	transactionType: PendingTransactionType,
	id: string,
	status: TransactionStatus
) {
	switch (transactionType) {
		case 'quotation':
			updateTransactionStatus(quotations, id, status);
			break;
		case 'sales_order':
			updateTransactionStatus(salesOrders, id, status);
			break;
		case 'purchase_order':
			updateTransactionStatus(purchaseOrders, id, status);
			break;
		case 'delivery_order':
			updateTransactionStatus(deliveries, id, status);
			break;
		case 'goods_receipt':
			updateTransactionStatus(goodsReceipts, id, status);
			break;
		case 'sales_invoice':
			updateTransactionStatus(billPayments, id, status);
			break;
		case 'customer_receipt':
			updateTransactionStatus(payments, id, status);
			break;
		case 'vendor_payment':
		case 'debt_payment':
			updateTransactionStatus(debtPayments, id, status);
			break;
		case 'purchase_invoice':
			updateTransactionStatus(purchaseInvoices, id, status);
			break;
		case 'sales_return':
			updateTransactionStatus(salesReturns, id, status);
			break;
		case 'purchase_return':
			updateTransactionStatus(purchaseReturns, id, status);
			break;
		case 'stock_movement':
			updateTransactionStatus(stockMovements, id, status);
			break;
		case 'stock_adjustment':
			updateTransactionStatus(stockAdjustments, id, status);
			break;
		case 'annual_budget':
			updateTransactionStatus(annualBudgets, id, status);
			break;
		case 'budget_revision':
			updateTransactionStatus(budgetRevisions, id, status);
			break;
		case 'expense':
			updateTransactionStatus(expenses, id, status);
			break;
		case 'journal_entry':
			updateTransactionStatus(journalEntries, id, status);
			break;
		case 'bank_reconciliation':
			updateTransactionStatus(bankReconciliations, id, status);
			break;
		case 'period_closing':
			updateTransactionStatus(periodClosings, id, status);
			break;
	}
}

function sortPendingRequests(requests: PendingRequest[]): PendingRequest[] {
	return [...requests].sort(
		(left, right) => new Date(right.requestedAt).getTime() - new Date(left.requestedAt).getTime()
	);
}

function upsertPendingRequest(entry: PendingRequest) {
	pendingRequests.update((list) =>
		sortPendingRequests([entry, ...list.filter((item) => item.id !== entry.id)])
	);
}

export const pendingActions = {
	async load(transactionType: PendingTransactionType, transactionId: string): Promise<void> {
		if (!isApiConfigured || !transactionType || !transactionId) return;

		try {
			const result = await pendingApi.list({ transactionType, transactionId, limit: 100 });
			const remote = result.data ?? [];
			pendingRequests.update((list) => {
				const others = list.filter(
					(item) =>
						!(item.transactionType === transactionType && item.transactionId === transactionId)
				);
				return sortPendingRequests([...remote, ...others]);
			});
		} catch (error) {
			console.warn(
				`[pending] failed to load pending history for ${transactionType}/${transactionId}`,
				error
			);
		}
	},

	async request(input: CreatePendingRequestInput): Promise<PendingRequest> {
		let entry: PendingRequest;

		if (isApiConfigured) {
			const result = await pendingApi.create({
				...input,
				actorRole: input.actorRole ?? ''
			});
			entry = result.data;
		} else {
			const now = new Date().toISOString();
			entry = {
				id: `pending-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
				transactionType: input.transactionType,
				transactionId: input.transactionId,
				transactionNumber: input.transactionNumber || input.transactionId,
				status: 'pending',
				requestedAt: now,
				requestedBy: input.requestedBy,
				pendingMessage: input.pendingMessage,
				approvalMessage: '',
				rejectionMessage: '',
				createdAt: now,
				updatedAt: now
			};
		}

		upsertPendingRequest(entry);
		setTransactionStatus(input.transactionType, input.transactionId, 'pending');
		auditLogActions.record({
			module: pendingTransactionModule(input.transactionType),
			entityType: pendingAuditEntityType(input.transactionType),
			entityId: input.transactionId,
			documentNumber: input.transactionNumber || input.transactionId,
			action: 'submit',
			status: 'pending',
			actor: input.requestedBy,
			summary: `Requested pending approval for ${input.transactionNumber || input.transactionId}.`,
			description: input.pendingMessage,
			changes: [{ field: 'status', before: null, after: 'pending' }]
		});

		return entry;
	},

	async decide(
		entry: PendingRequest,
		decision: 'approve' | 'reject',
		input: PendingDecisionInput
	): Promise<PendingRequest> {
		let decided: PendingRequest;

		if (isApiConfigured) {
			const result =
				decision === 'approve'
					? await pendingApi.approve(entry.transactionType, entry.id, input)
					: await pendingApi.reject(entry.transactionType, entry.id, input);
			decided = result.data;
		} else {
			const now = new Date().toISOString();
			decided =
				decision === 'approve'
					? {
							...entry,
							status: 'approved',
							approvedAt: now,
							approvedBy: input.actor,
							approvalMessage: input.decisionMessage,
							updatedAt: now
						}
					: {
							...entry,
							status: 'rejected',
							rejectedAt: now,
							rejectedBy: input.actor,
							rejectionMessage: input.decisionMessage,
							updatedAt: now
						};
		}

		const nextStatus: PendingStatus = decision === 'approve' ? 'approved' : 'rejected';
		upsertPendingRequest(decided);
		setTransactionStatus(entry.transactionType, entry.transactionId, nextStatus);
		auditLogActions.record({
			module: pendingTransactionModule(entry.transactionType),
			entityType: pendingAuditEntityType(entry.transactionType),
			entityId: entry.transactionId,
			documentNumber: entry.transactionNumber,
			action: decision === 'approve' ? 'approve' : 'reject',
			status: nextStatus,
			actor: input.actor,
			summary: `${decision === 'approve' ? 'Approved' : 'Rejected'} pending request for ${entry.transactionNumber}.`,
			description: input.decisionMessage,
			changes: [{ field: 'status', before: 'pending', after: nextStatus }]
		});

		return decided;
	}
};

// --- Computed Statistics ---
export const totalSalesAmount = derived(salesOrders, ($sales) =>
	$sales.reduce((sum, so) => sum + so.total, 0)
);

export const totalReceivableAmount = derived(billPayments, ($bills) =>
	$bills.filter((b) => b.status === 'pending').reduce((sum, b) => sum + b.amount, 0)
);

export const totalPayableAmount = derived(purchaseOrders, ($po) =>
	$po.filter((p) => p.status === 'pending').reduce((sum, p) => sum + p.total, 0)
);

export const paymentCompletionRate = derived(
	[billPayments, payments],
	([$bills, $payments]) => {
		const totalBilled = $bills.reduce((sum, b) => sum + b.amount, 0);
		const totalPaid = $payments.reduce((sum, p) => sum + p.amount, 0);
		if (totalBilled === 0) return 100;
		return Math.min(100, Math.round((totalPaid / totalBilled) * 100));
	}
);
