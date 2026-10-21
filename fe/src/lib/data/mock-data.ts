import type {
	User,
	Customer,
	Product,
	Supplier,
	Employee,
	ChartOfAccount,
	Quotation,
	SalesOrder,
	PurchaseOrder,
	Delivery,
	GoodsReceipt,
	Payment,
	BillPayment,
	DebtPayment,
	JournalEntry,
	DashboardStats,
	TransactionProgress,
	AppSettings
} from '$lib/types';

// Current logged-in user
export const currentUser: User = {
	id: 'usr-001',
	name: 'Ahmad Fauzi',
	email: 'ahmad.fauzi@byond.co.id',
	role: 'SUPER_ADMIN',
	avatar: ''
};

// Customers
export const customers: Customer[] = [
	{
		id: 'cust-001',
		companyName: 'PT Astra International Tbk',
		city: 'Jakarta',
		contactPerson: 'Budi Santoso',
		email: 'budi.santoso@astra.co.id',
		phone: '021-5089-1234',
		nb: 'NB-001',
		npwp: '01.234.567.8-091.000',
		npwpAddress: 'Jl. Gaya Motor Raya No.8, Sunter II, Jakarta Utara',
		address: 'Jl. Gaya Motor Raya No.8, Sunter II, Jakarta Utara 14330',
		termOfPayment: 30,
		notes: 'Pelanggan prioritas utama'
	},
	{
		id: 'cust-002',
		companyName: 'PT Telkom Indonesia Tbk',
		city: 'Bandung',
		contactPerson: 'Siti Rahayu',
		email: 'siti.rahayu@telkom.co.id',
		phone: '022-4520-1111',
		nb: 'NB-002',
		npwp: '01.345.678.9-423.000',
		npwpAddress: 'Jl. Japati No.1, Bandung',
		address: 'Jl. Japati No.1, Bandung, Jawa Barat 40133',
		termOfPayment: 45,
		notes: 'Term pembayaran khusus 45 hari'
	},
	{
		id: 'cust-003',
		companyName: 'PT Pertamina (Persero)',
		city: 'Jakarta',
		contactPerson: 'Hendra Wijaya',
		email: 'hendra.wijaya@pertamina.com',
		phone: '021-3815-9000',
		nb: 'NB-003',
		npwp: '01.061.127.0-051.000',
		npwpAddress: 'Jl. Medan Merdeka Timur No.1A, Jakarta Pusat',
		address: 'Jl. Medan Merdeka Timur No.1A, Jakarta Pusat 10110',
		termOfPayment: 30,
		notes: 'Kontrak tahunan'
	},
	{
		id: 'cust-004',
		companyName: 'PT Unilever Indonesia Tbk',
		city: 'Tangerang',
		contactPerson: 'Dewi Lestari',
		email: 'dewi.lestari@unilever.com',
		phone: '021-5460-6000',
		nb: 'NB-004',
		npwp: '01.078.219.5-054.000',
		npwpAddress: 'Grha Unilever, BSD City, Tangerang',
		address: 'Grha Unilever, Green Office Park Kav. 3, BSD City, Tangerang 15345',
		termOfPayment: 60,
		notes: 'Pengiriman setiap Senin dan Kamis'
	},
	{
		id: 'cust-005',
		companyName: 'PT Bank Central Asia Tbk',
		city: 'Jakarta',
		contactPerson: 'Rizky Pratama',
		email: 'rizky.pratama@bca.co.id',
		phone: '021-2358-8000',
		nb: 'NB-005',
		npwp: '01.309.148.0-091.000',
		npwpAddress: 'Menara BCA, Jl. MH Thamrin No.1, Jakarta Pusat',
		address: 'Menara BCA, Grand Indonesia, Jl. MH Thamrin No.1, Jakarta Pusat 10310',
		termOfPayment: 30,
		notes: 'Pembayaran via transfer BCA'
	}
];

