import { c as create_ssr_component, v as validate_component, f as add_attribute, e as escape, s as subscribe } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { E as employees, F as employeeActions } from "../../../chunks/dataStore.js";
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
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
            position: "Administration Staff",
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
        title: employeeToEdit ? "Edit Employee" : "New Employee",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(employeeToEdit ? "Save Changes" : "Create Employee")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Employee Full Name",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="Employee name"${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Position / Job Title",
              name: "position",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="position" type="text" placeholder="Finance Staff, Manager, etc."${add_attribute("class", inputClass, 0)} required${add_attribute("value", formData.position, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Email", name: "email" }, {}, {
            default: () => {
              return `<input id="email" type="email" placeholder="employee@company.com"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.email, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Phone / WhatsApp", name: "phone" }, {}, {
            default: () => {
              return `<input id="phone" type="tel" placeholder="0812-3456-7890"${add_attribute("class", inputClass, 0)}${add_attribute("value", formData.phone, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Employment Status",
              name: "status"
            },
            {},
            {
              default: () => {
                return `<select id="status"${add_attribute("class", inputClass, 0)}><option value="active" data-svelte-h="svelte-1mh57he">Active</option><option value="inactive" data-svelte-h="svelte-1b699cm">Inactive / Resigned</option></select>`;
              }
            }
          )}</div> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Residential Address",
              name: "address"
            },
            {},
            {
              default: () => {
                return `<textarea id="address" rows="2" placeholder="Employee residential address..."${add_attribute("class", inputClass, 0)}>${escape(formData.address || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const EmployeeDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { employee = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.employee === void 0 && $$bindings.employee && employee !== void 0) $$bindings.employee(employee);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Employee Details",
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
              return `Close`;
            }
          })} `;
        },
        default: () => {
          return `${employee ? `<div class="space-y-5 text-sm"><div class="bg-slate-50 dark:bg-slate-800/60 p-4 rounded-xl border border-gray-200 dark:border-slate-800 flex items-start justify-between gap-3"><div><h4 class="text-lg font-bold text-gray-900 dark:text-white">${escape(employee.name)}</h4> <p class="text-xs text-gray-500 dark:text-slate-400 mt-0.5">${escape(employee.position)}</p></div> ${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: employee.status,
              label: employee.status === "active" ? "Active" : "Inactive"
            },
            {},
            {}
          )}</div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4"><div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-uic7ol">Email</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1 break-all">${escape(employee.email || "-")}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-xs text-gray-500 dark:text-slate-400" data-svelte-h="svelte-skx2wu">Phone / WhatsApp</p> <p class="font-medium text-gray-800 dark:text-slate-100 mt-1">${escape(employee.phone || "-")}</p></div></div> <div><p class="text-xs font-semibold text-gray-700 dark:text-slate-200" data-svelte-h="svelte-168lkpk">Residential Address</p> <p class="text-xs text-gray-600 dark:text-slate-300 bg-gray-50 dark:bg-slate-800/60 p-2.5 rounded-lg border border-gray-200 dark:border-slate-800 mt-1">${escape(employee.address || "No address recorded")}</p></div></div>` : ``}`;
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
  let isDetailOpen = false;
  let selectedEmployee = null;
  let employeeToEdit = null;
  const columns = [
    {
      key: "name",
      label: "Employee Name",
      sortable: true
    },
    {
      key: "position",
      label: "Position / Division",
      sortable: true
    },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    {
      key: "status",
      label: "Status",
      align: "center",
      sortable: true
    }
  ];
  function openEdit(emp) {
    employeeToEdit = emp;
    isFormOpen = true;
  }
  function openDetail(emp) {
    selectedEmployee = emp;
    isDetailOpen = true;
  }
  function handleDelete(emp) {
    if (confirm(`Delete employee "${emp.name}"? This action cannot be undone.`)) {
      employeeActions.delete(emp.id);
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
        title: "Employees",
        description: "Internal employee records, job positions and employment status."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-b8j3xz">Add Employee</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $employees,
        searchPlaceholder: "Search employees by name, position or email...",
        searchKeys: ["name", "position", "email", "phone"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View employee details",
              onEdit: () => openEdit(row),
              editTitle: "Edit employee",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete employee"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value }) => {
          return `${column.key === "status" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "active" ? "Active" : "Inactive"
            },
            {},
            {}
          )}` : `${escape(value ?? "-")}`}`;
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
    )} ${validate_component(EmployeeDetailModal, "EmployeeDetailModal").$$render(
      $$result,
      {
        employee: selectedEmployee,
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
  $$unsubscribe_employees();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(EmployeeList, "EmployeeList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
