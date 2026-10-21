import { writable, derived } from 'svelte/store';
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
	AnnualBudget,
	BudgetAllocation,
	BudgetRevision,
	AppSettings,
	TransactionItem
} from '$lib/types';

import {
	customers as initialCustomers,
	products as initialProducts,
	suppliers as initialSuppliers,
	employees as initialEmployees,
	chartOfAccounts as initialCOA,
	quotations as initialQuotations,
	salesOrders as initialSales,
	purchaseOrders as initialPurchases,
	goodsReceipts as initialGoodsReceipts,
	deliveries as initialDeliveries,
	billPayments as initialBills,
	payments as initialPayments,
	debtPayments as initialDebtPayments,
	journalEntries as initialJournals,
	appSettings as initialSettings
} from '$lib/data/mock-data';

// --- Master Data Stores ---
export const customers = writable<Customer[]>(initialCustomers);

export const products = writable<Product[]>(
	initialProducts.map((p, idx) => ({
		...p,
		code: `PRD-${String(idx + 101).padStart(3, '0')}`,
		itemType: idx % 4 === 3 ? 'service' : 'goods',
		secondaryUnit: idx % 4 === 3 ? undefined : 'Box',
		conversionRate: idx % 4 === 3 ? undefined : 24,
		weightKg: idx % 4 === 3 ? undefined : 2.5,
		barcode: `899${Math.floor(Math.random() * 89999999 + 10000000)}`,
		costPrice: Math.round(p.price * 0.7)
	}))
);

export const suppliers = writable<Supplier[]>(initialSuppliers);
export const employees = writable<Employee[]>(initialEmployees);
export const departments = writable<Department[]>([
	{ id: 'dept-001', code: 'FIN', name: 'Finance & Accounting', manager: 'Bambang Soepomo', costCenter: 'CC-FIN-01', status: 'active' },
	{ id: 'dept-002', code: 'SAL', name: 'Sales & Marketing', manager: 'Rina Kusuma', costCenter: 'CC-SAL-01', status: 'active' },
	{ id: 'dept-003', code: 'OPS', name: 'Operations & Production', manager: 'Dedi Kurniawan', costCenter: 'CC-OPS-01', status: 'active' },
	{ id: 'dept-004', code: 'PUR', name: 'Procurement', manager: 'Putri Anggraini', costCenter: 'CC-PUR-01', status: 'active' },
	{ id: 'dept-005', code: 'HGA', name: 'HR & General Affairs', manager: 'Nurul Hidayah', costCenter: 'CC-HGA-01', status: 'active' },
	{ id: 'dept-006', code: 'IT', name: 'Information Technology', manager: 'Rizky Pratama', costCenter: 'CC-IT-01', status: 'active' }
]);
export const chartOfAccounts = writable<ChartOfAccount[]>(initialCOA);

export const warehouses = writable<Warehouse[]>([
	{ id: 'wh-001', code: 'WH-JKT-01', name: 'Main Distribution Center Sunter', location: 'Jakarta Utara', manager: 'Budi Hartono', capacity: '5,000 m3', status: 'active' },
	{ id: 'wh-002', code: 'WH-CKG-02', name: 'Raw Material Warehouse Cikarang', location: 'Cikarang Barat', manager: 'Agus Salim', capacity: '12,000 m3', status: 'active' },
	{ id: 'wh-003', code: 'WH-SBY-03', name: 'East Java Transit Depot', location: 'Surabaya Rungkut', manager: 'Dedi Kurniawan', capacity: '3,500 m3', status: 'active' }
]);

export const taxRates = writable<TaxRate[]>([
	{ id: 'tx-001', code: 'PPN-11', name: 'Value Added Tax 11%', rate: 11, type: 'sales', description: 'Standard VAT (PPN) applicable to taxable goods and services' },
	{ id: 'tx-002', code: 'PPH-23', name: 'Withholding Tax Article 23', rate: 2, type: 'withholding', description: 'Withholding tax for professional and machining services' },
	{ id: 'tx-003', code: 'NON-TAX', name: 'Non-Taxable Goods / Exempt', rate: 0, type: 'sales', description: '0% rate for exempted items and export supplies' }
]);

export const paymentTerms = writable<PaymentTerm[]>([
	{ id: 'top-001', code: 'COD', name: 'Cash On Delivery', days: 0, description: 'Immediate settlement upon goods receipt' },
	{ id: 'top-002', code: 'NET-14', name: 'Net 14 Days', days: 14, description: 'Payment due within 14 calendar days' },
	{ id: 'top-003', code: 'NET-30', name: 'Net 30 Days', days: 30, description: 'Standard corporate term of 30 days' },
	{ id: 'top-004', code: 'NET-60', name: 'Net 60 Days', days: 60, description: 'Extended enterprise contract terms' }
]);

export const bankAccounts = writable<BankAccount[]>([
	{ id: 'ba-001', code: 'BCA-001', bankName: 'Bank Central Asia (BCA)', accountNumber: '088-293-8472', accountHolder: 'PT Byond Technology Indonesia', currency: 'IDR', balance: 542850000 },
	{ id: 'ba-002', code: 'MDR-002', bankName: 'Bank Mandiri (Persero)', accountNumber: '124-00-983742-1', accountHolder: 'PT Byond Technology Indonesia', currency: 'IDR', balance: 318420000 },
	{ id: 'ba-003', code: 'PETTY-01', bankName: 'Petty Cash Safe Box (Operational)', accountNumber: 'CASH-IDR-HQ', accountHolder: 'Finance Cashier Desk', currency: 'IDR', balance: 18500000 }
]);