// Products
export const products: Product[] = [
	{
		id: 'prod-001',
		name: 'Kertas HVS A4 80gsm',
		category: 'Alat Tulis Kantor',
		unit: 'Rim',
		price: 65000,
		stock: 500,
		description: 'Kertas HVS ukuran A4, berat 80 gram per meter persegi, 500 lembar per rim'
	},
	{
		id: 'prod-002',
		name: 'Toner Printer HP LaserJet',
		category: 'Perlengkapan IT',
		unit: 'Unit',
		price: 1250000,
		stock: 50,
		description: 'Toner cartridge original HP LaserJet Pro series, yield 2500 halaman'
	},
	{
		id: 'prod-003',
		name: 'Meja Kantor Direktur',
		category: 'Furniture',
		unit: 'Unit',
		price: 8500000,
		stock: 15,
		description: 'Meja kantor eksekutif kayu jati solid, ukuran 180x90x75cm, laci 3 tingkat'
	},
	{
		id: 'prod-004',
		name: 'Kursi Ergonomis Mesh',
		category: 'Furniture',
		unit: 'Unit',
		price: 3750000,
		stock: 30,
		description: 'Kursi kantor ergonomis dengan sandaran mesh, adjustable armrest dan lumbar support'
	},
	{
		id: 'prod-005',
		name: 'AC Split Daikin 2PK',
		category: 'Elektronik',
		unit: 'Unit',
		price: 12500000,
		stock: 10,
		description: 'AC Split Daikin Inverter 2PK, hemat energi, garansi kompresor 10 tahun'
	}
];

// Suppliers
export const suppliers: Supplier[] = [
	{
		id: 'sup-001',
		companyName: 'CV Mitra Sejahtera',
		contactPerson: 'Agus Priyanto',
		email: 'agus@mitrasejahtera.co.id',
		phone: '021-6543-2100',
		address: 'Jl. Mangga Dua Raya No.45, Jakarta Utara 14430',
		city: 'Jakarta',
		npwp: '02.123.456.7-041.000'
	},
	{
		id: 'sup-002',
		companyName: 'PT Sumber Makmur Abadi',
		contactPerson: 'Lina Kusuma',
		email: 'lina@sumbermakmur.com',
		phone: '031-7891-2345',
		address: 'Jl. Rungkut Industri Raya No.12, Surabaya 60293',
		city: 'Surabaya',
		npwp: '02.234.567.8-631.000'
	},
	{
		id: 'sup-003',
		companyName: 'PT Jaya Abadi Teknik',
		contactPerson: 'Tono Subroto',
		email: 'tono@jayaabadi.co.id',
		phone: '022-8765-4321',
		address: 'Jl. Soekarno-Hatta No.789, Bandung 40286',
		city: 'Bandung',
		npwp: '02.345.678.9-423.000'
	},
	{
		id: 'sup-004',
		companyName: 'CV Karya Indah Furniture',
		contactPerson: 'Wahyu Hidayat',
		email: 'wahyu@karyaindah.com',
		phone: '0271-654-321',
		address: 'Jl. Solo-Sragen KM 7, Karanganyar, Jawa Tengah 57711',
		city: 'Solo',
		npwp: '02.456.789.0-526.000'
	},
	{
		id: 'sup-005',
		companyName: 'PT Nusantara Elektronik',
		contactPerson: 'Rina Susanti',
		email: 'rina@nusantaraelektronik.co.id',
		phone: '021-4567-8901',
		address: 'Jl. Hayam Wuruk No.123, Glodok, Jakarta Barat 11180',
		city: 'Jakarta',
		npwp: '02.567.890.1-034.000'
	}
];

// Employees
export const employees: Employee[] = [
	{
		id: 'emp-001',
		name: 'Ahmad Fauzi',
		position: 'General Manager',
		email: 'ahmad.fauzi@byond.co.id',
		phone: '0812-3456-7890',
		address: 'Jl. Kemang Raya No.12, Jakarta Selatan',
		status: 'active'
	},
	{
		id: 'emp-002',
		name: 'Nurul Hidayah',
		position: 'Accounting Manager',
		email: 'nurul.hidayah@byond.co.id',
		phone: '0813-4567-8901',
		address: 'Jl. Pondok Indah No.45, Jakarta Selatan',
		status: 'active'
	},
	{
		id: 'emp-003',
		name: 'Reza Mahendra',
		position: 'Sales Manager',
		email: 'reza.mahendra@byond.co.id',
		phone: '0814-5678-9012',
		address: 'Jl. Bintaro Jaya Sektor 9 Blok A5, Tangerang Selatan',
		status: 'active'
	},
	{
		id: 'emp-004',
		name: 'Putri Anggraini',
		position: 'Purchasing Staff',
		email: 'putri.anggraini@byond.co.id',
		phone: '0815-6789-0123',
		address: 'Perumahan Griya Asri Blok C No.7, Bekasi',
		status: 'active'
	},
	{
		id: 'emp-005',
		name: 'Dedi Kurniawan',
		position: 'Warehouse Staff',
		email: 'dedi.kurniawan@byond.co.id',
		phone: '0816-7890-1234',
		address: 'Jl. Ciputat Raya No.88, Tangerang Selatan',
		status: 'inactive'
	}
];

