
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
		RouteId(): "/" | "/bill" | "/coa" | "/customer" | "/dashboard" | "/debt-payment" | "/delivery" | "/employee" | "/goods" | "/ledger" | "/payment" | "/product" | "/purchase" | "/quotation" | "/report" | "/sales" | "/settings" | "/supplier";
		RouteParams(): {
			
		};
		LayoutParams(): {
			"/": Record<string, never>;
			"/bill": Record<string, never>;
			"/coa": Record<string, never>;
			"/customer": Record<string, never>;
			"/dashboard": Record<string, never>;
			"/debt-payment": Record<string, never>;
			"/delivery": Record<string, never>;
			"/employee": Record<string, never>;
			"/goods": Record<string, never>;
			"/ledger": Record<string, never>;
			"/payment": Record<string, never>;
			"/product": Record<string, never>;
			"/purchase": Record<string, never>;
			"/quotation": Record<string, never>;
			"/report": Record<string, never>;
			"/sales": Record<string, never>;
			"/settings": Record<string, never>;
			"/supplier": Record<string, never>
		};
		Pathname(): "/" | "/bill" | "/coa" | "/customer" | "/dashboard" | "/debt-payment" | "/delivery" | "/employee" | "/goods" | "/ledger" | "/payment" | "/product" | "/purchase" | "/quotation" | "/report" | "/sales" | "/settings" | "/supplier";
		ResolvedPathname(): `${"" | `/${string}`}${ReturnType<AppTypes['Pathname']>}`;
		Asset(): string & {};
	}
}