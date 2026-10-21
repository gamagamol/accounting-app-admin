import { w as writable, d as derived } from "./index.js";
const currentUser = {
  id: "usr-001",
  name: "Ahmad Fauzi",
  email: "ahmad.fauzi@byond.co.id",
  role: "SUPER_ADMIN",
  avatar: ""
};
const customers$1 = [
  {
    id: "cust-001",
    companyName: "PT Astra International Tbk",
    city: "Jakarta",
    contactPerson: "Budi Santoso",
    email: "budi.santoso@astra.co.id",
    phone: "021-5089-1234",
    nb: "NB-001",
    npwp: "01.234.567.8-091.000",
    npwpAddress: "Jl. Gaya Motor Raya No.8, Sunter II, Jakarta Utara",
    address: "Jl. Gaya Motor Raya No.8, Sunter II, Jakarta Utara 14330",
    termOfPayment: 30,
    notes: "Priority customer"
  },
  {
    id: "cust-002",
    companyName: "PT Telkom Indonesia Tbk",
    city: "Bandung",
    contactPerson: "Siti Rahayu",
    email: "siti.rahayu@telkom.co.id",
    phone: "022-4520-1111",
    nb: "NB-002",
    npwp: "01.345.678.9-423.000",
    npwpAddress: "Jl. Japati No.1, Bandung",
    address: "Jl. Japati No.1, Bandung, Jawa Barat 40133",
    termOfPayment: 45,
    notes: "Special 45-day payment term"
  },
  {
    id: "cust-003",
    companyName: "PT Pertamina (Persero)",
    city: "Jakarta",
    contactPerson: "Hendra Wijaya",
    email: "hendra.wijaya@pertamina.com",
    phone: "021-3815-9000",
    nb: "NB-003",
    npwp: "01.061.127.0-051.000",
    npwpAddress: "Jl. Medan Merdeka Timur No.1A, Jakarta Pusat",
    address: "Jl. Medan Merdeka Timur No.1A, Jakarta Pusat 10110",
    termOfPayment: 30,
    notes: "Annual contract"
  },
  {
    id: "cust-004",
    companyName: "PT Unilever Indonesia Tbk",
    city: "Tangerang",
    contactPerson: "Dewi Lestari",
    email: "dewi.lestari@unilever.com",
    phone: "021-5460-6000",
    nb: "NB-004",
    npwp: "01.078.219.5-054.000",
    npwpAddress: "Grha Unilever, BSD City, Tangerang",
    address: "Grha Unilever, Green Office Park Kav. 3, BSD City, Tangerang 15345",
    termOfPayment: 60,
    notes: "Deliveries every Monday and Thursday"
  },
  {
    id: "cust-005",
    companyName: "PT Bank Central Asia Tbk",
    city: "Jakarta",
    contactPerson: "Rizky Pratama",
    email: "rizky.pratama@bca.co.id",
    phone: "021-2358-8000",
    nb: "NB-005",
    npwp: "01.309.148.0-091.000",
    npwpAddress: "Menara BCA, Jl. MH Thamrin No.1, Jakarta Pusat",
    address: "Menara BCA, Grand Indonesia, Jl. MH Thamrin No.1, Jakarta Pusat 10310",
    termOfPayment: 30,
    notes: "Payment via BCA bank transfer"
  }
];
const products$1 = [
  {
    id: "prod-001",
    itemType: "goods",
    name: "A4 Copy Paper 80gsm",
    category: "Office Stationery",
    unit: "Rim",
    price: 65e3,
    stock: 500,
    description: "A4 copy paper, 80 gsm, 500 sheets per ream"
  },
  {
    id: "prod-002",
    itemType: "goods",
    name: "HP LaserJet Printer Toner",
    category: "IT Supplies",
    unit: "Unit",
    price: 125e4,
    stock: 50,
    description: "Original HP LaserJet Pro toner cartridge, 2,500 page yield"
  },
  {
    id: "prod-003",
    itemType: "goods",
    name: "Executive Office Desk",
    category: "Furniture",
    unit: "Unit",
    price: 85e5,
    stock: 15,
    description: "Solid teak executive office desk, 180x90x75 cm, three-drawer pedestal"
  },
  {
    id: "prod-004",
    itemType: "goods",
    name: "Ergonomic Mesh Chair",
    category: "Furniture",
    unit: "Unit",
    price: 375e4,
    stock: 30,
    description: "Ergonomic office chair with mesh backrest, adjustable armrests and lumbar support"
  },
  {
    id: "prod-005",
    itemType: "goods",
    name: "Daikin 2PK Split Air Conditioner",
    category: "Electronics",
    unit: "Unit",
    price: 125e5,
    stock: 10,
    description: "Daikin 2PK inverter split air conditioner, energy efficient, 10-year compressor warranty"
  }
];
const suppliers$1 = [
  {
    id: "sup-001",
    companyName: "CV Mitra Sejahtera",
    contactPerson: "Agus Priyanto",
    email: "agus@mitrasejahtera.co.id",
    phone: "021-6543-2100",
    address: "Jl. Mangga Dua Raya No.45, Jakarta Utara 14430",
    city: "Jakarta",
    npwp: "02.123.456.7-041.000"
  },
  {
    id: "sup-002",
    companyName: "PT Sumber Makmur Abadi",
    contactPerson: "Lina Kusuma",
    email: "lina@sumbermakmur.com",
    phone: "031-7891-2345",
    address: "Jl. Rungkut Industri Raya No.12, Surabaya 60293",
    city: "Surabaya",
    npwp: "02.234.567.8-631.000"
  },
  {
    id: "sup-003",
    companyName: "PT Jaya Abadi Teknik",
    contactPerson: "Tono Subroto",
    email: "tono@jayaabadi.co.id",
    phone: "022-8765-4321",
    address: "Jl. Soekarno-Hatta No.789, Bandung 40286",
    city: "Bandung",
    npwp: "02.345.678.9-423.000"
  },
  {
    id: "sup-004",
    companyName: "CV Karya Indah Furniture",
    contactPerson: "Wahyu Hidayat",
    email: "wahyu@karyaindah.com",
    phone: "0271-654-321",
    address: "Jl. Solo-Sragen KM 7, Karanganyar, Jawa Tengah 57711",
    city: "Solo",
    npwp: "02.456.789.0-526.000"
  },
  {
    id: "sup-005",
    companyName: "PT Nusantara Elektronik",
    contactPerson: "Rina Susanti",
    email: "rina@nusantaraelektronik.co.id",
    phone: "021-4567-8901",
    address: "Jl. Hayam Wuruk No.123, Glodok, Jakarta Barat 11180",
    city: "Jakarta",
    npwp: "02.567.890.1-034.000"
  }
];
const employees$1 = [
  {
    id: "emp-001",
    name: "Ahmad Fauzi",
    position: "General Manager",
    email: "ahmad.fauzi@byond.co.id",
    phone: "0812-3456-7890",
    address: "Jl. Kemang Raya No.12, Jakarta Selatan",
    status: "active"
  },
  {
    id: "emp-002",
    name: "Nurul Hidayah",
    position: "Accounting Manager",
    email: "nurul.hidayah@byond.co.id",
    phone: "0813-4567-8901",
    address: "Jl. Pondok Indah No.45, Jakarta Selatan",
    status: "active"
  },
  {
    id: "emp-003",
    name: "Reza Mahendra",
    position: "Sales Manager",
    email: "reza.mahendra@byond.co.id",
    phone: "0814-5678-9012",
    address: "Jl. Bintaro Jaya Sektor 9 Blok A5, Tangerang Selatan",
    status: "active"
  },
  {
    id: "emp-004",
    name: "Putri Anggraini",
    position: "Purchasing Staff",
    email: "putri.anggraini@byond.co.id",
    phone: "0815-6789-0123",
    address: "Griya Asri Housing Complex Block C No.7, Bekasi",
    status: "active"
  },
  {
    id: "emp-005",
    name: "Dedi Kurniawan",
    position: "Warehouse Staff",
    email: "dedi.kurniawan@byond.co.id",
    phone: "0816-7890-1234",
    address: "Jl. Ciputat Raya No.88, Tangerang Selatan",
    status: "inactive"
  }
];
const chartOfAccounts$1 = [
  { id: "coa-001", code: "1-1000", name: "Cash", category: "Asset", balance: 25e7 },
  { id: "coa-002", code: "1-2000", name: "Bank BCA", category: "Asset", balance: 185e7 },
  { id: "coa-003", code: "1-3000", name: "Accounts Receivable", category: "Asset", balance: 475e6 },
  { id: "coa-004", code: "2-1000", name: "Accounts Payable", category: "Liability", balance: 32e7 },
  { id: "coa-005", code: "2-2000", name: "Tax Payable", category: "Liability", balance: 85e6 },
  { id: "coa-006", code: "3-1000", name: "Paid-in Capital", category: "Equity", balance: 2e9 },
  { id: "coa-007", code: "4-1000", name: "Sales Revenue", category: "Revenue", balance: 325e7 },
  { id: "coa-008", code: "5-1000", name: "Cost of Goods Sold", category: "Expense", balance: 195e7 },
  { id: "coa-009", code: "6-1000", name: "Salaries & Wages", category: "Expense", balance: 0 },
  { id: "coa-010", code: "6-1100", name: "Electricity & Water", category: "Expense", balance: 0 },
  { id: "coa-011", code: "6-1200", name: "Office Supplies (ATK)", category: "Expense", balance: 0 },
  { id: "coa-012", code: "6-1300", name: "Rent Expense", category: "Expense", balance: 0 },
  { id: "coa-013", code: "6-2000", name: "Freight & Courier", category: "Expense", balance: 0 },
  { id: "coa-014", code: "6-3000", name: "Machinery Maintenance", category: "Expense", balance: 0 },
  { id: "coa-015", code: "6-4000", name: "Travel & Accommodation", category: "Expense", balance: 0 },
  { id: "coa-016", code: "6-9000", name: "Other Operating Expenses", category: "Expense", balance: 0 }
];
const quotations$1 = [
  {
    id: "quo-001",
    date: "2024-01-15",
    quotationNo: "QUO/2024/001",
    transactionNo: "TRX/2024/001",
    customerId: "cust-001",
    customerName: "PT Astra International Tbk",
    preparedBy: "Ahmad Fauzi",
    salesPerson: "Reza Mahendra",
    status: "completed",
    items: [
      { id: "qi-001", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 100, unit: "Rim", unitPrice: 65e3, discount: 5, total: 6175e3 },
      { id: "qi-002", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 20, unit: "Unit", unitPrice: 125e4, discount: 0, total: 25e6 }
    ],
    subtotal: 31175e3,
    tax: 3117500,
    total: 34292500,
    notes: "Two-phase partial delivery"
  },
  {
    id: "quo-002",
    date: "2024-02-03",
    quotationNo: "QUO/2024/002",
    transactionNo: "TRX/2024/002",
    customerId: "cust-002",
    customerName: "PT Telkom Indonesia Tbk",
    preparedBy: "Ahmad Fauzi",
    salesPerson: "Reza Mahendra",
    status: "sales",
    items: [
      { id: "qi-003", productId: "prod-003", productName: "Executive Office Desk", quantity: 5, unit: "Unit", unitPrice: 85e5, discount: 10, total: 3825e4 },
      { id: "qi-004", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 10, unit: "Unit", unitPrice: 375e4, discount: 5, total: 35625e3 }
    ],
    subtotal: 73875e3,
    tax: 7387500,
    total: 81262500,
    notes: "For the Bandung branch office renovation"
  },
  {
    id: "quo-003",
    date: "2024-02-20",
    quotationNo: "QUO/2024/003",
    transactionNo: "TRX/2024/003",
    customerId: "cust-003",
    customerName: "PT Pertamina (Persero)",
    preparedBy: "Ahmad Fauzi",
    salesPerson: "Reza Mahendra",
    status: "quotation",
    items: [
      { id: "qi-005", productId: "prod-005", productName: "Daikin 2PK Split Air Conditioner", quantity: 8, unit: "Unit", unitPrice: 125e5, discount: 8, total: 92e6 }
    ],
    subtotal: 92e6,
    tax: 92e5,
    total: 1012e5,
    notes: "Installation on floors 5-8 of the new building"
  },
  {
    id: "quo-004",
    date: "2024-03-05",
    quotationNo: "QUO/2024/004",
    transactionNo: "TRX/2024/004",
    customerId: "cust-004",
    customerName: "PT Unilever Indonesia Tbk",
    preparedBy: "Nurul Hidayah",
    salesPerson: "Reza Mahendra",
    status: "completed",
    items: [
      { id: "qi-006", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 200, unit: "Rim", unitPrice: 65e3, discount: 10, total: 117e5 },
      { id: "qi-007", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 30, unit: "Unit", unitPrice: 125e4, discount: 5, total: 35625e3 }
    ],
    subtotal: 47325e3,
    tax: 4732500,
    total: 52057500,
    notes: "Recurring monthly order"
  },
  {
    id: "quo-005",
    date: "2024-03-18",
    quotationNo: "QUO/2024/005",
    transactionNo: "TRX/2024/005",
    customerId: "cust-005",
    customerName: "PT Bank Central Asia Tbk",
    preparedBy: "Nurul Hidayah",
    salesPerson: "Reza Mahendra",
    status: "sales",
    items: [
      { id: "qi-008", productId: "prod-003", productName: "Executive Office Desk", quantity: 3, unit: "Unit", unitPrice: 85e5, discount: 0, total: 255e5 },
      { id: "qi-009", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 20, unit: "Unit", unitPrice: 375e4, discount: 10, total: 675e5 },
      { id: "qi-010", productId: "prod-005", productName: "Daikin 2PK Split Air Conditioner", quantity: 4, unit: "Unit", unitPrice: 125e5, discount: 5, total: 475e5 }
    ],
    subtotal: 1405e5,
    tax: 1405e4,
    total: 15455e4,
    notes: "For the new Surabaya branch office"
  }
];
const salesOrders$1 = [
  {
    id: "so-001",
    date: "2024-01-20",
    salesNo: "SO/2024/001",
    transactionNo: "TRX/2024/001",
    customerId: "cust-001",
    customerName: "PT Astra International Tbk",
    preparedBy: "Ahmad Fauzi",
    items: [
      { id: "si-001", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 100, unit: "Rim", unitPrice: 65e3, discount: 5, total: 6175e3 },
      { id: "si-002", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 20, unit: "Unit", unitPrice: 125e4, discount: 0, total: 25e6 }
    ],
    subtotal: 31175e3,
    tax: 3117500,
    total: 34292500,
    status: "completed"
  },
  {
    id: "so-002",
    date: "2024-02-10",
    salesNo: "SO/2024/002",
    transactionNo: "TRX/2024/002",
    customerId: "cust-002",
    customerName: "PT Telkom Indonesia Tbk",
    preparedBy: "Ahmad Fauzi",
    items: [
      { id: "si-003", productId: "prod-003", productName: "Executive Office Desk", quantity: 5, unit: "Unit", unitPrice: 85e5, discount: 10, total: 3825e4 },
      { id: "si-004", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 10, unit: "Unit", unitPrice: 375e4, discount: 5, total: 35625e3 }
    ],
    subtotal: 73875e3,
    tax: 7387500,
    total: 81262500,
    status: "delivered"
  },
  {
    id: "so-003",
    date: "2024-03-01",
    salesNo: "SO/2024/003",
    transactionNo: "TRX/2024/004",
    customerId: "cust-004",
    customerName: "PT Unilever Indonesia Tbk",
    preparedBy: "Nurul Hidayah",
    items: [
      { id: "si-005", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 200, unit: "Rim", unitPrice: 65e3, discount: 10, total: 117e5 },
      { id: "si-006", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 30, unit: "Unit", unitPrice: 125e4, discount: 5, total: 35625e3 }
    ],
    subtotal: 47325e3,
    tax: 4732500,
    total: 52057500,
    status: "completed"
  },
  {
    id: "so-004",
    date: "2024-03-20",
    salesNo: "SO/2024/004",
    transactionNo: "TRX/2024/005",
    customerId: "cust-005",
    customerName: "PT Bank Central Asia Tbk",
    preparedBy: "Nurul Hidayah",
    items: [
      { id: "si-007", productId: "prod-003", productName: "Executive Office Desk", quantity: 3, unit: "Unit", unitPrice: 85e5, discount: 0, total: 255e5 },
      { id: "si-008", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 20, unit: "Unit", unitPrice: 375e4, discount: 10, total: 675e5 }
    ],
    subtotal: 93e6,
    tax: 93e5,
    total: 1023e5,
    status: "pending"
  },
  {
    id: "so-005",
    date: "2024-04-02",
    salesNo: "SO/2024/005",
    transactionNo: "TRX/2024/006",
    customerId: "cust-003",
    customerName: "PT Pertamina (Persero)",
    preparedBy: "Ahmad Fauzi",
    items: [
      { id: "si-009", productId: "prod-005", productName: "Daikin 2PK Split Air Conditioner", quantity: 6, unit: "Unit", unitPrice: 125e5, discount: 5, total: 7125e4 }
    ],
    subtotal: 7125e4,
    tax: 7125e3,
    total: 78375e3,
    status: "pending"
  }
];
const purchaseOrders$1 = [
  {
    id: "po-001",
    date: "2024-01-10",
    purchaseNo: "PO/2024/001",
    transactionNo: "TRX-PO/2024/001",
    supplierId: "sup-001",
    supplierName: "CV Mitra Sejahtera",
    preparedBy: "Putri Anggraini",
    items: [
      { id: "pi-001", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 300, unit: "Rim", unitPrice: 48e3, discount: 0, total: 144e5 }
    ],
    subtotal: 144e5,
    tax: 144e4,
    total: 1584e4,
    status: "completed"
  },
  {
    id: "po-002",
    date: "2024-01-25",
    purchaseNo: "PO/2024/002",
    transactionNo: "TRX-PO/2024/002",
    supplierId: "sup-002",
    supplierName: "PT Sumber Makmur Abadi",
    preparedBy: "Putri Anggraini",
    items: [
      { id: "pi-002", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 50, unit: "Unit", unitPrice: 85e4, discount: 5, total: 40375e3 }
    ],
    subtotal: 40375e3,
    tax: 4037500,
    total: 44412500,
    status: "received"
  },
  {
    id: "po-003",
    date: "2024-02-15",
    purchaseNo: "PO/2024/003",
    transactionNo: "TRX-PO/2024/003",
    supplierId: "sup-004",
    supplierName: "CV Karya Indah Furniture",
    preparedBy: "Putri Anggraini",
    items: [
      { id: "pi-003", productId: "prod-003", productName: "Executive Office Desk", quantity: 10, unit: "Unit", unitPrice: 55e5, discount: 0, total: 55e6 },
      { id: "pi-004", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 30, unit: "Unit", unitPrice: 24e5, discount: 10, total: 648e5 }
    ],
    subtotal: 1198e5,
    tax: 1198e4,
    total: 13178e4,
    status: "completed"
  },
  {
    id: "po-004",
    date: "2024-03-10",
    purchaseNo: "PO/2024/004",
    transactionNo: "TRX-PO/2024/004",
    supplierId: "sup-005",
    supplierName: "PT Nusantara Elektronik",
    preparedBy: "Putri Anggraini",
    items: [
      { id: "pi-005", productId: "prod-005", productName: "Daikin 2PK Split Air Conditioner", quantity: 15, unit: "Unit", unitPrice: 82e5, discount: 5, total: 11685e4 }
    ],
    subtotal: 11685e4,
    tax: 11685e3,
    total: 128535e3,
    status: "pending"
  },
  {
    id: "po-005",
    date: "2024-03-28",
    purchaseNo: "PO/2024/005",
    transactionNo: "TRX-PO/2024/005",
    supplierId: "sup-003",
    supplierName: "PT Jaya Abadi Teknik",
    preparedBy: "Putri Anggraini",
    items: [
      { id: "pi-006", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 500, unit: "Rim", unitPrice: 46e3, discount: 3, total: 2231e4 },
      { id: "pi-007", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 25, unit: "Unit", unitPrice: 83e4, discount: 0, total: 2075e4 }
    ],
    subtotal: 4306e4,
    tax: 4306e3,
    total: 47366e3,
    status: "pending"
  }
];
const deliveries$1 = [
  {
    id: "del-001",
    date: "2024-01-25",
    deliveryNo: "DO/2024/001",
    salesNo: "SO/2024/001",
    transactionNo: "TRX/2024/001",
    customerName: "PT Astra International Tbk",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "di-001", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 100, unit: "Rim", unitPrice: 65e3, discount: 5, total: 6175e3 },
      { id: "di-002", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 20, unit: "Unit", unitPrice: 125e4, discount: 0, total: 25e6 }
    ],
    status: "delivered"
  },
  {
    id: "del-002",
    date: "2024-02-18",
    deliveryNo: "DO/2024/002",
    salesNo: "SO/2024/002",
    transactionNo: "TRX/2024/002",
    customerName: "PT Telkom Indonesia Tbk",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "di-003", productId: "prod-003", productName: "Executive Office Desk", quantity: 5, unit: "Unit", unitPrice: 85e5, discount: 10, total: 3825e4 }
    ],
    status: "delivered"
  },
  {
    id: "del-003",
    date: "2024-02-20",
    deliveryNo: "DO/2024/003",
    salesNo: "SO/2024/002",
    transactionNo: "TRX/2024/002",
    customerName: "PT Telkom Indonesia Tbk",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "di-004", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 10, unit: "Unit", unitPrice: 375e4, discount: 5, total: 35625e3 }
    ],
    status: "shipped"
  },
  {
    id: "del-004",
    date: "2024-03-08",
    deliveryNo: "DO/2024/004",
    salesNo: "SO/2024/003",
    transactionNo: "TRX/2024/004",
    customerName: "PT Unilever Indonesia Tbk",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "di-005", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 200, unit: "Rim", unitPrice: 65e3, discount: 10, total: 117e5 },
      { id: "di-006", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 30, unit: "Unit", unitPrice: 125e4, discount: 5, total: 35625e3 }
    ],
    status: "delivered"
  },
  {
    id: "del-005",
    date: "2024-03-25",
    deliveryNo: "DO/2024/005",
    salesNo: "SO/2024/004",
    transactionNo: "TRX/2024/005",
    customerName: "PT Bank Central Asia Tbk",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "di-007", productId: "prod-003", productName: "Executive Office Desk", quantity: 3, unit: "Unit", unitPrice: 85e5, discount: 0, total: 255e5 }
    ],
    status: "pending"
  }
];
const goodsReceipts$1 = [
  {
    id: "gr-001",
    date: "2024-01-15",
    receiptNo: "GR/2024/001",
    purchaseNo: "PO/2024/001",
    transactionNo: "TRX-PO/2024/001",
    supplierName: "CV Mitra Sejahtera",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "gi-001", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 300, unit: "Rim", unitPrice: 48e3, discount: 0, total: 144e5 }
    ],
    status: "received"
  },
  {
    id: "gr-002",
    date: "2024-02-01",
    receiptNo: "GR/2024/002",
    purchaseNo: "PO/2024/002",
    transactionNo: "TRX-PO/2024/002",
    supplierName: "PT Sumber Makmur Abadi",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "gi-002", productId: "prod-002", productName: "HP LaserJet Printer Toner", quantity: 50, unit: "Unit", unitPrice: 85e4, discount: 5, total: 40375e3 }
    ],
    status: "received"
  },
  {
    id: "gr-003",
    date: "2024-02-28",
    receiptNo: "GR/2024/003",
    purchaseNo: "PO/2024/003",
    transactionNo: "TRX-PO/2024/003",
    supplierName: "CV Karya Indah Furniture",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "gi-003", productId: "prod-003", productName: "Executive Office Desk", quantity: 10, unit: "Unit", unitPrice: 55e5, discount: 0, total: 55e6 },
      { id: "gi-004", productId: "prod-004", productName: "Ergonomic Mesh Chair", quantity: 30, unit: "Unit", unitPrice: 24e5, discount: 10, total: 648e5 }
    ],
    status: "received"
  },
  {
    id: "gr-004",
    date: "2024-03-15",
    receiptNo: "GR/2024/004",
    purchaseNo: "PO/2024/004",
    transactionNo: "TRX-PO/2024/004",
    supplierName: "PT Nusantara Elektronik",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "gi-005", productId: "prod-005", productName: "Daikin 2PK Split Air Conditioner", quantity: 15, unit: "Unit", unitPrice: 82e5, discount: 5, total: 11685e4 }
    ],
    status: "pending"
  },
  {
    id: "gr-005",
    date: "2024-04-05",
    receiptNo: "GR/2024/005",
    purchaseNo: "PO/2024/005",
    transactionNo: "TRX-PO/2024/005",
    supplierName: "PT Jaya Abadi Teknik",
    preparedBy: "Dedi Kurniawan",
    items: [
      { id: "gi-006", productId: "prod-001", productName: "A4 Copy Paper 80gsm", quantity: 500, unit: "Rim", unitPrice: 46e3, discount: 3, total: 2231e4 }
    ],
    status: "pending"
  }
];
const payments$1 = [
  {
    id: "pay-001",
    date: "2024-02-15",
    paymentNo: "PAY/2024/001",
    transactionNo: "TRX/2024/001",
    customerName: "PT Astra International Tbk",
    invoiceNo: "INV/2024/001",
    amount: 34292500,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "pay-002",
    date: "2024-03-20",
    paymentNo: "PAY/2024/002",
    transactionNo: "TRX/2024/002",
    customerName: "PT Telkom Indonesia Tbk",
    invoiceNo: "INV/2024/002",
    amount: 40631250,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "pay-003",
    date: "2024-03-28",
    paymentNo: "PAY/2024/003",
    transactionNo: "TRX/2024/002",
    customerName: "PT Telkom Indonesia Tbk",
    invoiceNo: "INV/2024/003",
    amount: 40631250,
    method: "check",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "pay-004",
    date: "2024-04-05",
    paymentNo: "PAY/2024/004",
    transactionNo: "TRX/2024/004",
    customerName: "PT Unilever Indonesia Tbk",
    invoiceNo: "INV/2024/004",
    amount: 52057500,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "pay-005",
    date: "2024-04-15",
    paymentNo: "PAY/2024/005",
    transactionNo: "TRX/2024/005",
    customerName: "PT Bank Central Asia Tbk",
    invoiceNo: "INV/2024/005",
    amount: 1023e5,
    method: "transfer",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  }
];
const billPayments$1 = [
  {
    id: "bp-001",
    date: "2024-02-10",
    billNo: "BP/2024/001",
    transactionNo: "TRX-PO/2024/001",
    supplierName: "CV Mitra Sejahtera",
    invoiceNo: "VINV/2024/001",
    amount: 1584e4,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "bp-002",
    date: "2024-02-25",
    billNo: "BP/2024/002",
    transactionNo: "TRX-PO/2024/002",
    supplierName: "PT Sumber Makmur Abadi",
    invoiceNo: "VINV/2024/002",
    amount: 44412500,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "bp-003",
    date: "2024-03-15",
    billNo: "BP/2024/003",
    transactionNo: "TRX-PO/2024/003",
    supplierName: "CV Karya Indah Furniture",
    invoiceNo: "VINV/2024/003",
    amount: 6589e4,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "bp-004",
    date: "2024-03-30",
    billNo: "BP/2024/004",
    transactionNo: "TRX-PO/2024/003",
    supplierName: "CV Karya Indah Furniture",
    invoiceNo: "VINV/2024/004",
    amount: 6589e4,
    method: "check",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "bp-005",
    date: "2024-04-10",
    billNo: "BP/2024/005",
    transactionNo: "TRX-PO/2024/004",
    supplierName: "PT Nusantara Elektronik",
    invoiceNo: "VINV/2024/005",
    amount: 128535e3,
    method: "transfer",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  }
];
const debtPayments$1 = [
  {
    id: "dp-001",
    date: "2024-02-10",
    paymentNo: "DP/2024/001",
    transactionNo: "TRX-PO/2024/001",
    supplierName: "CV Mitra Sejahtera",
    purchaseNo: "PO/2024/001",
    amount: 1584e4,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "dp-002",
    date: "2024-02-28",
    paymentNo: "DP/2024/002",
    transactionNo: "TRX-PO/2024/002",
    supplierName: "PT Sumber Makmur Abadi",
    purchaseNo: "PO/2024/002",
    amount: 44412500,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "dp-003",
    date: "2024-03-20",
    paymentNo: "DP/2024/003",
    transactionNo: "TRX-PO/2024/003",
    supplierName: "CV Karya Indah Furniture",
    purchaseNo: "PO/2024/003",
    amount: 13178e4,
    method: "transfer",
    status: "paid",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "dp-004",
    date: "2024-04-05",
    paymentNo: "DP/2024/004",
    transactionNo: "TRX-PO/2024/004",
    supplierName: "PT Nusantara Elektronik",
    purchaseNo: "PO/2024/004",
    amount: 128535e3,
    method: "transfer",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  },
  {
    id: "dp-005",
    date: "2024-04-15",
    paymentNo: "DP/2024/005",
    transactionNo: "TRX-PO/2024/005",
    supplierName: "PT Jaya Abadi Teknik",
    purchaseNo: "PO/2024/005",
    amount: 47366e3,
    method: "check",
    status: "pending",
    preparedBy: "Nurul Hidayah"
  }
];
const journalEntries$1 = [
  {
    id: "je-001",
    date: "2024-01-20",
    description: "Sales to PT Astra International Tbk",
    debitAccount: "1-3000 Accounts Receivable",
    creditAccount: "4-1000 Sales Revenue",
    amount: 34292500,
    reference: "SO/2024/001"
  },
  {
    id: "je-002",
    date: "2024-01-10",
    description: "Paper purchase from CV Mitra Sejahtera",
    debitAccount: "5-1000 Cost of Goods Sold",
    creditAccount: "2-1000 Accounts Payable",
    amount: 1584e4,
    reference: "PO/2024/001"
  },
  {
    id: "je-003",
    date: "2024-02-10",
    description: "Accounts payable settlement to CV Mitra Sejahtera",
    debitAccount: "2-1000 Accounts Payable",
    creditAccount: "1-2000 Bank BCA",
    amount: 1584e4,
    reference: "DP/2024/001"
  },
  {
    id: "je-004",
    date: "2024-02-15",
    description: "Payment received from PT Astra International Tbk",
    debitAccount: "1-2000 Bank BCA",
    creditAccount: "1-3000 Accounts Receivable",
    amount: 34292500,
    reference: "PAY/2024/001"
  },
  {
    id: "je-005",
    date: "2024-03-01",
    description: "Sales to PT Unilever Indonesia Tbk",
    debitAccount: "1-3000 Accounts Receivable",
    creditAccount: "4-1000 Sales Revenue",
    amount: 52057500,
    reference: "SO/2024/003"
  }
];
const appSettings$1 = {
  companyName: "PT Byond Technology Indonesia",
  companyAddress: "Jl. Jend. Sudirman Kav 52-53, Jakarta Selatan 12190",
  companyPhone: "021-515-3456",
  companyEmail: "info@byond.co.id",
  companyNpwp: "01.987.654.3-091.000",
  currency: "IDR",
  taxRate: 11
};
const customers = writable(customers$1);
const products = writable(
  products$1.map((p, idx) => ({
    ...p,
    code: `PRD-${String(idx + 101).padStart(3, "0")}`,
    itemType: idx % 4 === 3 ? "service" : "goods",
    secondaryUnit: idx % 4 === 3 ? void 0 : "Box",
    conversionRate: idx % 4 === 3 ? void 0 : 24,
    weightKg: idx % 4 === 3 ? void 0 : 2.5,
    barcode: `899${Math.floor(Math.random() * 89999999 + 1e7)}`,
    costPrice: Math.round(p.price * 0.7)
  }))
);
const suppliers = writable(suppliers$1);
const employees = writable(employees$1);
const departments = writable([
  { id: "dept-001", code: "FIN", name: "Finance & Accounting", manager: "Bambang Soepomo", costCenter: "CC-FIN-01", status: "active" },
  { id: "dept-002", code: "SAL", name: "Sales & Marketing", manager: "Rina Kusuma", costCenter: "CC-SAL-01", status: "active" },
  { id: "dept-003", code: "OPS", name: "Operations & Production", manager: "Dedi Kurniawan", costCenter: "CC-OPS-01", status: "active" },
  { id: "dept-004", code: "PUR", name: "Procurement", manager: "Putri Anggraini", costCenter: "CC-PUR-01", status: "active" },
  { id: "dept-005", code: "HGA", name: "HR & General Affairs", manager: "Nurul Hidayah", costCenter: "CC-HGA-01", status: "active" },
  { id: "dept-006", code: "IT", name: "Information Technology", manager: "Rizky Pratama", costCenter: "CC-IT-01", status: "active" }
]);
const chartOfAccounts = writable(chartOfAccounts$1);
const warehouses = writable([
  { id: "wh-001", code: "WH-JKT-01", name: "Main Distribution Center Sunter", location: "Jakarta Utara", manager: "Budi Hartono", capacity: "5,000 m3", status: "active" },
  { id: "wh-002", code: "WH-CKG-02", name: "Raw Material Warehouse Cikarang", location: "Cikarang Barat", manager: "Agus Salim", capacity: "12,000 m3", status: "active" },
  { id: "wh-003", code: "WH-SBY-03", name: "East Java Transit Depot", location: "Surabaya Rungkut", manager: "Dedi Kurniawan", capacity: "3,500 m3", status: "active" }
]);
const taxRates = writable([
  { id: "tx-001", code: "PPN-11", name: "Value Added Tax 11%", rate: 11, type: "sales", description: "Standard VAT (PPN) applicable to taxable goods and services" },
  { id: "tx-002", code: "PPH-23", name: "Withholding Tax Article 23", rate: 2, type: "withholding", description: "Withholding tax for professional and machining services" },
  { id: "tx-003", code: "NON-TAX", name: "Non-Taxable Goods / Exempt", rate: 0, type: "sales", description: "0% rate for exempted items and export supplies" }
]);
const paymentTerms = writable([
  { id: "top-001", code: "COD", name: "Cash On Delivery", days: 0, description: "Immediate settlement upon goods receipt" },
  { id: "top-002", code: "NET-14", name: "Net 14 Days", days: 14, description: "Payment due within 14 calendar days" },
  { id: "top-003", code: "NET-30", name: "Net 30 Days", days: 30, description: "Standard corporate term of 30 days" },
  { id: "top-004", code: "NET-60", name: "Net 60 Days", days: 60, description: "Extended enterprise contract terms" }
]);
const bankAccounts = writable([
  { id: "ba-001", code: "BCA-001", bankName: "Bank Central Asia (BCA)", accountNumber: "088-293-8472", accountHolder: "PT Byond Technology Indonesia", currency: "IDR", balance: 54285e4 },
  { id: "ba-002", code: "MDR-002", bankName: "Bank Mandiri (Persero)", accountNumber: "124-00-983742-1", accountHolder: "PT Byond Technology Indonesia", currency: "IDR", balance: 31842e4 },
  { id: "ba-003", code: "PETTY-01", bankName: "Petty Cash Safe Box (Operational)", accountNumber: "CASH-IDR-HQ", accountHolder: "Finance Cashier Desk", currency: "IDR", balance: 185e5 }
]);
const unitsOfMeasurement = writable([
  { id: "uom-001", code: "PCS", name: "Pieces", category: "Count", description: "Standard count for individual units" },
  { id: "uom-002", code: "BOX", name: "Box", category: "Count", description: "Carton or box packaging" },
  { id: "uom-003", code: "RIM", name: "Rim", category: "Count", description: "500 sheets of paper" },
  { id: "uom-004", code: "ROLL", name: "Roll", category: "Count", description: "Rolled material (tape, film, wire)" },
  { id: "uom-005", code: "SET", name: "Set", category: "Count", description: "A complete set of components" },
  { id: "uom-006", code: "UNIT", name: "Unit", category: "Count", description: "Single machine or device" },
  { id: "uom-007", code: "KG", name: "Kilogram", category: "Weight", description: "Metric weight measurement" },
  { id: "uom-008", code: "G", name: "Gram", category: "Weight", description: "Small metric weight measurement" },
  { id: "uom-009", code: "L", name: "Liter", category: "Volume", description: "Liquid volume measurement" },
  { id: "uom-010", code: "ML", name: "Milliliter", category: "Volume", description: "Small liquid volume measurement" },
  { id: "uom-011", code: "M", name: "Meter", category: "Length", description: "Metric length measurement" },
  { id: "uom-012", code: "CM", name: "Centimeter", category: "Length", description: "Small metric length measurement" },
  { id: "uom-013", code: "HOUR", name: "Hour", category: "Time", description: "Billable service hour" },
  { id: "uom-014", code: "DAY", name: "Day", category: "Time", description: "Billable service day" },
  { id: "uom-015", code: "SERVICE", name: "Service", category: "Service", description: "Lump-sum professional service" }
]);
const quotations = writable(quotations$1);
const salesOrders = writable(salesOrders$1);
const purchaseOrders = writable(purchaseOrders$1);
const goodsReceipts = writable(goodsReceipts$1);
const deliveries = writable(deliveries$1);
const billPayments = writable(billPayments$1);
const payments = writable(payments$1);
const debtPayments = writable(debtPayments$1);
const salesReturns = writable([
  { id: "sr-001", returnNo: "SR/2024/001", date: "2024-03-12", salesNo: "SO/2024/001", customerName: "PT Astra International Tbk", reason: "Packaging damaged during transit", total: 3429250, status: "approved" },
  { id: "sr-002", returnNo: "SR/2024/002", date: "2024-04-02", salesNo: "SO/2024/003", customerName: "PT Unilever Indonesia Tbk", reason: "Incorrect dimensions delivered", total: 5205750, status: "pending" }
]);
const purchaseReturns = writable([
  { id: "pr-001", returnNo: "PR/2024/001", date: "2024-03-20", purchaseNo: "PO/2024/001", supplierName: "CV Mitra Sejahtera", reason: "Substandard tensile strength", total: 1584e3, status: "completed" },
  { id: "pr-002", returnNo: "PR/2024/002", date: "2024-04-08", purchaseNo: "PO/2024/004", supplierName: "PT Nusantara Elektronik", reason: "Connector pins bent", total: 6426750, status: "approved" }
]);
const stockMovements = writable([
  { id: "sm-001", date: "2024-04-01", docNo: "GR/2024/001", productCode: "PRD-101", productName: "Steel Plate 10mm", type: "IN", warehouse: "Main Distribution Center", quantity: 50, unit: "Pcs", reference: "PO/2024/001" },
  { id: "sm-002", date: "2024-04-03", docNo: "DO/2024/001", productCode: "PRD-101", productName: "Steel Plate 10mm", type: "OUT", warehouse: "Main Distribution Center", quantity: 15, unit: "Pcs", reference: "SO/2024/001" },
  { id: "sm-003", date: "2024-04-05", docNo: "TR-2024-001", productCode: "PRD-102", productName: "Industrial Bearing 6204", type: "TRANSFER", warehouse: "Raw Material Warehouse", quantity: 100, unit: "Pcs", reference: "Rebalancing" },
  { id: "sm-004", date: "2024-04-10", docNo: "ADJ-2024-001", productCode: "PRD-103", productName: "Hydraulic Oil ISO VG 46", type: "ADJUST", warehouse: "Main Distribution Center", quantity: -2, unit: "Drum", reference: "Stock Count Variance" }
]);
const stockAdjustments = writable([
  { id: "adj-001", date: "2024-04-10", adjustmentNo: "ADJ/2024/001", warehouse: "Main Distribution Center", productName: "Hydraulic Oil ISO VG 46", systemQty: 25, actualQty: 23, diffQty: -2, reason: "Physical evaporation & measurement leak", status: "approved" },
  { id: "adj-002", date: "2024-04-14", adjustmentNo: "ADJ/2024/002", warehouse: "Raw Material Warehouse", productName: "Industrial Bearing 6204", systemQty: 340, actualQty: 345, diffQty: 5, reason: "Unrecorded surplus box found during cycle count", status: "pending" }
]);
const productAccountMappings = writable([
  { id: "map-001", category: "Raw Materials", inventoryAccount: "1-1410 Inventory - Raw Materials", salesAccount: "4-1000 Sales Revenue", cogsAccount: "5-1000 Cost of Goods Sold", returnAccount: "4-1200 Sales Returns" },
  { id: "map-002", category: "Hardware & Tools", inventoryAccount: "1-1420 Inventory - Hardware", salesAccount: "4-1000 Sales Revenue", cogsAccount: "5-1000 Cost of Goods Sold", returnAccount: "4-1200 Sales Returns" },
  { id: "map-003", category: "Machining & Technical Services", inventoryAccount: "N/A (Service Item)", salesAccount: "4-2000 Technical Services Revenue", cogsAccount: "5-2000 Direct Labor & Subcontracting", returnAccount: "4-2200 Service Rebates" }
]);
const expenses = writable([
  {
    id: "exp-001",
    date: "2024-04-02",
    expenseNo: "EXP/2024/001",
    expenseType: "utilities",
    category: "Utilities",
    accountCode: "6-1100",
    accountName: "Electricity & Water",
    departmentCode: "FIN",
    departmentName: "Finance & Accounting",
    budgetId: "bud-003",
    budgetNo: "BUD/2024/003",
    employeeId: "",
    employeeName: "",
    supplierName: "PT PLN (Persero)",
    description: "Factory electricity PLN billing",
    amount: 845e4,
    taxAmount: 929500,
    totalAmount: 9379500,
    paymentMethod: "Bank Transfer",
    bankAccount: "BCA-001",
    paidTo: "PT PLN (Persero)",
    status: "approved",
    attachmentUrl: "pln-april-2024.pdf",
    notes: "Monthly electricity billing",
    submittedBy: "Putri Anggraini",
    approvedBy: "Bambang Soepomo",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-002",
    date: "2024-04-05",
    expenseNo: "EXP/2024/002",
    expenseType: "logistics",
    category: "Logistics",
    accountCode: "6-2000",
    accountName: "Freight & Courier",
    departmentCode: "OPS",
    departmentName: "Operations & Production",
    budgetId: "bud-001",
    budgetNo: "BUD/2024/001",
    employeeId: "",
    employeeName: "",
    supplierName: "JNE Express Logistic",
    description: "Emergency courier forwarding for urgent delivery order",
    amount: 125e4,
    taxAmount: 137500,
    totalAmount: 1387500,
    paymentMethod: "Petty Cash",
    bankAccount: "PETTY-01",
    paidTo: "JNE Express Logistic",
    status: "posted",
    attachmentUrl: "jne-receipt.pdf",
    notes: "",
    submittedBy: "Dedi Kurniawan",
    approvedBy: "Bambang Soepomo",
    postedAt: "2024-04-06",
    glReference: "JE/2024/EXP/002"
  },
  {
    id: "exp-003",
    date: "2024-04-12",
    expenseNo: "EXP/2024/003",
    expenseType: "maintenance",
    category: "Maintenance",
    accountCode: "6-3000",
    accountName: "Machinery Maintenance",
    departmentCode: "OPS",
    departmentName: "Operations & Production",
    budgetId: "bud-001",
    budgetNo: "BUD/2024/001",
    employeeId: "",
    employeeName: "",
    supplierName: "CV Teknik Presisi",
    description: "CNC milling spindle lubrication and replacement",
    amount: 48e5,
    taxAmount: 528e3,
    totalAmount: 5328e3,
    paymentMethod: "Bank Transfer",
    bankAccount: "MDR-002",
    paidTo: "CV Teknik Presisi",
    status: "approved",
    attachmentUrl: "spindle-service-report.pdf",
    notes: "Preventive maintenance",
    submittedBy: "Dedi Kurniawan",
    approvedBy: "Bambang Soepomo",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-004",
    date: "2024-04-25",
    expenseNo: "EXP/2024/004",
    expenseType: "salary",
    category: "Employee Salary",
    accountCode: "6-1000",
    accountName: "Salaries & Wages",
    departmentCode: "FIN",
    departmentName: "Finance & Accounting",
    budgetId: "bud-003",
    budgetNo: "BUD/2024/003",
    employeeId: "emp-002",
    employeeName: "Nurul Hidayah",
    supplierName: "",
    description: "April 2024 salary - Finance & Accounting staff",
    amount: 125e5,
    taxAmount: 0,
    totalAmount: 125e5,
    paymentMethod: "Bank Transfer",
    bankAccount: "BCA-001",
    paidTo: "Nurul Hidayah",
    status: "posted",
    attachmentUrl: "payroll-april-2024.xlsx",
    notes: "Net salary after statutory deduction",
    submittedBy: "Nurul Hidayah",
    approvedBy: "Bambang Soepomo",
    postedAt: "2024-04-26",
    glReference: "JE/2024/PAY/004"
  },
  {
    id: "exp-005",
    date: "2024-04-15",
    expenseNo: "EXP/2024/005",
    expenseType: "purchase",
    category: "Direct Material Purchase",
    accountCode: "5-1000",
    accountName: "Cost of Goods Sold",
    departmentCode: "PUR",
    departmentName: "Procurement",
    budgetId: "bud-001",
    budgetNo: "BUD/2024/001",
    employeeId: "",
    employeeName: "",
    supplierName: "PT Sinar Jaya Metalindo",
    description: "Additional steel plate purchase for urgent production order",
    amount: 325e5,
    taxAmount: 3575e3,
    totalAmount: 36075e3,
    paymentMethod: "Bank Transfer",
    bankAccount: "BCA-001",
    paidTo: "PT Sinar Jaya Metalindo",
    status: "submitted",
    attachmentUrl: "po-2024-006.pdf",
    notes: "Awaiting finance approval",
    submittedBy: "Putri Anggraini",
    approvedBy: "",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-006",
    date: "2024-04-18",
    expenseNo: "EXP/2024/006",
    expenseType: "office_supplies",
    category: "Office Supplies (ATK)",
    accountCode: "6-1200",
    accountName: "Office Supplies (ATK)",
    departmentCode: "FIN",
    departmentName: "Finance & Accounting",
    budgetId: "bud-003",
    budgetNo: "BUD/2024/003",
    employeeId: "",
    employeeName: "",
    supplierName: "PT Sumber ATK Nusantara",
    description: "Monthly office stationery restock: paper, toner, folders",
    amount: 275e4,
    taxAmount: 302500,
    totalAmount: 3052500,
    paymentMethod: "Petty Cash",
    bankAccount: "PETTY-01",
    paidTo: "PT Sumber ATK Nusantara",
    status: "submitted",
    attachmentUrl: "atk-invoice-april.pdf",
    notes: "",
    submittedBy: "Nurul Hidayah",
    approvedBy: "",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-007",
    date: "2024-04-20",
    expenseNo: "EXP/2024/007",
    expenseType: "travel",
    category: "Travel & Accommodation",
    accountCode: "6-4000",
    accountName: "Travel & Accommodation",
    departmentCode: "SAL",
    departmentName: "Sales & Marketing",
    budgetId: "bud-002",
    budgetNo: "BUD/2024/002",
    employeeId: "emp-003",
    employeeName: "Rina Kusuma",
    supplierName: "",
    description: "Customer visit and exhibition trip to Surabaya",
    amount: 62e5,
    taxAmount: 682e3,
    totalAmount: 6882e3,
    paymentMethod: "Credit Card",
    bankAccount: "BCA-001",
    paidTo: "Rina Kusuma",
    status: "draft",
    attachmentUrl: "",
    notes: "Draft reimbursement",
    submittedBy: "Rina Kusuma",
    approvedBy: "",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-008",
    date: "2024-04-26",
    expenseNo: "EXP/2024/008",
    expenseType: "salary",
    category: "Employee Salary",
    accountCode: "6-1000",
    accountName: "Salaries & Wages",
    departmentCode: "OPS",
    departmentName: "Operations & Production",
    budgetId: "bud-001",
    budgetNo: "BUD/2024/001",
    employeeId: "emp-004",
    employeeName: "Dedi Kurniawan",
    supplierName: "",
    description: "April 2024 salary - Operations supervisor",
    amount: 15e6,
    taxAmount: 0,
    totalAmount: 15e6,
    paymentMethod: "Bank Transfer",
    bankAccount: "MDR-002",
    paidTo: "Dedi Kurniawan",
    status: "approved",
    attachmentUrl: "payroll-april-2024.xlsx",
    notes: "",
    submittedBy: "Nurul Hidayah",
    approvedBy: "Bambang Soepomo",
    postedAt: "",
    glReference: ""
  },
  {
    id: "exp-009",
    date: "2024-04-28",
    expenseNo: "EXP/2024/009",
    expenseType: "other",
    category: "Other Operating Expense",
    accountCode: "6-9000",
    accountName: "Other Operating Expenses",
    departmentCode: "IT",
    departmentName: "Information Technology",
    budgetId: "bud-004",
    budgetNo: "BUD/2024/004",
    employeeId: "",
    employeeName: "",
    supplierName: "PT Cloud Hosting Indonesia",
    description: "Cloud hosting and domain renewal",
    amount: 34e5,
    taxAmount: 374e3,
    totalAmount: 3774e3,
    paymentMethod: "Bank Transfer",
    bankAccount: "BCA-001",
    paidTo: "PT Cloud Hosting Indonesia",
    status: "posted",
    attachmentUrl: "cloud-invoice.pdf",
    notes: "",
    submittedBy: "Rizky Pratama",
    approvedBy: "Bambang Soepomo",
    postedAt: "2024-04-29",
    glReference: "JE/2024/EXP/009"
  }
]);
const annualBudgets = writable([
  {
    id: "bud-001",
    budgetNo: "BUD/2024/001",
    fiscalYear: 2024,
    name: "Operations Annual Budget 2024",
    departmentCode: "OPS",
    departmentName: "Operations & Production",
    totalAmount: 72e7,
    status: "approved",
    preparedBy: "Dedi Kurniawan",
    approvedBy: "Bambang Soepomo",
    createdAt: "2024-01-05",
    notes: "Production, maintenance and freight budget."
  },
  {
    id: "bud-002",
    budgetNo: "BUD/2024/002",
    fiscalYear: 2024,
    name: "Sales & Marketing Budget 2024",
    departmentCode: "SAL",
    departmentName: "Sales & Marketing",
    totalAmount: 48e7,
    status: "submitted",
    preparedBy: "Rina Kusuma",
    approvedBy: "",
    createdAt: "2024-01-08",
    notes: "Travel, promotion and customer engagement programs."
  },
  {
    id: "bud-003",
    budgetNo: "BUD/2024/003",
    fiscalYear: 2024,
    name: "Finance & Administration Budget 2024",
    departmentCode: "FIN",
    departmentName: "Finance & Accounting",
    totalAmount: 36e7,
    status: "approved",
    preparedBy: "Bambang Soepomo",
    approvedBy: "Ahmad Fauzi",
    createdAt: "2024-01-09",
    notes: "Salaries, utilities and office supplies."
  },
  {
    id: "bud-004",
    budgetNo: "BUD/2024/004",
    fiscalYear: 2024,
    name: "IT Infrastructure Budget 2024",
    departmentCode: "IT",
    departmentName: "Information Technology",
    totalAmount: 24e7,
    status: "draft",
    preparedBy: "Rizky Pratama",
    approvedBy: "",
    createdAt: "2024-02-01",
    notes: "Cloud services, hardware refresh and software licenses."
  },
  {
    id: "bud-005",
    budgetNo: "BUD/2024/005",
    fiscalYear: 2024,
    name: "HR & General Affairs Budget 2024",
    departmentCode: "HGA",
    departmentName: "HR & General Affairs",
    totalAmount: 3e8,
    status: "approved",
    preparedBy: "Nurul Hidayah",
    approvedBy: "Ahmad Fauzi",
    createdAt: "2024-01-10",
    notes: "Personnel welfare, office rent and supplies."
  }
]);
const budgetAllocations = writable([
  { id: "ball-001", budgetId: "bud-001", budgetNo: "BUD/2024/001", fiscalYear: 2024, accountCode: "5-1000", accountName: "Cost of Goods Sold", departmentCode: "OPS", departmentName: "Operations & Production", allocatedAmount: 42e7, usedAmount: 315e6, notes: "Direct material and production cost" },
  { id: "ball-002", budgetId: "bud-001", budgetNo: "BUD/2024/001", fiscalYear: 2024, accountCode: "6-3000", accountName: "Machinery Maintenance", departmentCode: "OPS", departmentName: "Operations & Production", allocatedAmount: 18e7, usedAmount: 925e5, notes: "Preventive and corrective maintenance" },
  { id: "ball-003", budgetId: "bud-001", budgetNo: "BUD/2024/001", fiscalYear: 2024, accountCode: "6-2000", accountName: "Freight & Courier", departmentCode: "OPS", departmentName: "Operations & Production", allocatedAmount: 12e7, usedAmount: 48e6, notes: "Outbound delivery and courier" },
  { id: "ball-004", budgetId: "bud-002", budgetNo: "BUD/2024/002", fiscalYear: 2024, accountCode: "6-4000", accountName: "Travel & Accommodation", departmentCode: "SAL", departmentName: "Sales & Marketing", allocatedAmount: 18e7, usedAmount: 64e6, notes: "Customer visits and exhibitions" },
  { id: "ball-005", budgetId: "bud-002", budgetNo: "BUD/2024/002", fiscalYear: 2024, accountCode: "6-9000", accountName: "Other Operating Expenses", departmentCode: "SAL", departmentName: "Sales & Marketing", allocatedAmount: 3e8, usedAmount: 112e6, notes: "Promotion and marketing programs" },
  { id: "ball-006", budgetId: "bud-003", budgetNo: "BUD/2024/003", fiscalYear: 2024, accountCode: "6-1000", accountName: "Salaries & Wages", departmentCode: "FIN", departmentName: "Finance & Accounting", allocatedAmount: 24e7, usedAmount: 18e7, notes: "Finance team payroll" },
  { id: "ball-007", budgetId: "bud-003", budgetNo: "BUD/2024/003", fiscalYear: 2024, accountCode: "6-1200", accountName: "Office Supplies (ATK)", departmentCode: "FIN", departmentName: "Finance & Accounting", allocatedAmount: 6e7, usedAmount: 1875e4, notes: "Stationery and consumables" },
  { id: "ball-008", budgetId: "bud-003", budgetNo: "BUD/2024/003", fiscalYear: 2024, accountCode: "6-1100", accountName: "Electricity & Water", departmentCode: "FIN", departmentName: "Finance & Accounting", allocatedAmount: 6e7, usedAmount: 254e5, notes: "Office utilities" },
  { id: "ball-009", budgetId: "bud-004", budgetNo: "BUD/2024/004", fiscalYear: 2024, accountCode: "6-9000", accountName: "Other Operating Expenses", departmentCode: "IT", departmentName: "Information Technology", allocatedAmount: 24e7, usedAmount: 0, notes: "Cloud, hardware and licenses" },
  { id: "ball-010", budgetId: "bud-005", budgetNo: "BUD/2024/005", fiscalYear: 2024, accountCode: "6-1000", accountName: "Salaries & Wages", departmentCode: "HGA", departmentName: "HR & General Affairs", allocatedAmount: 18e7, usedAmount: 15e7, notes: "HR and GA payroll" },
  { id: "ball-011", budgetId: "bud-005", budgetNo: "BUD/2024/005", fiscalYear: 2024, accountCode: "6-1200", accountName: "Office Supplies (ATK)", departmentCode: "HGA", departmentName: "HR & General Affairs", allocatedAmount: 6e7, usedAmount: 22e6, notes: "General office supplies" },
  { id: "ball-012", budgetId: "bud-005", budgetNo: "BUD/2024/005", fiscalYear: 2024, accountCode: "6-1300", accountName: "Rent Expense", departmentCode: "HGA", departmentName: "HR & General Affairs", allocatedAmount: 6e7, usedAmount: 6e7, notes: "Office rent" }
]);
const budgetRevisions = writable([
  { id: "brev-001", revisionNo: "REV/2024/001", budgetId: "bud-001", budgetNo: "BUD/2024/001", date: "2024-04-20", requestedBy: "Dedi Kurniawan", currentAmount: 72e7, requestedAmount: 78e7, difference: 6e7, reason: "Additional preventive maintenance for aging CNC machines.", status: "pending" },
  { id: "brev-002", revisionNo: "REV/2024/002", budgetId: "bud-002", budgetNo: "BUD/2024/002", date: "2024-04-10", requestedBy: "Rina Kusuma", currentAmount: 48e7, requestedAmount: 45e7, difference: -3e7, reason: "Reallocation of unused promotion budget to travel.", status: "approved" },
  { id: "brev-003", revisionNo: "REV/2024/003", budgetId: "bud-003", budgetNo: "BUD/2024/003", date: "2024-04-22", requestedBy: "Bambang Soepomo", currentAmount: 36e7, requestedAmount: 4e8, difference: 4e7, reason: "Additional office supplies and utility cost.", status: "rejected" }
]);
const bankReconciliations = writable([
  { id: "rec-001", date: "2024-03-31", bankAccount: "BCA 088-293-8472", statementBalance: 54285e4, glBalance: 54285e4, difference: 0, status: "reconciled" },
  { id: "rec-002", date: "2024-03-31", bankAccount: "Mandiri 124-00-983742-1", statementBalance: 32042e4, glBalance: 31842e4, difference: 2e6, status: "discrepancy" }
]);
const purchaseInvoices = writable([
  { id: "pinv-001", date: "2024-03-05", invoiceNo: "PI/2024/001", purchaseNo: "PO/2024/001", supplierName: "CV Mitra Sejahtera", dueDate: "2024-04-04", amount: 1584e5, status: "paid", preparedBy: "Putri Anggraini" },
  { id: "pinv-002", date: "2024-03-08", invoiceNo: "PI/2024/002", purchaseNo: "PO/2024/002", supplierName: "PT Sinar Jaya Metalindo", dueDate: "2024-04-15", amount: 89375e3, status: "pending", preparedBy: "Putri Anggraini" },
  { id: "pinv-003", date: "2024-03-12", invoiceNo: "PI/2024/003", purchaseNo: "PO/2024/003", supplierName: "PT Global Packaging", dueDate: "2024-04-10", amount: 13178e4, status: "overdue", preparedBy: "Putri Anggraini" },
  { id: "pinv-004", date: "2024-03-18", invoiceNo: "PI/2024/004", purchaseNo: "PO/2024/004", supplierName: "PT Nusantara Elektronik", dueDate: "2024-04-20", amount: 128535e3, status: "paid", preparedBy: "Putri Anggraini" },
  { id: "pinv-005", date: "2024-03-28", invoiceNo: "PI/2024/005", purchaseNo: "PO/2024/005", supplierName: "PT Jaya Abadi Teknik", dueDate: "2024-04-30", amount: 2231e4, status: "pending", preparedBy: "Putri Anggraini" }
]);
const periodClosings = writable([
  { id: "pc-001", period: "January 2024", startDate: "2024-01-01", endDate: "2024-01-31", status: "closed", closedBy: "Bambang Soepomo", closedAt: "2024-02-03", notes: "Monthly close completed, no adjusting entries pending." },
  { id: "pc-002", period: "February 2024", startDate: "2024-02-01", endDate: "2024-02-29", status: "closed", closedBy: "Bambang Soepomo", closedAt: "2024-03-04", notes: "Monthly close completed, bank reconciliation attached." },
  { id: "pc-003", period: "March 2024", startDate: "2024-03-01", endDate: "2024-03-31", status: "closed", closedBy: "Bambang Soepomo", closedAt: "2024-04-02", notes: "Quarterly close completed, VAT report submitted." },
  { id: "pc-004", period: "April 2024", startDate: "2024-04-01", endDate: "2024-04-30", status: "open", closedBy: "", closedAt: "", notes: "Current open period." }
]);
const journalEntries = writable(journalEntries$1);
const appSettings = writable(appSettings$1);
const systemAlerts = writable([
  {
    id: "alt-001",
    title: "Vendor Payable Due: PO/2024/001",
    message: "Notice: Vendor invoice payment of IDR 15,840,000 is approaching due date.",
    type: "debt",
    referenceNo: "PO/2024/001",
    link: "/vendor-payment",
    date: "2024-04-10",
    read: false
  },
  {
    id: "alt-002",
    title: "Overdue Receivable: INV/2024/002",
    message: "Notice: Customer receivable for PT Telkom Indonesia IDR 142,080,000 is overdue.",
    type: "receivable",
    referenceNo: "INV/2024/002",
    link: "/sales-invoice",
    date: "2024-04-12",
    read: false
  },
  {
    id: "alt-003",
    title: "Ready for Invoicing: SO/2024/005",
    message: "Delivery confirmed complete. Ready to generate sales invoice.",
    type: "info",
    referenceNo: "SO/2024/005",
    link: "/sales-invoice",
    date: "2024-04-14",
    read: false
  }
]);
const customerActions = {
  add(item) {
    const newCustomer = { id: `cust-${Date.now().toString(36)}`, ...item };
    customers.update((list) => [newCustomer, ...list]);
    return newCustomer;
  },
  update(id, data) {
    customers.update((list) => list.map((c) => c.id === id ? { ...c, ...data } : c));
  },
  delete(id) {
    customers.update((list) => list.filter((c) => c.id !== id));
  }
};
const productActions = {
  add(item) {
    const newProduct = { id: `prd-${Date.now().toString(36)}`, ...item };
    products.update((list) => [newProduct, ...list]);
    return newProduct;
  },
  update(id, data) {
    products.update((list) => list.map((p) => p.id === id ? { ...p, ...data } : p));
  },
  delete(id) {
    products.update((list) => list.filter((p) => p.id !== id));
  }
};
const supplierActions = {
  add(item) {
    const newSupplier = { id: `sup-${Date.now().toString(36)}`, ...item };
    suppliers.update((list) => [newSupplier, ...list]);
    return newSupplier;
  },
  update(id, data) {
    suppliers.update((list) => list.map((s) => s.id === id ? { ...s, ...data } : s));
  },
  delete(id) {
    suppliers.update((list) => list.filter((s) => s.id !== id));
  }
};
const employeeActions = {
  add(item) {
    const newEmp = { id: `emp-${Date.now().toString(36)}`, ...item };
    employees.update((list) => [newEmp, ...list]);
    return newEmp;
  },
  update(id, data) {
    employees.update((list) => list.map((e) => e.id === id ? { ...e, ...data } : e));
  },
  delete(id) {
    employees.update((list) => list.filter((e) => e.id !== id));
  }
};
const coaActions = {
  add(item) {
    const newCoa = { id: `coa-${Date.now().toString(36)}`, ...item };
    chartOfAccounts.update((list) => [newCoa, ...list]);
    return newCoa;
  },
  update(id, data) {
    chartOfAccounts.update((list) => list.map((c) => c.id === id ? { ...c, ...data } : c));
  },
  delete(id) {
    chartOfAccounts.update((list) => list.filter((c) => c.id !== id));
  }
};
const warehouseActions = {
  add(item) {
    const newWh = { id: `wh-${Date.now().toString(36)}`, ...item };
    warehouses.update((list) => [newWh, ...list]);
    return newWh;
  },
  update(id, data) {
    warehouses.update((list) => list.map((w) => w.id === id ? { ...w, ...data } : w));
  },
  delete(id) {
    warehouses.update((list) => list.filter((w) => w.id !== id));
  }
};
const taxRateActions = {
  add(item) {
    const newTax = { id: `tx-${Date.now().toString(36)}`, ...item };
    taxRates.update((list) => [newTax, ...list]);
    return newTax;
  },
  update(id, data) {
    taxRates.update((list) => list.map((t) => t.id === id ? { ...t, ...data } : t));
  },
  delete(id) {
    taxRates.update((list) => list.filter((t) => t.id !== id));
  }
};
const paymentTermActions = {
  add(item) {
    const newTerm = { id: `top-${Date.now().toString(36)}`, ...item };
    paymentTerms.update((list) => [newTerm, ...list]);
    return newTerm;
  },
  update(id, data) {
    paymentTerms.update((list) => list.map((t) => t.id === id ? { ...t, ...data } : t));
  },
  delete(id) {
    paymentTerms.update((list) => list.filter((t) => t.id !== id));
  }
};
const bankAccountActions = {
  add(item) {
    const newBank = { id: `ba-${Date.now().toString(36)}`, ...item };
    bankAccounts.update((list) => [newBank, ...list]);
    return newBank;
  },
  update(id, data) {
    bankAccounts.update((list) => list.map((b) => b.id === id ? { ...b, ...data } : b));
  },
  delete(id) {
    bankAccounts.update((list) => list.filter((b) => b.id !== id));
  }
};
const unitActions = {
  add(item) {
    const newUnit = { id: `uom-${Date.now().toString(36)}`, ...item };
    unitsOfMeasurement.update((list) => [newUnit, ...list]);
    return newUnit;
  },
  update(id, data) {
    unitsOfMeasurement.update((list) => list.map((u) => u.id === id ? { ...u, ...data } : u));
  },
  delete(id) {
    unitsOfMeasurement.update((list) => list.filter((u) => u.id !== id));
  }
};
const quotationActions = {
  add(item) {
    const newQ = { id: `qt-${Date.now().toString(36)}`, ...item };
    quotations.update((list) => [newQ, ...list]);
    return newQ;
  },
  update(id, data) {
    quotations.update((list) => list.map((q) => q.id === id ? { ...q, ...data } : q));
  },
  delete(id) {
    quotations.update((list) => list.filter((q) => q.id !== id));
  },
  convertToSalesOrder(quotationId, authorName = "Ahmad Fauzi") {
    let createdSO = null;
    quotations.update(
      (list) => list.map((q) => {
        if (q.id === quotationId) {
          createdSO = {
            id: `so-${Date.now().toString(36)}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            salesNo: `SO/${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
            transactionNo: q.transactionNo,
            customerId: q.customerId,
            customerName: q.customerName,
            preparedBy: authorName,
            items: [...q.items],
            subtotal: q.subtotal,
            tax: q.tax,
            total: q.total,
            status: "pending"
          };
          return { ...q, status: "sales" };
        }
        return q;
      })
    );
    if (createdSO) {
      salesOrders.update((list) => [createdSO, ...list]);
    }
    return createdSO;
  }
};
const salesActions = {
  add(item) {
    const newSO = { id: `so-${Date.now().toString(36)}`, ...item };
    salesOrders.update((list) => [newSO, ...list]);
    return newSO;
  },
  update(id, data) {
    salesOrders.update((list) => list.map((s) => s.id === id ? { ...s, ...data } : s));
  },
  delete(id) {
    salesOrders.update((list) => list.filter((s) => s.id !== id));
  },
  createDelivery(salesId, authorName = "Logistics Lead") {
    let createdDelivery = null;
    salesOrders.update(
      (list) => list.map((s) => {
        if (s.id === salesId) {
          createdDelivery = {
            id: `del-${Date.now().toString(36)}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            deliveryNo: `DO/${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
            salesNo: s.salesNo,
            transactionNo: s.transactionNo,
            customerName: s.customerName,
            preparedBy: authorName,
            items: [...s.items],
            status: "pending"
          };
          return { ...s, status: "delivered" };
        }
        return s;
      })
    );
    if (createdDelivery) {
      deliveries.update((list) => [createdDelivery, ...list]);
    }
    return createdDelivery;
  },
  createBill(salesId, authorName = "Ahmad Fauzi") {
    let createdBill = null;
    salesOrders.update(
      (list) => list.map((s) => {
        if (s.id === salesId) {
          createdBill = {
            id: `bill-${Date.now().toString(36)}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            billNo: `INV/${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
            transactionNo: s.transactionNo,
            supplierName: s.customerName,
            invoiceNo: s.salesNo,
            amount: s.total,
            method: "transfer",
            status: "pending",
            preparedBy: authorName
          };
        }
        return s;
      })
    );
    if (createdBill) {
      billPayments.update((list) => [createdBill, ...list]);
    }
    return createdBill;
  }
};
const purchaseActions = {
  add(item) {
    const newPO = { id: `po-${Date.now().toString(36)}`, ...item };
    purchaseOrders.update((list) => [newPO, ...list]);
    return newPO;
  },
  update(id, data) {
    purchaseOrders.update((list) => list.map((p) => p.id === id ? { ...p, ...data } : p));
  },
  delete(id) {
    purchaseOrders.update((list) => list.filter((p) => p.id !== id));
  },
  createGoodsReceipt(purchaseId, authorName = "Warehouse Lead") {
    let createdReceipt = null;
    purchaseOrders.update(
      (list) => list.map((p) => {
        if (p.id === purchaseId) {
          createdReceipt = {
            id: `gr-${Date.now().toString(36)}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            receiptNo: `GR/${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
            purchaseNo: p.purchaseNo,
            transactionNo: p.transactionNo,
            supplierName: p.supplierName,
            preparedBy: authorName,
            items: [...p.items],
            status: "received"
          };
          return { ...p, status: "received" };
        }
        return p;
      })
    );
    if (createdReceipt) {
      goodsReceipts.update((list) => [createdReceipt, ...list]);
    }
    return createdReceipt;
  }
};
const goodsReceiptActions = {
  add(item) {
    const newGR = { id: `gr-${Date.now().toString(36)}`, ...item };
    goodsReceipts.update((list) => [newGR, ...list]);
    return newGR;
  },
  update(id, data) {
    goodsReceipts.update((list) => list.map((g) => g.id === id ? { ...g, ...data } : g));
  },
  delete(id) {
    goodsReceipts.update((list) => list.filter((g) => g.id !== id));
  }
};
const deliveryActions = {
  add(item) {
    const newDel = { id: `del-${Date.now().toString(36)}`, ...item };
    deliveries.update((list) => [newDel, ...list]);
    return newDel;
  },
  update(id, data) {
    deliveries.update((list) => list.map((d) => d.id === id ? { ...d, ...data } : d));
  },
  delete(id) {
    deliveries.update((list) => list.filter((d) => d.id !== id));
  }
};
const billActions = {
  add(item) {
    const newBill = { id: `bill-${Date.now().toString(36)}`, ...item };
    billPayments.update((list) => [newBill, ...list]);
    return newBill;
  },
  update(id, data) {
    billPayments.update((list) => list.map((b) => b.id === id ? { ...b, ...data } : b));
  },
  delete(id) {
    billPayments.update((list) => list.filter((b) => b.id !== id));
  },
  recordPayment(billId, method = "transfer", authorName = "Finance Team") {
    let createdPayment = null;
    billPayments.update(
      (list) => list.map((b) => {
        if (b.id === billId) {
          createdPayment = {
            id: `pay-${Date.now().toString(36)}`,
            date: (/* @__PURE__ */ new Date()).toISOString().split("T")[0],
            paymentNo: `PAY/${(/* @__PURE__ */ new Date()).getFullYear()}/${String(Math.floor(Math.random() * 900) + 100)}`,
            transactionNo: b.transactionNo,
            customerName: b.supplierName,
            invoiceNo: b.billNo,
            amount: b.amount,
            method,
            status: "paid",
            preparedBy: authorName
          };
          return { ...b, status: "paid" };
        }
        return b;
      })
    );
    if (createdPayment) {
      payments.update((list) => [createdPayment, ...list]);
    }
    return createdPayment;
  }
};
const paymentActions = {
  add(item) {
    const newPay = { id: `pay-${Date.now().toString(36)}`, ...item };
    payments.update((list) => [newPay, ...list]);
    return newPay;
  },
  update(id, data) {
    payments.update((list) => list.map((p) => p.id === id ? { ...p, ...data } : p));
  },
  delete(id) {
    payments.update((list) => list.filter((p) => p.id !== id));
  }
};
const debtPaymentActions = {
  add(item) {
    const newDebtPay = { id: `dp-${Date.now().toString(36)}`, ...item };
    debtPayments.update((list) => [newDebtPay, ...list]);
    return newDebtPay;
  },
  update(id, data) {
    debtPayments.update((list) => list.map((d) => d.id === id ? { ...d, ...data } : d));
  },
  delete(id) {
    debtPayments.update((list) => list.filter((d) => d.id !== id));
  }
};
const salesReturnActions = {
  add(item) {
    const newSR = { id: `sr-${Date.now().toString(36)}`, ...item };
    salesReturns.update((list) => [newSR, ...list]);
    return newSR;
  },
  update(id, data) {
    salesReturns.update((list) => list.map((sr) => sr.id === id ? { ...sr, ...data } : sr));
  },
  delete(id) {
    salesReturns.update((list) => list.filter((sr) => sr.id !== id));
  }
};
const purchaseReturnActions = {
  add(item) {
    const newPR = { id: `pr-${Date.now().toString(36)}`, ...item };
    purchaseReturns.update((list) => [newPR, ...list]);
    return newPR;
  },
  update(id, data) {
    purchaseReturns.update((list) => list.map((pr) => pr.id === id ? { ...pr, ...data } : pr));
  },
  delete(id) {
    purchaseReturns.update((list) => list.filter((pr) => pr.id !== id));
  }
};
const inventoryActions = {
  addMovement(item) {
    const newM = { id: `sm-${Date.now().toString(36)}`, ...item };
    stockMovements.update((list) => [newM, ...list]);
    return newM;
  },
  updateMovement(id, data) {
    stockMovements.update((list) => list.map((m) => m.id === id ? { ...m, ...data } : m));
  },
  deleteMovement(id) {
    stockMovements.update((list) => list.filter((m) => m.id !== id));
  },
  addAdjustment(item) {
    const newA = { id: `adj-${Date.now().toString(36)}`, ...item };
    stockAdjustments.update((list) => [newA, ...list]);
    return newA;
  },
  updateAdjustment(id, data) {
    stockAdjustments.update((list) => list.map((a) => a.id === id ? { ...a, ...data } : a));
  },
  deleteAdjustment(id) {
    stockAdjustments.update((list) => list.filter((a) => a.id !== id));
  },
  addMapping(item) {
    const newMap = { id: `map-${Date.now().toString(36)}`, ...item };
    productAccountMappings.update((list) => [newMap, ...list]);
    return newMap;
  },
  updateMapping(id, data) {
    productAccountMappings.update((list) => list.map((m) => m.id === id ? { ...m, ...data } : m));
  },
  deleteMapping(id) {
    productAccountMappings.update((list) => list.filter((m) => m.id !== id));
  }
};
const departmentActions = {
  add(item) {
    const newDept = { id: `dept-${Date.now().toString(36)}`, ...item };
    departments.update((list) => [newDept, ...list]);
    return newDept;
  },
  update(id, data) {
    departments.update((list) => list.map((d) => d.id === id ? { ...d, ...data } : d));
  },
  delete(id) {
    departments.update((list) => list.filter((d) => d.id !== id));
  }
};
const expenseActions = {
  add(item) {
    const newExp = { id: `exp-${Date.now().toString(36)}`, ...item };
    expenses.update((list) => [newExp, ...list]);
    return newExp;
  },
  update(id, data) {
    expenses.update((list) => list.map((e) => e.id === id ? { ...e, ...data } : e));
  },
  delete(id) {
    expenses.update((list) => list.filter((e) => e.id !== id));
  },
  submit(id, submittedBy = "") {
    expenses.update(
      (list) => list.map(
        (e) => e.id === id ? { ...e, status: "submitted", submittedBy: submittedBy || e.submittedBy } : e
      )
    );
  },
  approve(id, approvedBy = "") {
    expenses.update(
      (list) => list.map(
        (e) => e.id === id ? { ...e, status: "approved", approvedBy: approvedBy || e.approvedBy } : e
      )
    );
  },
  reject(id, approvedBy = "") {
    expenses.update(
      (list) => list.map(
        (e) => e.id === id ? { ...e, status: "rejected", approvedBy: approvedBy || e.approvedBy } : e
      )
    );
  },
  post(id, glReference = "") {
    const postedAt = (/* @__PURE__ */ new Date()).toISOString().split("T")[0];
    expenses.update(
      (list) => list.map(
        (e) => e.id === id ? {
          ...e,
          status: "posted",
          postedAt,
          glReference: glReference || `JE/${(/* @__PURE__ */ new Date()).getFullYear()}/EXP/${e.expenseNo.split("/").pop()}`
        } : e
      )
    );
  }
};
const budgetingActions = {
  addBudget(item) {
    const newBudget = { id: `bud-${Date.now().toString(36)}`, ...item };
    annualBudgets.update((list) => [newBudget, ...list]);
    return newBudget;
  },
  updateBudget(id, data) {
    annualBudgets.update((list) => list.map((b) => b.id === id ? { ...b, ...data } : b));
  },
  deleteBudget(id) {
    annualBudgets.update((list) => list.filter((b) => b.id !== id));
    budgetAllocations.update((list) => list.filter((a) => a.budgetId !== id));
    budgetRevisions.update((list) => list.filter((r) => r.budgetId !== id));
  },
  submitBudget(id) {
    annualBudgets.update(
      (list) => list.map((b) => b.id === id ? { ...b, status: "submitted" } : b)
    );
  },
  approveBudget(id, approvedBy = "") {
    annualBudgets.update(
      (list) => list.map(
        (b) => b.id === id ? { ...b, status: "approved", approvedBy: approvedBy || b.approvedBy } : b
      )
    );
  },
  rejectBudget(id) {
    annualBudgets.update(
      (list) => list.map((b) => b.id === id ? { ...b, status: "rejected" } : b)
    );
  },
  closeBudget(id) {
    annualBudgets.update(
      (list) => list.map((b) => b.id === id ? { ...b, status: "closed" } : b)
    );
  },
  addAllocation(item) {
    const newAlloc = { id: `ball-${Date.now().toString(36)}`, ...item };
    budgetAllocations.update((list) => [newAlloc, ...list]);
    return newAlloc;
  },
  updateAllocation(id, data) {
    budgetAllocations.update(
      (list) => list.map((a) => a.id === id ? { ...a, ...data } : a)
    );
  },
  deleteAllocation(id) {
    budgetAllocations.update((list) => list.filter((a) => a.id !== id));
  },
  addRevision(item) {
    const newRevision = { id: `brev-${Date.now().toString(36)}`, ...item };
    budgetRevisions.update((list) => [newRevision, ...list]);
    return newRevision;
  },
  updateRevision(id, data) {
    budgetRevisions.update(
      (list) => list.map((r) => r.id === id ? { ...r, ...data } : r)
    );
  },
  deleteRevision(id) {
    budgetRevisions.update((list) => list.filter((r) => r.id !== id));
  },
  approveRevision(id) {
    budgetRevisions.update(
      (list) => list.map((r) => r.id === id ? { ...r, status: "approved" } : r)
    );
  },
  rejectRevision(id) {
    budgetRevisions.update(
      (list) => list.map((r) => r.id === id ? { ...r, status: "rejected" } : r)
    );
  }
};
const bankReconciliationActions = {
  add(item) {
    const newRec = { id: `rec-${Date.now().toString(36)}`, ...item };
    bankReconciliations.update((list) => [newRec, ...list]);
    return newRec;
  },
  update(id, data) {
    bankReconciliations.update((list) => list.map((r) => r.id === id ? { ...r, ...data } : r));
  },
  delete(id) {
    bankReconciliations.update((list) => list.filter((r) => r.id !== id));
  },
  reconcile(id) {
    bankReconciliations.update(
      (list) => list.map(
        (r) => r.id === id ? { ...r, status: "reconciled", glBalance: r.statementBalance, difference: 0 } : r
      )
    );
  }
};
const journalActions = {
  add(item) {
    const newEntry = { id: `je-${Date.now().toString(36)}`, ...item };
    journalEntries.update((list) => [newEntry, ...list]);
    return newEntry;
  },
  update(id, data) {
    journalEntries.update((list) => list.map((j) => j.id === id ? { ...j, ...data } : j));
  },
  delete(id) {
    journalEntries.update((list) => list.filter((j) => j.id !== id));
  }
};
const purchaseInvoiceActions = {
  add(item) {
    const newInv = { id: `pinv-${Date.now().toString(36)}`, ...item };
    purchaseInvoices.update((list) => [newInv, ...list]);
    return newInv;
  },
  update(id, data) {
    purchaseInvoices.update((list) => list.map((i) => i.id === id ? { ...i, ...data } : i));
  },
  delete(id) {
    purchaseInvoices.update((list) => list.filter((i) => i.id !== id));
  },
  markPaid(id) {
    purchaseInvoices.update((list) => list.map((i) => i.id === id ? { ...i, status: "paid" } : i));
  }
};
const periodClosingActions = {
  add(item) {
    const newPeriod = { id: `pc-${Date.now().toString(36)}`, ...item };
    periodClosings.update((list) => [newPeriod, ...list]);
    return newPeriod;
  },
  update(id, data) {
    periodClosings.update((list) => list.map((p) => p.id === id ? { ...p, ...data } : p));
  },
  delete(id) {
    periodClosings.update((list) => list.filter((p) => p.id !== id));
  },
  closePeriod(id, closedBy = "Bambang Soepomo") {
    periodClosings.update(
      (list) => list.map(
        (p) => p.id === id ? {
          ...p,
          status: "closed",
          closedBy,
          closedAt: (/* @__PURE__ */ new Date()).toISOString().split("T")[0]
        } : p
      )
    );
  }
};
const totalSalesAmount = derived(
  salesOrders,
  ($sales) => $sales.reduce((sum, so) => sum + so.total, 0)
);
const totalReceivableAmount = derived(
  billPayments,
  ($bills) => $bills.filter((b) => b.status === "pending").reduce((sum, b) => sum + b.amount, 0)
);
const totalPayableAmount = derived(
  purchaseOrders,
  ($po) => $po.filter((p) => p.status === "pending").reduce((sum, p) => sum + p.total, 0)
);
const paymentCompletionRate = derived(
  [billPayments, payments],
  ([$bills, $payments]) => {
    const totalBilled = $bills.reduce((sum, b) => sum + b.amount, 0);
    const totalPaid = $payments.reduce((sum, p) => sum + p.amount, 0);
    if (totalBilled === 0) return 100;
    return Math.min(100, Math.round(totalPaid / totalBilled * 100));
  }
);
export {
  purchaseReturnActions as $,
  salesOrders as A,
  quotations as B,
  deliveryActions as C,
  departmentActions as D,
  employees as E,
  employeeActions as F,
  expenseActions as G,
  suppliers as H,
  goodsReceiptActions as I,
  products as J,
  journalEntries as K,
  journalActions as L,
  currentUser as M,
  billActions as N,
  paymentActions as O,
  debtPaymentActions as P,
  paymentTerms as Q,
  paymentTermActions as R,
  periodClosings as S,
  periodClosingActions as T,
  productAccountMappings as U,
  inventoryActions as V,
  unitsOfMeasurement as W,
  productActions as X,
  purchaseInvoices as Y,
  purchaseInvoiceActions as Z,
  purchaseReturns as _,
  appSettings as a,
  purchaseActions as a0,
  quotationActions as a1,
  stockMovements as a2,
  taxRates as a3,
  salesReturns as a4,
  salesReturnActions as a5,
  salesActions as a6,
  stockAdjustments as a7,
  supplierActions as a8,
  taxRateActions as a9,
  unitActions as aa,
  warehouses as ab,
  warehouseActions as ac,
  bankAccounts as b,
  chartOfAccounts as c,
  bankAccountActions as d,
  bankReconciliations as e,
  bankReconciliationActions as f,
  departments as g,
  annualBudgets as h,
  budgetAllocations as i,
  budgetingActions as j,
  budgetRevisions as k,
  expenses as l,
  debtPayments as m,
  coaActions as n,
  customers as o,
  payments as p,
  customerActions as q,
  totalReceivableAmount as r,
  systemAlerts as s,
  totalSalesAmount as t,
  totalPayableAmount as u,
  paymentCompletionRate as v,
  billPayments as w,
  deliveries as x,
  goodsReceipts as y,
  purchaseOrders as z
};
