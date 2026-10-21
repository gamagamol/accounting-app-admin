import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { n as products } from "../../../chunks/dataStore.js";
import { a as formatCurrency, b as formatNumber } from "../../../chunks/formatters.js";
const ProductFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { productToEdit = null } = $$props;
  let formData = {
    name: "",
    price: 0,
    stock: 0,
    description: ""
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.productToEdit === void 0 && $$bindings.productToEdit && productToEdit !== void 0) $$bindings.productToEdit(productToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (productToEdit) {
          formData = {
            name: productToEdit.name,
            category: productToEdit.category,
            unit: productToEdit.unit,
            price: productToEdit.price,
            stock: productToEdit.stock,
            description: productToEdit.description
          };
        } else {
          formData = {
            name: "",
            category: "Material",
            unit: "Pcs",
            price: 0,
            stock: 0,
            description: ""
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: productToEdit ? "Edit Produk" : "Tambah Produk Baru",
        size: "lg",
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
              return `${escape(productToEdit ? "Simpan Perubahan" : "Tambahkan Produk")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Produk / Item",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="Contoh: Steel Plate 10mm x 4 x 8" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} <div class="grid grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render($$result, { label: "Kategori", name: "category" }, {}, {
            default: () => {
              return `<select id="category" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="Material" data-svelte-h="svelte-160as86">Material</option><option value="Hardware" data-svelte-h="svelte-1kfgpti">Hardware</option><option value="Electronic" data-svelte-h="svelte-1k772zy">Electronic</option><option value="Tools" data-svelte-h="svelte-4rmb50">Tools</option><option value="Consumable" data-svelte-h="svelte-1pcx7p2">Consumable</option></select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Satuan (Unit)", name: "unit" }, {}, {
            default: () => {
              return `<select id="unit" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="Pcs" data-svelte-h="svelte-1k3zp2e">Pcs</option><option value="Kg" data-svelte-h="svelte-q9tmtm">Kg</option><option value="Batang" data-svelte-h="svelte-1836oki">Batang</option><option value="Lembar" data-svelte-h="svelte-f5rbvu">Lembar</option><option value="Roll" data-svelte-h="svelte-60njpq">Roll</option><option value="Box" data-svelte-h="svelte-13r506c">Box</option><option value="Unit" data-svelte-h="svelte-1nh4n2e">Unit</option></select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Harga Satuan (IDR)",
              name: "price",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="price" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.price, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Jumlah Stok",
              name: "stock",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="stock" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.stock, 0)}>`;
              }
            }
          )}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Deskripsi / Spesifikasi",
              name: "description"
            },
            {},
            {
              default: () => {
                return `<textarea id="description" rows="3" placeholder="Spesifikasi teknis produk atau keterangan tambahan..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.description || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const ProductList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $products, $$unsubscribe_products;
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  let isFormOpen = false;
  let productToEdit = null;
  const columns = [
    {
      key: "name",
      label: "Nama Produk",
      sortable: true
    },
    {
      key: "category",
      label: "Kategori",
      sortable: true
    },
    {
      key: "unit",
      label: "Satuan",
      align: "center"
    },
    {
      key: "price",
      label: "Harga Satuan",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(v || 0)
    },
    {
      key: "stock",
      label: "Stok",
      sortable: true,
      align: "center",
      format: (v, r) => `${formatNumber(v || 0)} ${r.unit || ""}`
    },
    { key: "description", label: "Keterangan" }
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
        title: "Master Data Produk & Jasa",
        description: "Katalog inventaris barang, spesifikasi teknis, harga jual, dan sisa stok fisik"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-dd5320">Tambah Produk</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $products,
        searchPlaceholder: "Cari produk berdasarkan nama atau kategori...",
        searchKeys: ["name", "category", "description"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div>`;
        }
      }
    )} ${validate_component(ProductFormModal, "ProductFormModal").$$render(
      $$result,
      { productToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_products();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(ProductList, "ProductList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
