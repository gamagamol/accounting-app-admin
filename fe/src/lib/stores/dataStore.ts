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
	{ id: 'exp-001', date: '2024-04-02', expenseNo: 'EXP/2024/001', category: 'Utilities', accountCode: '6-1100 Electricity & Water', description: 'Factory electricity PLN billing', amount: 8450000, paymentMethod: 'Bank Transfer', paidTo: 'PT PLN (Persero)' },
	{ id: 'exp-002', date: '2024-04-05', expenseNo: 'EXP/2024/002', category: 'Logistics', accountCode: '6-2300 Freight & Courier', description: 'Emergency courier forwarding for urgent DO', amount: 1250000, paymentMethod: 'Petty Cash', paidTo: 'JNE Express Logistic' },
	{ id: 'exp-003', date: '2024-04-12', expenseNo: 'EXP/2024/003', category: 'Maintenance', accountCode: '6-3100 Machinery Maintenance', description: 'CNC milling spindle lubrication and replacement', amount: 4800000, paymentMethod: 'Bank Transfer', paidTo: 'CV Teknik Presisi' }
]);

export const bankReconciliations = writable<BankReconciliation[]>([
	{ id: 'rec-001', date: '2024-03-31', bankAccount: 'BCA 088-293-8472', statementBalance: 542850000, glBalance: 542850000, difference: 0, status: 'reconciled' },
	{ id: 'rec-002', date: '2024-03-31', bankAccount: 'Mandiri 124-00-983742-1', statementBalance: 320420000, glBalance: 318420000, difference: 2000000, status: 'discrepancy' }
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
		link: '/debt-payment',
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
	addAdjustment(item: Omit<StockAdjustment, 'id'>) {
		const newA: StockAdjustment = { id: `adj-${Date.now().toString(36)}`, ...item };
		stockAdjustments.update((list) => [newA, ...list]);
		return newA;
	}
};

export const expenseActions = {
	add(item: Omit<ExpenseEntry, 'id'>) {
		const newExp: ExpenseEntry = { id: `exp-${Date.now().toString(36)}`, ...item };
		expenses.update((list) => [newExp, ...list]);
		return newExp;
	},
	delete(id: string) {
		expenses.update((list) => list.filter((e) => e.id !== id));
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