export const unitsOfMeasurement = writable<UnitOfMeasurement[]>([
	{ id: 'uom-001', code: 'PCS', name: 'Pieces', category: 'Count', description: 'Standard count for individual units' },
	{ id: 'uom-002', code: 'BOX', name: 'Box', category: 'Count', description: 'Carton or box packaging' },
	{ id: 'uom-003', code: 'RIM', name: 'Rim', category: 'Count', description: '500 sheets of paper' },
	{ id: 'uom-004', code: 'ROLL', name: 'Roll', category: 'Count', description: 'Rolled material (tape, film, wire)' },
	{ id: 'uom-005', code: 'SET', name: 'Set', category: 'Count', description: 'A complete set of components' },
	{ id: 'uom-006', code: 'UNIT', name: 'Unit', category: 'Count', description: 'Single machine or device' },
	{ id: 'uom-007', code: 'KG', name: 'Kilogram', category: 'Weight', description: 'Metric weight measurement' },
	{ id: 'uom-008', code: 'G', name: 'Gram', category: 'Weight', description: 'Small metric weight measurement' },
	{ id: 'uom-009', code: 'L', name: 'Liter', category: 'Volume', description: 'Liquid volume measurement' },
	{ id: 'uom-010', code: 'ML', name: 'Milliliter', category: 'Volume', description: 'Small liquid volume measurement' },
	{ id: 'uom-011', code: 'M', name: 'Meter', category: 'Length', description: 'Metric length measurement' },
	{ id: 'uom-012', code: 'CM', name: 'Centimeter', category: 'Length', description: 'Small metric length measurement' },
	{ id: 'uom-013', code: 'HOUR', name: 'Hour', category: 'Time', description: 'Billable service hour' },
	{ id: 'uom-014', code: 'DAY', name: 'Day', category: 'Time', description: 'Billable service day' },
	{ id: 'uom-015', code: 'SERVICE', name: 'Service', category: 'Service', description: 'Lump-sum professional service' }
]);

// --- Transactions ---
export const quotations = writable<Quotation[]>(initialQuotations);
export const salesOrders = writable<SalesOrder[]>(initialSales);
export const purchaseOrders = writable<PurchaseOrder[]>(initialPurchases);
export const goodsReceipts = writable<GoodsReceipt[]>(initialGoodsReceipts);
export const deliveries = writable<Delivery[]>(initialDeliveries);
export const billPayments = writable<BillPayment[]>(initialBills);
export const payments = writable<Payment[]>(initialPayments);
export const debtPayments = writable<DebtPayment[]>(initialDebtPayments);

export const salesReturns = writable<SalesReturn[]>([
	{ id: 'sr-001', returnNo: 'SR/2024/001', date: '2024-03-12', salesNo: 'SO/2024/001', customerName: 'PT Astra International Tbk', reason: 'Packaging damaged during transit', total: 3429250, status: 'approved' },
	{ id: 'sr-002', returnNo: 'SR/2024/002', date: '2024-04-02', salesNo: 'SO/2024/003', customerName: 'PT Unilever Indonesia Tbk', reason: 'Incorrect dimensions delivered', total: 5205750, status: 'pending' }
]);

export const purchaseReturns = writable<PurchaseReturn[]>([
	{ id: 'pr-001', returnNo: 'PR/2024/001', date: '2024-03-20', purchaseNo: 'PO/2024/001', supplierName: 'CV Mitra Sejahtera', reason: 'Substandard tensile strength', total: 1584000, status: 'completed' },
	{ id: 'pr-002', returnNo: 'PR/2024/002', date: '2024-04-08', purchaseNo: 'PO/2024/004', supplierName: 'PT Nusantara Elektronik', reason: 'Connector pins bent', total: 6426750, status: 'approved' }
]);

// --- Inventory ---
export const stockMovements = writable<StockMovement[]>([
	{ id: 'sm-001', date: '2024-04-01', docNo: 'GR/2024/001', productCode: 'PRD-101', productName: 'Steel Plate 10mm', type: 'IN', warehouse: 'Main Distribution Center', quantity: 50, unit: 'Pcs', reference: 'PO/2024/001' },
	{ id: 'sm-002', date: '2024-04-03', docNo: 'DO/2024/001', productCode: 'PRD-101', productName: 'Steel Plate 10mm', type: 'OUT', warehouse: 'Main Distribution Center', quantity: 15, unit: 'Pcs', reference: 'SO/2024/001' },
	{ id: 'sm-003', date: '2024-04-05', docNo: 'TR-2024-001', productCode: 'PRD-102', productName: 'Industrial Bearing 6204', type: 'TRANSFER', warehouse: 'Raw Material Warehouse', quantity: 100, unit: 'Pcs', reference: 'Rebalancing' },
	{ id: 'sm-004', date: '2024-04-10', docNo: 'ADJ-2024-001', productCode: 'PRD-103', productName: 'Hydraulic Oil ISO VG 46', type: 'ADJUST', warehouse: 'Main Distribution Center', quantity: -2, unit: 'Drum', reference: 'Stock Count Variance' }
]);

export const stockAdjustments = writable<StockAdjustment[]>([
	{ id: 'adj-001', date: '2024-04-10', adjustmentNo: 'ADJ/2024/001', warehouse: 'Main Distribution Center', productName: 'Hydraulic Oil ISO VG 46', systemQty: 25, actualQty: 23, diffQty: -2, reason: 'Physical evaporation & measurement leak', status: 'approved' },
	{ id: 'adj-002', date: '2024-04-14', adjustmentNo: 'ADJ/2024/002', warehouse: 'Raw Material Warehouse', productName: 'Industrial Bearing 6204', systemQty: 340, actualQty: 345, diffQty: 5, reason: 'Unrecorded surplus box found during cycle count', status: 'pending' }
]);