// Chart of Accounts
export const chartOfAccounts: ChartOfAccount[] = [
	{ id: 'coa-001', code: '1-1000', name: 'Kas', category: 'Asset', balance: 250000000 },
	{ id: 'coa-002', code: '1-2000', name: 'Bank BCA', category: 'Asset', balance: 1850000000 },
	{ id: 'coa-003', code: '1-3000', name: 'Piutang Usaha', category: 'Asset', balance: 475000000 },
	{ id: 'coa-004', code: '2-1000', name: 'Hutang Usaha', category: 'Liability', balance: 320000000 },
	{ id: 'coa-005', code: '2-2000', name: 'Hutang Pajak', category: 'Liability', balance: 85000000 },
	{ id: 'coa-006', code: '3-1000', name: 'Modal Disetor', category: 'Equity', balance: 2000000000 },
	{ id: 'coa-007', code: '4-1000', name: 'Pendapatan Penjualan', category: 'Revenue', balance: 3250000000 },
	{ id: 'coa-008', code: '5-1000', name: 'Beban Pokok Penjualan', category: 'Expense', balance: 1950000000 }
];

// Quotations
export const quotations: Quotation[] = [
	{
		id: 'quo-001',
		date: '2024-01-15',
		quotationNo: 'QUO/2024/001',
		transactionNo: 'TRX/2024/001',
		customerId: 'cust-001',
		customerName: 'PT Astra International Tbk',
		preparedBy: 'Ahmad Fauzi',
		salesPerson: 'Reza Mahendra',
		status: 'completed',
		items: [
			{ id: 'qi-001', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 100, unit: 'Rim', unitPrice: 65000, discount: 5, total: 6175000 },
			{ id: 'qi-002', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 20, unit: 'Unit', unitPrice: 1250000, discount: 0, total: 25000000 }
		],
		subtotal: 31175000,
		tax: 3117500,
		total: 34292500,
		notes: 'Pengiriman bertahap 2 kali'
	},
	{
		id: 'quo-002',
		date: '2024-02-03',
		quotationNo: 'QUO/2024/002',
		transactionNo: 'TRX/2024/002',
		customerId: 'cust-002',
		customerName: 'PT Telkom Indonesia Tbk',
		preparedBy: 'Ahmad Fauzi',
		salesPerson: 'Reza Mahendra',
		status: 'sales',
		items: [
			{ id: 'qi-003', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 5, unit: 'Unit', unitPrice: 8500000, discount: 10, total: 38250000 },
			{ id: 'qi-004', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 10, unit: 'Unit', unitPrice: 3750000, discount: 5, total: 35625000 }
		],
		subtotal: 73875000,
		tax: 7387500,
		total: 81262500,
		notes: 'Untuk renovasi kantor cabang Bandung'
	},
	{
		id: 'quo-003',
		date: '2024-02-20',
		quotationNo: 'QUO/2024/003',
		transactionNo: 'TRX/2024/003',
		customerId: 'cust-003',
		customerName: 'PT Pertamina (Persero)',
		preparedBy: 'Ahmad Fauzi',
		salesPerson: 'Reza Mahendra',
		status: 'quotation',
		items: [
			{ id: 'qi-005', productId: 'prod-005', productName: 'AC Split Daikin 2PK', quantity: 8, unit: 'Unit', unitPrice: 12500000, discount: 8, total: 92000000 }
		],
		subtotal: 92000000,
		tax: 9200000,
		total: 101200000,
		notes: 'Pemasangan di gedung baru lantai 5-8'
	},
	{
		id: 'quo-004',
		date: '2024-03-05',
		quotationNo: 'QUO/2024/004',
		transactionNo: 'TRX/2024/004',
		customerId: 'cust-004',
		customerName: 'PT Unilever Indonesia Tbk',
		preparedBy: 'Nurul Hidayah',
		salesPerson: 'Reza Mahendra',
		status: 'completed',
		items: [
			{ id: 'qi-006', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 200, unit: 'Rim', unitPrice: 65000, discount: 10, total: 11700000 },
			{ id: 'qi-007', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 30, unit: 'Unit', unitPrice: 1250000, discount: 5, total: 35625000 }
		],
		subtotal: 47325000,
		tax: 4732500,
		total: 52057500,
		notes: 'Pesanan bulanan rutin'
	},
	{
		id: 'quo-005',
		date: '2024-03-18',
		quotationNo: 'QUO/2024/005',
		transactionNo: 'TRX/2024/005',
		customerId: 'cust-005',
		customerName: 'PT Bank Central Asia Tbk',
		preparedBy: 'Nurul Hidayah',
		salesPerson: 'Reza Mahendra',
		status: 'sales',
		items: [
			{ id: 'qi-008', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 3, unit: 'Unit', unitPrice: 8500000, discount: 0, total: 25500000 },
			{ id: 'qi-009', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 20, unit: 'Unit', unitPrice: 3750000, discount: 10, total: 67500000 },
			{ id: 'qi-010', productId: 'prod-005', productName: 'AC Split Daikin 2PK', quantity: 4, unit: 'Unit', unitPrice: 12500000, discount: 5, total: 47500000 }
		],
		subtotal: 140500000,
		tax: 14050000,
		total: 154550000,
		notes: 'Untuk kantor cabang baru di Surabaya'
	}
];

