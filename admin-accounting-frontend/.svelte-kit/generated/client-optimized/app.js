// in dev, this makes Vite inject its client as this module's first dependency,
// so that global constant replacements are installed before any other module
// (including user hooks) evaluates. In build it's inert.
import.meta.hot;




export { matchers } from './matchers.js';

export const nodes = [
	() => import('./nodes/0'),
	() => import('./nodes/1'),
	() => import('./nodes/2'),
	() => import('./nodes/3'),
	() => import('./nodes/4'),
	() => import('./nodes/5'),
	() => import('./nodes/6'),
	() => import('./nodes/7'),
	() => import('./nodes/8'),
	() => import('./nodes/9'),
	() => import('./nodes/10'),
	() => import('./nodes/11'),
	() => import('./nodes/12'),
	() => import('./nodes/13'),
	() => import('./nodes/14'),
	() => import('./nodes/15'),
	() => import('./nodes/16'),
	() => import('./nodes/17'),
	() => import('./nodes/18'),
	() => import('./nodes/19'),
	() => import('./nodes/20'),
	() => import('./nodes/21'),
	() => import('./nodes/22'),
	() => import('./nodes/23'),
	() => import('./nodes/24'),
	() => import('./nodes/25'),
	() => import('./nodes/26'),
	() => import('./nodes/27'),
	() => import('./nodes/28'),
	() => import('./nodes/29'),
	() => import('./nodes/30'),
	() => import('./nodes/31'),
	() => import('./nodes/32'),
	() => import('./nodes/33'),
	() => import('./nodes/34'),
	() => import('./nodes/35'),
	() => import('./nodes/36'),
	() => import('./nodes/37'),
	() => import('./nodes/38'),
	() => import('./nodes/39'),
	() => import('./nodes/40'),
	() => import('./nodes/41'),
	() => import('./nodes/42'),
	() => import('./nodes/43'),
	() => import('./nodes/44'),
	() => import('./nodes/45'),
	() => import('./nodes/46'),
	() => import('./nodes/47'),
	() => import('./nodes/48'),
	() => import('./nodes/49'),
	() => import('./nodes/50'),
	() => import('./nodes/51'),
	() => import('./nodes/52'),
	() => import('./nodes/53'),
	() => import('./nodes/54'),
	() => import('./nodes/55'),
	() => import('./nodes/56'),
	() => import('./nodes/57'),
	() => import('./nodes/58'),
	() => import('./nodes/59'),
	() => import('./nodes/60'),
	() => import('./nodes/61'),
	() => import('./nodes/62'),
	() => import('./nodes/63'),
	() => import('./nodes/64')
];

export const server_loads = [];

export const dictionary = {
		"/": [2],
		"/api-contract": [3],
		"/balance-sheet": [4],
		"/bank-accounts": [5],
		"/bank-reconciliation": [6],
		"/bill": [7],
		"/budget-allocation": [8],
		"/budget-approval": [9],
		"/budget-revision": [10],
		"/budget-vs-actual": [11],
		"/budgets": [12],
		"/cash-flow": [13],
		"/coa": [14],
		"/customer-receipt": [16],
		"/customer": [15],
		"/dashboard": [17],
		"/debt-payment": [18],
		"/delivery": [19],
		"/department": [20],
		"/employee": [21],
		"/expense-approval": [22],
		"/expenses": [23],
		"/general-ledger": [24],
		"/goods": [25],
		"/inventory-valuation": [26],
		"/journal-entry": [27],
		"/ledger": [28],
		"/payment-terms": [30],
		"/payment": [29],
		"/period-closing": [31],
		"/posted-expenses": [32],
		"/product-account-mapping": [34],
		"/product": [33],
		"/profit-loss": [35],
		"/purchase-invoice": [37],
		"/purchase-return": [38],
		"/purchase": [36],
		"/quotation": [39],
		"/reports/aging-schedule": [41],
		"/reports/customer-omzet": [42],
		"/reports/gross-profit": [43],
		"/reports/omzet": [44],
		"/reports/order-fulfillment": [45],
		"/reports/outstanding": [46],
		"/reports/purchase-by-vendor": [47],
		"/reports/quotation-detail": [48],
		"/reports/quotation-vs-po": [49],
		"/reports/stock-card": [50],
		"/reports/tax-summary": [51],
		"/reports/transaction-tracking": [52],
		"/report": [40],
		"/sales-invoice": [54],
		"/sales-return": [55],
		"/sales": [53],
		"/settings": [56],
		"/stock-adjustment": [57],
		"/stock-movement": [58],
		"/supplier": [59],
		"/tax-rates": [60],
		"/trial-balance": [61],
		"/uom": [62],
		"/vendor-payment": [63],
		"/warehouse": [64]
	};

export const hooks = {
	handleError: (({ error }) => { console.error(error) }),
	
	reroute: (() => {}),
	transport: {}
};

export const decoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.decode]));
export const encoders = Object.fromEntries(Object.entries(hooks.transport).map(([k, v]) => [k, v.encode]));

export const hash = false;

export const decode = (type, value) => decoders[type](value);

export { default as root } from '../root.svelte';

export const get_error_template = () => import('../shared/error-template.js').then(m => m.default);