export const productAccountMappings = writable<ProductAccountMapping[]>([
	{ id: 'map-001', category: 'Raw Materials', inventoryAccount: '1-1410 Inventory - Raw Materials', salesAccount: '4-1000 Sales Revenue', cogsAccount: '5-1000 Cost of Goods Sold', returnAccount: '4-1200 Sales Returns' },
	{ id: 'map-002', category: 'Hardware & Tools', inventoryAccount: '1-1420 Inventory - Hardware', salesAccount: '4-1000 Sales Revenue', cogsAccount: '5-1000 Cost of Goods Sold', returnAccount: '4-1200 Sales Returns' },
	{ id: 'map-003', category: 'Machining & Technical Services', inventoryAccount: 'N/A (Service Item)', salesAccount: '4-2000 Technical Services Revenue', cogsAccount: '5-2000 Direct Labor & Subcontracting', returnAccount: '4-2200 Service Rebates' }
]);

// --- Accounting & Financial Entries ---
export const expenses = writable<ExpenseEntry[]>([
	{
		id: 'exp-001', date: '2024-04-02', expenseNo: 'EXP/2024/001', expenseType: 'utilities', category: 'Utilities',
		accountCode: '6-1100', accountName: 'Electricity & Water', departmentCode: 'FIN', departmentName: 'Finance & Accounting',
		budgetId: 'bud-003', budgetNo: 'BUD/2024/003', employeeId: '', employeeName: '', supplierName: 'PT PLN (Persero)',
		description: 'Factory electricity PLN billing', amount: 8450000, taxAmount: 929500, totalAmount: 9379500,
		paymentMethod: 'Bank Transfer', bankAccount: 'BCA-001', paidTo: 'PT PLN (Persero)', status: 'approved',
		attachmentUrl: 'pln-april-2024.pdf', notes: 'Monthly electricity billing', submittedBy: 'Putri Anggraini',
		approvedBy: 'Bambang Soepomo', postedAt: '', glReference: ''
	},
	{
		id: 'exp-002', date: '2024-04-05', expenseNo: 'EXP/2024/002', expenseType: 'logistics', category: 'Logistics',
		accountCode: '6-2000', accountName: 'Freight & Courier', departmentCode: 'OPS', departmentName: 'Operations & Production',
		budgetId: 'bud-001', budgetNo: 'BUD/2024/001', employeeId: '', employeeName: '', supplierName: 'JNE Express Logistic',
		description: 'Emergency courier forwarding for urgent delivery order', amount: 1250000, taxAmount: 137500, totalAmount: 1387500,
		paymentMethod: 'Petty Cash', bankAccount: 'PETTY-01', paidTo: 'JNE Express Logistic', status: 'posted',
		attachmentUrl: 'jne-receipt.pdf', notes: '', submittedBy: 'Dedi Kurniawan',
		approvedBy: 'Bambang Soepomo', postedAt: '2024-04-06', glReference: 'JE/2024/EXP/002'
	},
	{
		id: 'exp-003', date: '2024-04-12', expenseNo: 'EXP/2024/003', expenseType: 'maintenance', category: 'Maintenance',
		accountCode: '6-3000', accountName: 'Machinery Maintenance', departmentCode: 'OPS', departmentName: 'Operations & Production',
		budgetId: 'bud-001', budgetNo: 'BUD/2024/001', employeeId: '', employeeName: '', supplierName: 'CV Teknik Presisi',
		description: 'CNC milling spindle lubrication and replacement', amount: 4800000, taxAmount: 528000, totalAmount: 5328000,
		paymentMethod: 'Bank Transfer', bankAccount: 'MDR-002', paidTo: 'CV Teknik Presisi', status: 'approved',
		attachmentUrl: 'spindle-service-report.pdf', notes: 'Preventive maintenance', submittedBy: 'Dedi Kurniawan',
		approvedBy: 'Bambang Soepomo', postedAt: '', glReference: ''
	},
	{
		id: 'exp-004', date: '2024-04-25', expenseNo: 'EXP/2024/004', expenseType: 'salary', category: 'Employee Salary',
		accountCode: '6-1000', accountName: 'Salaries & Wages', departmentCode: 'FIN', departmentName: 'Finance & Accounting',
		budgetId: 'bud-003', budgetNo: 'BUD/2024/003', employeeId: 'emp-002', employeeName: 'Nurul Hidayah', supplierName: '',
		description: 'April 2024 salary - Finance & Accounting staff', amount: 12500000, taxAmount: 0, totalAmount: 12500000,
		paymentMethod: 'Bank Transfer', bankAccount: 'BCA-001', paidTo: 'Nurul Hidayah', status: 'posted',
		attachmentUrl: 'payroll-april-2024.xlsx', notes: 'Net salary after statutory deduction', submittedBy: 'Nurul Hidayah',
		approvedBy: 'Bambang Soepomo', postedAt: '2024-04-26', glReference: 'JE/2024/PAY/004'
	},
	{
		id: 'exp-005', date: '2024-04-15', expenseNo: 'EXP/2024/005', expenseType: 'purchase', category: 'Direct Material Purchase',
		accountCode: '5-1000', accountName: 'Cost of Goods Sold', departmentCode: 'PUR', departmentName: 'Procurement',
		budgetId: 'bud-001', budgetNo: 'BUD/2024/001', employeeId: '', employeeName: '', supplierName: 'PT Sinar Jaya Metalindo',
		description: 'Additional steel plate purchase for urgent production order', amount: 32500000, taxAmount: 3575000, totalAmount: 36075000,
		paymentMethod: 'Bank Transfer', bankAccount: 'BCA-001', paidTo: 'PT Sinar Jaya Metalindo', status: 'submitted',
		attachmentUrl: 'po-2024-006.pdf', notes: 'Awaiting finance approval', submittedBy: 'Putri Anggraini',
		approvedBy: '', postedAt: '', glReference: ''
	},
	{
		id: 'exp-006', date: '2024-04-18', expenseNo: 'EXP/2024/006', expenseType: 'office_supplies', category: 'Office Supplies (ATK)',
		accountCode: '6-1200', accountName: 'Office Supplies (ATK)', departmentCode: 'FIN', departmentName: 'Finance & Accounting',
		budgetId: 'bud-003', budgetNo: 'BUD/2024/003', employeeId: '', employeeName: '', supplierName: 'PT Sumber ATK Nusantara',
		description: 'Monthly office stationery restock: paper, toner, folders', amount: 2750000, taxAmount: 302500, totalAmount: 3052500,
		paymentMethod: 'Petty Cash', bankAccount: 'PETTY-01', paidTo: 'PT Sumber ATK Nusantara', status: 'submitted',
		attachmentUrl: 'atk-invoice-april.pdf', notes: '', submittedBy: 'Nurul Hidayah',
		approvedBy: '', postedAt: '', glReference: ''
	},
	{
		id: 'exp-007', date: '2024-04-20', expenseNo: 'EXP/2024/007', expenseType: 'travel', category: 'Travel & Accommodation',
		accountCode: '6-4000', accountName: 'Travel & Accommodation', departmentCode: 'SAL', departmentName: 'Sales & Marketing',
		budgetId: 'bud-002', budgetNo: 'BUD/2024/002', employeeId: 'emp-003', employeeName: 'Rina Kusuma', supplierName: '',
		description: 'Customer visit and exhibition trip to Surabaya', amount: 6200000, taxAmount: 682000, totalAmount: 6882000,
		paymentMethod: 'Credit Card', bankAccount: 'BCA-001', paidTo: 'Rina Kusuma', status: 'draft',
		attachmentUrl: '', notes: 'Draft reimbursement', submittedBy: 'Rina Kusuma',
		approvedBy: '', postedAt: '', glReference: ''
	},
	{
		id: 'exp-008', date: '2024-04-26', expenseNo: 'EXP/2024/008', expenseType: 'salary', category: 'Employee Salary',
		accountCode: '6-1000', accountName: 'Salaries & Wages', departmentCode: 'OPS', departmentName: 'Operations & Production',
		budgetId: 'bud-001', budgetNo: 'BUD/2024/001', employeeId: 'emp-004', employeeName: 'Dedi Kurniawan', supplierName: '',
		description: 'April 2024 salary - Operations supervisor', amount: 15000000, taxAmount: 0, totalAmount: 15000000,
		paymentMethod: 'Bank Transfer', bankAccount: 'MDR-002', paidTo: 'Dedi Kurniawan', status: 'approved',
		attachmentUrl: 'payroll-april-2024.xlsx', notes: '', submittedBy: 'Nurul Hidayah',
		approvedBy: 'Bambang Soepomo', postedAt: '', glReference: ''
	},
	{
		id: 'exp-009', date: '2024-04-28', expenseNo: 'EXP/2024/009', expenseType: 'other', category: 'Other Operating Expense',
		accountCode: '6-9000', accountName: 'Other Operating Expenses', departmentCode: 'IT', departmentName: 'Information Technology',
		budgetId: 'bud-004', budgetNo: 'BUD/2024/004', employeeId: '', employeeName: '', supplierName: 'PT Cloud Hosting Indonesia',
		description: 'Cloud hosting and domain renewal', amount: 3400000, taxAmount: 374000, totalAmount: 3774000,
		paymentMethod: 'Bank Transfer', bankAccount: 'BCA-001', paidTo: 'PT Cloud Hosting Indonesia', status: 'posted',
		attachmentUrl: 'cloud-invoice.pdf', notes: '', submittedBy: 'Rizky Pratama',
		approvedBy: 'Bambang Soepomo', postedAt: '2024-04-29', glReference: 'JE/2024/EXP/009'
	}
]);

