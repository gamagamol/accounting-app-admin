import { c as create_ssr_component, s as subscribe, v as validate_component } from "../../../chunks/ssr.js";
import { E as EntityManager } from "../../../chunks/EntityManager.js";
import { g as departments, D as departmentActions } from "../../../chunks/dataStore.js";
import { c as apiRequest } from "../../../chunks/client.js";
const BASE = "/api";
const masterEndpoints = {
  departments: `${BASE}/master/departments`,
  department: (id) => `${BASE}/master/departments/${id}`,
  inventoryValuation: `${BASE}/inventory/valuation`,
  inventoryAdjustment: `${BASE}/inventory/adjustments`
};
const departmentsApi = {
  list() {
    return apiRequest(masterEndpoints.departments);
  },
  create(payload) {
    return apiRequest(masterEndpoints.departments, {
      method: "POST",
      body: payload
    });
  },
  update(id, payload) {
    return apiRequest(masterEndpoints.department(id), {
      method: "PUT",
      body: payload
    });
  },
  delete(id) {
    return apiRequest(masterEndpoints.department(id), { method: "DELETE" });
  }
};
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $departments, $$unsubscribe_departments;
  $$unsubscribe_departments = subscribe(departments, (value) => $departments = value);
  const columns = [
    {
      key: "code",
      label: "Dept Code",
      sortable: true
    },
    {
      key: "name",
      label: "Department Name",
      sortable: true
    },
    {
      key: "manager",
      label: "Manager",
      sortable: true
    },
    { key: "costCenter", label: "Cost Center" },
    {
      key: "status",
      label: "Status",
      align: "center"
    }
  ];
  const fields = [
    {
      key: "code",
      label: "Department Code",
      type: "text",
      required: true,
      placeholder: "OPS"
    },
    {
      key: "name",
      label: "Department Name",
      type: "text",
      required: true,
      placeholder: "Operations & Production"
    },
    {
      key: "manager",
      label: "Department Manager",
      type: "text"
    },
    {
      key: "costCenter",
      label: "Cost Center",
      type: "text",
      placeholder: "CC-OPS-01"
    },
    {
      key: "status",
      label: "Status",
      type: "select",
      badge: true,
      badgeLabels: { active: "Active", inactive: "Inactive" },
      options: [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" }
      ]
    }
  ];
  async function handleSave(payload, id) {
    try {
      if (id) {
        await departmentsApi.update(id, payload);
        departmentActions.update(id, payload);
      } else {
        await departmentsApi.create(payload);
        departmentActions.add(payload);
      }
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to save department.");
    }
  }
  async function handleDelete(id) {
    try {
      await departmentsApi.delete(id);
      departmentActions.delete(id);
    } catch (error) {
      alert(error instanceof Error ? error.message : "Failed to delete department.");
    }
  }
  $$unsubscribe_departments();
  return `${validate_component(EntityManager, "EntityManager").$$render(
    $$result,
    {
      title: "Departments & Cost Centers",
      description: "Master data for budget ownership, budget allocation and expense accountability.",
      entityName: "department",
      columns,
      fields,
      data: $departments,
      searchKeys: ["code", "name", "manager", "costCenter"],
      searchPlaceholder: "Search departments...",
      createLabel: "Add Department",
      displayKey: "name",
      onSave: handleSave,
      onDelete: handleDelete
    },
    {},
    {}
  )}`;
});
export {
  Page as default
};
