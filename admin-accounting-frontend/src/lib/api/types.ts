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


// type ExpenseForm = {
//     date: string;
//     expenseNo?: string;
//     expenseType: string;
//     category?: string;

//     departmentId?: number | null;
//     costCenterId?: number | null;
//     budgetPlanId?: number | null;
//     budgetAllocationId?: number | null;
//     employeeId?: number | null;
//     supplierId?: number | null;
//     bankAccountId?: number | null;
//     preparedBy?: number | null;

//     paidTo?: string;
//     paymentMethod?: string;
//     description?: string;
//     notes?: string;
//     actor?: string;

//     accountId: number;
//     accountName?: string;
//     amount: number;
//     taxRateId?: number | null;
//     taxAmount?: number;
//     lineDescription?: string;
//     lineBudgetAllocationId?: number | null;
// };

// export function mapExpenseToApi(form: ExpenseForm) {
//     return {
//         document_number: form.expenseNo || null,
//         document_date: form.date,
//         expense_type: form.expenseType,
//         category: form.category || null,

//         department_id: form.departmentId ?? null,
//         cost_center_id: form.costCenterId ?? null,
//         budget_plan_id: form.budgetPlanId ?? null,
//         budget_allocation_id: form.budgetAllocationId ?? null,
//         employee_id: form.employeeId ?? null,
//         supplier_id: form.supplierId ?? null,

//         paid_to: form.paidTo || null,
//         payment_method: form.paymentMethod || null,
//         bank_account_id: form.bankAccountId ?? null,

//         description: form.description || null,
//         notes: form.notes || null,
//         prepared_by: form.preparedBy ?? null,
//         actor: form.actor || null,

//         lines: [
//             {
//                 coa_id: form.accountId,
//                 description:
//                     form.lineDescription ||
//                     form.accountName ||
//                     form.description ||
//                     null,
//                 amount: form.amount,
//                 tax_rate_id: form.taxRateId ?? null,
//                 tax_amount: form.taxAmount ?? 0,
//                 budget_allocation_id:
//                     form.lineBudgetAllocationId ??
//                     form.budgetAllocationId ??
//                     null,
//             },
//         ],
//     };
// }



export interface CreateExpenseApiRequest {
  document_number: string | null;
  document_date: string;
  expense_type: ExpenseType;
  category: string | null;

  department_id: number | null;
  cost_center_id: number | null;
  budget_plan_id: number | null;
  budget_allocation_id: number | null;

  employee_id: number | null;
  supplier_id: number | null;
  paid_to: string | null;
  payment_method: string | null;
  bank_account_id: number | null;

  description: string | null;
  notes: string | null;
  prepared_by: number | null;
  actor: string | null;

  lines: Array<{
    coa_id: number;
    description: string | null;
    amount: number;
    tax_rate_id: number | null;
    tax_amount: number | null;
    budget_allocation_id: number | null;
  }>;
}

// Referensi berupa ID database, bukan kode/nama yang tampil di form.
export interface ExpenseApiReferences {
  departmentId: number | null;
  costCenterId: number | null;
  budgetPlanId: number | null;
  /** Header-level budget_allocation.id. */
  budgetAllocationId: number | null;
  /** Detail-level budget_allocation_detail.id consumed when posting. */
  lineBudgetAllocationId?: number | null;
  employeeId: number | null;
  supplierId: number | null;
  bankAccountId: number | null;
  preparedBy: number | null;
  coaId: number;
  taxRateId: number | null;
}

/** Budgeting API payloads (snake_case matches the Rust DTOs). */
export interface CreateBudgetApiRequest {
	budget_number: string | null;
	fiscal_year: number;
	name: string;
	department_id: number | null;
	prepared_by: number | null;
	notes: string | null;
	total_amount: number;
	lines: Array<{
		coa_id: number;
		department_id: number | null;
		description: string | null;
		allocated_amount: number;
		notes: string | null;
	}>;
}

export interface CreateAllocationApiRequest {
	allocation_number: string | null;
	budget_plan_id: number;
	allocation_date: string;
	prepared_by: number | null;
	notes: string | null;
	lines: Array<{
		budget_plan_detail_id: number | null;
		coa_id: number;
		department_id: number | null;
		allocated_amount: number;
		notes: string | null;
	}>;
}

export function mapBudgetToApi(
	form: CreateAnnualBudgetPayload,
	refs: { departmentId: number | null; preparedBy: number | null },
): CreateBudgetApiRequest {
	return {
		budget_number: form.budgetNo.trim() || null,
		fiscal_year: Number(form.fiscalYear),
		name: form.name.trim(),
		department_id: refs.departmentId,
		prepared_by: refs.preparedBy,
		notes: form.notes?.trim() || form.description?.trim() || null,
		total_amount: Number(form.totalAmount) || 0,
		lines: []
	};
}

export function mapAllocationToApi(
	form: CreateBudgetAllocationPayload,
	refs: {
		budgetPlanId: number;
		coaId: number;
		departmentId: number | null;
		preparedBy: number | null;
		allocationDate?: string;
	},
): CreateAllocationApiRequest {
	return {
		allocation_number: null,
		budget_plan_id: refs.budgetPlanId,
		allocation_date: refs.allocationDate || new Date().toISOString().split('T')[0],
		prepared_by: refs.preparedBy,
		notes: form.notes?.trim() || form.description?.trim() || null,
		lines: [
			{
				budget_plan_detail_id: null,
				coa_id: refs.coaId,
				department_id: refs.departmentId,
				allocated_amount: Number(form.allocatedAmount) || 0,
				notes: form.notes?.trim() || null
			}
		]
	};
}

export function mapExpenseToApi(
  form: CreateExpensePayload,
  refs: ExpenseApiReferences,
): CreateExpenseApiRequest {
  return {
    document_number: form.expenseNo.trim() || null,
    document_date: form.date,
    expense_type: form.expenseType,
    category: form.category || null,

    department_id: refs.departmentId,
    cost_center_id: refs.costCenterId,
    budget_plan_id: refs.budgetPlanId,
    budget_allocation_id: refs.budgetAllocationId,

    employee_id: refs.employeeId,
    supplier_id: refs.supplierId,
    paid_to: form.paidTo || null,
    payment_method: form.paymentMethod || null,
    bank_account_id: refs.bankAccountId,

    description: form.description.trim() || null,
    notes: form.notes || null,
    prepared_by: refs.preparedBy,
    actor: form.submittedBy || null,

    lines: [
      {
        coa_id: refs.coaId,
        description: form.accountName || form.description || null,
        amount: Number(form.amount),
        tax_rate_id: refs.taxRateId,
        tax_amount: Number(form.taxAmount) || 0,
        budget_allocation_id: refs.lineBudgetAllocationId ?? refs.budgetAllocationId,
      },
    ],
  };
}