// --- Budgeting ---
export const annualBudgets = writable<AnnualBudget[]>([
	{
		id: 'bud-001', budgetNo: 'BUD/2024/001', fiscalYear: 2024, name: 'Operations Annual Budget 2024',
		departmentCode: 'OPS', departmentName: 'Operations & Production', totalAmount: 720000000,
		status: 'approved', preparedBy: 'Dedi Kurniawan', approvedBy: 'Bambang Soepomo',
		createdAt: '2024-01-05', notes: 'Production, maintenance and freight budget.'
	},
	{
		id: 'bud-002', budgetNo: 'BUD/2024/002', fiscalYear: 2024, name: 'Sales & Marketing Budget 2024',
		departmentCode: 'SAL', departmentName: 'Sales & Marketing', totalAmount: 480000000,
		status: 'submitted', preparedBy: 'Rina Kusuma', approvedBy: '',
		createdAt: '2024-01-08', notes: 'Travel, promotion and customer engagement programs.'
	},
	{
		id: 'bud-003', budgetNo: 'BUD/2024/003', fiscalYear: 2024, name: 'Finance & Administration Budget 2024',
		departmentCode: 'FIN', departmentName: 'Finance & Accounting', totalAmount: 360000000,
		status: 'approved', preparedBy: 'Bambang Soepomo', approvedBy: 'Ahmad Fauzi',
		createdAt: '2024-01-09', notes: 'Salaries, utilities and office supplies.'
	},
	{
		id: 'bud-004', budgetNo: 'BUD/2024/004', fiscalYear: 2024, name: 'IT Infrastructure Budget 2024',
		departmentCode: 'IT', departmentName: 'Information Technology', totalAmount: 240000000,
		status: 'draft', preparedBy: 'Rizky Pratama', approvedBy: '',
		createdAt: '2024-02-01', notes: 'Cloud services, hardware refresh and software licenses.'
	},
	{
		id: 'bud-005', budgetNo: 'BUD/2024/005', fiscalYear: 2024, name: 'HR & General Affairs Budget 2024',
		departmentCode: 'HGA', departmentName: 'HR & General Affairs', totalAmount: 300000000,
		status: 'approved', preparedBy: 'Nurul Hidayah', approvedBy: 'Ahmad Fauzi',
		createdAt: '2024-01-10', notes: 'Personnel welfare, office rent and supplies.'
	}
]);

