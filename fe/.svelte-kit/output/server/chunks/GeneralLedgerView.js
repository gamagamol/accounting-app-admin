import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component } from "./ssr.js";
import { B as Button, D as DataTable } from "./Button.js";
import { r as journalEntries, d as chartOfAccounts } from "./dataStore.js";
import { a as formatCurrency, f as formatDate } from "./formatters.js";
const GeneralLedgerView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let totalJournalAmount;
  let $journalEntries, $$unsubscribe_journalEntries;
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_journalEntries = subscribe(journalEntries, (value) => $journalEntries = value);
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  const columns = [
    {
      key: "date",
      label: "Tanggal Jurnal",
      sortable: true,
      format: (v) => formatDate(v)
    },
    {
      key: "reference",
      label: "No. Dokumen Ref",
      sortable: true
    },
    {
      key: "description",
      label: "Keterangan Transaksi",
      sortable: true
    },
    {
      key: "debitAccount",
      label: "Akun Debet",
      sortable: true
    },
    {
      key: "creditAccount",
      label: "Akun Kredit",
      sortable: true
    },
    {
      key: "amount",
      label: "Nominal (IDR)",
      align: "right",
      sortable: true,
      format: (v) => formatCurrency(v)
    }
  ];
  totalJournalAmount = $journalEntries.reduce((s, j) => s + j.amount, 0);
  $$unsubscribe_journalEntries();
  $$unsubscribe_chartOfAccounts();
  return `<div class="space-y-6"><div class="grid grid-cols-1 sm:grid-cols-3 gap-4"><div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-1ylxef3">Total Mutasi Jurnal Umum</span> <p class="text-xl font-bold text-gray-900 mt-1 font-mono">${escape(formatCurrency(totalJournalAmount))}</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200"><span class="text-xs font-semibold text-gray-500 uppercase" data-svelte-h="svelte-19nb6qa">Total Akun Aktif (COA)</span> <p class="text-xl font-bold text-blue-700 mt-1 font-mono">${escape($chartOfAccounts.length)} Akun</p></div> <div class="bg-white p-4 rounded-xl border border-gray-200" data-svelte-h="svelte-11bsq1l"><span class="text-xs font-semibold text-gray-500 uppercase">Keseimbangan Pembukuan</span> <p class="text-xl font-bold text-emerald-700 mt-1 flex items-center gap-2"><span>Balance (Seimbang)</span> <span class="text-sm">⚖️</span></p></div></div> <div class="flex justify-between items-center"><p class="text-xs text-gray-500" data-svelte-h="svelte-18rhh7s">Daftar ayat jurnal umum pembukuan transaksi keuangan dan operasional</p> ${validate_component(Button, "Button").$$render($$result, { variant: "secondary", size: "sm" }, {}, {
    default: () => {
      return `🖨️ Cetak Buku Jurnal Umum`;
    }
  })}</div> ${validate_component(DataTable, "DataTable").$$render(
    $$result,
    {
      columns,
      data: $journalEntries,
      searchPlaceholder: "Cari jurnal berdasarkan keterangan, akun, atau nomor referensi...",
      searchKeys: ["description", "reference", "debitAccount", "creditAccount"]
    },
    {},
    {
      cell: ({ column, value, row }) => {
        return `${column.key === "reference" ? `<span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(value)}</span>` : `${column.key === "debitAccount" ? `<span class="font-medium text-emerald-800">${escape(value)}</span>` : `${column.key === "creditAccount" ? `<span class="font-medium text-rose-800">${escape(value)}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`}`}`;
      }
    }
  )}</div>`;
});
export {
  GeneralLedgerView as G
};
