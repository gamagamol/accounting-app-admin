
// this file is generated — do not edit it


declare module "svelte/elements" {
	export interface HTMLAttributes<T> {
		'data-sveltekit-keepfocus'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-noscroll'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-preload-code'?:
			| true
			| ''
			| 'eager'
			| 'viewport'
			| 'hover'
			| 'tap'
			| 'off'
			| undefined
			| null;
		'data-sveltekit-preload-data'?: true | '' | 'hover' | 'tap' | 'off' | undefined | null;
		'data-sveltekit-reload'?: true | '' | 'off' | undefined | null;
		'data-sveltekit-replacestate'?: true | '' | 'off' | undefined | null;
	}
}

export {};


declare module "$app/types" {
	type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;

	export interface AppTypes {
		RouteId(): "/" | "/api-contract" | "/balance-sheet" | "/bank-accounts" | "/bank-reconciliation" | "/bill" | "/budget-allocation" | "/budget-approval" | "/budget-revision" | "/budget-vs-actual" | "/budgets" | "/cash-flow" | "/coa" | "/customer-receipt" | "/customer" | "/dashboard" | "/debt-payment" | "/delivery" | "/department" | "/employee" | "/expense-approval" | "/expenses" | "/general-ledger" | "/goods" | "/inventory-valuation" | "/journal-entry" | "/ledger" | "/payment-terms" | "/payment" | "/period-closing" | "/posted-expenses" | "/product-account-mapping" | "/product" | "/profit-loss" | "/purchase-invoice" | "/purchase-return" | "/purchase" | "/quotation" | "/reports" | "/reports/aging-schedule" | "/reports/customer-omzet" | "/reports/gross-profit" | "/reports/omzet" | "/reports/order-fulfillment" | "/reports/outstanding" | "/reports/purchase-by-vendor" | "/reports/quotation-detail" | "/reports/quotation-vs-po" | "/reports/stock-card" | "/reports/tax-summary" | "/reports/transaction-tracking" | "/report" | "/sales-invoice" | "/sales-return" | "/sales" | "/settings" | "/stock-adjustment" | "/stock-movement" | "/supplier" | "/tax-rates" | "/trial-balance" | "/uom" | "/vendor-payment" | "/warehouse";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/api-contract": Record<string, never>;
			"/balance-sheet": Record<string, never>;
			"/bank-accounts": Record<string, never>;
			"/bank-reconciliation": Record<string, never>;
			"/bill": Record<string, never>;
			"/budget-allocation": Record<string, never>;
			"/budget-approval": Record<string, never>;
			"/budget-revision": Record<string, never>;
			"/budget-vs-actual": Record<string, never>;
			"/budgets": Record<string, never>;
			"/cash-flow": Record<string, never>;
			"/coa": Record<string, never>;
			"/customer-receipt": Record<string, never>;
			"/customer": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/debt-payment": Record<string, never>;
			"/delivery": Record<string, never>;
			"/department": Record<string, never>;
			"/employee": Record<string, never>;
			"/expense-approval": Record<string, never>;
			"/expenses": Record<string, never>;
			"/general-ledger": Record<string, never>;
			"/goods": Record<string, never>;
			"/inventory-valuation": Record<string, never>;
			"/journal-entry": Record<string, never>;
			"/ledger": Record<string, never>;
			"/payment-terms": Record<string, never>;
			"/payment": Record<string, never>;
			"/period-closing": Record<string, never>;
			"/posted-expenses": Record<string, never>;
			"/product-account-mapping": Record<string, never>;
			"/product": Record<string, never>;
			"/profit-loss": Record<string, never>;
			"/purchase-invoice": Record<string, never>;
			"/purchase-return": Record<string, never>;
			"/purchase": Record<string, never>;
			"/quotation": Record<string, never>;
			"/reports": Record<string, never>;
			"/reports/aging-schedule": Record<string, never>;
			"/reports/customer-omzet": Record<string, never>;
			"/reports/gross-profit": Record<string, never>;
			"/reports/omzet": Record<string, never>;
			"/reports/order-fulfillment": Record<string, never>;
			"/reports/outstanding": Record<string, never>;
			"/reports/purchase-by-vendor": Record<string, never>;
			"/reports/quotation-detail": Record<string, never>;
			"/reports/quotation-vs-po": Record<string, never>;
			"/reports/stock-card": Record<string, never>;
			"/reports/tax-summary": Record<string, never>;
			"/reports/transaction-tracking": Record<string, never>;
			"/report": Record<string, never>;
			"/sales-invoice": Record<string, never>;
			"/sales-return": Record<string, never>;
			"/sales": Record<string, never>;
			"/settings": Record<string, never>;
			"/stock-adjustment": Record<string, never>;
			"/stock-movement": Record<string, never>;
			"/supplier": Record<string, never>;
			"/tax-rates": Record<string, never>;
			"/trial-balance": Record<string, never>;
			"/uom": Record<string, never>;
			"/vendor-payment": Record<string, never>;
			"/warehouse": Record<string, never>
		};
		Pathname(): "/" | "/api-contract" | "/balance-sheet" | "/bank-accounts" | "/bank-reconciliation" | "/bill" | "/budget-allocation" | "/budget-approval" | "/budget-revision" | "/budget-vs-actual" | "/budgets" | "/cash-flow" | "/coa" | "/customer-receipt" | "/customer" | "/dashboard" | "/debt-payment" | "/delivery" | "/department" | "/employee" | "/expense-approval" | "/expenses" | "/general-ledger" | "/goods" | "/inventory-valuation" | "/journal-entry" | "/ledger" | "/payment-terms" | "/payment" | "/period-closing" | "/posted-expenses" | "/product-account-mapping" | "/product" | "/profit-loss" | "/purchase-invoice" | "/purchase-return" | "/purchase" | "/quotation" | "/reports/aging-schedule" | "/reports/customer-omzet" | "/reports/gross-profit" | "/reports/omzet" | "/reports/order-fulfillment" | "/reports/outstanding" | "/reports/purchase-by-vendor" | "/reports/quotation-detail" | "/reports/quotation-vs-po" | "/reports/stock-card" | "/reports/tax-summary" | "/reports/transaction-tracking" | "/report" | "/sales-invoice" | "/sales-return" | "/sales" | "/settings" | "/stock-adjustment" | "/stock-movement" | "/supplier" | "/tax-rates" | "/trial-balance" | "/uom" | "/vendor-payment" | "/warehouse";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}