export const budgetAllocations = writable<BudgetAllocation[]>([
	{ id: 'ball-001', budgetId: 'bud-001', budgetNo: 'BUD/2024/001', fiscalYear: 2024, accountCode: '5-1000', accountName: 'Cost of Goods Sold', departmentCode: 'OPS', departmentName: 'Operations & Production', allocatedAmount: 420000000, usedAmount: 315000000, notes: 'Direct material and production cost' },
	{ id: 'ball-002', budgetId: 'bud-001', budgetNo: 'BUD/2024/001', fiscalYear: 2024, accountCode: '6-3000', accountName: 'Machinery Maintenance', departmentCode: 'OPS', departmentName: 'Operations & Production', allocatedAmount: 180000000, usedAmount: 92500000, notes: 'Preventive and corrective maintenance' },
	{ id: 'ball-003', budgetId: 'bud-001', budgetNo: 'BUD/2024/001', fiscalYear: 2024, accountCode: '6-2000', accountName: 'Freight & Courier', departmentCode: 'OPS', departmentName: 'Operations & Production', allocatedAmount: 120000000, usedAmount: 48000000, notes: 'Outbound delivery and courier' },
	{ id: 'ball-004', budgetId: 'bud-002', budgetNo: 'BUD/2024/002', fiscalYear: 2024, accountCode: '6-4000', accountName: 'Travel & Accommodation', departmentCode: 'SAL', departmentName: 'Sales & Marketing', allocatedAmount: 180000000, usedAmount: 64000000, notes: 'Customer visits and exhibitions' },
	{ id: 'ball-005', budgetId: 'bud-002', budgetNo: 'BUD/2024/002', fiscalYear: 2024, accountCode: '6-9000', accountName: 'Other Operating Expenses', departmentCode: 'SAL', departmentName: 'Sales & Marketing', allocatedAmount: 300000000, usedAmount: 112000000, notes: 'Promotion and marketing programs' },
	{ id: 'ball-006', budgetId: 'bud-003', budgetNo: 'BUD/2024/003', fiscalYear: 2024, accountCode: '6-1000', accountName: 'Salaries & Wages', departmentCode: 'FIN', departmentName: 'Finance & Accounting', allocatedAmount: 240000000, usedAmount: 180000000, notes: 'Finance team payroll' },
	{ id: 'ball-007', budgetId: 'bud-003', budgetNo: 'BUD/2024/003', fiscalYear: 2024, accountCode: '6-1200', accountName: 'Office Supplies (ATK)', departmentCode: 'FIN', departmentName: 'Finance & Accounting', allocatedAmount: 60000000, usedAmount: 18750000, notes: 'Stationery and consumables' },
	{ id: 'ball-008', budgetId: 'bud-003', budgetNo: 'BUD/2024/003', fiscalYear: 2024, accountCode: '6-1100', accountName: 'Electricity & Water', departmentCode: 'FIN', departmentName: 'Finance & Accounting', allocatedAmount: 60000000, usedAmount: 25400000, notes: 'Office utilities' },
	{ id: 'ball-009', budgetId: 'bud-004', budgetNo: 'BUD/2024/004', fiscalYear: 2024, accountCode: '6-9000', accountName: 'Other Operating Expenses', departmentCode: 'IT', departmentName: 'Information Technology', allocatedAmount: 240000000, usedAmount: 0, notes: 'Cloud, hardware and licenses' },
	{ id: 'ball-010', budgetId: 'bud-005', budgetNo: 'BUD/2024/005', fiscalYear: 2024, accountCode: '6-1000', accountName: 'Salaries & Wages', departmentCode: 'HGA', departmentName: 'HR & General Affairs', allocatedAmount: 180000000, usedAmount: 150000000, notes: 'HR and GA payroll' },
	{ id: 'ball-011', budgetId: 'bud-005', budgetNo: 'BUD/2024/005', fiscalYear: 2024, accountCode: '6-1200', accountName: 'Office Supplies (ATK)', departmentCode: 'HGA', departmentName: 'HR & General Affairs', allocatedAmount: 60000000, usedAmount: 22000000, notes: 'General office supplies' },
	{ id: 'ball-012', budgetId: 'bud-005', budgetNo: 'BUD/2024/005', fiscalYear: 2024, accountCode: '6-1300', accountName: 'Rent Expense', departmentCode: 'HGA', departmentName: 'HR & General Affairs', allocatedAmount: 60000000, usedAmount: 60000000, notes: 'Office rent' }
]);

export const budgetRevisions = writable<BudgetRevision[]>([
	{ id: 'brev-001', revisionNo: 'REV/2024/001', budgetId: 'bud-001', budgetNo: 'BUD/2024/001', date: '2024-04-20', requestedBy: 'Dedi Kurniawan', currentAmount: 720000000, requestedAmount: 780000000, difference: 60000000, reason: 'Additional preventive maintenance for aging CNC machines.', status: 'pending' },
	{ id: 'brev-002', revisionNo: 'REV/2024/002', budgetId: 'bud-002', budgetNo: 'BUD/2024/002', date: '2024-04-10', requestedBy: 'Rina Kusuma', currentAmount: 480000000, requestedAmount: 450000000, difference: -30000000, reason: 'Reallocation of unused promotion budget to travel.', status: 'approved' },
	{ id: 'brev-003', revisionNo: 'REV/2024/003', budgetId: 'bud-003', budgetNo: 'BUD/2024/003', date: '2024-04-22', requestedBy: 'Bambang Soepomo', currentAmount: 360000000, requestedAmount: 400000000, difference: 40000000, reason: 'Additional office supplies and utility cost.', status: 'rejected' }
]);

export const bankReconciliations = writable<BankReconciliation[]>([
	{ id: 'rec-001', date: '2024-03-31', bankAccount: 'BCA 088-293-8472', statementBalance: 542850000, glBalance: 542850000, difference: 0, status: 'reconciled' },
	{ id: 'rec-002', date: '2024-03-31', bankAccount: 'Mandiri 124-00-983742-1', statementBalance: 320420000, glBalance: 318420000, difference: 2000000, status: 'discrepancy' }
]);

