import { c as create_ssr_component, h as createEventDispatcher, g as each, e as escape, s as subscribe, v as validate_component, f as add_attribute } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import { P as PageHeader } from "../../../chunks/formatters.js";
import { B as Button } from "../../../chunks/Button.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { u as user, s as systemUsers, d as deleteSystemUser } from "../../../chunks/auth.js";
import { a as appSettings } from "../../../chunks/dataStore.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { t as theme } from "../../../chunks/theme.js";
const Tabs = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { tabs = [] } = $$props;
  let { activeTab = tabs[0]?.id || "" } = $$props;
  createEventDispatcher();
  if ($$props.tabs === void 0 && $$bindings.tabs && tabs !== void 0) $$bindings.tabs(tabs);
  if ($$props.activeTab === void 0 && $$bindings.activeTab && activeTab !== void 0) $$bindings.activeTab(activeTab);
  return `<div class="border-b border-gray-200 dark:border-slate-800 overflow-x-auto"><nav class="-mb-px flex space-x-2 sm:space-x-4" aria-label="Tabs">${each(tabs, (tab) => {
    return `<button type="button" class="${"whitespace-nowrap py-3 px-2 border-b-2 font-medium text-xs sm:text-sm flex items-center gap-2 transition-colors " + escape(
      activeTab === tab.id ? "border-blue-600 text-blue-600 dark:text-blue-300 dark:border-blue-400 font-semibold" : "border-transparent text-gray-500 dark:text-slate-400 hover:text-gray-700 dark:hover:text-white hover:border-gray-300 dark:hover:border-slate-600",
      true
    )}">${tab.icon ? `<span>${escape(tab.icon)}</span>` : ``} <span>${escape(tab.label)}</span> ${tab.badge !== void 0 ? `<span class="${"ml-1 px-2 py-0.5 text-xs rounded-full font-bold " + escape(
      activeTab === tab.id ? "bg-blue-100 text-blue-700 dark:bg-blue-500/20 dark:text-blue-200" : "bg-gray-100 text-gray-600 dark:bg-slate-800 dark:text-slate-300",
      true
    )}">${escape(tab.badge)} </span>` : ``} </button>`;
  })}</nav></div>`;
});
const inputClass$2 = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
const ProfileSettingsView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let name = $user.name;
  let email = $user.email;
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  $$unsubscribe_user();
  return `<div class="space-y-6 max-w-4xl">${``} <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><div class="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5"><div class="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div><h3 class="text-lg font-bold text-gray-900 dark:text-white">${escape($user.name)}</h3> <p class="text-xs text-gray-500 dark:text-slate-400">${escape($user.email)}</p> <span class="inline-block mt-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20 uppercase">${escape($user.role.replace("_", " "))}</span></div></div> <form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Full Name",
      name: "profileName",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="profileName" type="text"${add_attribute("class", inputClass$2, 0)} required${add_attribute("value", name, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Email Address",
      name: "profileEmail",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="profileEmail" type="email"${add_attribute("class", inputClass$2, 0)} required${add_attribute("value", email, 0)}>`;
      }
    }
  )}</div> <div class="flex justify-end pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "primary" }, {}, {
    default: () => {
      return `Save My Profile`;
    }
  })}</div></form></div> <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4" data-svelte-h="svelte-1qm7edz">Change Password</h4> <form class="space-y-4 max-w-lg">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Current Password",
      name: "currentPassword"
    },
    {},
    {
      default: () => {
        return `<input id="currentPassword" type="password" placeholder="••••••••"${add_attribute("class", inputClass$2, 0)}${add_attribute("value", currentPassword, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "New Password",
      name: "newPassword"
    },
    {},
    {
      default: () => {
        return `<input id="newPassword" type="password" placeholder="At least 8 characters"${add_attribute("class", inputClass$2, 0)}${add_attribute("value", newPassword, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Confirm New Password",
      name: "confirmPassword"
    },
    {},
    {
      default: () => {
        return `<input id="confirmPassword" type="password" placeholder="Repeat the new password"${add_attribute("class", inputClass$2, 0)}${add_attribute("value", confirmPassword, 0)}>`;
      }
    }
  )} <div class="flex justify-start pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "secondary" }, {}, {
    default: () => {
      return `Update Password`;
    }
  })}</div></form></div></div>`;
});
const inputClass$1 = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 focus:ring-2 focus:ring-blue-500 focus:outline-none";
const CompanySettingsView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $appSettings, $$unsubscribe_appSettings;
  $$unsubscribe_appSettings = subscribe(appSettings, (value) => $appSettings = value);
  let companyName = $appSettings.companyName;
  let companyAddress = $appSettings.companyAddress;
  let companyPhone = $appSettings.companyPhone;
  let companyEmail = $appSettings.companyEmail;
  let companyNpwp = $appSettings.companyNpwp;
  let currency = $appSettings.currency;
  let taxRate = $appSettings.taxRate;
  $$unsubscribe_appSettings();
  return `<div class="space-y-6 max-w-4xl">${``} <div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4" data-svelte-h="svelte-13c6c3g">Company Identity &amp; Accounting Document Profile</h4> <form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Registered Company Name",
      name: "compName",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="compName" type="text"${add_attribute("class", inputClass$1, 0)} required${add_attribute("value", companyName, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Company Tax ID (NPWP)",
      name: "compNpwp",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="compNpwp" type="text" class="${escape(inputClass$1, true) + " font-mono"}" required${add_attribute("value", companyNpwp, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Office Phone Number",
      name: "compPhone"
    },
    {},
    {
      default: () => {
        return `<input id="compPhone" type="text"${add_attribute("class", inputClass$1, 0)}${add_attribute("value", companyPhone, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Correspondence Email",
      name: "compEmail"
    },
    {},
    {
      default: () => {
        return `<input id="compEmail" type="email"${add_attribute("class", inputClass$1, 0)}${add_attribute("value", companyEmail, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Base Currency", name: "currency" }, {}, {
    default: () => {
      return `<input id="currency" type="text" class="${escape(inputClass$1, true) + " font-mono"}"${add_attribute("value", currency, 0)}>`;
    }
  })} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Standard VAT Rate (%)",
      name: "taxRate"
    },
    {},
    {
      default: () => {
        return `<input id="taxRate" type="number" min="0" max="100" class="${escape(inputClass$1, true) + " font-mono"}"${add_attribute("value", taxRate, 0)}>`;
      }
    }
  )}</div> ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Office & Tax Address",
      name: "compAddress",
      required: true
    },
    {},
    {
      default: () => {
        return `<textarea id="compAddress" rows="3"${add_attribute("class", inputClass$1, 0)} required>${escape(companyAddress || "")}</textarea>`;
      }
    }
  )} <div class="flex justify-end pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "primary" }, {}, {
    default: () => {
      return `Save Company Configuration`;
    }
  })}</div></form></div></div>`;
});
const inputClass = "w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none";
const UserFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { userToEdit = null } = $$props;
  let name = "";
  let email = "";
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.userToEdit === void 0 && $$bindings.userToEdit && userToEdit !== void 0) $$bindings.userToEdit(userToEdit);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    {
      if (isOpen) {
        if (userToEdit) {
          name = userToEdit.name;
          email = userToEdit.email;
          userToEdit.role;
        } else {
          name = "";
          email = "";
        }
      }
    }
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: userToEdit ? "Edit System User" : "Add New User",
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
              return `Cancel`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(userToEdit ? "Save Changes" : "Add User")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "User Name",
              name: "userName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="userName" type="text" placeholder="Full name"${add_attribute("class", inputClass, 0)} required${add_attribute("value", name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Email Address (Login Username)",
              name: "userEmail",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="userEmail" type="email" placeholder="user@byond.co.id"${add_attribute("class", inputClass, 0)} required${add_attribute("value", email, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Access Role",
              name: "userRole",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="userRole"${add_attribute("class", inputClass, 0)}><option value="SUPER_ADMIN" data-svelte-h="svelte-21kik9">SUPER ADMIN (Full Access &amp; User Management)</option><option value="SALES_ADMIN" data-svelte-h="svelte-1nsswqg">SALES ADMIN (Sales, Customers, Quotations)</option><option value="ACCOUNTING_ADMIN" data-svelte-h="svelte-19m23cm">ACCOUNTING ADMIN (Finance, Billing, General Ledger)</option><option value="OWNER" data-svelte-h="svelte-xjqqkv">OWNER / DIRECTOR (Reports &amp; Revenue Monitoring)</option></select>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
function getRoleBadge(role) {
  switch (role) {
    case "SUPER_ADMIN":
      return "bg-purple-100 text-purple-800 border-purple-200 dark:bg-purple-500/10 dark:text-purple-300 dark:border-purple-500/20";
    case "SALES_ADMIN":
      return "bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-500/10 dark:text-blue-300 dark:border-blue-500/20";
    case "ACCOUNTING_ADMIN":
      return "bg-emerald-100 text-emerald-800 border-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:border-emerald-500/20";
    case "OWNER":
      return "bg-amber-100 text-amber-800 border-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:border-amber-500/20";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200 dark:bg-slate-800 dark:text-slate-200 dark:border-slate-700";
  }
}
const UserManagementView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  let $systemUsers, $$unsubscribe_systemUsers;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  $$unsubscribe_systemUsers = subscribe(systemUsers, (value) => $systemUsers = value);
  let isFormOpen = false;
  let userToEdit = null;
  const columns = [
    {
      key: "name",
      label: "User Name",
      sortable: true
    },
    {
      key: "email",
      label: "Email Address",
      sortable: true
    },
    {
      key: "role",
      label: "Access Role",
      sortable: true,
      align: "center"
    }
  ];
  function openEdit(u) {
    userToEdit = u;
    isFormOpen = true;
  }
  function handleDelete(u) {
    if (u.id === $user.id) {
      alert("You cannot delete the account that is currently active.");
      return;
    }
    if (confirm(`Are you sure you want to revoke access for ${u.name}?`)) {
      deleteSystemUser(u.id);
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex justify-between items-center gap-3 flex-wrap"><div data-svelte-h="svelte-x6itzq"><h3 class="text-base font-bold text-gray-900 dark:text-white">System User Accounts</h3> <p class="text-xs text-gray-500 dark:text-slate-400">Manage staff accounts, module access rights and login credentials.</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-128tyv2">Add New User</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $systemUsers,
        searchPlaceholder: "Search users by name or email...",
        searchKeys: ["name", "email", "role"]
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onEdit: () => openEdit(row),
              editTitle: "Edit user",
              onDelete: row.id !== $user.id ? () => handleDelete(row) : void 0,
              deleteTitle: "Delete user"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "role" ? `<span class="${"px-2.5 py-1 rounded-full text-xs font-bold border " + escape(getRoleBadge(value), true)}">${escape(value.replace("_", " "))}</span>` : `${escape(column.format ? column.format(value, row) : value)}`}`;
        }
      }
    )} ${validate_component(UserFormModal, "UserFormModal").$$render(
      $$result,
      { userToEdit, isOpen: isFormOpen },
      {
        isOpen: ($$value) => {
          isFormOpen = $$value;
          $$settled = false;
        }
      },
      {}
    )}</div>`;
  } while (!$$settled);
  $$unsubscribe_user();
  $$unsubscribe_systemUsers();
  return $$rendered;
});
const AppearanceSettingsView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $theme, $$unsubscribe_theme;
  $$unsubscribe_theme = subscribe(theme, (value) => $theme = value);
  const options = [
    {
      id: "light",
      label: "Light",
      description: "Bright surfaces for well-lit office environments.",
      icon: "☀️"
    },
    {
      id: "dark",
      label: "Dark",
      description: "Reduced glare and lower eye strain in low light.",
      icon: "🌙"
    }
  ];
  $$unsubscribe_theme();
  return `<div class="space-y-6 max-w-4xl"><div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm"><h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4" data-svelte-h="svelte-o0tfil">Appearance &amp; Theme</h4> <p class="text-xs text-gray-500 dark:text-slate-400 mb-5" data-svelte-h="svelte-1uuzrj">Choose how the accounting workspace looks. Your preference is saved on this device and applied immediately.</p> <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${each(options, (option) => {
    return `<button type="button" class="${"text-left p-5 rounded-2xl border-2 transition-all " + escape(
      $theme === option.id ? "border-blue-500 bg-blue-50/60 dark:bg-blue-500/10 ring-2 ring-blue-400" : "border-gray-200 dark:border-slate-700 bg-white dark:bg-slate-900 hover:border-gray-300 dark:hover:border-slate-600",
      true
    )}"><div class="flex items-center justify-between mb-3"><span class="text-3xl">${escape(option.icon)}</span> ${$theme === option.id ? `<span class="text-[11px] font-bold uppercase text-blue-700 dark:text-blue-300 bg-white dark:bg-slate-900 border border-blue-200 dark:border-blue-500/30 px-2 py-0.5 rounded-full" data-svelte-h="svelte-tq4zgx">Active
							</span>` : ``}</div> <p class="text-sm font-bold text-gray-900 dark:text-white">${escape(option.label)}</p> <p class="text-xs text-gray-500 dark:text-slate-400 mt-1">${escape(option.description)}</p> <div class="mt-4 rounded-lg overflow-hidden border border-gray-200 dark:border-slate-700"><div class="${"h-16 " + escape(option.id === "dark" ? "bg-slate-950" : "bg-slate-100", true) + " p-2 flex gap-2"}"><div class="${"w-6 rounded " + escape(option.id === "dark" ? "bg-slate-800" : "bg-white", true)}"></div> <div class="flex-1 space-y-1.5"><div class="${"h-2.5 rounded " + escape(option.id === "dark" ? "bg-slate-700" : "bg-white", true) + " w-3/4"}"></div> <div class="${"h-2.5 rounded " + escape(option.id === "dark" ? "bg-slate-800" : "bg-white", true) + " w-1/2"}"></div> <div class="${"h-2.5 rounded " + escape(option.id === "dark" ? "bg-blue-500/60" : "bg-blue-500", true) + " w-2/3"}"></div></div> </div></div> </button>`;
  })}</div> <div class="mt-6 pt-4 border-t border-gray-100 dark:border-slate-800"><p class="text-xs text-gray-500 dark:text-slate-400">Current theme: <span class="font-bold text-gray-800 dark:text-slate-100 capitalize">${escape($theme)}</span></p></div></div></div>`;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let tabs;
  let $page, $$unsubscribe_page;
  let $user, $$unsubscribe_user;
  $$unsubscribe_page = subscribe(page, (value) => $page = value);
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let activeTab = $page.url.searchParams.get("tab") || "profile";
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    tabs = [
      {
        id: "profile",
        label: "My Profile",
        icon: "👤"
      },
      {
        id: "company",
        label: "Company & Tax Profile",
        icon: "🏢"
      },
      {
        id: "appearance",
        label: "Appearance & Theme",
        icon: "🎨"
      },
      ...$user.role === "SUPER_ADMIN" ? [
        {
          id: "users",
          label: "User Management",
          icon: "👥"
        }
      ] : []
    ];
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "System & User Settings",
        description: "Configure staff accounts, official company profile, tax information and workspace appearance."
      },
      {},
      {}
    )} ${validate_component(Tabs, "Tabs").$$render(
      $$result,
      { tabs, activeTab },
      {
        activeTab: ($$value) => {
          activeTab = $$value;
          $$settled = false;
        }
      },
      {}
    )} <div class="pt-2">${activeTab === "profile" ? `${validate_component(ProfileSettingsView, "ProfileSettingsView").$$render($$result, {}, {}, {})}` : `${activeTab === "company" ? `${validate_component(CompanySettingsView, "CompanySettingsView").$$render($$result, {}, {}, {})}` : `${activeTab === "appearance" ? `${validate_component(AppearanceSettingsView, "AppearanceSettingsView").$$render($$result, {}, {}, {})}` : `${activeTab === "users" ? `${validate_component(UserManagementView, "UserManagementView").$$render($$result, {}, {}, {})}` : ``}`}`}`}</div></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_user();
  return $$rendered;
});
export {
  Page as default
};
