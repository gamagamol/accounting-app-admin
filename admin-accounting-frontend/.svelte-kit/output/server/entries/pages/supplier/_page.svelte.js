import { c as create_ssr_component, v as validate_component, f as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { H as suppliers, a8 as supplierActions } from "../../../chunks/dataStore.js";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
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
        title: supplierToEdit ? "Edit Supplier" : "New Supplier",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(supplierToEdit ? "Save Changes" : "Create Supplier")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Supplier Company Name",
              name: "companyName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="companyName" type="text" placeholder="PT Main Supplier Teknik"${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.companyName, 0)}>`;
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
                return `<input id="contactPerson" type="text" placeholder="Contact person name"${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.contactPerson, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Email", name: "email" }, {}, {
            default: () => {
              return `<input id="email" type="email" placeholder="sales@supplier.com"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Phone Number", name: "phone" }, {}, {
            default: () => {
              return `<input id="phone" type="tel" placeholder="021-98765432"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.phone, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "City", name: "city" }, {}, {
            default: () => {
              return `<input id="city" type="text" placeholder="Bekasi"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.city, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Tax ID (NPWP)", name: "npwp" }, {}, {
            default: () => {
              return `<input id="npwp" type="text" placeholder="01.999.888.7-011.000" class="${escape(inputClass, true) + " font-mono"}"${add_attribute("value", formData.npwp, 0)}>`;
            }
          })}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Office / Warehouse Address",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="3" placeholder="Full supplier address..."${add_attribute("class", inputClass, 0)}>${escape(formData.address || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const SupplierDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { supplier = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.supplier === void 0 && $$bindings.supplier && supplier !== void 0) $$bindings.supplier(supplier);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Supplier Details",
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
              return `Close`;
            }
          })} `;
        },
        default: () => {
          return `${supplier ? `<div class="space-y-6 text-sm"><div class="bg-emerald-50/60 dark:bg-emerald-500/10 p-4 rounded-xl border border-emerald-100 dark:border-emerald-500/20"><h4 class="text-lg font-bold text-gray-900 dark:text-white">${escape(supplier.companyName)}</h4> <p class="text-xs text-emerald-700 dark:text-emerald-300 mt-0.5">${escape(supplier.city || "No city recorded")}</p></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1rww9nj">Contact Person (PIC)</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(supplier.contactPerson || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1j4f61a">Phone Number</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(supplier.phone || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-uic7ol">Email</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">${escape(supplier.email || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-ksysj3">Tax ID (NPWP)</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1 font-mono">${escape(supplier.npwp || "-")}</p></div></div> <div><p class="text-xs font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-yy7bxg">Office / Warehouse Address</p> <p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">${escape(supplier.address || "No address recorded")}</p></div></div>` : ``}`;
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
  let isDetailOpen = false;
  let selectedSupplier = null;
  let supplierToEdit = null;
  const columns = [
    {
      key: "companyName",
      label: "Vendor Name",
      sortable: true
    },
    {
      key: "contactPerson",
      label: "Contact Person",
      sortable: true
    },
    {
      key: "city",
      label: "City",
      sortable: true
    },
    { key: "phone", label: "Phone" },
    { key: "email", label: "Email" }
  ];
  function openEdit(supplier) {
    supplierToEdit = supplier;
    isFormOpen = true;
  }
  function openDetail(supplier) {
    selectedSupplier = supplier;
    isDetailOpen = true;
  }
  function handleDelete(supplier) {
    if (confirm(`Delete vendor "${supplier.companyName}"? This action cannot be undone.`)) {
      supplierActions.delete(supplier.id);
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Suppliers",
        description: "Directory of vendors supplying goods, raw materials and industrial equipment."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-95nz6j">Add Supplier</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $suppliers,
        searchPlaceholder: "Search suppliers by name, contact person or city...",
        searchKeys: ["companyName", "contactPerson", "city", "phone", "email"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View vendor details",
              onEdit: () => openEdit(row),
              editTitle: "Edit vendor",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete vendor"
            },
            {},
            {}
          )}`;
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
    )} ${validate_component(SupplierDetailModal, "SupplierDetailModal").$$render(
      $$result,
      {
        supplier: selectedSupplier,
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
  $$unsubscribe_suppliers();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(SupplierList, "SupplierList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
