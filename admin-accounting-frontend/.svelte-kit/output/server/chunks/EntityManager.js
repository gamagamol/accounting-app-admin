import { c as create_ssr_component, v as validate_component, e as escape, g as each, f as add_attribute } from "./ssr.js";
import { D as DataTable, a as DataTableCell } from "./DataTable.js";
import { R as RowActions, M as Modal } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { F as FormField } from "./FormField.js";
import { P as PageHeader, f as formatCurrency, a as formatDate } from "./formatters.js";
const EntityManager = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let fieldMap;
  let { title } = $$props;
  let { description = "" } = $$props;
  let { entityName = "record" } = $$props;
  let { columns = [] } = $$props;
  let { data = [] } = $$props;
  let { fields = [] } = $$props;
  let { searchKeys = [] } = $$props;
  let { searchPlaceholder = "Search records..." } = $$props;
  let { createLabel = "Add New" } = $$props;
  let { canCreate = true } = $$props;
  let { canEdit = true } = $$props;
  let { canDelete = true } = $$props;
  let { canView = true } = $$props;
  let { formSize = "2xl" } = $$props;
  let { displayKey = "" } = $$props;
  let { onSave = () => {
  } } = $$props;
  let { onDelete = () => {
  } } = $$props;
  let isFormOpen = false;
  let isDetailOpen = false;
  let editingRow = null;
  let detailRow = null;
  let formData = {};
  function blankForm() {
    const result = {};
    for (const field of fields) {
      if (field.defaultValue !== void 0) {
        result[field.key] = field.defaultValue;
      } else if (field.type === "number" || field.type === "currency") {
        result[field.key] = 0;
      } else if (field.type === "select") {
        result[field.key] = field.options?.[0]?.value ?? "";
      } else {
        result[field.key] = "";
      }
    }
    return result;
  }
  function openEdit(row) {
    editingRow = row;
    const next = {};
    for (const field of fields) {
      next[field.key] = row[field.key] ?? blankForm()[field.key];
    }
    formData = next;
    isFormOpen = true;
  }
  function openDetail(row) {
    detailRow = row;
    isDetailOpen = true;
  }
  function handleDelete(row) {
    const label = row[displayKey] ?? row.id;
    if (confirm(`Delete ${entityName} "${label}"? This action cannot be undone.`)) {
      onDelete(row.id);
    }
  }
  function displayValue(row, field) {
    const value = row[field.key];
    if (field.type === "currency") return formatCurrency(Number(value) || 0);
    if (field.type === "date") return value ? formatDate(String(value)) : "-";
    if (field.type === "select") {
      return field.options?.find((option) => option.value === value)?.label ?? value ?? "-";
    }
    return value === "" || value === null || value === void 0 ? "-" : value;
  }
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.description === void 0 && $$bindings.description && description !== void 0) $$bindings.description(description);
  if ($$props.entityName === void 0 && $$bindings.entityName && entityName !== void 0) $$bindings.entityName(entityName);
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0) $$bindings.columns(columns);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.fields === void 0 && $$bindings.fields && fields !== void 0) $$bindings.fields(fields);
  if ($$props.searchKeys === void 0 && $$bindings.searchKeys && searchKeys !== void 0) $$bindings.searchKeys(searchKeys);
  if ($$props.searchPlaceholder === void 0 && $$bindings.searchPlaceholder && searchPlaceholder !== void 0) $$bindings.searchPlaceholder(searchPlaceholder);
  if ($$props.createLabel === void 0 && $$bindings.createLabel && createLabel !== void 0) $$bindings.createLabel(createLabel);
  if ($$props.canCreate === void 0 && $$bindings.canCreate && canCreate !== void 0) $$bindings.canCreate(canCreate);
  if ($$props.canEdit === void 0 && $$bindings.canEdit && canEdit !== void 0) $$bindings.canEdit(canEdit);
  if ($$props.canDelete === void 0 && $$bindings.canDelete && canDelete !== void 0) $$bindings.canDelete(canDelete);
  if ($$props.canView === void 0 && $$bindings.canView && canView !== void 0) $$bindings.canView(canView);
  if ($$props.formSize === void 0 && $$bindings.formSize && formSize !== void 0) $$bindings.formSize(formSize);
  if ($$props.displayKey === void 0 && $$bindings.displayKey && displayKey !== void 0) $$bindings.displayKey(displayKey);
  if ($$props.onSave === void 0 && $$bindings.onSave && onSave !== void 0) $$bindings.onSave(onSave);
  if ($$props.onDelete === void 0 && $$bindings.onDelete && onDelete !== void 0) $$bindings.onDelete(onDelete);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (!displayKey && fields.length > 0) {
        displayKey = fields[0].key;
      }
    }
    fieldMap = fields.reduce(
      (acc, field) => {
        acc[field.key] = field;
        return acc;
      },
      {}
    );
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render($$result, { title, description }, {}, {})} ${canCreate ? `${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span>${escape(createLabel)}</span>`;
      }
    })}` : ``}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data,
        searchKeys,
        searchPlaceholder,
        emptyMessage: "No " + entityName + " records found"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              extraFirst: true,
              onView: canView ? () => openDetail(row) : void 0,
              onEdit: canEdit ? () => openEdit(row) : void 0,
              onDelete: canDelete ? () => handleDelete(row) : void 0
            },
            {},
            {
              default: () => {
                return `${slots["extra-actions"] ? slots["extra-actions"]({ row }) : ``}`;
              }
            }
          )} `;
        },
        cell: ({ column, row }) => {
          let field = fieldMap[column.key];
          return `${validate_component(DataTableCell, "DataTableCell").$$render(
            $$result,
            {
              column,
              row,
              badge: field?.badge,
              badgeLabels: field?.badgeLabels
            },
            {},
            {}
          )}`;
        }
      }
    )}  ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: editingRow ? `Edit ${entityName}` : `New ${entityName}`,
        size: formSize,
        isOpen: isFormOpen
      },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
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
              return `${escape(editingRow ? "Save Changes" : `Create ${entityName}`)}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-1">${each(fields, (field) => {
            return `<div${add_attribute("class", field.colSpan === "full" ? "sm:col-span-2" : "", 0)}>${validate_component(FormField, "FormField").$$render(
              $$result,
              {
                label: field.label,
                name: field.key,
                required: field.required
              },
              {},
              {
                default: () => {
                  return `${field.type === "select" ? `<select${add_attribute("id", field.key, 0)} class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(field.options ?? [], (option) => {
                    return `<option${add_attribute("value", option.value, 0)}>${escape(option.label)}</option>`;
                  })}</select>` : `${field.type === "textarea" ? `<textarea${add_attribute("id", field.key, 0)} rows="3"${add_attribute("placeholder", field.placeholder ?? "", 0)} class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData[field.key] || "")}</textarea>` : `<input${add_attribute("id", field.key, 0)}${add_attribute(
                    "type",
                    field.type === "currency" || field.type === "number" ? "number" : field.type === "date" ? "date" : field.type ?? "text",
                    0
                  )}${add_attribute("value", formData[field.key], 0)}${add_attribute("placeholder", field.placeholder ?? "", 0)} class="${"w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none " + escape(field.type === "currency" ? "font-mono" : "", true)}" ${field.required ? "required" : ""}>`}`} ${field.help ? `<p class="mt-1 text-[11px] text-gray-500 dark:text-slate-400">${escape(field.help)}</p>` : ``} `;
                }
              }
            )} </div>`;
          })}</div></form>`;
        }
      }
    )}  ${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: `${entityName} Details`,
        size: "xl",
        isOpen: isDetailOpen
      },
      {
        isOpen: ($$value) => {
          isDetailOpen = $$value;
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
          return `${detailRow ? `<div class="grid grid-cols-1 sm:grid-cols-2 gap-3 text-sm">${each(fields, (field) => {
            return `<div class="${"border border-gray-200 dark:border-slate-800 rounded-lg p-3 " + escape(field.colSpan === "full" ? "sm:col-span-2" : "", true)}"><p class="text-[11px] uppercase tracking-wider text-gray-500 dark:text-slate-400">${escape(field.label)}</p> <p class="mt-1 font-medium text-gray-800 dark:text-slate-100 break-words">${escape(displayValue(detailRow, field))}</p> </div>`;
          })}</div>` : ``}`;
        }
      }
    )}</div>`;
  } while (!$$settled);
  return $$rendered;
});
export {
  EntityManager as E
};
