import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape, f as add_attribute, g as each } from "../../../chunks/ssr.js";
import { D as DataTable } from "../../../chunks/DataTable.js";
import { M as Modal, R as RowActions } from "../../../chunks/RowActions.js";
import { B as Button } from "../../../chunks/Button.js";
import { B as Badge } from "../../../chunks/Badge.js";
import { f as formatCurrency, d as formatNumber, P as PageHeader } from "../../../chunks/formatters.js";
import { F as FormField } from "../../../chunks/FormField.js";
import { W as unitsOfMeasurement, J as products, X as productActions } from "../../../chunks/dataStore.js";
const ProductFormModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let baseUnitOptions;
  let secondaryUnitOptions;
  let $unitsOfMeasurement, $$unsubscribe_unitsOfMeasurement;
  $$unsubscribe_unitsOfMeasurement = subscribe(unitsOfMeasurement, (value) => $unitsOfMeasurement = value);
  let { isOpen = false } = $$props;
  let { productToEdit = null } = $$props;
  let formData = {
    code: "",
    name: "",
    itemType: "goods",
    conversionRate: 0,
    weightKg: 0,
    barcode: "",
    price: 0,
    costPrice: 0,
    stock: 0,
    minStock: 0,
    description: ""
  };
  let showMeasurement = true;
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
          const baseUnit = $unitsOfMeasurement.find((unit) => unit.code.toLowerCase() === (productToEdit.unit ?? "").toLowerCase() || unit.name.toLowerCase() === (productToEdit.unit ?? "").toLowerCase())?.code ?? productToEdit.unit ?? "PCS";
          formData = {
            code: productToEdit.code ?? "",
            name: productToEdit.name,
            itemType: productToEdit.itemType ?? "goods",
            category: productToEdit.category,
            unit: baseUnit,
            secondaryUnit: productToEdit.secondaryUnit ?? "",
            conversionRate: productToEdit.conversionRate ?? 0,
            weightKg: productToEdit.weightKg ?? 0,
            barcode: productToEdit.barcode ?? "",
            price: productToEdit.price,
            costPrice: productToEdit.costPrice ?? 0,
            stock: productToEdit.stock,
            minStock: productToEdit.minStock ?? 0,
            description: productToEdit.description
          };
          showMeasurement = true;
        } else {
          formData = {
            code: "",
            name: "",
            itemType: "goods",
            category: "Raw Materials",
            unit: "PCS",
            secondaryUnit: "",
            conversionRate: 0,
            weightKg: 0,
            barcode: "",
            price: 0,
            costPrice: 0,
            stock: 0,
            minStock: 0,
            description: ""
          };
          showMeasurement = true;
        }
      }
    }
    baseUnitOptions = $unitsOfMeasurement.filter((unit) => formData.itemType === "goods" ? unit.category !== "Service" : unit.category === "Service" || unit.category === "Time");
    secondaryUnitOptions = $unitsOfMeasurement.filter((unit) => unit.category !== "Service");
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: productToEdit ? "Edit Product" : "New Product",
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
              return `${escape(productToEdit ? "Save Changes" : "Create Product")}`;
            }
          })} `;
        },
        default: () => {
          return `<form class="space-y-5"> <div><p class="text-xs font-semibold text-gray-700 dark:text-slate-300 mb-1.5 uppercase tracking-wide" data-svelte-h="svelte-1g7ik5b">Item Type</p> <div class="grid grid-cols-2 gap-3"><button type="button" class="${"flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all " + escape(
            formData.itemType === "goods" ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10" : "border-gray-200 dark:border-slate-700 hover:border-blue-300",
            true
          )}"><span class="text-2xl" data-svelte-h="svelte-x4o3y8">📦</span> <span data-svelte-h="svelte-13ycsxx"><span class="block text-sm font-bold text-gray-900 dark:text-white">Goods</span> <span class="block text-[11px] text-gray-500 dark:text-slate-400">Physical inventory with stock and measurement</span></span></button> <button type="button" class="${"flex items-start gap-3 p-3 rounded-xl border-2 text-left transition-all " + escape(
            formData.itemType === "service" ? "border-blue-600 bg-blue-50 dark:bg-blue-500/10" : "border-gray-200 dark:border-slate-700 hover:border-blue-300",
            true
          )}"><span class="text-2xl" data-svelte-h="svelte-lrwjcj">🛠️</span> <span data-svelte-h="svelte-1yv6ab7"><span class="block text-sm font-bold text-gray-900 dark:text-white">Service</span> <span class="block text-[11px] text-gray-500 dark:text-slate-400">Billable service without physical stock</span></span></button></div></div> <div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Product / Service Name",
              name: "name",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="name" type="text" placeholder="e.g. A4 Copy Paper 80gsm" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none" required${add_attribute("value", formData.name, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Product Code",
              name: "code",
              hint: "Leave blank to generate automatically"
            },
            {},
            {
              default: () => {
                return `<input id="code" type="text" placeholder="PRD-001" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"${add_attribute("value", formData.code, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Category", name: "category" }, {}, {
            default: () => {
              return `<select id="category" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${formData.itemType === "goods" ? `<option value="Raw Materials" data-svelte-h="svelte-3a7xk6">Raw Materials</option> <option value="Hardware &amp; Tools" data-svelte-h="svelte-67m5oi">Hardware &amp; Tools</option> <option value="Office Stationery" data-svelte-h="svelte-avcvke">Office Stationery</option> <option value="IT Supplies" data-svelte-h="svelte-ct9gie">IT Supplies</option> <option value="Furniture" data-svelte-h="svelte-hu2hva">Furniture</option> <option value="Electronics" data-svelte-h="svelte-d52ug4">Electronics</option> <option value="Consumables" data-svelte-h="svelte-1f6jbs6">Consumables</option>` : `<option value="Professional Services" data-svelte-h="svelte-r466q0">Professional Services</option> <option value="Technical Services" data-svelte-h="svelte-1u0mdse">Technical Services</option> <option value="Maintenance Services" data-svelte-h="svelte-iztq7e">Maintenance Services</option> <option value="Consulting" data-svelte-h="svelte-1368vv2">Consulting</option> <option value="Installation" data-svelte-h="svelte-141ydba">Installation</option>`}</select>`;
            }
          })} ${validate_component(FormField, "FormField").$$render($$result, { label: "Barcode / SKU", name: "barcode" }, {}, {
            default: () => {
              return `<input id="barcode" type="text" placeholder="899xxxxxxxx" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"${add_attribute("value", formData.barcode, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: formData.itemType === "goods" ? "Selling Price (IDR)" : "Service Rate (IDR)",
              name: "price",
              required: true
            },
            {},
            {
              default: () => {
                return `<input id="price" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono" required${add_attribute("value", formData.price, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Cost / Standard Rate (IDR)",
              name: "costPrice"
            },
            {},
            {
              default: () => {
                return `<input id="costPrice" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none font-mono"${add_attribute("value", formData.costPrice, 0)}>`;
              }
            }
          )}</div>  ${formData.itemType === "goods" ? `<div class="rounded-xl border border-gray-200 dark:border-slate-800 overflow-hidden"><button type="button" class="w-full flex items-center justify-between px-4 py-3 bg-slate-50 dark:bg-slate-800/60 hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors"><div class="flex items-center gap-2" data-svelte-h="svelte-141hlwa"><span class="text-lg">📐</span> <div class="text-left"><p class="text-sm font-bold text-gray-800 dark:text-white">Measurement &amp; Inventory</p> <p class="text-[11px] text-gray-500 dark:text-slate-400">Unit of Measurement, conversion and stock levels</p></div></div> <svg class="${"w-4 h-4 text-gray-500 transition-transform " + escape(showMeasurement ? "rotate-180" : "", true)}" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"></path></svg></button> ${showMeasurement ? `<div class="p-4 border-t border-gray-200 dark:border-slate-800"><div class="grid grid-cols-1 sm:grid-cols-2 gap-x-4">${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Base Unit of Measurement",
              name: "unit",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="unit" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(baseUnitOptions, (unit) => {
                  return `<option${add_attribute("value", unit.code, 0)}>${escape(unit.code)} — ${escape(unit.name)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Secondary Unit (optional)",
              name: "secondaryUnit"
            },
            {},
            {
              default: () => {
                return `<select id="secondaryUnit" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"><option value="" data-svelte-h="svelte-14tl2n9">No secondary unit</option>${each(secondaryUnitOptions, (unit) => {
                  return `<option${add_attribute("value", unit.code, 0)}>${escape(unit.code)} — ${escape(unit.name)}</option>`;
                })}</select>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Conversion Rate",
              name: "conversionRate",
              hint: "Base units per secondary unit"
            },
            {},
            {
              default: () => {
                return `<input id="conversionRate" type="number" min="0" placeholder="e.g. 24" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.conversionRate, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Weight per Unit (kg)",
              name: "weightKg"
            },
            {},
            {
              default: () => {
                return `<input id="weightKg" type="number" min="0" step="0.01" placeholder="0.00" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.weightKg, 0)}>`;
              }
            }
          )} ${validate_component(FormField, "FormField").$$render($$result, { label: "Current Stock", name: "stock" }, {}, {
            default: () => {
              return `<input id="stock" type="number" placeholder="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.stock, 0)}>`;
            }
          })} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Minimum Stock Alert",
              name: "minStock"
            },
            {},
            {
              default: () => {
                return `<input id="minStock" type="number" min="0" placeholder="0" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none"${add_attribute("value", formData.minStock, 0)}>`;
              }
            }
          )}</div> <div class="mt-1 flex items-center justify-between rounded-lg bg-blue-50 dark:bg-blue-500/10 px-3 py-2 text-xs"><span class="text-blue-800 dark:text-blue-200 font-medium" data-svelte-h="svelte-w7p22v">Estimated stock value</span> <span class="font-mono font-bold text-blue-900 dark:text-blue-100">${escape(formatCurrency((Number(formData.stock) || 0) * (Number(formData.costPrice) || 0)))}</span></div></div>` : ``}</div>` : `<div class="rounded-xl border border-purple-200 dark:border-purple-500/20 bg-purple-50 dark:bg-purple-500/10 p-4"><p class="text-sm font-bold text-purple-800 dark:text-purple-200 mb-2" data-svelte-h="svelte-szc6dz">Service Measurement</p> ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Service Unit",
              name: "unit",
              required: true
            },
            {},
            {
              default: () => {
                return `<select id="unit" class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${each(baseUnitOptions, (unit) => {
                  return `<option${add_attribute("value", unit.code, 0)}>${escape(unit.code)} — ${escape(unit.name)}</option>`;
                })}</select>`;
              }
            }
          )} <p class="text-[11px] text-purple-700 dark:text-purple-300" data-svelte-h="svelte-1au5cmk">Services do not track physical stock. Stock and measurement fields are hidden.</p></div>`} ${validate_component(FormField, "FormField").$$render(
            $$result,
            {
              label: "Description / Specification",
              name: "description"
            },
            {},
            {
              default: () => {
                return `<textarea id="description" rows="3" placeholder="Technical specification or additional notes..." class="w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 focus:ring-2 focus:ring-blue-500 focus:outline-none">${escape(formData.description || "")}</textarea>`;
              }
            }
          )}</form>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_unitsOfMeasurement();
  return $$rendered;
});
const ProductDetailModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { isOpen = false } = $$props;
  let { product = null } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.product === void 0 && $$bindings.product && product !== void 0) $$bindings.product(product);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      {
        title: "Product Details",
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
              return `Close`;
            }
          })} `;
        },
        default: () => {
          return `${product ? `<div class="space-y-5 text-sm"><div class="rounded-xl bg-slate-50 dark:bg-slate-800/60 border border-gray-200 dark:border-slate-800 p-4 flex items-start justify-between gap-3"><div><p class="text-[11px] font-mono text-blue-600 dark:text-blue-300">${escape(product.code || "-")}</p> <h4 class="text-lg font-bold text-gray-900 dark:text-white">${escape(product.name)}</h4> <p class="text-xs text-gray-500 dark:text-slate-400">${escape(product.category)}</p></div> ${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: product.itemType,
              label: product.itemType === "goods" ? "Goods" : "Service"
            },
            {},
            {}
          )}</div> <div class="grid grid-cols-2 sm:grid-cols-3 gap-3"><div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-175hcel">Selling Price</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(formatCurrency(product.price))}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-freg2e">Cost Price</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(formatCurrency(product.costPrice ?? 0))}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-ev1351">Base Unit</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(product.unit || "-")}</p></div> ${product.itemType === "goods" ? `<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-iaagnf">Current Stock</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(formatNumber(product.stock || 0))} ${escape(product.unit)}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1g6xde8">Minimum Stock</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(formatNumber(product.minStock ?? 0))} ${escape(product.unit)}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-150jdpb">Stock Value</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(formatCurrency((product.stock || 0) * (product.costPrice ?? 0)))}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-18t4cja">Secondary Unit</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(product.secondaryUnit || "-")} ${product.secondaryUnit && product.conversionRate ? `<span class="text-[11px] text-gray-500 dark:text-slate-400">(1 ${escape(product.secondaryUnit)} = ${escape(product.conversionRate)} ${escape(product.unit)})</span>` : ``}</p></div> <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1jqahit">Weight / Unit</p> <p class="mt-1 font-bold text-gray-900 dark:text-white">${escape(product.weightKg ?? 0)} kg</p></div>` : ``}</div> ${product.barcode ? `<div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-183k2a6">Barcode / SKU</p> <p class="mt-1 font-mono text-gray-800 dark:text-slate-100">${escape(product.barcode)}</p></div>` : ``} <div class="border border-gray-200 dark:border-slate-800 rounded-lg p-3"><p class="text-[10px] uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1rjxa00">Description</p> <p class="mt-1 text-gray-700 dark:text-slate-200">${escape(product.description || "-")}</p></div></div>` : ``}`;
        }
      }
    )}`;
  } while (!$$settled);
  return $$rendered;
});
const ProductList = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredProducts;
  let goodsCount;
  let serviceCount;
  let $products, $$unsubscribe_products;
  $$unsubscribe_products = subscribe(products, (value) => $products = value);
  let isFormOpen = false;
  let isDetailOpen = false;
  let selectedProduct = null;
  let productToEdit = null;
  const columns = [
    {
      key: "code",
      label: "Code",
      sortable: true
    },
    {
      key: "name",
      label: "Product / Service",
      sortable: true
    },
    {
      key: "itemType",
      label: "Type",
      align: "center"
    },
    {
      key: "category",
      label: "Category",
      sortable: true
    },
    {
      key: "unit",
      label: "UoM",
      align: "center"
    },
    {
      key: "price",
      label: "Price",
      sortable: true,
      align: "right",
      format: (v) => formatCurrency(Number(v) || 0)
    },
    {
      key: "stock",
      label: "Stock",
      sortable: true,
      align: "center",
      format: (v, row) => row.itemType === "goods" ? `${formatNumber(Number(v) || 0)} ${row.unit ?? ""}` : "—"
    }
  ];
  function openEdit(product) {
    productToEdit = product;
    isFormOpen = true;
  }
  function openDetail(product) {
    selectedProduct = product;
    isDetailOpen = true;
  }
  function handleDelete(product) {
    if (confirm(`Delete product "${product.name}"? This action cannot be undone.`)) {
      productActions.delete(product.id);
    }
  }
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    filteredProducts = $products;
    goodsCount = $products.filter((p) => p.itemType === "goods").length;
    serviceCount = $products.filter((p) => p.itemType === "service").length;
    $$rendered = `<div class="space-y-6"><div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">${validate_component(PageHeader, "PageHeader").$$render(
      $$result,
      {
        title: "Products & Services",
        description: "Master catalogue for goods, services, unit of measurement, pricing and physical stock."
      },
      {},
      {}
    )} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
      default: () => {
        return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"></path></svg> <span data-svelte-h="svelte-8o5jgm">Add Product</span>`;
      }
    })}</div> <div class="grid grid-cols-3 gap-3"><div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-gray-500 dark:text-slate-400" data-svelte-h="svelte-1a1ewht">Total Items</p> <p class="text-xl font-black text-gray-900 dark:text-white">${escape($products.length)}</p></div> <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-blue-600 dark:text-blue-300" data-svelte-h="svelte-15oas3v">Goods</p> <p class="text-xl font-black text-gray-900 dark:text-white">${escape(goodsCount)}</p></div> <div class="bg-white dark:bg-slate-900 border border-gray-200 dark:border-slate-800 rounded-xl p-3"><p class="text-[10px] font-bold uppercase tracking-wider text-purple-600 dark:text-purple-300" data-svelte-h="svelte-uej369">Services</p> <p class="text-xl font-black text-gray-900 dark:text-white">${escape(serviceCount)}</p></div></div> ${validate_component(DataTable, "DataTable").$$render(
      $$result,
      {
        columns,
        data: filteredProducts,
        searchPlaceholder: "Search products by name, code or category...",
        searchKeys: ["code", "name", "category", "description"],
        emptyMessage: "No products match the selected filter"
      },
      {},
      {
        actions: ({ row }) => {
          return `${validate_component(RowActions, "RowActions").$$render(
            $$result,
            {
              onView: () => openDetail(row),
              viewTitle: "View product details",
              onEdit: () => openEdit(row),
              editTitle: "Edit product",
              onDelete: () => handleDelete(row),
              deleteTitle: "Delete product"
            },
            {},
            {}
          )} `;
        },
        cell: ({ column, value, row }) => {
          return `${column.key === "itemType" ? `${validate_component(Badge, "Badge").$$render(
            $$result,
            {
              status: value,
              label: value === "goods" ? "Goods" : "Service"
            },
            {},
            {}
          )}` : `${escape(column.format ? column.format(value, row) : value ?? "-")}`} `;
        },
        controls: () => {
          return `<select class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 text-xs focus:ring-1 focus:ring-blue-500"><option value="all" data-svelte-h="svelte-gd4md7">All types</option><option value="goods" data-svelte-h="svelte-1wqmty2">Goods only</option><option value="service" data-svelte-h="svelte-1duye0v">Services only</option></select>`;
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
    )} ${validate_component(ProductDetailModal, "ProductDetailModal").$$render(
      $$result,
      {
        product: selectedProduct,
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
  $$unsubscribe_products();
  return $$rendered;
});
const Page = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  return `${validate_component(ProductList, "ProductList").$$render($$result, {}, {}, {})}`;
});
export {
  Page as default
};
