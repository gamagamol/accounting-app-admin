import type { NavGroup, NavItem } from '$lib/types';

export const mainNavItems: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: '📊' }
];

export const navGroups: NavGroup[] = [
	{
		label: 'Master Data',
		icon: '🗂️',
		items: [
			{ label: 'Chart of Accounts (COA)', href: '/coa', icon: '📒' },
			{ label: 'Customer', href: '/customer', icon: '👥' },
			{ label: 'Supplier', href: '/supplier', icon: '🚚' },
			{ label: 'Employee', href: '/employee', icon: '🪪' },
			{ label: 'Product Category', href: '/product-category', icon: '🏷️' },
			{ label: 'Product', href: '/product', icon: '📦' },
			{ label: 'Unit of Measurement (UoM)', href: '/uom', icon: '📐' },
			{ label: 'Warehouse / Location', href: '/warehouse', icon: '🏭' },
			{ label: 'Tax Rates', href: '/tax-rates', icon: '🧮' },
			{ label: 'Terms of Payment', href: '/payment-terms', icon: '📅' },
			{ label: 'Bank & Cash Accounts', href: '/bank-accounts', icon: '🏦' },
			{ label: 'Departments', href: '/department', icon: '🏢' },
			{ label: 'Cost Centers', href: '/cost-center', icon: '🧾' },
			{ label: 'Payroll Components', href: '/payroll-component', icon: '💼' }
		]
	},
	{
		label: 'Sales Module',
		icon: '💳',
		items: [
			{ label: 'Quotation', href: '/quotation', icon: '📄' },
			{ label: 'Sales Order', href: '/sales', icon: '🛒' },
			{ label: 'Delivery', href: '/delivery', icon: '🚚' },
			{ label: 'Sales Invoice', href: '/sales-invoice', icon: '🧾' },
			{ label: 'Customer Receipt', href: '/customer-receipt', icon: '💵' },
			{ label: 'Sales Return / Credit Note', href: '/sales-return', icon: '↩️' }
		]
	},
	{
		label: 'Purchase Module',
		icon: '🛍️',
		items: [
			{ label: 'Purchase Order', href: '/purchase', icon: '📋' },
			{ label: 'Goods Receipt', href: '/goods', icon: '📥' },
			{ label: 'Purchase Invoice', href: '/purchase-invoice', icon: '🧾' },
			{ label: 'Vendor Payment', href: '/vendor-payment', icon: '🏦' },
			{ label: 'Purchase Return / Debit Note', href: '/purchase-return', icon: '↪️' }
		]
	},
	{
		label: 'Inventory',
		icon: '📦',
		items: [
			{ label: 'Stock Movement', href: '/stock-movement', icon: '🔁' },
			{ label: 'Stock Adjustment', href: '/stock-adjustment', icon: '⚖️' },
			{ label: 'Stock Card', href: '/stock-card', icon: '🗃️' },
			{ label: 'Product Account Mapping', href: '/product-account-mapping', icon: '🔗' },
			{ label: 'Inventory Valuation / Adjustment', href: '/inventory-valuation', icon: '🏷️' }
		]
	},
	{
		label: 'Accounting & Financial Reports',
		icon: '📘',
		items: [
			{ label: 'Closing Period', href: '/period-closing', icon: '🔒' },
			{ label: 'Journal', href: '/journal', icon: '📘' },
			{ label: 'General Ledger', href: '/general-ledger', icon: '📚' },
			{ label: 'Trial Balance', href: '/trial-balance', icon: '⚖️' },
			{ label: 'Profit & Loss', href: '/profit-loss', icon: '📈' },
			{ label: 'Balance Sheet', href: '/balance-sheet', icon: '🏛️' }
		]
	},
	{
		label: 'Operational & Management Reports',
		icon: '📊',
		items: [
			{ label: 'Aging Schedule', href: '/reports/aging-schedule', icon: '⏰' },
			{ label: 'Quotation vs PO', href: '/reports/quotation-vs-po', icon: '📊' },
			{ label: 'Quotation Detail', href: '/reports/quotation-detail', icon: '📑' },
			{ label: 'Customer Omzet', href: '/reports/customer-omzet', icon: '👥' },
			{ label: 'Outstanding Report', href: '/reports/outstanding', icon: '⚠️' },
			{ label: 'Omzet Report', href: '/reports/omzet', icon: '📈' },
			{ label: 'Transaction Tracking', href: '/reports/transaction-tracking', icon: '🚀' },
			{ label: 'Order Fulfillment (SO vs DO)', href: '/reports/order-fulfillment', icon: '📦' },
			{ label: 'Purchase by Vendor Report', href: '/reports/purchase-by-vendor', icon: '🏷️' },
			{ label: 'Gross Profit by Product', href: '/reports/gross-profit', icon: '💰' },
			{ label: 'Tax Summary', href: '/reports/tax-summary', icon: '🧾' }
		]
	},
	{
		label: 'Expense & Budgeting',
		icon: '💼',
		items: [
			{ label: 'Annual Budget Plan', href: '/budgets', icon: '🎯' },
			{ label: 'Budget Approval', href: '/budget-approval', icon: '✅' },
			{ label: 'Budget Allocation', href: '/budget-allocation', icon: '🧩' },
			{ label: 'Expense Entry', href: '/expenses', icon: '💳' },
			{ label: 'Expense Approval', href: '/expense-approval', icon: '🔎' },
			{ label: 'Posted Expenses (GL)', href: '/posted-expenses', icon: '📘' },
			{ label: 'Budget vs Actual', href: '/budget-vs-actual', icon: '📊' },
			{ label: 'Budget Revision', href: '/budget-revision', icon: '🔁' }
		]
	},
	{
		label: 'System Configuration',
		icon: '⚙️',
		items: [
			{ label: 'Company Profile', href: '/settings?tab=company', icon: '🏢' },
			{ label: 'User Management', href: '/settings?tab=users', icon: '🔐' },
			{ label: 'Application Config', href: '/app-config', icon: '🧩' },
			{ label: 'Appearance & Theme', href: '/settings?tab=appearance', icon: '🎨' },
			{ label: 'API Integration & Payloads', href: '/api-contract', icon: '🔌' }
		]
	}
];

// Flat navigation items for quick lookups.
export const navigation: { name: string; href: string; icon?: string }[] = [
	{ name: 'Dashboard', href: '/dashboard', icon: 'dashboard' },
	...navGroups.flatMap((group) =>
		group.items.map((item) => ({ name: item.label, href: item.href, icon: item.icon }))
	)
];
