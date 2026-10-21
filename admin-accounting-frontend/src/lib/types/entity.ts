export interface SelectOption {
	value: string;
	label: string;
}

export interface FieldDef {
	key: string;
	label: string;
	type?: 'text' | 'number' | 'currency' | 'date' | 'select' | 'textarea' | 'email' | 'tel';
	options?: SelectOption[];
	required?: boolean;
	placeholder?: string;
	colSpan?: 'full' | 'half';
	defaultValue?: string | number;
	badge?: boolean;
	badgeLabels?: Record<string, string>;
	help?: string;
}
