import { c as create_ssr_component, s as subscribe, e as escape, v as validate_component, d as add_attribute } from "../../../chunks/ssr.js";
import { p as page } from "../../../chunks/stores.js";
import { P as PageHeader } from "../../../chunks/PageHeader.js";
import { T as Tabs } from "../../../chunks/Tabs.js";
import { B as Button, D as DataTable } from "../../../chunks/Button.js";
import { F as FormField, M as Modal } from "../../../chunks/FormField.js";
import { u as user, s as systemUsers } from "../../../chunks/auth.js";
import { a as appSettings } from "../../../chunks/dataStore.js";
const ProfileSettingsView = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $user, $$unsubscribe_user;
  $$unsubscribe_user = subscribe(user, (value) => $user = value);
  let name = $user.name;
  let email = $user.email;
  let currentPassword = "";
  let newPassword = "";
  let confirmPassword = "";
  $$unsubscribe_user();
  return `<div class="space-y-6 max-w-4xl">${``}  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><div class="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5"><div class="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">${escape($user.name ? $user.name.charAt(0) : "U")}</div> <div><h3 class="text-lg font-bold text-gray-900">${escape($user.name)}</h3> <p class="text-xs text-gray-500">${escape($user.email)}</p> <span class="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">${escape($user.role.replace("_", " "))}</span></div></div> <form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Nama Lengkap",
      name: "profileName",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="profileName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", name, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Alamat Email",
      name: "profileEmail",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="profileEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", email, 0)}>`;
      }
    }
  )}</div> <div class="flex justify-end pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "primary" }, {}, {
    default: () => {
      return `Simpan Profil Saya`;
    }
  })}</div></form></div>  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><h4 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4" data-svelte-h="svelte-1mi4m8o">Ganti Kata Sandi (Password)</h4> <form class="space-y-4 max-w-lg">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Password Sekarang",
      name: "currentPassword"
    },
    {},
    {
      default: () => {
        return `<input id="currentPassword" type="password" placeholder="••••••••" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", currentPassword, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Password Baru",
      name: "newPassword"
    },
    {},
    {
      default: () => {
        return `<input id="newPassword" type="password" placeholder="Minimal 8 karakter" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", newPassword, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Konfirmasi Password Baru",
      name: "confirmPassword"
    },
    {},
    {
      default: () => {
        return `<input id="confirmPassword" type="password" placeholder="Ulangi password baru" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", confirmPassword, 0)}>`;
      }
    }
  )} <div class="flex justify-start pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "secondary" }, {}, {
    default: () => {
      return `Perbarui Password`;
    }
  })}</div></form></div></div>`;
});
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
  return `<div class="space-y-6 max-w-4xl">${``} <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm"><h4 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4" data-svelte-h="svelte-9jjlsl">Identitas Perusahaan &amp; Profil Dokumen Akuntansi</h4> <form class="space-y-4"><div class="grid grid-cols-1 sm:grid-cols-2 gap-4">${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Nama Resmi Perusahaan",
      name: "compName",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="compName" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", companyName, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "NPWP Perusahaan",
      name: "compNpwp",
      required: true
    },
    {},
    {
      default: () => {
        return `<input id="compNpwp" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", companyNpwp, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Nomor Telepon Kantor",
      name: "compPhone"
    },
    {},
    {
      default: () => {
        return `<input id="compPhone" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", companyPhone, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Email Korespondensi",
      name: "compEmail"
    },
    {},
    {
      default: () => {
        return `<input id="compEmail" type="email" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", companyEmail, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Mata Uang Utama",
      name: "currency"
    },
    {},
    {
      default: () => {
        return `<input id="currency" type="text" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", currency, 0)}>`;
      }
    }
  )} ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Tarif PPN Standar (%)",
      name: "taxRate"
    },
    {},
    {
      default: () => {
        return `<input id="taxRate" type="number" min="0" max="100" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", taxRate, 0)}>`;
      }
    }
  )}</div> ${validate_component(FormField, "FormField").$$render(
    $$result,
    {
      label: "Alamat Kantor & NPWP",
      name: "compAddress",
      required: true
    },
    {},
    {
      default: () => {
        return `<textarea id="compAddress" rows="3" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required>${escape(companyAddress || "")}</textarea>`;
      }
    }
  )} <div class="flex justify-end pt-2">${validate_component(Button, "Button").$$render($$result, { type: "submit", variant: "primary" }, {}, {
    default: () => {
      return `Simpan Konfigurasi Perusahaan`;
    }
  })}</div></form></div></div>`;
});
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
        title: userToEdit ? "Edit Pengguna Sistem" : "Tambah Pengguna Baru (User Management)",
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
              return `Batal`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `${escape(userToEdit ? "Simpan Perubahan" : "Tambahkan Pengguna")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Nama Pengguna",
              name: "userName",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="userName" type="text" placeholder="Nama Lengkap" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Alamat Email (Username Login)",
              name: "userEmail",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="userEmail" type="email" placeholder="user@byond.co.id" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", email, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Hak Akses / Peran (Role)",
              name: "userRole",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="userRole" class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm bg-white focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="SUPER_ADMIN" data-svelte-h="svelte-c3lk89">SUPER ADMIN (Semua Akses &amp; Manajemen User)</option><option value="SALES_ADMIN" data-svelte-h="svelte-1w64ov8">SALES ADMIN (Penjualan, Customer, Quotation)</option><option value="ACCOUNTING_ADMIN" data-svelte-h="svelte-1imw786">ACCOUNTING ADMIN (Keuangan, Tagihan, Buku Besar)</option><option value="OWNER" data-svelte-h="svelte-23c7un">OWNER / DIREKSI (Pemantauan Laporan &amp; Omzet)</option></select>`;
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
      return "bg-purple-100 text-purple-800 border-purple-200";
    case "SALES_ADMIN":
      return "bg-blue-100 text-blue-800 border-blue-200";
    case "ACCOUNTING_ADMIN":
      return "bg-emerald-100 text-emerald-800 border-emerald-200";
    case "OWNER":
      return "bg-amber-100 text-amber-800 border-amber-200";
    default:
      return "bg-gray-100 text-gray-800 border-gray-200";
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
      label: "Nama Pengguna",
      sortable: true
    },
    {
      key: "email",
      label: "Alamat Email",
      sortable: true
    },
    {
      key: "role",
      label: "Hak Akses / Role",
      sortable: true,
      align: "center"
    }
  ];
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `<div class="space-y-6"><div class="flex justify-between items-center"><div data-svelte-h="svelte-9v3x1x"><h3 class="text-base font-bold text-gray-900">Daftar Akun Pengguna Sistem (User Management)</h3> <p class="text-xs text-gray-500">Kelola akun staf, hak akses per modul, dan kredensial login</p></div> ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<span class="text-base font-bold" data-svelte-h="svelte-us2z26">+</span> <span data-svelte-h="svelte-1q85k7u">Tambah User Baru</span>`;
      }
    })}</div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: $systemUsers,
        searchPlaceholder: "Cari pengguna berdasarkan nama atau email...",
        searchKeys: ["name", "email", "role"]
      },
      {},
      {
        actions: ({ row }) => {
          return `<div class="flex items-center justify-end gap-1.5"><button type="button" class="p-1.5 text-amber-600 hover:bg-amber-50 rounded-lg text-xs font-semibold" title="Edit" data-svelte-h="svelte-pl2p7b">Edit</button> ${row.id !== $user.id ? `<button type="button" class="p-1.5 text-red-600 hover:bg-red-50 rounded-lg text-xs font-semibold" title="Hapus" data-svelte-h="svelte-yltwyw">Hapus</button>` : ``}</div> `;
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
        label: "Profil Saya",
        icon: "👤"
      },
      {
        id: "company",
        label: "Profil Perusahaan & Pajak",
        icon: "🏢"
      },
      ...$user.role === "SUPER_ADMIN" ? [
        {
          id: "users",
          label: "Manajemen Pengguna (User Management)",
          icon: "👥"
        }
      ] : []
    ];
    $$rendered = `<div class="space-y-6">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Pengaturan Sistem & Pengguna",
        description: "Konfigurasi akun staf pengguna, profil resmi perusahaan, dan data administrasi"
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
    )} <div class="pt-2">${activeTab === "profile" ? `${validate_component(ProfileSettingsView, "ProfileSettingsView").$$render($$result, {}, {}, {})}` : `${activeTab === "company" ? `${validate_component(CompanySettingsView, "CompanySettingsView").$$render($$result, {}, {}, {})}` : `${activeTab === "users" ? `${validate_component(UserManagementView, "UserManagementView").$$render($$result, {}, {}, {})}` : ``}`}`}</div></div>`;
  } while (!$$settled);
  $$unsubscribe_page();
  $$unsubscribe_user();
  return $$rendered;
});
export {
  Page as default
};
