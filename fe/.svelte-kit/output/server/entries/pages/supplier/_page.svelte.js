import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { o as suppliers } from "../../../chunks/dataStore.js";
const SupplierFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { supplierToEdit = null } = $$props;
  let formData = {
    companyName: "",
    contactPerson: "",
    email: "",
    phone: "",
    address: "",
    city: "",
    npwp: ""
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.supplierToEdit === void 0 && $$bindings.supplierToEdit && supplierToEdit !== void 0) $$bindings.supplierToEdit(supplierToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (supplierToEdit) {
          formData = {
            companyName: supplierToEdit.companyName,
            contactPerson: supplierToEdit.contactPerson,
            email: supplierToEdit.email,
            phone: supplierToEdit.phone,
            address: supplierToEdit.address,
            city: supplierToEdit.city,
            npwp: supplierToEdit.npwp
          };
        } else {
          formData = {
            companyName: "",
            contactPerson: "",
            email: "",
            phone: "",
            address: "",
            city: "",
            npwp: ""
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: supplierToEdit ? "Edit Data Supplier" : "Tambah Supplier Baru",
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
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(supplierToEdit ? "Simpan Perubahan" : "Tambahkan Supplier")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Perusahaan Supplier",
              name: "companyName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="companyName" type="text" placeholder="PT Supplier Utama Teknik" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.companyName, 0)}>`;
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
              return `<input id="email" type="email" placeholder="sales@supplier.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Nomor Telepon", name: "phone" }, {}, {
            default: () => {
              return `<input id="phone" type="tel" placeholder="021-98765432" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.phone, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Kota", name: "city" }, {}, {
            default: () => {
              return `<input id="city" type="text" placeholder="Bekasi" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.city, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "NPWP", name: "npwp" }, {}, {
            default: () => {
              return `<input id="npwp" type="text" placeholder="01.999.888.7-011.000" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.npwp, 0)}>`;
            }
          })}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Alamat Kantor / Gudang",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="3" placeholder="Alamat lengkap supplier..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.address || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const SupplierList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $suppliers, $$unsubscribe_suppliers;
  $$unsubscribe_suppliers = subscribe(suppliers, (value) => $suppliers = value);
  let isFormOpen = false;
  let supplierToEdit = null;
  const columns = [
    {
      key: "companyName",
      label: "Nama Supplier",
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
    { key: "email", label: "Email" },
    { key: "address", label: "Alamat" }
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
        title: "Master Data Supplier",
        description: "Direktori vendor dan pemasok barang, bahan baku, dan perlengkapan industri"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1c8r397">Tambah Supplier</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $suppliers,
        searchPlaceholder: "Cari supplier berdasarkan nama, PIC, atau kota...",
        searchKeys: ["companyName", "contactPerson", "city", "phone", "email"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div>`;
        }
      }
    )} ${validate_component(SupplierFormModal, "SupplierFormModal").$$render(
      $$result,
      { supplierToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_suppliers();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(SupplierList, "SupplierList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