// Sales Orders
export const salesOrders: SalesOrder[] = [
	{
		id: 'so-001',
		date: '2024-01-20',
		salesNo: 'SO/2024/001',
		transactionNo: 'TRX/2024/001',
		customerId: 'cust-001',
		customerName: 'PT Astra International Tbk',
		preparedBy: 'Ahmad Fauzi',
		items: [
			{ id: 'si-001', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 100, unit: 'Rim', unitPrice: 65000, discount: 5, total: 6175000 },
			{ id: 'si-002', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 20, unit: 'Unit', unitPrice: 1250000, discount: 0, total: 25000000 }
		],
		subtotal: 31175000,
		tax: 3117500,
		total: 34292500,
		status: 'completed'
	},
	{
		id: 'so-002',
		date: '2024-02-10',
		salesNo: 'SO/2024/002',
		transactionNo: 'TRX/2024/002',
		customerId: 'cust-002',
		customerName: 'PT Telkom Indonesia Tbk',
		preparedBy: 'Ahmad Fauzi',
		items: [
			{ id: 'si-003', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 5, unit: 'Unit', unitPrice: 8500000, discount: 10, total: 38250000 },
			{ id: 'si-004', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 10, unit: 'Unit', unitPrice: 3750000, discount: 5, total: 35625000 }
		],
		subtotal: 73875000,
		tax: 7387500,
		total: 81262500,
		status: 'delivered'
	},
	{
		id: 'so-003',
		date: '2024-03-01',
		salesNo: 'SO/2024/003',
		transactionNo: 'TRX/2024/004',
		customerId: 'cust-004',
		customerName: 'PT Unilever Indonesia Tbk',
		preparedBy: 'Nurul Hidayah',
		items: [
			{ id: 'si-005', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 200, unit: 'Rim', unitPrice: 65000, discount: 10, total: 11700000 },
			{ id: 'si-006', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 30, unit: 'Unit', unitPrice: 1250000, discount: 5, total: 35625000 }
		],
		subtotal: 47325000,
		tax: 4732500,
		total: 52057500,
		status: 'completed'
	},
	{
		id: 'so-004',
		date: '2024-03-20',
		salesNo: 'SO/2024/004',
		transactionNo: 'TRX/2024/005',
		customerId: 'cust-005',
		customerName: 'PT Bank Central Asia Tbk',
		preparedBy: 'Nurul Hidayah',
		items: [
			{ id: 'si-007', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 3, unit: 'Unit', unitPrice: 8500000, discount: 0, total: 25500000 },
			{ id: 'si-008', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 20, unit: 'Unit', unitPrice: 3750000, discount: 10, total: 67500000 }
		],
		subtotal: 93000000,
		tax: 9300000,
		total: 102300000,
		status: 'pending'
	},
	{
		id: 'so-005',
		date: '2024-04-02',
		salesNo: 'SO/2024/005',
		transactionNo: 'TRX/2024/006',
		customerId: 'cust-003',
		customerName: 'PT Pertamina (Persero)',
		preparedBy: 'Ahmad Fauzi',
		items: [
			{ id: 'si-009', productId: 'prod-005', productName: 'AC Split Daikin 2PK', quantity: 6, unit: 'Unit', unitPrice: 12500000, discount: 5, total: 71250000 }
		],
		subtotal: 71250000,
		tax: 7125000,
		total: 78375000,
		status: 'pending'
	}
];

