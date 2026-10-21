export const manifest = (() => {
function __memo(fn) {
	let value;
	return () => value ??= (value = fn());
}

return {
	appDir: "_app",
	appPath: "_app",
	assets: new Set([]),
	mimeTypes: {},
	_: {
		client: {start:"_app/immutable/entry/start.DHCX9V-9.js",app:"_app/immutable/entry/app.IXpYlNTA.js",imports:["_app/immutable/entry/start.DHCX9V-9.js","_app/immutable/chunks/CMra9cIr.js","_app/immutable/chunks/DuCFJ0cF.js","_app/immutable/chunks/OA8UcISh.js","_app/immutable/chunks/DslT-xRy.js","_app/immutable/entry/app.IXpYlNTA.js","_app/immutable/chunks/DuCFJ0cF.js","_app/immutable/chunks/D9vxG4dG.js"],stylesheets:[],fonts:[],uses_env_dynamic_public:false},
		nodes: [
			__memo(() => import('./nodes/0.js')),
			__memo(() => import('./nodes/1.js')),
			__memo(() => import('./nodes/2.js')),
			__memo(() => import('./nodes/3.js')),
			__memo(() => import('./nodes/4.js')),
			__memo(() => import('./nodes/5.js')),
			__memo(() => import('./nodes/6.js')),
			__memo(() => import('./nodes/7.js')),
			__memo(() => import('./nodes/8.js')),
			__memo(() => import('./nodes/9.js')),
			__memo(() => import('./nodes/10.js')),
			__memo(() => import('./nodes/11.js')),
			__memo(() => import('./nodes/12.js')),
			__memo(() => import('./nodes/13.js')),
			__memo(() => import('./nodes/14.js')),
			__memo(() => import('./nodes/15.js')),
			__memo(() => import('./nodes/16.js')),
			__memo(() => import('./nodes/17.js')),
			__memo(() => import('./nodes/18.js')),
			__memo(() => import('./nodes/19.js')),
			__memo(() => import('./nodes/20.js')),
			__memo(() => import('./nodes/21.js')),
			__memo(() => import('./nodes/22.js')),
			__memo(() => import('./nodes/23.js')),
			__memo(() => import('./nodes/24.js')),
			__memo(() => import('./nodes/25.js')),
			__memo(() => import('./nodes/26.js')),
			__memo(() => import('./nodes/27.js')),
			__memo(() => import('./nodes/28.js')),
			__memo(() => import('./nodes/29.js')),
			__memo(() => import('./nodes/30.js')),
			__memo(() => import('./nodes/31.js')),
			__memo(() => import('./nodes/32.js')),
			__memo(() => import('./nodes/33.js')),
			__memo(() => import('./nodes/34.js')),
			__memo(() => import('./nodes/35.js')),
			__memo(() => import('./nodes/36.js')),
			__memo(() => import('./nodes/37.js')),
			__memo(() => import('./nodes/38.js')),
			__memo(() => import('./nodes/39.js')),
			__memo(() => import('./nodes/40.js')),
			__memo(() => import('./nodes/41.js')),
			__memo(() => import('./nodes/42.js')),
			__memo(() => import('./nodes/43.js')),
			__memo(() => import('./nodes/44.js')),
			__memo(() => import('./nodes/45.js')),
			__memo(() => import('./nodes/46.js')),
			__memo(() => import('./nodes/47.js')),
			__memo(() => import('./nodes/48.js')),
			__memo(() => import('./nodes/49.js')),
			__memo(() => import('./nodes/50.js')),
			__memo(() => import('./nodes/51.js')),
			__memo(() => import('./nodes/52.js')),
			__memo(() => import('./nodes/53.js')),
			__memo(() => import('./nodes/54.js')),
			__memo(() => import('./nodes/55.js')),
			__memo(() => import('./nodes/56.js')),
			__memo(() => import('./nodes/57.js')),
			__memo(() => import('./nodes/58.js')),
			__memo(() => import('./nodes/59.js')),
			__memo(() => import('./nodes/60.js')),
			__memo(() => import('./nodes/61.js')),
			__memo(() => import('./nodes/62.js')),
			__memo(() => import('./nodes/63.js')),
			__memo(() => import('./nodes/64.js'))
		],
		remotes: {
			
		},
		routes: [
			{
				id: "/",
				pattern: /^\/$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 2 },
				endpoint: null
			},
			{
				id: "/api-contract",
				pattern: /^\/api-contract\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 3 },
				endpoint: null
			},
			{
				id: "/balance-sheet",
				pattern: /^\/balance-sheet\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 4 },
				endpoint: null
			},
			{
				id: "/bank-accounts",
				pattern: /^\/bank-accounts\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 5 },
				endpoint: null
			},
			{
				id: "/bank-reconciliation",
				pattern: /^\/bank-reconciliation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 6 },
				endpoint: null
			},
			{
				id: "/bill",
				pattern: /^\/bill\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 7 },
				endpoint: null
			},
			{
				id: "/budget-allocation",
				pattern: /^\/budget-allocation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 8 },
				endpoint: null
			},
			{
				id: "/budget-approval",
				pattern: /^\/budget-approval\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 9 },
				endpoint: null
			},
			{
				id: "/budget-revision",
				pattern: /^\/budget-revision\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 10 },
				endpoint: null
			},
			{
				id: "/budget-vs-actual",
				pattern: /^\/budget-vs-actual\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 11 },
				endpoint: null
			},
			{
				id: "/budgets",
				pattern: /^\/budgets\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 12 },
				endpoint: null
			},
			{
				id: "/cash-flow",
				pattern: /^\/cash-flow\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 13 },
				endpoint: null
			},
			{
				id: "/coa",
				pattern: /^\/coa\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 14 },
				endpoint: null
			},
			{
				id: "/customer-receipt",
				pattern: /^\/customer-receipt\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 16 },
				endpoint: null
			},
			{
				id: "/customer",
				pattern: /^\/customer\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 15 },
				endpoint: null
			},
			{
				id: "/dashboard",
				pattern: /^\/dashboard\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 17 },
				endpoint: null
			},
			{
				id: "/debt-payment",
				pattern: /^\/debt-payment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 18 },
				endpoint: null
			},
			{
				id: "/delivery",
				pattern: /^\/delivery\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 19 },
				endpoint: null
			},
			{
				id: "/department",
				pattern: /^\/department\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 20 },
				endpoint: null
			},
			{
				id: "/employee",
				pattern: /^\/employee\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 21 },
				endpoint: null
			},
			{
				id: "/expense-approval",
				pattern: /^\/expense-approval\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 22 },
				endpoint: null
			},
			{
				id: "/expenses",
				pattern: /^\/expenses\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 23 },
				endpoint: null
			},
			{
				id: "/general-ledger",
				pattern: /^\/general-ledger\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 24 },
				endpoint: null
			},
			{
				id: "/goods",
				pattern: /^\/goods\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 25 },
				endpoint: null
			},
			{
				id: "/inventory-valuation",
				pattern: /^\/inventory-valuation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 26 },
				endpoint: null
			},
			{
				id: "/journal-entry",
				pattern: /^\/journal-entry\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 27 },
				endpoint: null
			},
			{
				id: "/ledger",
				pattern: /^\/ledger\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 28 },
				endpoint: null
			},
			{
				id: "/payment-terms",
				pattern: /^\/payment-terms\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 30 },
				endpoint: null
			},
			{
				id: "/payment",
				pattern: /^\/payment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 29 },
				endpoint: null
			},
			{
				id: "/period-closing",
				pattern: /^\/period-closing\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 31 },
				endpoint: null
			},
			{
				id: "/posted-expenses",
				pattern: /^\/posted-expenses\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 32 },
				endpoint: null
			},
			{
				id: "/product-account-mapping",
				pattern: /^\/product-account-mapping\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 34 },
				endpoint: null
			},
			{
				id: "/product",
				pattern: /^\/product\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 33 },
				endpoint: null
			},
			{
				id: "/profit-loss",
				pattern: /^\/profit-loss\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 35 },
				endpoint: null
			},
			{
				id: "/purchase-invoice",
				pattern: /^\/purchase-invoice\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 37 },
				endpoint: null
			},
			{
				id: "/purchase-return",
				pattern: /^\/purchase-return\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 38 },
				endpoint: null
			},
			{
				id: "/purchase",
				pattern: /^\/purchase\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 36 },
				endpoint: null
			},
			{
				id: "/quotation",
				pattern: /^\/quotation\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 39 },
				endpoint: null
			},
			{
				id: "/reports/aging-schedule",
				pattern: /^\/reports\/aging-schedule\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 41 },
				endpoint: null
			},
			{
				id: "/reports/customer-omzet",
				pattern: /^\/reports\/customer-omzet\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 42 },
				endpoint: null
			},
			{
				id: "/reports/gross-profit",
				pattern: /^\/reports\/gross-profit\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 43 },
				endpoint: null
			},
			{
				id: "/reports/omzet",
				pattern: /^\/reports\/omzet\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 44 },
				endpoint: null
			},
			{
				id: "/reports/order-fulfillment",
				pattern: /^\/reports\/order-fulfillment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 45 },
				endpoint: null
			},
			{
				id: "/reports/outstanding",
				pattern: /^\/reports\/outstanding\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 46 },
				endpoint: null
			},
			{
				id: "/reports/purchase-by-vendor",
				pattern: /^\/reports\/purchase-by-vendor\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 47 },
				endpoint: null
			},
			{
				id: "/reports/quotation-detail",
				pattern: /^\/reports\/quotation-detail\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 48 },
				endpoint: null
			},
			{
				id: "/reports/quotation-vs-po",
				pattern: /^\/reports\/quotation-vs-po\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 49 },
				endpoint: null
			},
			{
				id: "/reports/stock-card",
				pattern: /^\/reports\/stock-card\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 50 },
				endpoint: null
			},
			{
				id: "/reports/tax-summary",
				pattern: /^\/reports\/tax-summary\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 51 },
				endpoint: null
			},
			{
				id: "/reports/transaction-tracking",
				pattern: /^\/reports\/transaction-tracking\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 52 },
				endpoint: null
			},
			{
				id: "/report",
				pattern: /^\/report\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 40 },
				endpoint: null
			},
			{
				id: "/sales-invoice",
				pattern: /^\/sales-invoice\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 54 },
				endpoint: null
			},
			{
				id: "/sales-return",
				pattern: /^\/sales-return\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 55 },
				endpoint: null
			},
			{
				id: "/sales",
				pattern: /^\/sales\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 53 },
				endpoint: null
			},
			{
				id: "/settings",
				pattern: /^\/settings\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 56 },
				endpoint: null
			},
			{
				id: "/stock-adjustment",
				pattern: /^\/stock-adjustment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 57 },
				endpoint: null
			},
			{
				id: "/stock-movement",
				pattern: /^\/stock-movement\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 58 },
				endpoint: null
			},
			{
				id: "/supplier",
				pattern: /^\/supplier\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 59 },
				endpoint: null
			},
			{
				id: "/tax-rates",
				pattern: /^\/tax-rates\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 60 },
				endpoint: null
			},
			{
				id: "/trial-balance",
				pattern: /^\/trial-balance\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 61 },
				endpoint: null
			},
			{
				id: "/uom",
				pattern: /^\/uom\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 62 },
				endpoint: null
			},
			{
				id: "/vendor-payment",
				pattern: /^\/vendor-payment\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 63 },
				endpoint: null
			},
			{
				id: "/warehouse",
				pattern: /^\/warehouse\/?$/,
				params: [],
				page: { layouts: [0,], errors: [1,], leaf: 64 },
				endpoint: null
			}
		],
		prerendered_routes: new Set([]),
		matchers: async () => {
			
			return {  };
		},
		server_assets: {}
	}
}
})();
