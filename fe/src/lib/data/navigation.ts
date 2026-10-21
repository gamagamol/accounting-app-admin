import type { NavGroup, NavItem } from '$lib/types';

export const mainNavItems: NavItem[] = [
	{ label: 'Dashboard', href: '/dashboard', icon: 'tachometer-alt' }
];

export const navGroups: NavGroup[] = [
	{
		label: 'Master Data',
		icon: 'folder-open',
		roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'ACCOUNTING_ADMIN'],
		items: [
			{ label: 'Product', href: '/product', icon: 'box' },
			{ label: 'Customer', href: '/customer', icon: 'users' },
			{ label: 'Chart of Account', href: '/coa', icon: 'list' },
			{ label: 'Supplier', href: '/supplier', icon: 'truck' },
			{ label: 'Employee', href: '/employee', icon: 'id-badge' }
		]
	},
	{
		label: 'Transaction',
		icon: 'hand-holding-usd',
		roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'ACCOUNTING_ADMIN'],
		items: [
			{ label: 'Quotation', href: '/quotation', icon: 'file-alt' },
			{ label: 'Sales Order', href: '/sales', icon: 'shopping-cart' },
			{ label: 'Purchase Order', href: '/purchase', icon: 'cart-plus' },
			{ label: 'Goods Receipt', href: '/goods', icon: 'dolly' },
			{ label: 'Delivery', href: '/delivery', icon: 'shipping-fast' },
			{ label: 'Bill Payment', href: '/bill', icon: 'file-invoice-dollar' },
			{ label: 'Payment', href: '/payment', icon: 'money-bill' },
			{ label: 'Debt Payment', href: '/debt-payment', icon: 'money-check' }
		]
	},
	{
		label: 'Report',
		icon: 'book',
		roles: ['SUPER_ADMIN', 'SALES_ADMIN', 'ACCOUNTING_ADMIN', 'OWNER'],
		items: [
			{ label: 'All Reports & Analytics', href: '/report', icon: 'chart-pie' },
			{ label: 'General Ledger', href: '/ledger', icon: 'book' }
		]
	}
];

// Flat navigation items for simple loops or quick lookups
export const navigation: { name: string; href: string; icon?: string }[] = [
	{ name: 'Dashboard', href: '/dashboard', icon: 'tachometer-alt' },
	{ name: 'Product', href: '/product', icon: 'box' },
	{ name: 'Customer', href: '/customer', icon: 'users' },
	{ name: 'Chart of Account', href: '/coa', icon: 'list' },
	{ name: 'Supplier', href: '/supplier', icon: 'truck' },
	{ name: 'Employee', href: '/employee', icon: 'id-badge' },
	{ name: 'Quotation', href: '/quotation', icon: 'file-alt' },
	{ name: 'Sales Order', href: '/sales', icon: 'shopping-cart' },
	{ name: 'Purchase Order', href: '/purchase', icon: 'cart-plus' },
	{ name: 'Goods Receipt', href: '/goods', icon: 'dolly' },
	{ name: 'Delivery', href: '/delivery', icon: 'shipping-fast' },
	{ name: 'Bill Payment', href: '/bill', icon: 'file-invoice-dollar' },
	{ name: 'Payment', href: '/payment', icon: 'money-bill' },
	{ name: 'Debt Payment', href: '/debt-payment', icon: 'money-check' },
	{ name: 'Reports', href: '/report', icon: 'chart-bar' },
	{ name: 'General Ledger', href: '/ledger', icon: 'book' },
	{ name: 'Settings & Users', href: '/settings', icon: 'cog' }
];