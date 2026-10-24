export interface CustomerFormData {
	companyName: string;
	city: string;
	contactPerson: string;
	email: string;
	phone: string;
	nb: string;
	npwp: string;
	npwpAddress: string;
	address: string;
	termOfPayment: number;
	notes: string;
}

export interface ProductFormData {
	name: string;
	category: string;
	unit: string;
	price: number;
	stock: number;
	description: string;
}

export interface SupplierFormData {
	companyName: string;
	contactPerson: string;
	email: string;
	phone: string;
	address: string;
	city: string;
	npwp: string;
}

export interface EmployeeFormData {
	name: string;
	position: string;
	email: string;
	phone: string;
	address: string;
}

export interface QuotationFormData {
	date: string;
	customerId: string;
	salesPersonId: string;
	items: TransactionItemFormData[];
	notes: string;
	description?: string;
}

export interface TransactionItemFormData {
	productId: string;
	quantity: number;
	unitPrice: number;
	discount: number;
}

export interface PaymentFormData {
	date: string;
	invoiceNo: string;
	amount: number;
	method: 'cash' | 'transfer' | 'check';
	description?: string;
}
