import { c as create_ssr_component, v as validate_component, d as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { M as Modal, F as FormField } from "../../../chunks/FormField.js";
import { m as employees } from "../../../chunks/dataStore.js";
const EmployeeFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { employeeToEdit = null } = $$props;
  let formData = {
    name: "",
    position: "Staff",
    email: "",
    phone: "",
    address: ""
  };
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.employeeToEdit === void 0 && $$bindings.employeeToEdit && employeeToEdit !== void 0) $$bindings.employeeToEdit(employeeToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (employeeToEdit) {
          formData = {
            name: employeeToEdit.name,
            position: employeeToEdit.position,
            email: employeeToEdit.email,
            phone: employeeToEdit.phone,
            address: employeeToEdit.address,
            status: employeeToEdit.status
          };
        } else {
          formData = {
            name: "",
            position: "Staff Administrasi",
            email: "",
            phone: "",
            address: "",
            status: "active"
          };
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: employeeToEdit ? "Edit Data Pegawai" : "Tambah Pegawai Baru",
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
              return `${escape(employeeToEdit ? "Simpan Pegawai" : "Tambahkan Pegawai")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Lengkap Pegawai",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="Nama Pegawai" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Jabatan / Posisi",
              name: "position",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="position" type="text" placeholder="Staff Finance, Manager, dll" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.position, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Email", name: "email" }, {}, {
            default: () => {
              return `<input id="email" type="email" placeholder="pegawai@perusahaan.com" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nomor Telepon / WhatsApp",
              name: "phone"
            },
            {},
            {
              default: () => {
                return `<input id="phone" type="tel" placeholder="0812-3456-7890" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.phone, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Status Kepegawaian",
              name: "status"
            },
            {},
            {
              default: () => {
                return `<select id="status" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="active" data-svelte-h="svelte-chnlmd">Aktif</option><option value="inactive" data-svelte-h="svelte-yer60m">Non-Aktif / Resigned</option></select>`;
              }
            }
          )}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Alamat Domisili",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="2" placeholder="Alamat tempat tinggal pegawai..." class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.address || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const EmployeeList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $employees, $$unsubscribe_employees;
  $$unsubscribe_employees = subscribe(employees, (value) => $employees = value);
  let isFormOpen = false;
  let employeeToEdit = null;
  const columns = [
    {
      key: "name",
      label: "Nama Pegawai",
      sortable: true
    },
    {
      key: "position",
      label: "Jabatan / Divisi",
      sortable: true
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Telepon" },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
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
        title: "Master Data Pegawai & Karyawan",
        description: "Data kepegawaian internal perusahaan, posisi jabatan, dan status operasional"
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1pcb53h">Tambah Pegawai</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $employees,
        searchPlaceholder: "Cari pegawai berdasarkan nama atau jabatan...",
        searchKeys: ["name", "position", "email", "phone"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> <button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-h5yy0">Hapus</button></div> `;
        },
        cell: ({ column, value }) => {
          return `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "active" ? "Aktif" : "Non-Aktif"
            },
            {},
            {}
          )}` : `${escape(value)}`}`;
        }
      }
    )} ${validate_component(EmployeeFormModal, "EmployeeFormModal").$$render(
      $$result,
      { employeeToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_employees();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(EmployeeList, "EmployeeList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