export const purchaseInvoices = writable<PurchaseInvoice[]>([
	{ id: 'pinv-001', date: '2024-03-05', invoiceNo: 'PI/2024/001', purchaseNo: 'PO/2024/001', supplierName: 'CV Mitra Sejahtera', dueDate: '2024-04-04', amount: 158400000, status: 'paid', preparedBy: 'Putri Anggraini' },
	{ id: 'pinv-002', date: '2024-03-08', invoiceNo: 'PI/2024/002', purchaseNo: 'PO/2024/002', supplierName: 'PT Sinar Jaya Metalindo', dueDate: '2024-04-15', amount: 89375000, status: 'pending', preparedBy: 'Putri Anggraini' },
	{ id: 'pinv-003', date: '2024-03-12', invoiceNo: 'PI/2024/003', purchaseNo: 'PO/2024/003', supplierName: 'PT Global Packaging', dueDate: '2024-04-10', amount: 131780000, status: 'overdue', preparedBy: 'Putri Anggraini' },
	{ id: 'pinv-004', date: '2024-03-18', invoiceNo: 'PI/2024/004', purchaseNo: 'PO/2024/004', supplierName: 'PT Nusantara Elektronik', dueDate: '2024-04-20', amount: 128535000, status: 'paid', preparedBy: 'Putri Anggraini' },
	{ id: 'pinv-005', date: '2024-03-28', invoiceNo: 'PI/2024/005', purchaseNo: 'PO/2024/005', supplierName: 'PT Jaya Abadi Teknik', dueDate: '2024-04-30', amount: 22310000, status: 'pending', preparedBy: 'Putri Anggraini' }
]);

export const periodClosings = writable<PeriodClosing[]>([
	{ id: 'pc-001', period: 'January 2024', startDate: '2024-01-01', endDate: '2024-01-31', status: 'closed', closedBy: 'Bambang Soepomo', closedAt: '2024-02-03', notes: 'Monthly close completed, no adjusting entries pending.' },
	{ id: 'pc-002', period: 'February 2024', startDate: '2024-02-01', endDate: '2024-02-29', status: 'closed', closedBy: 'Bambang Soepomo', closedAt: '2024-03-04', notes: 'Monthly close completed, bank reconciliation attached.' },
	{ id: 'pc-003', period: 'March 2024', startDate: '2024-03-01', endDate: '2024-03-31', status: 'closed', closedBy: 'Bambang Soepomo', closedAt: '2024-04-02', notes: 'Quarterly close completed, VAT report submitted.' },
	{ id: 'pc-004', period: 'April 2024', startDate: '2024-04-01', endDate: '2024-04-30', status: 'open', closedBy: '', closedAt: '', notes: 'Current open period.' }
]);

export const journalEntries = writable<JournalEntry[]>(initialJournals);
export const appSettings = writable<AppSettings>(initialSettings);

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

export const systemAlerts = writable<SystemAlert[]>([
	{
		id: 'alt-001',
		title: 'Vendor Payable Due: PO/2024/001',
		message: 'Notice: Vendor invoice payment of IDR 15,840,000 is approaching due date.',
		type: 'debt',
		referenceNo: 'PO/2024/001',
		link: '/vendor-payment',
		date: '2024-04-10',
		read: false
	},
	{
		id: 'alt-002',
		title: 'Overdue Receivable: INV/2024/002',
		message: 'Notice: Customer receivable for PT Telkom Indonesia IDR 142,080,000 is overdue.',
		type: 'receivable',
		referenceNo: 'INV/2024/002',
		link: '/sales-invoice',
		date: '2024-04-12',
		read: false
	},
	{
		id: 'alt-003',
		title: 'Ready for Invoicing: SO/2024/005',
		message: 'Delivery confirmed complete. Ready to generate sales invoice.',
		type: 'info',
		referenceNo: 'SO/2024/005',
		link: '/sales-invoice',
		date: '2024-04-14',
		read: false
	}
]);

// --- Master Data Actions ---
export const customerActions = {
	add(item: Omit<Customer, 'id'>) {
		const newCustomer: Customer = { id: `cust-${Date.now().toString(36)}`, ...item };
		customers.update((list) => [newCustomer, ...list]);
		return newCustomer;
	},
	update(id: string, data: Partial<Customer>) {
		customers.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
	},
	delete(id: string) {
		customers.update((list) => list.filter((c) => c.id !== id));
	}
};

export const productActions = {
	add(item: Omit<Product, 'id'>) {
		const newProduct: Product = { id: `prd-${Date.now().toString(36)}`, ...item };
		products.update((list) => [newProduct, ...list]);
		return newProduct;
	},
	update(id: string, data: Partial<Product>) {
		products.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
	},
	delete(id: string) {
		products.update((list) => list.filter((p) => p.id !== id));
	}
};

export const supplierActions = {
	add(item: Omit<Supplier, 'id'>) {
		const newSupplier: Supplier = { id: `sup-${Date.now().toString(36)}`, ...item };
		suppliers.update((list) => [newSupplier, ...list]);
		return newSupplier;
	},
	update(id: string, data: Partial<Supplier>) {
		suppliers.update((list) => list.map((s) => (s.id === id ? { ...s, ...data } : s)));
	},
	delete(id: string) {
		suppliers.update((list) => list.filter((s) => s.id !== id));
	}
};

export const employeeActions = {
	add(item: Omit<Employee, 'id'>) {
		const newEmp: Employee = { id: `emp-${Date.now().toString(36)}`, ...item };
		employees.update((list) => [newEmp, ...list]);
		return newEmp;
	},
	update(id: string, data: Partial<Employee>) {
		employees.update((list) => list.map((e) => (e.id === id ? { ...e, ...data } : e)));
	},
	delete(id: string) {
		employees.update((list) => list.filter((e) => e.id !== id));
	}
};

