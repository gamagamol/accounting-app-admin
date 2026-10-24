import type { BudgetStatus, ExpenseStatus, ExpenseType, TransactionStatus } from '$lib/types';

/** Master data: departments / cost centers */
export interface CreateDepartmentPayload {
	code: string;
	name: string;
	manager: string;
	costCenter: string;
	status: 'active' | 'inactive';
}

export type UpdateDepartmentPayload = Partial<CreateDepartmentPayload>;

/** Budgeting */
export interface CreateAnnualBudgetPayload {
	budgetNo: string;
	fiscalYear: number;
	name: string;
	departmentCode: string;
	departmentName: string;
	totalAmount: number;
	status: BudgetStatus;
	preparedBy: string;
	notes: string;
	description?: string;
}

export type UpdateAnnualBudgetPayload = Partial<CreateAnnualBudgetPayload>;

export interface CreateBudgetAllocationPayload {
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
	description?: string;
}

export type UpdateBudgetAllocationPayload = Partial<CreateBudgetAllocationPayload>;

export interface CreateBudgetRevisionPayload {
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
	description?: string;
}

export type UpdateBudgetRevisionPayload = Partial<CreateBudgetRevisionPayload>;

export interface BudgetDecisionPayload {
	approvedBy?: string;
	reason?: string;
}

/** Expenses */
export interface CreateExpensePayload {
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

export type UpdateExpensePayload = Partial<CreateExpensePayload>;

export interface ExpenseDecisionPayload {
	approvedBy?: string;
	reason?: string;
}

export interface PostExpensePayload {
	glReference?: string;
	postedBy?: string;
}

/** Inventory */
export interface InventoryAdjustmentPayload {
	productCode: string;
	productName: string;
	warehouse: string;
	quantity: number;
	unitCost: number;
	adjustmentValue: number;
	reason: string;
	adjustmentAccount: string;
}
