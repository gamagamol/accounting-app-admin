import type * as Kit from '@sveltejs/kit';

type Expand<T> = T extends infer O ? { [K in keyof O]: O[K] } : never;
type MatcherParam<M> = M extends (param : string) => param is (infer U extends string) ? U : string;
type RouteParams = {  };
type RouteId = '/';
type MaybeWithVoid<T> = {} extends T ? T | void : T;
export type RequiredKeys<T> = { [K in keyof T]-?: {} extends { [P in K]: T[K] } ? never : K; }[keyof T];
type OutputDataShape<T> = MaybeWithVoid<Omit<App.PageData, RequiredKeys<T>> & Partial<Pick<App.PageData, keyof T & keyof App.PageData>> & Record<string, any>>
type EnsureDefined<T> = T extends null | undefined ? {} : T;
type OptionalUnion<U extends Record<string, any>, A extends keyof U = U extends U ? keyof U : never> = U extends unknown ? { [P in Exclude<A, keyof U>]?: never } & U : never;
export type Snapshot<T = any> = Kit.Snapshot<T>;
type PageParentData = EnsureDefined<LayoutData>;
type LayoutRouteId = RouteId | "/" | "/api-contract" | "/balance-sheet" | "/bank-accounts" | "/bank-reconciliation" | "/bill" | "/budget-allocation" | "/budget-approval" | "/budget-revision" | "/budget-vs-actual" | "/budgets" | "/cash-flow" | "/coa" | "/customer" | "/customer-receipt" | "/dashboard" | "/debt-payment" | "/delivery" | "/department" | "/employee" | "/expense-approval" | "/expenses" | "/general-ledger" | "/goods" | "/inventory-valuation" | "/journal-entry" | "/ledger" | "/payment" | "/payment-terms" | "/period-closing" | "/posted-expenses" | "/product" | "/product-account-mapping" | "/profit-loss" | "/purchase" | "/purchase-invoice" | "/purchase-return" | "/quotation" | "/report" | "/reports/aging-schedule" | "/reports/customer-omzet" | "/reports/gross-profit" | "/reports/omzet" | "/reports/order-fulfillment" | "/reports/outstanding" | "/reports/purchase-by-vendor" | "/reports/quotation-detail" | "/reports/quotation-vs-po" | "/reports/stock-card" | "/reports/tax-summary" | "/reports/transaction-tracking" | "/sales" | "/sales-invoice" | "/sales-return" | "/settings" | "/stock-adjustment" | "/stock-movement" | "/supplier" | "/tax-rates" | "/trial-balance" | "/uom" | "/vendor-payment" | "/warehouse" | null
type LayoutParams = RouteParams & {  }
type LayoutParentData = EnsureDefined<{}>;

export type PageServerData = null;
export type PageData = Expand<PageParentData>;
export type PageProps = { params: RouteParams; data: PageData }
export type LayoutServerData = null;
export type LayoutData = Expand<LayoutParentData>;
export type LayoutProps = { params: LayoutParams; data: LayoutData; children: import("svelte").Snippet }