// Purchase Orders
export const purchaseOrders: PurchaseOrder[] = [
	{
		id: 'po-001',
		date: '2024-01-10',
		purchaseNo: 'PO/2024/001',
		transactionNo: 'TRX-PO/2024/001',
		supplierId: 'sup-001',
		supplierName: 'CV Mitra Sejahtera',
		preparedBy: 'Putri Anggraini',
		items: [
			{ id: 'pi-001', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 300, unit: 'Rim', unitPrice: 48000, discount: 0, total: 14400000 }
		],
		subtotal: 14400000,
		tax: 1440000,
		total: 15840000,
		status: 'completed'
	},
	{
		id: 'po-002',
		date: '2024-01-25',
		purchaseNo: 'PO/2024/002',
		transactionNo: 'TRX-PO/2024/002',
		supplierId: 'sup-002',
		supplierName: 'PT Sumber Makmur Abadi',
		preparedBy: 'Putri Anggraini',
		items: [
			{ id: 'pi-002', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 50, unit: 'Unit', unitPrice: 850000, discount: 5, total: 40375000 }
		],
		subtotal: 40375000,
		tax: 4037500,
		total: 44412500,
		status: 'received'
	},
	{
		id: 'po-003',
		date: '2024-02-15',
		purchaseNo: 'PO/2024/003',
		transactionNo: 'TRX-PO/2024/003',
		supplierId: 'sup-004',
		supplierName: 'CV Karya Indah Furniture',
		preparedBy: 'Putri Anggraini',
		items: [
			{ id: 'pi-003', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 10, unit: 'Unit', unitPrice: 5500000, discount: 0, total: 55000000 },
			{ id: 'pi-004', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 30, unit: 'Unit', unitPrice: 2400000, discount: 10, total: 64800000 }
		],
		subtotal: 119800000,
		tax: 11980000,
		total: 131780000,
		status: 'completed'
	},
	{
		id: 'po-004',
		date: '2024-03-10',
		purchaseNo: 'PO/2024/004',
		transactionNo: 'TRX-PO/2024/004',
		supplierId: 'sup-005',
		supplierName: 'PT Nusantara Elektronik',
		preparedBy: 'Putri Anggraini',
		items: [
			{ id: 'pi-005', productId: 'prod-005', productName: 'AC Split Daikin 2PK', quantity: 15, unit: 'Unit', unitPrice: 8200000, discount: 5, total: 116850000 }
		],
		subtotal: 116850000,
		tax: 11685000,
		total: 128535000,
		status: 'pending'
	},
	{
		id: 'po-005',
		date: '2024-03-28',
		purchaseNo: 'PO/2024/005',
		transactionNo: 'TRX-PO/2024/005',
		supplierId: 'sup-003',
		supplierName: 'PT Jaya Abadi Teknik',
		preparedBy: 'Putri Anggraini',
		items: [
			{ id: 'pi-006', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 500, unit: 'Rim', unitPrice: 46000, discount: 3, total: 22310000 },
			{ id: 'pi-007', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 25, unit: 'Unit', unitPrice: 830000, discount: 0, total: 20750000 }
		],
		subtotal: 43060000,
		tax: 4306000,
		total: 47366000,
		status: 'pending'
	}
];