export const coaActions = {
	add(item: Omit<ChartOfAccount, 'id'>) {
		const newCoa: ChartOfAccount = { id: `coa-${Date.now().toString(36)}`, ...item };
		chartOfAccounts.update((list) => [newCoa, ...list]);
		return newCoa;
	},
	update(id: string, data: Partial<ChartOfAccount>) {
		chartOfAccounts.update((list) => list.map((c) => (c.id === id ? { ...c, ...data } : c)));
	},
	delete(id: string) {
		chartOfAccounts.update((list) => list.filter((c) => c.id !== id));
	}
};

export const warehouseActions = {
	add(item: Omit<Warehouse, 'id'>) {
		const newWh: Warehouse = { id: `wh-${Date.now().toString(36)}`, ...item };
		warehouses.update((list) => [newWh, ...list]);
		return newWh;
	},
	update(id: string, data: Partial<Warehouse>) {
		warehouses.update((list) => list.map((w) => (w.id === id ? { ...w, ...data } : w)));
	},
	delete(id: string) {
		warehouses.update((list) => list.filter((w) => w.id !== id));
	}
};

export const taxRateActions = {
	add(item: Omit<TaxRate, 'id'>) {
		const newTax: TaxRate = { id: `tx-${Date.now().toString(36)}`, ...item };
		taxRates.update((list) => [newTax, ...list]);
		return newTax;
	},
	update(id: string, data: Partial<TaxRate>) {
		taxRates.update((list) => list.map((t) => (t.id === id ? { ...t, ...data } : t)));
	},
	delete(id: string) {
		taxRates.update((list) => list.filter((t) => t.id !== id));
	}
};

export const paymentTermActions = {
	add(item: Omit<PaymentTerm, 'id'>) {
		const newTerm: PaymentTerm = { id: `top-${Date.now().toString(36)}`, ...item };
		paymentTerms.update((list) => [newTerm, ...list]);
		return newTerm;
	},
	update(id: string, data: Partial<PaymentTerm>) {
		paymentTerms.update((list) => list.map((t) => (t.id === id ? { ...t, ...data } : t)));
	},
	delete(id: string) {
		paymentTerms.update((list) => list.filter((t) => t.id !== id));
	}
};

export const bankAccountActions = {
	add(item: Omit<BankAccount, 'id'>) {
		const newBank: BankAccount = { id: `ba-${Date.now().toString(36)}`, ...item };
		bankAccounts.update((list) => [newBank, ...list]);
		return newBank;
	},
	update(id: string, data: Partial<BankAccount>) {
		bankAccounts.update((list) => list.map((b) => (b.id === id ? { ...b, ...data } : b)));
	},
	delete(id: string) {
		bankAccounts.update((list) => list.filter((b) => b.id !== id));
	}
};

export const unitActions = {
	add(item: Omit<UnitOfMeasurement, 'id'>) {
		const newUnit: UnitOfMeasurement = { id: `uom-${Date.now().toString(36)}`, ...item };
		unitsOfMeasurement.update((list) => [newUnit, ...list]);
		return newUnit;
	},
	update(id: string, data: Partial<UnitOfMeasurement>) {
		unitsOfMeasurement.update((list) => list.map((u) => (u.id === id ? { ...u, ...data } : u)));
	},
	delete(id: string) {
		unitsOfMeasurement.update((list) => list.filter((u) => u.id !== id));
	}
};

