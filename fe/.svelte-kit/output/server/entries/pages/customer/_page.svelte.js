import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { e as customers } from "../../../chunks/dataStore.js";
const CustomerFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { customerToEdit = null } = $$props;
  let formData = {
    companyName: "",
    city: "",
    contactPerson: "",
    email: "",
    phone: "",
    nb: "",
    npwp: "",
    npwpAddress: "",
    address: "",
    termOfPayment: 30,
    notes: ""
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.customerToEdit === void 0 && $$bindings.customerToEdit && customerToEdit !== void 0) $$bindings.customerToEdit(customerToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (customerToEdit) {
          formData = {
            companyName: customerToEdit.companyName,
            city: customerToEdit.city,
            contactPerson: customerToEdit.contactPerson,
            email: customerToEdit.email,
            phone: customerToEdit.phone,
            nb: customerToEdit.nb,
            npwp: customerToEdit.npwp,
            npwpAddress: customerToEdit.npwpAddress,
            address: customerToEdit.address,
            termOfPayment: customerToEdit.termOfPayment,
            notes: customerToEdit.notes
          };
        } else {
          formData = {
            companyName: "",
            city: "",
            contactPerson: "",
            email: "",
            phone: "",
            nb: "NB-" + Math.floor(Math.random() * 900 + 100),
            npwp: "",
            npwpAddress: "",
            address: "",
            termOfPayment: 30,
            notes: ""
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: customerToEdit ? "Edit Data Customer" : "Tambah Customer Baru",
        size: "2xl",
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
              return `${escape(customerToEdit ? "Simpan Perubahan" : "Tambahkan Customer")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Perusahaan",
              name: "companyName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="companyName" type="text" placeholder="PT Contoh Sukses Mandiri" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.companyName, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Contact Person (PIC)",
              name: "contactPerson",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="contactPerson" type="text" placeholder="Nama PIC" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.contactPerson, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Email", name: "email" }, {}, {
            default: () => {
              return `<input id="email" type="email" placeholder="kontak@perusahaan.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Nomor Telepon", name: "phone" }, {}, {
            default: () => {
              return `<input id="phone" type="tel" placeholder="021-12345678" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.phone, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Kota", name: "city" }, {}, {
            default: () => {
              return `<input id="city" type="text" placeholder="Jakarta" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.city, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Term of Payment (Hari)",
              name: "termOfPayment"
            },
            {},
            {
              default: () => {
                return `<input id="termOfPayment" type="number" min="0" placeholder="30" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.termOfPayment, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "NPWP", name: "npwp" }, {}, {
            default: () => {
              return `<input id="npwp" type="text" placeholder="01.234.567.8-091.000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.npwp, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Kode NB", name: "nb" }, {}, {
            default: () => {
              return `<input id="nb" type="text" placeholder="NB-001" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.nb, 0)}>`;
            }
          })}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Alamat Operasional",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="2" placeholder="Alamat lengkap pengiriman dan operasional..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.address || "")}</textarea>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Alamat NPWP",
              name: "npwpAddress"
            },
            {},
            {
              default: () => {
                return `<textarea id="npwpAddress" rows="2" placeholder="Alamat yang tertera pada faktur pajak..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.npwpAddress || "")}</textarea>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Catatan Tambahan", name: "notes" }, {}, {
            default: () => {
              return `<input id="notes" type="text" placeholder="Catatan khusus pelanggan..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.notes, 0)}>`;
            }
          })}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const CustomerDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { customer = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.customer === void 0 && $$bindings.customer && customer !== void 0) $$bindings.customer(customer);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Detail Customer",
        size: "xl",
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
              return `Tutup`;
            }
          })} `;
        },
        default: () => {
          return `${customer ? `<div class="space-y-6 text-sm"><div class="bg-blue-50/60 p-4 rounded-xl border border-blue-100 flex items-start justify-between"><div><h4 class="text-lg font-bold text-gray-900">${escape(customer.companyName)}</h4> <p class="text-xs text-blue-700 font-mono mt-0.5">Kode: ${escape(customer.nb || "-")}</p></div> <span class="px-2.5 py-1 bg-white text-blue-700 border border-blue-200 rounded-lg text-xs font-bold">TOP: ${escape(customer.termOfPayment)} Hari</span></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="border rounded-lg p-3"><p class="text-xs text-gray-500" data-svelte-h="svelte-1pzdd2f">Contact Person (PIC)</p> <p class="font-medium text-gray-800 mt-1">${escape(customer.contactPerson || "-")}</p></div> <div class="border rounded-lg p-3"><p class="text-xs text-gray-500" data-svelte-h="svelte-6zojdu">Kota</p> <p class="font-medium text-gray-800 mt-1">${escape(customer.city || "-")}</p></div> <div class="border rounded-lg p-3"><p class="text-xs text-gray-500" data-svelte-h="svelte-1fzjr2t">Email</p> <p class="font-medium text-gray-800 mt-1">${escape(customer.email || "-")}</p></div> <div class="border rounded-lg p-3"><p class="text-xs text-gray-500" data-svelte-h="svelte-5mttu7">Nomor Telepon</p> <p class="font-medium text-gray-800 mt-1">${escape(customer.phone || "-")}</p></div> <div class="border rounded-lg p-3 sm:col-span-2"><p class="text-xs text-gray-500" data-svelte-h="svelte-1rf2hl2">NPWP</p> <p class="font-medium text-gray-800 mt-1 font-mono">${escape(customer.npwp || "-")}</p></div></div> <div class="space-y-3"><div><p class="text-xs font-semibold text-gray-700" data-svelte-h="svelte-udsoji">Alamat Lengkap</p> <p class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1">${escape(customer.address || "Tidak ada data alamat operasional")}</p></div> <div><p class="text-xs font-semibold text-gray-700" data-svelte-h="svelte-1kirjf7">Alamat NPWP</p> <p class="text-xs text-gray-600 bg-gray-50 p-2.5 rounded-lg border border-gray-200 mt-1">${escape(customer.npwpAddress || "Tidak ada data alamat NPWP")}</p></div> ${customer.notes ? `<div><p class="text-xs font-semibold text-gray-700" data-svelte-h="svelte-vx31l5">Catatan Pelanggan</p> <p class="text-xs text-gray-600 italic bg-amber-50/50 p-2.5 rounded-lg border border-amber-200 mt-1">${escape(customer.notes)}</p></div>` : ``}</div></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const CustomerList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $customers, $$unsubscribe_customers;
  $$unsubscribe_customers = subscribe(customers, (value) => $customers = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedCustomer = null;
  let customerToEdit = null;
  const columns = [
    {
      key: "companyName",
      label: "Nama Perusahaan",
      sortable: true
    },
    {
      key: "contactPerson",
      label: "PIC / Kontak",
      sortable: true
    },
    {
      key: "city",
      label: "Kota",
      sortable: true
    },
    { key: "phone", label: "Telepon" },
    {
      key: "termOfPayment",
      label: "TOP (Hari)",
      sortable: true,
      align: "center",
      format: (val) => `${val || 0} Hari`
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
        title: "Master Data Customer",
        description: "Kelola direktori pelanggan, ketentuan pembayaran (TOP), dan data perpajakan"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-ig14c3">Tambah Customer</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $customers,
        searchPlaceholder: "Cari customer berdasarkan nama, kota, atau PIC...",
        searchKeys: ["companyName", "contactPerson", "city", "phone", "email"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-blue-600 hover:bg-blue-50 rounded-lg text-xs font-semibold" title="Lihat Detail" data-svelte-h="svelte-cga0iu">Detail</button> <button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div>`;
        }
      }
    )}  ${validate_component(CustomerFormModal, "CustomerFormModal").$$render(
      $$result,
      { customerToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )} ${validate_component(CustomerDetailModal, "CustomerDetailModal").$$render(
      $$result,
      {
        customer: selectedCustomer,
        isOpen: isDetailOpen
      },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_customers();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(CustomerList, "CustomerList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