// Deliveries
export const deliveries: Delivery[] = [
	{
		id: 'del-001',
		date: '2024-01-25',
		deliveryNo: 'DO/2024/001',
		salesNo: 'SO/2024/001',
		transactionNo: 'TRX/2024/001',
		customerName: 'PT Astra International Tbk',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'di-001', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 100, unit: 'Rim', unitPrice: 65000, discount: 5, total: 6175000 },
			{ id: 'di-002', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 20, unit: 'Unit', unitPrice: 1250000, discount: 0, total: 25000000 }
		],
		status: 'delivered'
	},
	{
		id: 'del-002',
		date: '2024-02-18',
		deliveryNo: 'DO/2024/002',
		salesNo: 'SO/2024/002',
		transactionNo: 'TRX/2024/002',
		customerName: 'PT Telkom Indonesia Tbk',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'di-003', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 5, unit: 'Unit', unitPrice: 8500000, discount: 10, total: 38250000 }
		],
		status: 'delivered'
	},
	{
		id: 'del-003',
		date: '2024-02-20',
		deliveryNo: 'DO/2024/003',
		salesNo: 'SO/2024/002',
		transactionNo: 'TRX/2024/002',
		customerName: 'PT Telkom Indonesia Tbk',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'di-004', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 10, unit: 'Unit', unitPrice: 3750000, discount: 5, total: 35625000 }
		],
		status: 'shipped'
	},
	{
		id: 'del-004',
		date: '2024-03-08',
		deliveryNo: 'DO/2024/004',
		salesNo: 'SO/2024/003',
		transactionNo: 'TRX/2024/004',
		customerName: 'PT Unilever Indonesia Tbk',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'di-005', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 200, unit: 'Rim', unitPrice: 65000, discount: 10, total: 11700000 },
			{ id: 'di-006', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 30, unit: 'Unit', unitPrice: 1250000, discount: 5, total: 35625000 }
		],
		status: 'delivered'
	},
	{
		id: 'del-005',
		date: '2024-03-25',
		deliveryNo: 'DO/2024/005',
		salesNo: 'SO/2024/004',
		transactionNo: 'TRX/2024/005',
		customerName: 'PT Bank Central Asia Tbk',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'di-007', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 3, unit: 'Unit', unitPrice: 8500000, discount: 0, total: 25500000 }
		],
		status: 'pending'
	}
];

// Goods Receipts
export const goodsReceipts: GoodsReceipt[] = [
	{
		id: 'gr-001',
		date: '2024-01-15',
		receiptNo: 'GR/2024/001',
		purchaseNo: 'PO/2024/001',
		transactionNo: 'TRX-PO/2024/001',
		supplierName: 'CV Mitra Sejahtera',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'gi-001', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 300, unit: 'Rim', unitPrice: 48000, discount: 0, total: 14400000 }
		],
		status: 'received'
	},
	{
		id: 'gr-002',
		date: '2024-02-01',
		receiptNo: 'GR/2024/002',
		purchaseNo: 'PO/2024/002',
		transactionNo: 'TRX-PO/2024/002',
		supplierName: 'PT Sumber Makmur Abadi',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'gi-002', productId: 'prod-002', productName: 'Toner Printer HP LaserJet', quantity: 50, unit: 'Unit', unitPrice: 850000, discount: 5, total: 40375000 }
		],
		status: 'received'
	},
	{
		id: 'gr-003',
		date: '2024-02-28',
		receiptNo: 'GR/2024/003',
		purchaseNo: 'PO/2024/003',
		transactionNo: 'TRX-PO/2024/003',
		supplierName: 'CV Karya Indah Furniture',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'gi-003', productId: 'prod-003', productName: 'Meja Kantor Direktur', quantity: 10, unit: 'Unit', unitPrice: 5500000, discount: 0, total: 55000000 },
			{ id: 'gi-004', productId: 'prod-004', productName: 'Kursi Ergonomis Mesh', quantity: 30, unit: 'Unit', unitPrice: 2400000, discount: 10, total: 64800000 }
		],
		status: 'received'
	},
	{
		id: 'gr-004',
		date: '2024-03-15',
		receiptNo: 'GR/2024/004',
		purchaseNo: 'PO/2024/004',
		transactionNo: 'TRX-PO/2024/004',
		supplierName: 'PT Nusantara Elektronik',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'gi-005', productId: 'prod-005', productName: 'AC Split Daikin 2PK', quantity: 15, unit: 'Unit', unitPrice: 8200000, discount: 5, total: 116850000 }
		],
		status: 'pending'
	},
	{
		id: 'gr-005',
		date: '2024-04-05',
		receiptNo: 'GR/2024/005',
		purchaseNo: 'PO/2024/005',
		transactionNo: 'TRX-PO/2024/005',
		supplierName: 'PT Jaya Abadi Teknik',
		preparedBy: 'Dedi Kurniawan',
		items: [
			{ id: 'gi-006', productId: 'prod-001', productName: 'Kertas HVS A4 80gsm', quantity: 500, unit: 'Rim', unitPrice: 46000, discount: 3, total: 22310000 }
		],
		status: 'pending'
	}
];

