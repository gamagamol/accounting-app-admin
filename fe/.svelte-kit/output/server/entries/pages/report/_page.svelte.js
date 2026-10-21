import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component, b as each, d as add_attribute } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { T as Tabs } from "../../../chunks/Tabs.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { c as billPayments, b as salesOrders, q as quotations, e as customers, k as purchaseOrders, j as goodsReceipts, h as payments, i as deliveries } from "../../../chunks/dataStore.js";
import { a as formatCurrency, f as formatDate } from "../../../chunks/formatters.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { G as GeneralLedgerView } from "../../../chunks/GeneralLedgerView.js";
const AgingScheduleView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let agingData;
  let totalAll;
  let $billPayments, $$unsubscribe_billPayments;
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  const columns = [
    {
      key: "invoiceNo",
      label: "No. Faktur",
      sortable: true
    },
    {
      key: "customerName",
      label: "Customer / Pelanggan",
      sortable: true
    },
    {
      key: "date",
      label: "Tgl Faktur",
      format: (v) => formatDate(v)
    },
    {
      key: "current",
      label: "Belum Jatuh Tempo",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "days1_30",
      label: "1 - 30 Hari",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "days31_60",
      label: "31 - 60 Hari",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "days61_90",
      label: "61 - 90 Hari",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "daysOver90",
      label: "> 90 Hari",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "total",
      label: "Total Piutang",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  agingData = $billPayments.map((b, i) => {
    const isPaid = b.status === "paid";
    const amount = isPaid ? 0 : b.amount;
    let current = 0;
    let days1_30 = 0;
    let days31_60 = 0;
    let days61_90 = 0;
    let daysOver90 = 0;
    if (i % 5 === 0) current = amount;
    else if (i % 5 === 1) days1_30 = amount;
    else if (i % 5 === 2) days31_60 = amount;
    else if (i % 5 === 3) days61_90 = amount;
    else daysOver90 = amount;
    return {
      invoiceNo: b.billNo,
      customerName: b.supplierName,
      date: b.date,
      current,
      days1_30,
      days31_60,
      days61_90,
      daysOver90,
      total: amount
    };
  });
  totalAll = agingData.reduce(
    (acc, row) => ({
      current: acc.current + row.current,
      days1_30: acc.days1_30 + row.days1_30,
      days31_60: acc.days31_60 + row.days31_60,
      days61_90: acc.days61_90 + row.days61_90,
      daysOver90: acc.daysOver90 + row.daysOver90,
      total: acc.total + row.total
    }),
    {
      current: 0,
      days1_30: 0,
      days31_60: 0,
      days61_90: 0,
      daysOver90: 0,
      total: 0
    }
  );
  $$unsubscribe_billPayments();
  return `<div class="space-y-6"> <div class="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3"><div class="bg-white p-3.5 rounded-xl border border-gray-200"><span class="text-[11px] font-semibold text-gray-500 uppercase" data-svelte-h="svelte-1rd2wp8">Lancar (Current)</span> <p class="text-sm font-bold text-emerald-700 mt-1 font-mono">${escape(formatCurrency(totalAll.current))}</p></div> <div class="bg-white p-3.5 rounded-xl border border-gray-200"><span class="text-[11px] font-semibold text-gray-500 uppercase" data-svelte-h="svelte-b1y3vm">1 - 30 Hari</span> <p class="text-sm font-bold text-blue-700 mt-1 font-mono">${escape(formatCurrency(totalAll.days1_30))}</p></div> <div class="bg-white p-3.5 rounded-xl border border-gray-200"><span class="text-[11px] font-semibold text-gray-500 uppercase" data-svelte-h="svelte-m6ii14">31 - 60 Hari</span> <p class="text-sm font-bold text-amber-700 mt-1 font-mono">${escape(formatCurrency(totalAll.days31_60))}</p></div> <div class="bg-white p-3.5 rounded-xl border border-gray-200"><span class="text-[11px] font-semibold text-gray-500 uppercase" data-svelte-h="svelte-uw9a98">61 - 90 Hari</span> <p class="text-sm font-bold text-orange-700 mt-1 font-mono">${escape(formatCurrency(totalAll.days61_90))}</p></div> <div class="bg-white p-3.5 rounded-xl border border-gray-200"><span class="text-[11px] font-semibold text-gray-500 uppercase" data-svelte-h="svelte-raiwu1">&gt; 90 Hari (Macet)</span> <p class="text-sm font-bold text-rose-700 mt-1 font-mono">${escape(formatCurrency(totalAll.daysOver90))}</p></div> <div class="bg-slate-900 text-white p-3.5 rounded-xl"><span class="text-[11px] font-semibold text-slate-400 uppercase" data-svelte-h="svelte-u7ciy6">Total Piutang Usaha</span> <p class="text-sm font-bold text-white mt-1 font-mono">${escape(formatCurrency(totalAll.total))}</p></div></div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Cetak / Print Jadwal Umur Piutang`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: agingData,
      searchPlaceholder: "Cari berdasarkan nomor invoice atau customer...",
      searchKeys: ["invoiceNo", "customerName"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "daysOver90" && value > 0 ? `<span class="font-mono text-rose-600 font-bold bg-rose-50 px-2 py-0.5 rounded">${escape(formatCurrency(value))}</span>` : `${column.key === "total" ? `<span class="font-mono font-bold text-gray-900">${escape(formatCurrency(value))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const QuotationVsPoView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let reportData;
  let totalQuotation;
  let totalSales;
  let conversionRate;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  const columns = [
    {
      key: "quotationNo",
      label: "No. Quotation",
      sortable: true
    },
    {
      key: "customerName",
      label: "Nama Customer",
      sortable: true
    },
    {
      key: "quotationDate",
      label: "Tgl Penawaran",
      format: (v) => formatDate(v)
    },
    {
      key: "quotationTotal",
      label: "Nilai Penawaran",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "salesNo",
      label: "No. SO (Realisasi)"
    },
    {
      key: "salesTotal",
      label: "Nilai SO",
      align: "right",
      sortable: true,
      format: (v) => v > 0 ? formatCurrency(v) : "-"
    },
    {
      key: "status",
      label: "Status Deal",
      align: "center",
      sortable: true
    }
  ];
  reportData = $quotations.map((q) => {
    const matchedSO = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const salesTotal = matchedSO ? matchedSO.total : 0;
    const variance = salesTotal - q.total;
    return {
      quotationNo: q.quotationNo,
      customerName: q.customerName,
      quotationDate: q.date,
      quotationTotal: q.total,
      salesNo: matchedSO ? matchedSO.salesNo : "-",
      salesDate: matchedSO ? matchedSO.date : "-",
      salesTotal,
      variance,
      status: matchedSO ? "Deal (SO Terbit)" : "Pending Penawaran"
    };
  });
  totalQuotation = reportData.reduce((sum, r) => sum + r.quotationTotal, 0);
  totalSales = reportData.reduce((sum, r) => sum + r.salesTotal, 0);
  conversionRate = totalQuotation > 0 ? Math.round(totalSales / totalQuotation * 100) : 0;
  $$unsubscribe_salesOrders();
  $$unsubscribe_quotations();
  return `<div class="space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-1fj1o8k">Total Nilai Penawaran</span> <p class="text-xl font-bold text-blue-700 mt-1 font-mono">${escape(formatCurrency(totalQuotation))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-4tk222">Total Realisasi Pesanan (SO)</span> <p class="text-xl font-bold text-emerald-700 mt-1 font-mono">${escape(formatCurrency(totalSales))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-1vtimb">Rasio Konversi Penjualan</span> <p class="text-xl font-bold text-indigo-700 mt-1 font-mono">${escape(conversionRate)}%</p></div></div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Cetak / Print Laporan`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: reportData,
      searchPlaceholder: "Cari berdasarkan nomor quotation atau customer...",
      searchKeys: ["quotationNo", "customerName", "salesNo"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "quotationNo" ? `<span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(value)}</span>` : `${column.key === "salesNo" && value !== "-" ? `<span class="font-mono font-bold text-indigo-700 bg-indigo-50 px-2 py-0.5 rounded border border-indigo-200">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
          $$result,
          {
            status: value.includes("Deal") ? "completed" : "pending",
            label: value
          },
          {},
          {}
        )}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
const QuotationDetailView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let detailRows;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  const columns = [
    {
      key: "quotationNo",
      label: "No. Quotation",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "customerName",
      label: "Customer",
      sortable: true
    },
    {
      key: "productName",
      label: "Nama Item Barang",
      sortable: true
    },
    {
      key: "quantity",
      label: "Qty",
      align: "center",
      sortable: true
    },
    {
      key: "unit",
      label: "Satuan",
      align: "center"
    },
    {
      key: "unitPrice",
      label: "Harga Satuan",
      align: "right",
      format: (v) => formatCurrency(v)
    },
    {
      key: "discount",
      label: "Diskon",
      align: "center",
      format: (v) => v ? `${v}%` : "-"
    },
    {
      key: "total",
      label: "Total Nominal",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  detailRows = $quotations.flatMap((q) => q.items.map((item) => ({
    quotationNo: q.quotationNo,
    date: q.date,
    customerName: q.customerName,
    productName: item.productName,
    quantity: item.quantity,
    unit: item.unit,
    unitPrice: item.unitPrice,
    discount: item.discount,
    total: item.total
  })));
  $$unsubscribe_quotations();
  return `<div class="space-y-6"><div class="flex justify-between items-center"><p class="text-xs text-gray-500" data-svelte-h="svelte-mqlvu8">Rincian line item seluruh penawaran harga yang diterbitkan</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Cetak / Print Rincian`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: detailRows,
      searchPlaceholder: "Cari berdasarkan quotation, produk, atau customer...",
      searchKeys: ["quotationNo", "customerName", "productName"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "quotationNo" ? `<span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`;
      }
    }
  )}</div>`;
});
const CustomerOmzetView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalAllSales;
  let omzetData;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $customers, $$unsubscribe_customers;
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_customers = subscribe(customers, (value) => $customers = value);
  const columns = [
    {
      key: "companyName",
      label: "Nama Perusahaan Pelanggan",
      sortable: true
    },
    {
      key: "city",
      label: "Kota",
      sortable: true
    },
    {
      key: "orderCount",
      label: "Jml Transaksi SO",
      align: "center",
      sortable: true
    },
    {
      key: "contributionPercentage",
      label: "Kontribusi Omzet",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    },
    {
      key: "totalOmzet",
      label: "Total Omzet Penjualan",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  totalAllSales = $salesOrders.reduce((sum, so) => sum + so.total, 0);
  omzetData = $customers.map((cust) => {
    const custOrders = $salesOrders.filter((so) => so.customerId === cust.id || so.customerName === cust.companyName);
    const totalOmzet = custOrders.reduce((sum, o) => sum + o.total, 0);
    const contributionPercentage = totalAllSales > 0 ? Math.round(totalOmzet / totalAllSales * 100) : 0;
    return {
      customerId: cust.id,
      companyName: cust.companyName,
      city: cust.city,
      orderCount: custOrders.length,
      totalOmzet,
      contributionPercentage
    };
  }).sort((a, b) => b.totalOmzet - a.totalOmzet);
  $$unsubscribe_salesOrders();
  $$unsubscribe_customers();
  return `<div class="space-y-6"><div class="bg-gradient-to-r from-blue-700 to-indigo-800 rounded-2xl p-6 text-white shadow-lg flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4"><div><span class="text-xs uppercase tracking-wider font-semibold text-blue-200" data-svelte-h="svelte-1m32cf2">Total Akumulasi Omzet Perusahaan</span> <h3 class="text-2xl sm:text-3xl font-extrabold font-mono mt-1">${escape(formatCurrency(totalAllSales))}</h3> <p class="text-xs text-blue-100 mt-1" data-svelte-h="svelte-11r0sai">Dihitung dari seluruh pesanan penjualan yang telah disetujui</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "md" }, {}, {
    default: () => {
      return `📥 Export / Cetak Laporan Omzet`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: omzetData,
      searchPlaceholder: "Cari customer atau kota...",
      searchKeys: ["companyName", "city"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "totalOmzet" ? `<span class="font-mono font-bold text-gray-900 text-sm">${escape(formatCurrency(value))}</span>` : `${column.key === "contributionPercentage" ? `<div class="flex items-center justify-center gap-2"><div class="w-16 bg-gray-200 rounded-full h-2 overflow-hidden"><div class="bg-blue-600 h-2 rounded-full" style="${"width: " + escape(value, true) + "%"}"></div></div> <span class="font-bold text-xs font-mono">${escape(value)}%</span></div>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const OutstandingView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let outstandingBills;
  let totalOutstandingReceivable;
  let pendingDeliveries;
  let totalPendingDeliveryValue;
  let pendingPurchases;
  let totalPendingPurchaseValue;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $billPayments, $$unsubscribe_billPayments;
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  const receivableColumns = [
    {
      key: "billNo",
      label: "No. Faktur (Invoice)",
      sortable: true
    },
    {
      key: "date",
      label: "Tanggal Terbit",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "supplierName",
      label: "Pelanggan (Customer)",
      sortable: true
    },
    { key: "invoiceNo", label: "No. SO Ref" },
    {
      key: "amount",
      label: "Nilai Piutang Tertunggak",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "status",
      label: "Status Penagihan",
      align: "center"
    }
  ];
  outstandingBills = $billPayments.filter((b) => b.status === "pending");
  totalOutstandingReceivable = outstandingBills.reduce((sum, b) => sum + b.amount, 0);
  pendingDeliveries = $salesOrders.filter((s) => s.status === "pending");
  totalPendingDeliveryValue = pendingDeliveries.reduce((sum, s) => sum + s.total, 0);
  pendingPurchases = $purchaseOrders.filter((p) => p.status === "pending");
  totalPendingPurchaseValue = pendingPurchases.reduce((sum, p) => sum + p.total, 0);
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_salesOrders();
  $$unsubscribe_billPayments();
  return `<div class="space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-amber-50/70 border-amber-300 ring-2 ring-amber-400",
    true
  )}"><span class="text-xs font-semibold text-amber-800 uppercase tracking-wider" data-svelte-h="svelte-1rthgm0">Piutang Belum Lunas</span> <p class="text-xl font-bold text-amber-700 mt-1 font-mono">${escape(formatCurrency(totalOutstandingReceivable))}</p> <span class="text-xs text-amber-600 mt-1 block">${escape(outstandingBills.length)} Tagihan Menunggu Pembayaran</span></button> <button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-white border-gray-200 hover:border-gray-300",
    true
  )}"><span class="text-xs font-semibold text-blue-800 uppercase tracking-wider" data-svelte-h="svelte-1o992gq">Pengiriman Belum Selesai</span> <p class="text-xl font-bold text-blue-700 mt-1 font-mono">${escape(formatCurrency(totalPendingDeliveryValue))}</p> <span class="text-xs text-blue-600 mt-1 block">${escape(pendingDeliveries.length)} Pesanan Menunggu Kirim</span></button> <button type="button" class="${"text-left p-4 rounded-xl border transition-all " + escape(
    "bg-white border-gray-200 hover:border-gray-300",
    true
  )}"><span class="text-xs font-semibold text-rose-800 uppercase tracking-wider" data-svelte-h="svelte-1qu107u">Hutang / PO Pending</span> <p class="text-xl font-bold text-rose-700 mt-1 font-mono">${escape(formatCurrency(totalPendingPurchaseValue))}</p> <span class="text-xs text-rose-600 mt-1 block">${escape(pendingPurchases.length)} PO Belum Diterima</span></button></div> <div class="flex justify-between items-center"><div class="text-xs font-semibold text-gray-700">${`Daftar Faktur Tagihan Piutang Yang Belum Lunas (Outstanding Invoices)`}</div> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Cetak Laporan Outstanding`;
    }
  })}</div> ${`${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns: receivableColumns,
      data: outstandingBills,
      searchPlaceholder: "Cari invoice piutang tertunggak...",
      searchKeys: ["billNo", "supplierName", "invoiceNo"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "billNo" ? `<span class="font-mono font-bold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">${escape(value)}</span>` : `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render($$result, { status: "pending", label: "Belum Lunas" }, {}, {})}` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}`}</div>`;
});
const OmzetReportView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalGross;
  let totalCogs;
  let totalMargin;
  let avgMarginPct;
  const monthlyOmzet = [
    {
      period: "Januari 2024",
      grossSales: 1254e5,
      cogs: 825e5,
      margin: 429e5,
      marginPct: 34.2,
      orders: 12
    },
    {
      period: "Februari 2024",
      grossSales: 1482e5,
      cogs: 963e5,
      margin: 519e5,
      marginPct: 35,
      orders: 15
    },
    {
      period: "Maret 2024",
      grossSales: 1856e5,
      cogs: 1184e5,
      margin: 672e5,
      marginPct: 36.2,
      orders: 18
    },
    {
      period: "April 2024 (Berjalan)",
      grossSales: 1629e5,
      cogs: 1045e5,
      margin: 584e5,
      marginPct: 35.8,
      orders: 14
    }
  ];
  const columns = [
    {
      key: "period",
      label: "Periode Bulan",
      sortable: true
    },
    {
      key: "orders",
      label: "Volume Transaksi",
      align: "center",
      sortable: true,
      format: (v) => `${v} Pesanan`
    },
    {
      key: "grossSales",
      label: "Omzet Penjualan Kotor",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "cogs",
      label: "Harga Pokok (HPP)",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "margin",
      label: "Laba Kotor (Gross Profit)",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    },
    {
      key: "marginPct",
      label: "Margin (%)",
      align: "center",
      sortable: true,
      format: (v) => `${v}%`
    }
  ];
  totalGross = monthlyOmzet.reduce((s, m) => s + m.grossSales, 0);
  totalCogs = monthlyOmzet.reduce((s, m) => s + m.cogs, 0);
  totalMargin = monthlyOmzet.reduce((s, m) => s + m.margin, 0);
  avgMarginPct = Math.round(totalMargin / totalGross * 100);
  return `<div class="space-y-6"> <div class="grid grid-cols-1 sm:grid-cols-4 gap-4"><div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-102zv8t">Total Akumulasi Omzet</span> <p class="text-xl font-bold text-blue-700 mt-1 font-mono">${escape(formatCurrency(totalGross))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-14f1gav">Beban Pokok Penjualan (HPP)</span> <p class="text-xl font-bold text-amber-700 mt-1 font-mono">${escape(formatCurrency(totalCogs))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-1b3c8d2">Laba Kotor (Gross Margin)</span> <p class="text-xl font-bold text-emerald-700 mt-1 font-mono">${escape(formatCurrency(totalMargin))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-7im1ob">Rata-rata Margin</span> <p class="text-xl font-bold text-indigo-700 mt-1 font-mono">${escape(avgMarginPct)}%</p></div></div> <div class="flex justify-end gap-2">${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Export / Cetak Laporan Omzet Bulanan`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: monthlyOmzet,
      searchPlaceholder: "Cari periode bulan...",
      searchKeys: ["period"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "grossSales" ? `<span class="font-mono font-bold text-blue-700">${escape(formatCurrency(value))}</span>` : `${column.key === "margin" ? `<span class="font-mono font-bold text-emerald-700">${escape(formatCurrency(value))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`;
      }
    }
  )}</div>`;
});
const TransactionTrackingView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let trackingItems;
  let activeTrx;
  let $goodsReceipts, $$unsubscribe_goodsReceipts;
  let $purchaseOrders, $$unsubscribe_purchaseOrders;
  let $payments, $$unsubscribe_payments;
  let $billPayments, $$unsubscribe_billPayments;
  let $deliveries, $$unsubscribe_deliveries;
  let $salesOrders, $$unsubscribe_salesOrders;
  let $quotations, $$unsubscribe_quotations;
  $$unsubscribe_goodsReceipts = subscribe(goodsReceipts, (value) => $goodsReceipts = value);
  $$unsubscribe_purchaseOrders = subscribe(purchaseOrders, (value) => $purchaseOrders = value);
  $$unsubscribe_payments = subscribe(payments, (value) => $payments = value);
  $$unsubscribe_billPayments = subscribe(billPayments, (value) => $billPayments = value);
  $$unsubscribe_deliveries = subscribe(deliveries, (value) => $deliveries = value);
  $$unsubscribe_salesOrders = subscribe(salesOrders, (value) => $salesOrders = value);
  $$unsubscribe_quotations = subscribe(quotations, (value) => $quotations = value);
  let selectedTrxIndex = 0;
  trackingItems = $quotations.map((q) => {
    const so = $salesOrders.find((s) => s.transactionNo === q.transactionNo || s.customerId === q.customerId);
    const doItem = so ? $deliveries.find((d) => d.salesNo === so.salesNo || d.transactionNo === q.transactionNo) : null;
    const bill = so ? $billPayments.find((b) => b.invoiceNo === so.salesNo || b.transactionNo === q.transactionNo) : null;
    const pay = bill ? $payments.find((p) => p.invoiceNo === bill.billNo || p.transactionNo === q.transactionNo) : null;
    const po = $purchaseOrders[0];
    const gr = $goodsReceipts[0];
    return {
      transactionNo: q.transactionNo,
      customerName: q.customerName,
      date: q.date,
      quotation: q,
      salesOrder: so || null,
      purchaseOrder: po || null,
      goodsReceipt: gr || null,
      delivery: doItem || null,
      bill: bill || null,
      payment: pay || null
    };
  });
  activeTrx = trackingItems[selectedTrxIndex] || trackingItems[0];
  $$unsubscribe_goodsReceipts();
  $$unsubscribe_purchaseOrders();
  $$unsubscribe_payments();
  $$unsubscribe_billPayments();
  $$unsubscribe_deliveries();
  $$unsubscribe_salesOrders();
  $$unsubscribe_quotations();
  return `<div class="space-y-6"> <div class="bg-white p-4 rounded-xl border border-gray-200 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4"><div><span class="text-xs font-semibold text-gray-500 uppercase tracking-wider" data-svelte-h="svelte-pjbwqw">Pilih Nomor Transaksi untuk Tracking:</span> <select class="mt-1 block w-full sm:w-80 px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono font-bold text-gray-900 bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(trackingItems, (item, idx) => {
    return `<option${add_attribute("value", idx, 0)}>${escape(item.transactionNo)} - ${escape(item.customerName)}</option>`;
  })}</select></div> ${activeTrx ? `<div class="text-right"><span class="text-xs text-gray-500" data-svelte-h="svelte-121s3jz">Customer:</span> <p class="font-bold text-gray-900 text-sm">${escape(activeTrx.customerName)}</p> <span class="text-[11px] text-gray-500">Tgl Awal: ${escape(formatDate(activeTrx.date))}</span></div>` : ``}</div> ${activeTrx ? ` <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><h4 class="text-sm font-bold text-gray-900 mb-6 flex items-center gap-2" data-svelte-h="svelte-suey72"><span>🚀</span> <span>Alur Siklus Hidup Transaksi (Transaction Lifecycle)</span></h4> <div class="grid grid-cols-1 md:grid-cols-7 gap-3 relative"> <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.quotation ? "bg-blue-50/70 border-blue-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1" data-svelte-h="svelte-2glxc2"><span class="text-[10px] font-bold text-blue-800 uppercase">1. Quotation</span> <span class="text-xs">✅</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.quotation.quotationNo)}</p> <p class="text-[11px] text-gray-500 font-mono mt-0.5">${escape(formatCurrency(activeTrx.quotation.total))}</p> <span class="inline-block mt-2 text-[10px] bg-blue-100 text-blue-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-1hshjl">Penawaran</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.salesOrder ? "bg-indigo-50/70 border-indigo-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-indigo-800 uppercase" data-svelte-h="svelte-r4h3om">2. Sales Order</span> <span>${escape(activeTrx.salesOrder ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.salesOrder?.salesNo || "Belum Terbit")}</p> <p class="text-[11px] text-gray-500 font-mono mt-0.5">${escape(activeTrx.salesOrder ? formatCurrency(activeTrx.salesOrder.total) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-indigo-100 text-indigo-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-v1dx66">Pesanan Deal</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.purchaseOrder ? "bg-emerald-50/70 border-emerald-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-emerald-800 uppercase" data-svelte-h="svelte-1eakxcd">3. Purchase PO</span> <span>${escape(activeTrx.purchaseOrder ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.purchaseOrder?.purchaseNo || "Belum Ada PO")}</p> <p class="text-[11px] text-gray-500 font-mono mt-0.5">${escape(activeTrx.purchaseOrder ? formatCurrency(activeTrx.purchaseOrder.total) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-emerald-100 text-emerald-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-1aadk4h">Pengadaan</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.goodsReceipt ? "bg-teal-50/70 border-teal-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-teal-800 uppercase" data-svelte-h="svelte-m8afwu">4. Goods Receipt</span> <span>${escape(activeTrx.goodsReceipt ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.goodsReceipt?.receiptNo || "Menunggu Masuk")}</p> <p class="text-[11px] text-gray-500 mt-0.5">${escape(activeTrx.goodsReceipt ? "Fisik Masuk Gudang" : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-teal-100 text-teal-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-1wxn2rs">Gudang</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.delivery ? "bg-cyan-50/70 border-cyan-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-cyan-800 uppercase" data-svelte-h="svelte-53purl">5. Delivery DO</span> <span>${escape(activeTrx.delivery ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.delivery?.deliveryNo || "Menunggu Kirim")}</p> <p class="text-[11px] text-gray-500 mt-0.5">${escape(activeTrx.delivery ? activeTrx.delivery.status : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-cyan-100 text-cyan-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-t93sw6">Logistik</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.bill ? "bg-amber-50/70 border-amber-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-amber-800 uppercase" data-svelte-h="svelte-1gjj2li">6. Invoice</span> <span>${escape(activeTrx.bill ? "✅" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.bill?.billNo || "Belum Ditagih")}</p> <p class="text-[11px] text-gray-500 font-mono mt-0.5">${escape(activeTrx.bill ? formatCurrency(activeTrx.bill.amount) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-amber-100 text-amber-800 px-1.5 py-0.5 rounded font-semibold" data-svelte-h="svelte-14g4feq">Faktur Penagihan</span></div>  <div class="${"p-3 rounded-xl border " + escape(
    activeTrx.payment ? "bg-green-50/70 border-green-300" : "bg-gray-50 border-gray-200 opacity-50",
    true
  )}"><div class="flex items-center justify-between mb-1"><span class="text-[10px] font-bold text-green-800 uppercase" data-svelte-h="svelte-c845x3">7. Pelunasan</span> <span>${escape(activeTrx.payment ? "🎉" : "⏳")}</span></div> <p class="font-mono text-xs font-bold text-gray-900 truncate">${escape(activeTrx.payment?.paymentNo || "Pending Bayar")}</p> <p class="text-[11px] text-gray-500 font-mono mt-0.5">${escape(activeTrx.payment ? formatCurrency(activeTrx.payment.amount) : "-")}</p> <span class="inline-block mt-2 text-[10px] bg-green-100 text-green-800 px-1.5 py-0.5 rounded font-semibold">${escape(activeTrx.payment ? "Lunas Kas Masuk" : "Tertunggak")}</span></div></div></div>` : ``}</div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $page, $$unsubscribe_page;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  const tabs = [
    {
      id: "aging",
      label: "Aging Schedule (Umur Piutang)",
      icon: "⏰"
    },
    {
      id: "quotation-po",
      label: "Quotation vs PO",
      icon: "📊"
    },
    {
      id: "quotation-detail",
      label: "Rincian Quotation",
      icon: "📑"
    },
    {
      id: "customer-omzet",
      label: "Omzet Customer",
      icon: "👥"
    },
    {
      id: "outstanding",
      label: "Outstanding Report",
      icon: "⚠️"
    },
    {
      id: "omzet",
      label: "Laporan Omzet Bulanan",
      icon: "📈"
    },
    {
      id: "tracking",
      label: "Transaction Tracking",
      icon: "🚀"
    },
    {
      id: "ledger",
      label: "General Ledger",
      icon: "📚"
    }
  ];
  let activeTab = $page.url.searchParams.get("tab") || "aging";
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Pusat Laporan & Analitik (Reports)",
        description: "Analisis performa penawaran, omzet penjualan, piutang macet, dan rekonsiliasi buku besar"
      },
      {},
      {}
    )} ${validate_component(Tabs, "Tabs").$$render(
      $$result,
      { tabs, activeTab },
      {
        activeTab: ($$value) => {
          activeTab = $$value;
          $$settled = false;
        }
      },
      {}
    )} <div class="pt-2">${activeTab === "aging" ? `${validate_component(AgingScheduleView, "AgingScheduleView").$$render($$result, {}, {}, {})}` : `${activeTab === "quotation-po" ? `${validate_component(QuotationVsPoView, "QuotationVsPoView").$$render($$result, {}, {}, {})}` : `${activeTab === "quotation-detail" ? `${validate_component(QuotationDetailView, "QuotationDetailView").$$render($$result, {}, {}, {})}` : `${activeTab === "customer-omzet" ? `${validate_component(CustomerOmzetView, "CustomerOmzetView").$$render($$result, {}, {}, {})}` : `${activeTab === "outstanding" ? `${validate_component(OutstandingView, "OutstandingView").$$render($$result, {}, {}, {})}` : `${activeTab === "omzet" ? `${validate_component(OmzetReportView, "OmzetReportView").$$render($$result, {}, {}, {})}` : `${activeTab === "tracking" ? `${validate_component(TransactionTrackingView, "TransactionTrackingView").$$render($$result, {}, {}, {})}` : `${activeTab === "ledger" ? `${validate_component(GeneralLedgerView, "GeneralLedgerView").$$render($$result, {}, {}, {})}` : ``}`}`}`}`}`}`}`}</div></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  return $$rendered;
});
export {
  Page as default
};
