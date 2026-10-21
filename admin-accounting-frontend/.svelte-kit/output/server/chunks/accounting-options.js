const expenseTypeOptions = [
  {
    value: "salary",
    label: "Employee Salary",
    category: "Employee Salary",
    accountCode: "6-1000",
    icon: "👔",
    hint: "Payroll, wages, allowances and employee compensation."
  },
  {
    value: "purchase",
    label: "Purchase Expense",
    category: "Direct Material Purchase",
    accountCode: "5-1000",
    icon: "📦",
    hint: "Direct material or operational purchase not recorded as a supplier invoice."
  },
  {
    value: "office_supplies",
    label: "Office Supplies (ATK)",
    category: "Office Supplies (ATK)",
    accountCode: "6-1200",
    icon: "✏️",
    hint: "Stationery, toner, paper, folders and other office consumables."
  },
  {
    value: "utilities",
    label: "Utilities",
    category: "Utilities",
    accountCode: "6-1100",
    icon: "💡",
    hint: "Electricity, water, internet and other building utilities."
  },
  {
    value: "logistics",
    label: "Logistics & Freight",
    category: "Logistics",
    accountCode: "6-2000",
    icon: "🚚",
    hint: "Courier, freight forwarding and transportation cost."
  },
  {
    value: "maintenance",
    label: "Maintenance",
    category: "Maintenance",
    accountCode: "6-3000",
    icon: "🔧",
    hint: "Repair, spare parts and preventive maintenance."
  },
  {
    value: "travel",
    label: "Travel & Accommodation",
    category: "Travel & Accommodation",
    accountCode: "6-4000",
    icon: "✈️",
    hint: "Business trip, accommodation and employee reimbursement."
  },
  {
    value: "other",
    label: "Other Operating Expense",
    category: "Other Operating Expense",
    accountCode: "6-9000",
    icon: "🧾",
    hint: "Any operating expense that does not fit the categories above."
  }
];
const expenseTypeMap = Object.fromEntries(
  expenseTypeOptions.map((option) => [option.value, option])
);
const expenseStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "posted", label: "Posted to GL" }
];
const budgetStatusOptions = [
  { value: "draft", label: "Draft" },
  { value: "submitted", label: "Submitted" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" },
  { value: "revised", label: "Revised" },
  { value: "closed", label: "Closed" }
];
const budgetRevisionStatusOptions = [
  { value: "pending", label: "Pending" },
  { value: "approved", label: "Approved" },
  { value: "rejected", label: "Rejected" }
];
const paymentMethodOptions = [
  { value: "Bank Transfer", label: "Bank Transfer" },
  { value: "Petty Cash", label: "Petty Cash" },
  { value: "Cash", label: "Cash" },
  { value: "Credit Card", label: "Credit Card" },
  { value: "Cheque", label: "Cheque" }
];
function expenseTypeLabel(type) {
  return expenseTypeMap[type]?.label ?? type;
}
function defaultExpenseAccount(type) {
  return expenseTypeMap[type]?.accountCode ?? "6-9000";
}
function defaultExpenseCategory(type) {
  return expenseTypeMap[type]?.category ?? "Other Operating Expense";
}
export {
  budgetStatusOptions as a,
  budgetRevisionStatusOptions as b,
  defaultExpenseCategory as c,
  defaultExpenseAccount as d,
  expenseTypeLabel as e,
  expenseTypeMap as f,
  expenseTypeOptions as g,
  expenseStatusOptions as h,
  paymentMethodOptions as p
};
