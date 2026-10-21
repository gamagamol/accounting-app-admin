import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape, g as each } from "./ssr.js";
import { M as Modal } from "./RowActions.js";
import { B as Button } from "./Button.js";
import { a as formatDate, f as formatCurrency } from "./formatters.js";
import { a as appSettings } from "./dataStore.js";
const PrintPreviewModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let documentLabel;
  let $appSettings, $$unsubscribe_appSettings;
  $$unsubscribe_appSettings = subscribe(appSettings, (value) => $appSettings = value);
  let { isOpen = false } = $$props;
  let { title = "Print Document" } = $$props;
  let { documentType = "quotation" } = $$props;
  let { documentNo = "" } = $$props;
  let { date = "" } = $$props;
  let { customerOrSupplierName = "" } = $$props;
  let { address = "" } = $$props;
  let { items = [] } = $$props;
  let { subtotal = 0 } = $$props;
  let { tax = 0 } = $$props;
  let { total = 0 } = $$props;
  let { notes = "" } = $$props;
  let { preparedBy = "" } = $$props;
  if ($$props.isOpen === void 0 && $$bindings.isOpen && isOpen !== void 0) $$bindings.isOpen(isOpen);
  if ($$props.title === void 0 && $$bindings.title && title !== void 0) $$bindings.title(title);
  if ($$props.documentType === void 0 && $$bindings.documentType && documentType !== void 0) $$bindings.documentType(documentType);
  if ($$props.documentNo === void 0 && $$bindings.documentNo && documentNo !== void 0) $$bindings.documentNo(documentNo);
  if ($$props.date === void 0 && $$bindings.date && date !== void 0) $$bindings.date(date);
  if ($$props.customerOrSupplierName === void 0 && $$bindings.customerOrSupplierName && customerOrSupplierName !== void 0) $$bindings.customerOrSupplierName(customerOrSupplierName);
  if ($$props.address === void 0 && $$bindings.address && address !== void 0) $$bindings.address(address);
  if ($$props.items === void 0 && $$bindings.items && items !== void 0) $$bindings.items(items);
  if ($$props.subtotal === void 0 && $$bindings.subtotal && subtotal !== void 0) $$bindings.subtotal(subtotal);
  if ($$props.tax === void 0 && $$bindings.tax && tax !== void 0) $$bindings.tax(tax);
  if ($$props.total === void 0 && $$bindings.total && total !== void 0) $$bindings.total(total);
  if ($$props.notes === void 0 && $$bindings.notes && notes !== void 0) $$bindings.notes(notes);
  if ($$props.preparedBy === void 0 && $$bindings.preparedBy && preparedBy !== void 0) $$bindings.preparedBy(preparedBy);
  let $$settled;
  let $$rendered;
  let previous_head = $$result.head;
  do {
    $$settled = true;
    $$result.head = previous_head;
    documentLabel = documentType === "quotation" ? "QUOTATION" : documentType === "sales" ? "SALES ORDER" : documentType === "purchase" ? "PURCHASE ORDER" : documentType === "delivery" ? "DELIVERY ORDER" : documentType === "bill" ? "SALES INVOICE" : documentType === "payment" ? "PAYMENT RECEIPT" : "SHIPPING LABEL";
    $$rendered = `${validate_component(Modal, "Modal").$$render(
      $$result,
      { title, size: "4xl", isOpen },
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
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `<svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
			Print`;
            }
          })} `;
        },
        default: () => {
          return `<div class="print:p-0 p-2 sm:p-4 max-h-[75vh] overflow-y-auto"> <div id="printable-area" class="print-sheet bg-white border border-gray-300 p-5 sm:p-8 shadow-sm text-gray-900 font-sans"> <div class="flex flex-col sm:flex-row justify-between items-start gap-4 border-b-2 border-gray-900 pb-4 mb-6"><div><h1 class="text-xl sm:text-2xl font-black tracking-tight text-blue-900 uppercase">${escape($appSettings.companyName)}</h1> <p class="text-xs text-gray-600 mt-1 max-w-sm">${escape($appSettings.companyAddress)}</p> <p class="text-xs text-gray-600">Phone: ${escape($appSettings.companyPhone)} | Email: ${escape($appSettings.companyEmail)}</p> <p class="text-xs text-gray-600 font-mono">Tax ID: ${escape($appSettings.companyNpwp)}</p></div> <div class="sm:text-right"><span class="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">${escape(documentLabel)}</span> <p class="text-base font-bold text-gray-800 mt-2 font-mono">${escape(documentNo)}</p> <p class="text-xs text-gray-500">Date: ${escape(date ? formatDate(date) : "-")}</p></div></div>  <div class="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6 text-sm"><div class="border rounded-lg p-3 bg-gray-50"><p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">${documentType === "purchase" ? `To Supplier / Vendor:` : `To Customer:`}</p> <p class="font-bold text-gray-900 text-base">${escape(customerOrSupplierName || "-")}</p> ${address ? `<p class="text-xs text-gray-600 mt-1">${escape(address)}</p>` : ``}</div> <div class="border rounded-lg p-3 bg-gray-50"><p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" data-svelte-h="svelte-1y1z404">Transaction Information:</p> <div class="grid grid-cols-2 gap-1 text-xs"><span class="text-gray-500" data-svelte-h="svelte-1sftyrk">Document No:</span> <span class="font-semibold text-gray-800 font-mono">${escape(documentNo)}</span> <span class="text-gray-500" data-svelte-h="svelte-13zza6i">Prepared by:</span> <span class="font-semibold text-gray-800">${escape(preparedBy || "-")}</span> <span class="text-gray-500" data-svelte-h="svelte-18quatr">Currency:</span> <span class="font-semibold text-gray-800">${escape($appSettings.currency)}</span></div></div></div>  ${documentType !== "payment" && items && items.length > 0 ? `<div class="overflow-x-auto"><table class="w-full text-xs border border-gray-300 mb-6"><thead class="bg-slate-100 border-b border-gray-300"><tr><th class="p-2 border-r border-gray-300 text-center w-10" data-svelte-h="svelte-adwohk">No</th> <th class="p-2 border-r border-gray-300 text-left" data-svelte-h="svelte-1sqsjrn">Product / Service</th> <th class="p-2 border-r border-gray-300 text-center w-20" data-svelte-h="svelte-p68nec">Qty</th> <th class="p-2 border-r border-gray-300 text-center w-16" data-svelte-h="svelte-9mron7">Unit</th> ${documentType !== "delivery" && documentType !== "sticker" ? `<th class="p-2 border-r border-gray-300 text-right w-28" data-svelte-h="svelte-12zlml0">Unit Price</th> <th class="p-2 border-r border-gray-300 text-right w-20" data-svelte-h="svelte-kk7f9g">Disc.</th> <th class="p-2 text-right w-32" data-svelte-h="svelte-1mxpvrd">Total</th>` : ``}</tr></thead> <tbody class="divide-y divide-gray-200">${each(items, (item, i) => {
            return `<tr><td class="p-2 border-r border-gray-300 text-center font-mono">${escape(i + 1)}</td> <td class="p-2 border-r border-gray-300 font-medium">${escape(item.productName || item.name)}</td> <td class="p-2 border-r border-gray-300 text-center">${escape(item.quantity)}</td> <td class="p-2 border-r border-gray-300 text-center text-gray-600">${escape(item.unit || "Pcs")}</td> ${documentType !== "delivery" && documentType !== "sticker" ? `<td class="p-2 border-r border-gray-300 text-right font-mono">${escape(formatCurrency(item.unitPrice || item.price || 0))}</td> <td class="p-2 border-r border-gray-300 text-right">${escape(item.discount ? item.discount + "%" : "-")}</td> <td class="p-2 text-right font-mono font-semibold">${escape(formatCurrency(item.total || item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)))} </td>` : ``} </tr>`;
          })}</tbody></table></div>` : ``}  ${documentType !== "delivery" && documentType !== "sticker" ? `<div class="flex flex-col sm:flex-row justify-between items-start gap-6 mb-8 text-xs"><div class="flex-1"><p class="font-bold text-gray-700 mb-1" data-svelte-h="svelte-1en27pt">Notes / Terms:</p> <p class="text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-200">${escape(notes || "Thank you for your business. This document is valid and officially generated by the accounting system.")}</p></div> <div class="w-full sm:w-64 space-y-1.5 border border-gray-300 rounded p-3 bg-gray-50"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono font-semibold">${escape(formatCurrency(subtotal || total))}</span></div> ${tax > 0 ? `<div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1kc64qu">VAT 11%:</span> <span class="font-mono font-semibold">${escape(formatCurrency(tax))}</span></div>` : ``} <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5 mt-1.5"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span class="font-mono text-blue-900">${escape(formatCurrency(total || subtotal))}</span></div></div></div>` : ``}  <div class="grid grid-cols-3 gap-4 text-center text-xs pt-4 border-t border-gray-200"><div><p class="text-gray-500 mb-16" data-svelte-h="svelte-1x8cz81">Prepared by,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">${escape(preparedBy || "Administration Staff")}</p></div> <div data-svelte-h="svelte-1nkqthh"><p class="text-gray-500 mb-16">Reviewed by / Finance,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">Supervisor</p></div> <div><p class="text-gray-500 mb-16" data-svelte-h="svelte-ucpina">Received / Approved,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[100px]">${escape(customerOrSupplierName || "Authorized Party")}</p></div></div></div></div>`;
        }
      }
    )}`;
  } while (!$$settled);
  $$unsubscribe_appSettings();
  return $$rendered;
});
export {
  PrintPreviewModal as P
};
