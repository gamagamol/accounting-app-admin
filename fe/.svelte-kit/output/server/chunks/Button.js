import { c as create_ssr_component, f as createEventDispatcher, d as add_attribute, b as each, e as escape, h as compute_slots } from "./ssr.js";
const DataTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredData;
  let sortedData;
  let totalPages;
  let paginatedData;
  let startRange;
  let endRange;
  let $$slots = compute_slots(slots);
  let { columns = [] } = $$props;
  let { data = [] } = $$props;
  let { searchable = true } = $$props;
  let { searchPlaceholder = "Cari data..." } = $$props;
  let { searchKeys = [] } = $$props;
  let { pageSize = 10 } = $$props;
  let { emptyMessage = "Tidak ada data ditemukan" } = $$props;
  let { showPagination = true } = $$props;
  createEventDispatcher();
  let searchTerm = "";
  let currentPage = 1;
  let sortKey = "";
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0) $$bindings.columns(columns);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.searchable === void 0 && $$bindings.searchable && searchable !== void 0) $$bindings.searchable(searchable);
  if ($$props.searchPlaceholder === void 0 && $$bindings.searchPlaceholder && searchPlaceholder !== void 0) $$bindings.searchPlaceholder(searchPlaceholder);
  if ($$props.searchKeys === void 0 && $$bindings.searchKeys && searchKeys !== void 0) $$bindings.searchKeys(searchKeys);
  if ($$props.pageSize === void 0 && $$bindings.pageSize && pageSize !== void 0) $$bindings.pageSize(pageSize);
  if ($$props.emptyMessage === void 0 && $$bindings.emptyMessage && emptyMessage !== void 0) $$bindings.emptyMessage(emptyMessage);
  if ($$props.showPagination === void 0 && $$bindings.showPagination && showPagination !== void 0) $$bindings.showPagination(showPagination);
  filteredData = data.filter((row) => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    const keysToCheck = searchKeys.length > 0 ? searchKeys : columns.map((c) => c.key);
    return keysToCheck.some((key) => {
      const val = row[key];
      if (val === null || val === void 0) return false;
      return String(val).toLowerCase().includes(term);
    });
  });
  sortedData = [...filteredData].sort((a, b) => {
    return 0;
  });
  totalPages = Math.max(1, Math.ceil(sortedData.length / pageSize));
  {
    {
      if (currentPage > totalPages) {
        currentPage = totalPages;
      }
    }
  }
  paginatedData = showPagination ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData;
  startRange = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  endRange = Math.min(currentPage * pageSize, sortedData.length);
  return `<div class="space-y-4"> ${searchable || $$slots.controls ? `<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">${searchable ? `<div class="relative max-w-sm w-full"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400" data-svelte-h="svelte-typnto"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <input type="text"${add_attribute("placeholder", searchPlaceholder, 0)} class="block w-full pl-9 pr-4 py-2 border border-gray-300 rounded-lg text-sm bg-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"${add_attribute("value", searchTerm, 0)}> ${``}</div>` : `<div></div>`} <div class="flex items-center gap-2">${slots.controls ? slots.controls({}) : ``}</div></div>` : ``}  <div class="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden"><div class="overflow-x-auto min-h-[160px]"><table class="min-w-full divide-y divide-gray-200"><thead class="bg-slate-50"><tr><th class="px-4 py-3.5 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider w-12 text-center" data-svelte-h="svelte-7h42qi">No</th> ${each(columns, (col) => {
    return `<th class="${"px-4 py-3.5 text-xs font-semibold text-slate-500 uppercase tracking-wider select-none " + escape(
      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
      true
    ) + " " + escape(
      col.sortable !== false ? "cursor-pointer hover:bg-slate-100 transition-colors" : "",
      true
    )}"><div class="${"inline-flex items-center gap-1.5 " + escape(
      col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "",
      true
    )}"><span>${escape(col.label)}</span> ${col.sortable !== false ? `<span class="text-xs text-gray-400">${sortKey === col.key ? `${escape("▲")}` : `<span class="opacity-30" data-svelte-h="svelte-12onqsz">⇅</span>`} </span>` : ``}</div> </th>`;
  })} ${$$slots.actions ? `<th class="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 uppercase tracking-wider w-36" data-svelte-h="svelte-qt2iaj">Aksi</th>` : ``}</tr></thead> <tbody class="divide-y divide-gray-100 bg-white">${paginatedData.length === 0 ? `<tr><td${add_attribute("colspan", columns.length + 1 + ($$slots.actions ? 1 : 0), 0)} class="px-6 py-12 text-center text-sm text-gray-500"><div class="flex flex-col items-center justify-center space-y-2"><div class="text-gray-300 text-4xl" data-svelte-h="svelte-6ycpdx">📂</div> <p class="font-medium text-gray-600">${escape(emptyMessage)}</p> ${``}</div></td></tr>` : `${each(paginatedData, (row, idx) => {
    return `<tr class="hover:bg-slate-50/80 transition-colors"><td class="px-4 py-3 text-xs text-gray-500 font-mono text-center">${escape((currentPage - 1) * pageSize + idx + 1)}</td> ${each(columns, (col) => {
      return `<td class="${"px-4 py-3 text-sm text-gray-800 " + escape(
        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
        true
      )}">${$$slots.cell ? `${slots.cell ? slots.cell({ row, column: col, value: row[col.key] }) : ` ${escape(col.format ? col.format(row[col.key], row) : row[col.key] ?? "-")} `}` : `${col.format ? `${escape(col.format(row[col.key], row))}` : `${escape(row[col.key] ?? "-")}`}`} </td>`;
    })} ${$$slots.actions ? `<td class="px-4 py-3 text-right text-sm font-medium whitespace-nowrap">${slots.actions ? slots.actions({ row }) : ``} </td>` : ``} </tr>`;
  })}`}</tbody></table></div>  ${showPagination && sortedData.length > 0 ? `<div class="px-4 py-3 bg-white border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500"><div>Menampilkan <span class="font-semibold text-gray-700">${escape(startRange)}</span> - <span class="font-semibold text-gray-700">${escape(endRange)}</span> dari <span class="font-semibold text-gray-700">${escape(sortedData.length)}</span> data</div> ${totalPages > 1 ? `<div class="flex items-center gap-1"><button type="button" ${currentPage === 1 ? "disabled" : ""} class="px-2.5 py-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Sebelumnya</button> <div class="px-2 font-medium text-gray-700">Halaman ${escape(currentPage)} / ${escape(totalPages)}</div> <button type="button" ${currentPage === totalPages ? "disabled" : ""} class="px-2.5 py-1.5 rounded border border-gray-200 hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed">Selanjutnya</button></div>` : ``}</div>` : ``}</div></div>`;
});
const Button = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let { variant = "primary" } = $$props;
  let { size = "md" } = $$props;
  let { href = "" } = $$props;
  let { type = "button" } = $$props;
  let { disabled = false } = $$props;
  const variantClasses = {
    primary: "bg-blue-600 hover:bg-blue-700 text-white",
    secondary: "bg-gray-200 hover:bg-gray-300 text-gray-800",
    success: "bg-green-600 hover:bg-green-700 text-white",
    danger: "bg-red-600 hover:bg-red-700 text-white",
    warning: "bg-yellow-500 hover:bg-yellow-600 text-white",
    info: "bg-cyan-500 hover:bg-cyan-600 text-white"
  };
  const sizeClasses = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-4 py-2 text-sm",
    lg: "px-6 py-3 text-base"
  };
  if ($$props.variant === void 0 && $$bindings.variant && variant !== void 0) $$bindings.variant(variant);
  if ($$props.size === void 0 && $$bindings.size && size !== void 0) $$bindings.size(size);
  if ($$props.href === void 0 && $$bindings.href && href !== void 0) $$bindings.href(href);
  if ($$props.type === void 0 && $$bindings.type && type !== void 0) $$bindings.type(type);
  if ($$props.disabled === void 0 && $$bindings.disabled && disabled !== void 0) $$bindings.disabled(disabled);
  return `${href ? `<a${add_attribute("href", href, 0)} class="${"inline-flex items-center gap-2 rounded-lg font-medium transition-colors " + escape(variantClasses[variant], true) + " " + escape(sizeClasses[size], true) + " " + escape(disabled ? "opacity-50 pointer-events-none" : "", true)}">${slots.default ? slots.default({}) : ``}</a>` : `<button${add_attribute("type", type, 0)} ${disabled ? "disabled" : ""} class="${"inline-flex items-center gap-2 rounded-lg font-medium transition-colors " + escape(variantClasses[variant], true) + " " + escape(sizeClasses[size], true) + " disabled:opacity-50 disabled:cursor-not-allowed"}">${slots.default ? slots.default({}) : ``}</button>`}`;
});
export {
  Button as B,
  DataTable as D
};