// Payments (from customers)
export const payments: Payment[] = [
	{
		id: 'pay-001',
		date: '2024-02-15',
		paymentNo: 'PAY/2024/001',
		transactionNo: 'TRX/2024/001',
		customerName: 'PT Astra International Tbk',
		invoiceNo: 'INV/2024/001',
		amount: 34292500,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'pay-002',
		date: '2024-03-20',
		paymentNo: 'PAY/2024/002',
		transactionNo: 'TRX/2024/002',
		customerName: 'PT Telkom Indonesia Tbk',
		invoiceNo: 'INV/2024/002',
		amount: 40631250,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'pay-003',
		date: '2024-03-28',
		paymentNo: 'PAY/2024/003',
		transactionNo: 'TRX/2024/002',
		customerName: 'PT Telkom Indonesia Tbk',
		invoiceNo: 'INV/2024/003',
		amount: 40631250,
		method: 'check',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'pay-004',
		date: '2024-04-05',
		paymentNo: 'PAY/2024/004',
		transactionNo: 'TRX/2024/004',
		customerName: 'PT Unilever Indonesia Tbk',
		invoiceNo: 'INV/2024/004',
		amount: 52057500,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'pay-005',
		date: '2024-04-15',
		paymentNo: 'PAY/2024/005',
		transactionNo: 'TRX/2024/005',
		customerName: 'PT Bank Central Asia Tbk',
		invoiceNo: 'INV/2024/005',
		amount: 102300000,
		method: 'transfer',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	}
];

// Bill Payments (to vendors)
export const billPayments: BillPayment[] = [
	{
		id: 'bp-001',
		date: '2024-02-10',
		billNo: 'BP/2024/001',
		transactionNo: 'TRX-PO/2024/001',
		supplierName: 'CV Mitra Sejahtera',
		invoiceNo: 'VINV/2024/001',
		amount: 15840000,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'bp-002',
		date: '2024-02-25',
		billNo: 'BP/2024/002',
		transactionNo: 'TRX-PO/2024/002',
		supplierName: 'PT Sumber Makmur Abadi',
		invoiceNo: 'VINV/2024/002',
		amount: 44412500,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'bp-003',
		date: '2024-03-15',
		billNo: 'BP/2024/003',
		transactionNo: 'TRX-PO/2024/003',
		supplierName: 'CV Karya Indah Furniture',
		invoiceNo: 'VINV/2024/003',
		amount: 65890000,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'bp-004',
		date: '2024-03-30',
		billNo: 'BP/2024/004',
		transactionNo: 'TRX-PO/2024/003',
		supplierName: 'CV Karya Indah Furniture',
		invoiceNo: 'VINV/2024/004',
		amount: 65890000,
		method: 'check',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'bp-005',
		date: '2024-04-10',
		billNo: 'BP/2024/005',
		transactionNo: 'TRX-PO/2024/004',
		supplierName: 'PT Nusantara Elektronik',
		invoiceNo: 'VINV/2024/005',
		amount: 128535000,
		method: 'transfer',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	}
];

