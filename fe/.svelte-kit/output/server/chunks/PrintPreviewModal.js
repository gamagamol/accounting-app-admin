import { c as create_ssr_component, s as subscribe, v as validate_component, e as escape, b as each } from "./ssr.js";
import { M as Modal } from "./FormField.js";
import { B as Button } from "./Button.js";
import { f as formatDate, a as formatCurrency } from "./formatters.js";
import { a as appSettings } from "./dataStore.js";
const PrintPreviewModal = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let $appSettings, $$unsubscribe_appSettings;
  $$unsubscribe_appSettings = subscribe(appSettings, (value) => $appSettings = value);
  let { isOpen = false } = $$props;
  let { title = "Cetak Dokumen" } = $$props;
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
              return `Tutup`;
            }
          })} ${validate_component(Button, "Button").$$render($$result, { variant: "primary" }, {}, {
            default: () => {
              return `<svg class="w-4 h-4 mr-1.5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 17h2a2 2 0 002-2v-4a2 2 0 00-2-2H5a2 2 0 00-2 2v4a2 2 0 002 2h2m2 4h6a2 2 0 002-2v-4a2 2 0 00-2-2H9a2 2 0 00-2 2v4a2 2 0 002 2zm8-12V5a2 2 0 00-2-2H9a2 2 0 00-2 2v4h10z"></path></svg>
      Cetak / Print`;
            }
          })} `;
        },
        default: () => {
          return `<div class="print:p-0 p-4 max-h-[75vh] overflow-y-auto"> <div id="printable-area" class="bg-white border border-gray-300 p-8 shadow-sm text-gray-900 font-sans"> <div class="flex justify-between items-start border-b-2 border-gray-900 pb-4 mb-6"><div><h1 class="text-2xl font-black tracking-tight text-blue-900 uppercase">${escape($appSettings.companyName)}</h1> <p class="text-xs text-gray-600 mt-1 max-w-sm">${escape($appSettings.companyAddress)}</p> <p class="text-xs text-gray-600">Telp: ${escape($appSettings.companyPhone)} | Email: ${escape($appSettings.companyEmail)}</p> <p class="text-xs text-gray-600 font-mono">NPWP: ${escape($appSettings.companyNpwp)}</p></div> <div class="text-right"><span class="inline-block px-3 py-1 bg-slate-900 text-white text-xs font-bold uppercase tracking-wider rounded">${documentType === "quotation" ? `SURAT PENAWARAN HARGA` : `${documentType === "sales" ? `SALES ORDER (SURAT PESANAN)` : `${documentType === "purchase" ? `PURCHASE ORDER (PO PEMBELIAN)` : `${documentType === "delivery" ? `SURAT JALAN / DELIVERY ORDER` : `${documentType === "bill" ? `FAKTUR TAGIHAN / INVOICE` : `${documentType === "payment" ? `KUITANSI / BUKTI PEMBAYARAN` : `${documentType === "sticker" ? `LABEL PENGIRIMAN` : ``}`}`}`}`}`}`}</span> <p class="text-base font-bold text-gray-800 mt-2 font-mono">${escape(documentNo)}</p> <p class="text-xs text-gray-500">Tanggal: ${escape(date ? formatDate(date) : "-")}</p></div></div>  <div class="grid grid-cols-2 gap-6 mb-6 text-sm"><div class="border rounded-lg p-3 bg-gray-50/50"><p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1">${["purchase"].includes(documentType) ? `Kepada Supplier / Vendor:` : `Kepada Customer / Yth:`}</p> <p class="font-bold text-gray-900 text-base">${escape(customerOrSupplierName || "-")}</p> ${address ? `<p class="text-xs text-gray-600 mt-1">${escape(address)}</p>` : ``}</div> <div class="border rounded-lg p-3 bg-gray-50/50"><p class="text-xs font-bold text-gray-500 uppercase tracking-wider mb-1" data-svelte-h="svelte-1n7mv2s">Informasi Transaksi:</p> <div class="grid grid-cols-2 gap-1 text-xs"><span class="text-gray-500" data-svelte-h="svelte-qgm8uk">Nomor Dokumen:</span> <span class="font-semibold text-gray-800 font-mono">${escape(documentNo)}</span> <span class="text-gray-500" data-svelte-h="svelte-btyb2d">Dibuat Oleh:</span> <span class="font-semibold text-gray-800">${escape(preparedBy || "-")}</span> <span class="text-gray-500" data-svelte-h="svelte-yj2g5m">Mata Uang:</span> <span class="font-semibold text-gray-800">${escape($appSettings.currency)}</span></div></div></div>  ${documentType !== "payment" && items && items.length > 0 ? `<table class="w-full text-xs border border-gray-300 mb-6"><thead class="bg-slate-100 border-b border-gray-300"><tr><th class="p-2 border-r border-gray-300 text-center w-10" data-svelte-h="svelte-adwohk">No</th> <th class="p-2 border-r border-gray-300 text-left" data-svelte-h="svelte-1khqup8">Nama Produk / Jasa</th> <th class="p-2 border-r border-gray-300 text-center w-20" data-svelte-h="svelte-p68nec">Qty</th> <th class="p-2 border-r border-gray-300 text-center w-16" data-svelte-h="svelte-gszzed">Satuan</th> ${documentType !== "delivery" && documentType !== "sticker" ? `<th class="p-2 border-r border-gray-300 text-right w-28" data-svelte-h="svelte-km5as6">Harga Satuan</th> <th class="p-2 border-r border-gray-300 text-right w-20" data-svelte-h="svelte-11doq61">Diskon</th> <th class="p-2 text-right w-32" data-svelte-h="svelte-1mxpvrd">Total</th>` : ``}</tr></thead> <tbody class="divide-y divide-gray-200">${each(items, (item, i) => {
            return `<tr><td class="p-2 border-r border-gray-300 text-center font-mono">${escape(i + 1)}</td> <td class="p-2 border-r border-gray-300 font-medium">${escape(item.productName || item.name)}</td> <td class="p-2 border-r border-gray-300 text-center">${escape(item.quantity)}</td> <td class="p-2 border-r border-gray-300 text-center text-gray-600">${escape(item.unit || "Pcs")}</td> ${documentType !== "delivery" && documentType !== "sticker" ? `<td class="p-2 border-r border-gray-300 text-right font-mono">${escape(formatCurrency(item.unitPrice || item.price || 0))}</td> <td class="p-2 border-r border-gray-300 text-right">${escape(item.discount ? item.discount + "%" : "-")}</td> <td class="p-2 text-right font-mono font-semibold">${escape(formatCurrency(item.total || item.quantity * item.unitPrice * (1 - (item.discount || 0) / 100)))}</td>` : ``} </tr>`;
          })}</tbody></table>` : ``}  ${documentType !== "delivery" && documentType !== "sticker" ? `<div class="flex justify-between items-start gap-6 mb-8 text-xs"><div class="flex-1"><p class="font-bold text-gray-700 mb-1" data-svelte-h="svelte-vu83fs">Catatan / Ketentuan:</p> <p class="text-gray-600 italic bg-gray-50 p-2.5 rounded border border-gray-200">${escape(notes || "Terima kasih atas kerja samanya. Dokumen ini sah dan dikeluarkan secara resmi oleh sistem komputerisasi.")}</p></div> <div class="w-64 space-y-1.5 border border-gray-300 rounded p-3 bg-gray-50/50"><div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-1ytwh2c">Subtotal:</span> <span class="font-mono font-semibold">${escape(formatCurrency(subtotal || total))}</span></div> ${tax > 0 ? `<div class="flex justify-between text-gray-600"><span data-svelte-h="svelte-jsgqoh">PPN 11%:</span> <span class="font-mono font-semibold">${escape(formatCurrency(tax))}</span></div>` : ``} <div class="flex justify-between text-base font-bold text-gray-900 border-t border-gray-300 pt-1.5 mt-1.5"><span data-svelte-h="svelte-ukqv8i">Total:</span> <span class="font-mono text-blue-900">${escape(formatCurrency(total || subtotal))}</span></div></div></div>` : ``}  <div class="grid grid-cols-3 gap-6 text-center text-xs pt-4 border-t border-gray-200"><div><p class="text-gray-500 mb-16" data-svelte-h="svelte-1fqhbag">Dibuat Oleh,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">${escape(preparedBy || "Staff Administrasi")}</p></div> <div data-svelte-h="svelte-10wjzyy"><p class="text-gray-500 mb-16">Mengetahui / Finance,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">Supervisor</p></div> <div><p class="text-gray-500 mb-16" data-svelte-h="svelte-1btv2bt">Diterima / Disetujui,</p> <p class="font-bold text-gray-800 border-b border-gray-400 pb-1 inline-block min-w-[120px]">${escape(customerOrSupplierName || "Pihak Terkait")}</p></div></div></div></div>`;
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
