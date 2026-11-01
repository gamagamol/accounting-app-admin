import type { AnnualBudget, BudgetAllocation, ExpenseEntry } from '$lib/types';

export interface ApiDocument {
	header: Record<string, any>;
	lines: Record<string, any>[];
}

const text = (value: unknown, fallback = ''): string =>
	value === null || value === undefined ? fallback : String(value);

const number = (value: unknown): number => {
	const parsed = Number(value ?? 0);
	return Number.isFinite(parsed) ? parsed : 0;
};

export function mapExpenseHeader(row: Record<string, any>): ExpenseEntry {
	const paymentMethod = text(row.payment_method, 'transfer');
	return {
		id: text(row.id),
		date: text(row.document_date),
		expenseNo: text(row.document_number),
		expenseType: row.expense_type ?? 'other',
		category: text(row.category),
		accountCode: text(row.account_code),
		accountName: text(row.account_name),
		departmentCode: text(row.department_code ?? row.department_id),
		departmentName: text(row.department_name),
		budgetId: text(row.budget_plan_id),
		budgetNo: text(row.budget_number),
		employeeId: text(row.employee_id),
		employeeName: text(row.employee_name),
		supplierName: text(row.supplier_name),
		description: text(row.description),
		amount: number(row.subtotal),
		taxAmount: number(row.tax_amount),
		totalAmount: number(row.grand_total),
		paymentMethod,
		bankAccount: text(row.bank_account_id),
		paidTo: text(row.paid_to),
		status: row.status ?? 'draft',
		attachmentUrl: text(row.attachment_url),
		notes: text(row.notes),
		submittedBy: text(row.submitted_by),
		approvedBy: text(row.approved_by),
		postedAt: text(row.posted_at),
		glReference: text(row.journal_id),
		rootTransactionId: text(row.root_transaction_id)
	};
}

export function mapExpenseDocument(doc: ApiDocument): ExpenseEntry {
	const mapped = mapExpenseHeader(doc.header);
	const firstLine = doc.lines?.[0];
	if (firstLine) {
		mapped.accountCode = text(firstLine.coa_id, mapped.accountCode);
		mapped.accountName = text(firstLine.description, mapped.accountName);
	}
	return mapped;
}

export function mapBudgetHeader(row: Record<string, any>): AnnualBudget {
	return {
		id: text(row.id),
		budgetNo: text(row.budget_number),
		fiscalYear: number(row.fiscal_year),
		name: text(row.name),
		departmentCode: text(row.department_code ?? row.department_id),
		departmentName: text(row.department_name),
		totalAmount: number(row.total_amount),
		status: row.status ?? 'draft',
		preparedBy: text(row.prepared_by),
		approvedBy: text(row.approved_by),
		createdAt: text(row.created_at),
		notes: text(row.notes),
		rootTransactionId: text(row.root_transaction_id)
	};
}

export function mapBudgetDocument(doc: ApiDocument): AnnualBudget {
	return mapBudgetHeader(doc.header);
}

export function mapAllocationRow(row: Record<string, any>): BudgetAllocation {
	return {
		id: text(row.allocation_id ?? row.id),
		detailId: text(row.id),
		budgetId: text(row.budget_plan_id),
		budgetNo: text(row.budget_number),
		fiscalYear: number(row.fiscal_year),
		accountCode: text(row.account_code ?? row.coa_id),
		accountName: text(row.account_name ?? row.notes ?? row.description),
		departmentCode: text(row.department_code ?? row.department_id),
		departmentName: text(row.department_name),
		allocatedAmount: number(row.allocated_amount),
		usedAmount: number(row.used_amount),
		notes: text(row.notes),
		rootTransactionId: text(row.root_transaction_id)
	};
}

export function mapAllocationDocument(doc: ApiDocument): BudgetAllocation {
	const header = doc.header;
	const firstLine = doc.lines?.[0] ?? {};
	const allocated = doc.lines?.reduce((sum, line) => sum + number(line.allocated_amount), 0) ?? 0;
	const used = doc.lines?.reduce((sum, line) => sum + number(line.used_amount), 0) ?? 0;
	return {
		id: text(header.id),
		detailId: text(firstLine.id),
		budgetId: text(header.budget_plan_id),
		budgetNo: text(header.budget_number),
		fiscalYear: number(header.fiscal_year),
		accountCode: text(header.account_code ?? firstLine.account_code ?? firstLine.coa_id),
		accountName: text(
			header.account_name ?? firstLine.account_name ?? firstLine.notes ?? firstLine.description
		),
		departmentCode: text(header.department_code ?? firstLine.department_id ?? header.department_id),
		departmentName: text(header.department_name),
		allocatedAmount: allocated,
		usedAmount: used,
		notes: text(header.notes),
		rootTransactionId: text(header.root_transaction_id)
	};
}