// --- Transaction Actions ---
export const quotationActions = {
	add(item: Omit<Quotation, 'id'>) {
		const newQ: Quotation = { id: `qt-${Date.now().toString(36)}`, ...item };
		quotations.update((list) => [newQ, ...list]);
		return newQ;
	},
	update(id: string, data: Partial<Quotation>) {
		quotations.update((list) => list.map((q) => (q.id === id ? { ...q, ...data } : q)));
	},
	delete(id: string) {
		quotations.update((list) => list.filter((q) => q.id !== id));
	},
	convertToSalesOrder(quotationId: string, authorName = 'Ahmad Fauzi') {
		let createdSO: SalesOrder | null = null;
		quotations.update((list) =>
			list.map((q) => {
				if (q.id === quotationId) {
					createdSO = {
						id: `so-${Date.now().toString(36)}`,
						date: new Date().toISOString().split('T')[0],
						salesNo: `SO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
						transactionNo: q.transactionNo,
						customerId: q.customerId,
						customerName: q.customerName,
						preparedBy: authorName,
						items: [...q.items],
						subtotal: q.subtotal,
						tax: q.tax,
						total: q.total,
						status: 'pending'
					};
					return { ...q, status: 'sales' };
				}
				return q;
			})
		);
		if (createdSO) {
			salesOrders.update((list) => [createdSO!, ...list]);
		}
		return createdSO;
	}
};

export const salesActions = {
	add(item: Omit<SalesOrder, 'id'>) {
		const newSO: SalesOrder = { id: `so-${Date.now().toString(36)}`, ...item };
		salesOrders.update((list) => [newSO, ...list]);
		return newSO;
	},
	update(id: string, data: Partial<SalesOrder>) {
		salesOrders.update((list) => list.map((s) => (s.id === id ? { ...s, ...data } : s)));
	},
	delete(id: string) {
		salesOrders.update((list) => list.filter((s) => s.id !== id));
	},
	createDelivery(salesId: string, authorName = 'Logistics Lead') {
		let createdDelivery: Delivery | null = null;
		salesOrders.update((list) =>
			list.map((s) => {
				if (s.id === salesId) {
					createdDelivery = {
						id: `del-${Date.now().toString(36)}`,
						date: new Date().toISOString().split('T')[0],
						deliveryNo: `DO/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
						salesNo: s.salesNo,
						transactionNo: s.transactionNo,
						customerName: s.customerName,
						preparedBy: authorName,
						items: [...s.items],
						status: 'pending'
					};
					return { ...s, status: 'delivered' };
				}
				return s;
			})
		);
		if (createdDelivery) {
			deliveries.update((list) => [createdDelivery!, ...list]);
		}
		return createdDelivery;
	},
	createBill(salesId: string, authorName = 'Ahmad Fauzi') {
		let createdBill: BillPayment | null = null;
		salesOrders.update((list) =>
			list.map((s) => {
				if (s.id === salesId) {
					createdBill = {
						id: `bill-${Date.now().toString(36)}`,
						date: new Date().toISOString().split('T')[0],
						billNo: `INV/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
						transactionNo: s.transactionNo,
						supplierName: s.customerName,
						invoiceNo: s.salesNo,
						amount: s.total,
						method: 'transfer',
						status: 'pending',
						preparedBy: authorName
					};
				}
				return s;
			})
		);
		if (createdBill) {
			billPayments.update((list) => [createdBill!, ...list]);
		}
		return createdBill;
	}
};

export const purchaseActions = {
	add(item: Omit<PurchaseOrder, 'id'>) {
		const newPO: PurchaseOrder = { id: `po-${Date.now().toString(36)}`, ...item };
		purchaseOrders.update((list) => [newPO, ...list]);
		return newPO;
	},
	update(id: string, data: Partial<PurchaseOrder>) {
		purchaseOrders.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
	},
	delete(id: string) {
		purchaseOrders.update((list) => list.filter((p) => p.id !== id));
	},
	createGoodsReceipt(purchaseId: string, authorName = 'Warehouse Lead') {
		let createdReceipt: GoodsReceipt | null = null;
		purchaseOrders.update((list) =>
			list.map((p) => {
				if (p.id === purchaseId) {
					createdReceipt = {
						id: `gr-${Date.now().toString(36)}`,
						date: new Date().toISOString().split('T')[0],
						receiptNo: `GR/${new Date().getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
						purchaseNo: p.purchaseNo,
						transactionNo: p.transactionNo,
						supplierName: p.supplierName,
						preparedBy: authorName,
						items: [...p.items],
						status: 'received'
					};
					return { ...p, status: 'received' };
				}
				return p;
			})
		);
		if (createdReceipt) {
			goodsReceipts.update((list) => [createdReceipt!, ...list]);
		}
		return createdReceipt;
	}
};

export const goodsReceiptActions = {
	add(item: Omit<GoodsReceipt, 'id'>) {
		const newGR: GoodsReceipt = { id: `gr-${Date.now().toString(36)}`, ...item };
		goodsReceipts.update((list) => [newGR, ...list]);
		return newGR;
	},
	update(id: string, data: Partial<GoodsReceipt>) {
		goodsReceipts.update((list) => list.map((g) => (g.id === id ? { ...g, ...data } : g)));
	},
	delete(id: string) {
		goodsReceipts.update((list) => list.filter((g) => g.id !== id));
	}
};

export const deliveryActions = {
	add(item: Omit<Delivery, 'id'>) {
		const newDel: Delivery = { id: `del-${Date.now().toString(36)}`, ...item };
		deliveries.update((list) => [newDel, ...list]);
		return newDel;
	},
	update(id: string, data: Partial<Delivery>) {
		deliveries.update((list) => list.map((d) => (d.id === id ? { ...d, ...data } : d)));
	},
	delete(id: string) {
		deliveries.update((list) => list.filter((d) => d.id !== id));
	}
};

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
						status: 'paid',
						preparedBy: authorName
					};
					return { ...b, status: 'paid' };
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
	addMapping(item: Omit<ProductAccountMapping, 'id'>) {
		const newMap: ProductAccountMapping = { id: `map-${Date.now().toString(36)}`, ...item };
		productAccountMappings.update((list) => [newMap, ...list]);
		return newMap;
	},
	updateMapping(id: string, data: Partial<ProductAccountMapping>) {
		productAccountMappings.update((list) => list.map((m) => (m.id === id ? { ...m, ...data } : m)));
	},
	deleteMapping(id: string) {
		productAccountMappings.update((list) => list.filter((m) => m.id !== id));
	}
};

export const departmentActions = {
	add(item: Omit<Department, 'id'>) {
		const newDept: Department = { id: `dept-${Date.now().toString(36)}`, ...item };
		departments.update((list) => [newDept, ...list]);
		return newDept;
	},
	update(id: string, data: Partial<Department>) {
		departments.update((list) => list.map((d) => (d.id === id ? { ...d, ...data } : d)));
	},
	delete(id: string) {
		departments.update((list) => list.filter((d) => d.id !== id));
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
					? { ...e, status: 'submitted', submittedBy: submittedBy || e.submittedBy }
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
							status: 'posted',
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
			list.map((b) => (b.id === id ? { ...b, status: 'submitted' } : b))
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
			list.map((b) => (b.id === id ? { ...b, status: 'closed' } : b))
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
					? { ...r, status: 'reconciled', glBalance: r.statementBalance, difference: 0 }
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
		purchaseInvoices.update((list) => list.map((i) => (i.id === id ? { ...i, status: 'paid' } : i)));
	}
};

export const periodClosingActions = {
	add(item: Omit<PeriodClosing, 'id'>) {
		const newPeriod: PeriodClosing = { id: `pc-${Date.now().toString(36)}`, ...item };
		periodClosings.update((list) => [newPeriod, ...list]);
		return newPeriod;
	},
	update(id: string, data: Partial<PeriodClosing>) {
		periodClosings.update((list) => list.map((p) => (p.id === id ? { ...p, ...data } : p)));
	},
	delete(id: string) {
		periodClosings.update((list) => list.filter((p) => p.id !== id));
	},
	closePeriod(id: string, closedBy = 'Bambang Soepomo') {
		periodClosings.update((list) =>
			list.map((p) =>
				p.id === id
					? {
							...p,
							status: 'closed',
							closedBy,
							closedAt: new Date().toISOString().split('T')[0]
						}
					: p
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