// Debt Payments (Payment Vendor)
export const debtPayments: DebtPayment[] = [
	{
		id: 'dp-001',
		date: '2024-02-10',
		paymentNo: 'DP/2024/001',
		transactionNo: 'TRX-PO/2024/001',
		supplierName: 'CV Mitra Sejahtera',
		purchaseNo: 'PO/2024/001',
		amount: 15840000,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'dp-002',
		date: '2024-02-28',
		paymentNo: 'DP/2024/002',
		transactionNo: 'TRX-PO/2024/002',
		supplierName: 'PT Sumber Makmur Abadi',
		purchaseNo: 'PO/2024/002',
		amount: 44412500,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'dp-003',
		date: '2024-03-20',
		paymentNo: 'DP/2024/003',
		transactionNo: 'TRX-PO/2024/003',
		supplierName: 'CV Karya Indah Furniture',
		purchaseNo: 'PO/2024/003',
		amount: 131780000,
		method: 'transfer',
		status: 'paid',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'dp-004',
		date: '2024-04-05',
		paymentNo: 'DP/2024/004',
		transactionNo: 'TRX-PO/2024/004',
		supplierName: 'PT Nusantara Elektronik',
		purchaseNo: 'PO/2024/004',
		amount: 128535000,
		method: 'transfer',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	},
	{
		id: 'dp-005',
		date: '2024-04-15',
		paymentNo: 'DP/2024/005',
		transactionNo: 'TRX-PO/2024/005',
		supplierName: 'PT Jaya Abadi Teknik',
		purchaseNo: 'PO/2024/005',
		amount: 47366000,
		method: 'check',
		status: 'pending',
		preparedBy: 'Nurul Hidayah'
	}
];

// Journal Entries
export const journalEntries: JournalEntry[] = [
	{
		id: 'je-001',
		date: '2024-01-20',
		description: 'Penjualan kepada PT Astra International Tbk',
		debitAccount: '1-3000 Piutang Usaha',
		creditAccount: '4-1000 Pendapatan Penjualan',
		amount: 34292500,
		reference: 'SO/2024/001'
	},
	{
		id: 'je-002',
		date: '2024-01-10',
		description: 'Pembelian kertas dari CV Mitra Sejahtera',
		debitAccount: '5-1000 Beban Pokok Penjualan',
		creditAccount: '2-1000 Hutang Usaha',
		amount: 15840000,
		reference: 'PO/2024/001'
	},
	{
		id: 'je-003',
		date: '2024-02-10',
		description: 'Pembayaran hutang kepada CV Mitra Sejahtera',
		debitAccount: '2-1000 Hutang Usaha',
		creditAccount: '1-2000 Bank BCA',
		amount: 15840000,
		reference: 'DP/2024/001'
	},
	{
		id: 'je-004',
		date: '2024-02-15',
		description: 'Penerimaan pembayaran dari PT Astra International Tbk',
		debitAccount: '1-2000 Bank BCA',
		creditAccount: '1-3000 Piutang Usaha',
		amount: 34292500,
		reference: 'PAY/2024/001'
	},
	{
		id: 'je-005',
		date: '2024-03-01',
		description: 'Penjualan kepada PT Unilever Indonesia Tbk',
		debitAccount: '1-3000 Piutang Usaha',
		creditAccount: '4-1000 Pendapatan Penjualan',
		amount: 52057500,
		reference: 'SO/2024/003'
	}
];

// Dashboard Stats
export const dashboardStats: DashboardStats = {
	sales: 348287500,
	payable: 320567500,
	receivable: 475612500,
	paymentPercentage: 72.5
};

// Transaction Progress
export const transactionProgress: TransactionProgress = {
	quotation: 5,
	sales: 5,
	purchase: 5,
	goodsReceipt: 5,
	delivery: 5,
	billPayment: 5,
	payment: 5
};

// App Settings
export const appSettings: AppSettings = {
	companyName: 'PT Byond Technology Indonesia',
	companyAddress: 'Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan 12190',
	companyPhone: '021-515-3456',
	companyEmail: 'info@byond.co.id',
	companyNpwp: '01.987.654.3-091.000',
	currency: 'IDR',
	taxRate: 11
};

// Aliases for legacy component imports
export const mockCustomers = customers;
export const mockStats = [
	{ title: 'Total Penjualan', value: 'Rp 348.287.500', trend: '+12.5%' },
	{ title: 'Total Piutang Usaha', value: 'Rp 475.612.500', trend: '-2.4%' },
	{ title: 'Total Hutang Usaha', value: 'Rp 320.567.500', trend: '+5.1%' }
];