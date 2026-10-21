import { c as create_ssr_component, v as validate_component, f as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { o as customers, q as customerActions } from "../../../chunks/dataStore.js";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
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
        title: customerToEdit ? "Edit Customer" : "New Customer",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(customerToEdit ? "Save Changes" : "Create Customer")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Company Name",
              name: "companyName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="companyName" type="text" placeholder="PT Example Success Mandiri"${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.companyName, 0)}>`;
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
              return `<input id="email" type="email" placeholder="contact@company.com"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Phone Number", name: "phone" }, {}, {
            default: () => {
              return `<input id="phone" type="tel" placeholder="021-12345678"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.phone, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "City", name: "city" }, {}, {
            default: () => {
              return `<input id="city" type="text" placeholder="Jakarta"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.city, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Term of Payment (days)",
              name: "termOfPayment"
            },
            {},
            {
              default: () => {
                return `<input id="termOfPayment" type="number" min="0" placeholder="30"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.termOfPayment, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Tax ID (NPWP)", name: "npwp" }, {}, {
            default: () => {
              return `<input id="npwp" type="text" placeholder="01.234.567.8-091.000" class="${escape(inputClass, true) + " font-mono"}"${add_attribute("value", formData.npwp, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Customer Code (NB)", name: "nb" }, {}, {
            default: () => {
              return `<input id="nb" type="text" placeholder="NB-001" class="${escape(inputClass, true) + " font-mono"}"${add_attribute("value", formData.nb, 0)}>`;
            }
          })}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Operational Address",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="2" placeholder="Full delivery and operational address..."${add_attribute("class", inputClass, 0)}>${escape(formData.address || "")}</textarea>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Tax Address (NPWP Address)",
              name: "npwpAddress"
            },
            {},
            {
              default: () => {
                return `<textarea id="npwpAddress" rows="2" placeholder="Address printed on tax invoices..."${add_attribute("class", inputClass, 0)}>${escape(formData.npwpAddress || "")}</textarea>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Additional Notes", name: "notes" }, {}, {
            default: () => {
              return `<input id="notes" type="text" placeholder="Special customer notes..."${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.notes, 0)}>`;
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
        title: "Customer Details",
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
          return `${customer ? `<div class="space-y-6 text-sm"><div class="bg-blue-50/60 dark:bg-blue-500/10 p-4 rounded-xl border border-blue-100 dark:border-blue-500/20 flex items-start justify-between gap-3"><div><h4 class="text-lg font-bold text-gray-900 dark:text-white">${escape(customer.companyName)}</h4> <p class="text-xs text-blue-700 dark:text-blue-300 font-mono mt-0.5">Code: ${escape(customer.nb || "-")}</p></div> <span class="px-2.5 py-1 bg-white dark:bg-slate-900 text-blue-700 dark:text-blue-300 border border-blue-200 dark:border-blue-500/30 rounded-lg text-xs font-bold whitespace-nowrap">TOP: ${escape(customer.termOfPayment)} days</span></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1rww9nj">Contact Person (PIC)</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(customer.contactPerson || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1x9b03w">City</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(customer.city || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-uic7ol">Email</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">${escape(customer.email || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1j4f61a">Phone Number</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(customer.phone || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3 sm:col-span-2"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-ksysj3">Tax ID (NPWP)</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1 font-mono">${escape(customer.npwp || "-")}</p></div></div> <div class="space-y-3"><div><p class="text-xs font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-1bxjbkp">Full Address</p> <p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">${escape(customer.address || "No operational address recorded")}</p></div> <div><p class="text-xs font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-iumreb">Tax Address (NPWP)</p> <p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">${escape(customer.npwpAddress || "No tax address recorded")}</p></div> ${customer.notes ? `<div><p class="text-xs font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-1y5opxh">Customer Notes</p> <p class="text-xs text-gray-600 dark:text-slate-300 italic bg-amber-50/50 dark:bg-amber-500/10 p-2.5 rounded-lg border border-amber-200 dark:border-amber-500/20 mt-1">${escape(customer.notes)}</p></div>` : ``}</div></div>` : ``}`;
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
      label: "Company Name",
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
    {
      key: "termOfPayment",
      label: "Payment Term",
      sortable: true,
      align: "center",
      format: (val) => `${val || 0} days`
    }
  ];
  function openEdit(customer) {
    customerToEdit = customer;
    isFormOpen = true;
  }
  function openDetail(customer) {
    selectedCustomer = customer;
    isDetailOpen = true;
  }
  function handleDelete(customer) {
    if (confirm(`Delete customer "${customer.companyName}"? This action cannot be undone.`)) {
      customerActions.delete(customer.id);
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
        title: "Customers",
        description: "Manage the customer directory, payment terms and tax registration details."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-h14n7">Add Customer</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $customers,
        searchPlaceholder: "Search customers by name, city, contact person or email...",
        searchKeys: ["companyName", "contactPerson", "city", "phone", "email"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View customer details",
              onEdit: () => openEdit(row),
              editTitle: "Edit customer",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete customer"
            },
            {},
            {}
          )}`;
        }
      }
    )} ${validate_component(CustomerFormModal, "CustomerFormModal").$$render(
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
