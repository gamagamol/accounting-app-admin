import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { d as chartOfAccounts } from "../../../chunks/dataStore.js";
import { a as formatCurrency } from "../../../chunks/formatters.js";
const CoaFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { coaToEdit = null } = $$props;
  let formData = {
    code: "",
    name: "",
    balance: 0
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.coaToEdit === void 0 && $$bindings.coaToEdit && coaToEdit !== void 0) $$bindings.coaToEdit(coaToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (coaToEdit) {
          formData = {
            code: coaToEdit.code,
            name: coaToEdit.name,
            category: coaToEdit.category,
            balance: coaToEdit.balance
          };
        } else {
          formData = {
            code: "",
            name: "",
            category: "Asset",
            balance: 0
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: coaToEdit ? "Edit Bagan Akun (COA)" : "Tambah Bagan Akun Baru",
        size: "md",
        isOpen
      },
      {
        isOpen: ($$value) => {
          isOpen = $$value;
          $$settled = false;
        }
      },
      {
        footer: () => {
          return `${validate_component(Button, "Button").$$render($$result, { variant: "secondary" }, {}, {
            default: () => {
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(coaToEdit ? "Simpan Akun" : "Tambahkan Akun")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Kode Akun (Account Code)",
              name: "code",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="code" type="text" placeholder="Contoh: 1-1000 atau 4-1000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.code, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Akun",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="Contoh: Kas Kecil, Piutang Usaha" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Kategori Akun", name: "category" }, {}, {
            default: () => {
              return `<select id="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="Asset" data-svelte-h="svelte-1dh75mj">Asset (Aset / Harta)</option><option value="Liability" data-svelte-h="svelte-s6lcar">Liability (Kewajiban / Hutang)</option><option value="Equity" data-svelte-h="svelte-1k3f319">Equity (Modal / Ekuitas)</option><option value="Revenue" data-svelte-h="svelte-8h1ld9">Revenue (Pendapatan)</option><option value="Expense" data-svelte-h="svelte-spvjp4">Expense (Beban Pokok &amp; Operasional)</option></select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Saldo Awal / Berjalan (IDR)",
              name: "balance"
            },
            {},
            {
              default: () => {
                return `<input id="balance" type="number" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.balance, 0)}>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
function getCategoryColor(cat) {
  switch (cat) {
    case "Asset":
      return "bg-emerald-50 text-emerald-700 border-emerald-200";
    case "Liability":
      return "bg-rose-50 text-rose-700 border-rose-200";
    case "Equity":
      return "bg-purple-50 text-purple-700 border-purple-200";
    case "Revenue":
      return "bg-blue-50 text-blue-700 border-blue-200";
    case "Expense":
      return "bg-amber-50 text-amber-700 border-amber-200";
    default:
      return "bg-gray-50 text-gray-700 border-gray-200";
  }
}
const CoaList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $chartOfAccounts, $$unsubscribe_chartOfAccounts;
  $$unsubscribe_chartOfAccounts = subscribe(chartOfAccounts, (value) => $chartOfAccounts = value);
  let isFormOpen = false;
  let coaToEdit = null;
  const columns = [
    {
      key: "code",
      label: "Kode Akun",
      sortable: true
    },
    {
      key: "name",
      label: "Nama Akun",
      sortable: true
    },
    {
      key: "category",
      label: "Kategori",
      sortable: true
    },
    {
      key: "balance",
      label: "Saldo (IDR)",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(v || 0)
    }
  ];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Bagan Akun (Chart of Account - COA)",
        description: "Struktur rekening pembukuan akuntansi: Aktiva, Kewajiban, Ekuitas, Pendapatan, dan Beban"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1ju4hsy">Tambah Akun</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $chartOfAccounts,
        searchPlaceholder: "Cari berdasarkan kode akun atau nama akun...",
        searchKeys: ["code", "name", "category"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "code" ? `<span class="font-mono font-bold text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">${escape(value)}</span>` : `${column.key === "category" ? `<span class="${"px-2 py-0.5 rounded-full text-xs font-semibold border " + escape(getCategoryColor(value), true)}">${escape(value)}</span>` : `${column.key === "balance" ? `<span class="font-mono font-semibold text-gray-900">${escape(formatCurrency(value))}</span>` : `${escape(value)}`}`}`}`;
        }
      }
    )} ${validate_component(CoaFormModal, "CoaFormModal").$$render(
      $$result,
      { coaToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_chartOfAccounts();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(CoaList, "CoaList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
