import { c as create_ssr_component, v as validate_component, e as escape, f as add_attribute, g as each, l as compute_slots } from "./ssr.js";
import { B as Badge } from "./Badge.js";
const DataTableCell = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let value;
  let showBadge;
  let labels;
  let { column } = $$props;
  let { row } = $$props;
  let { badge = void 0 } = $$props;
  let { badgeLabels = void 0 } = $$props;
  if ($$props.column === void 0 && $$bindings.column && column !== void 0) $$bindings.column(column);
  if ($$props.row === void 0 && $$bindings.row && row !== void 0) $$bindings.row(row);
  if ($$props.badge === void 0 && $$bindings.badge && badge !== void 0) $$bindings.badge(badge);
  if ($$props.badgeLabels === void 0 && $$bindings.badgeLabels && badgeLabels !== void 0) $$bindings.badgeLabels(badgeLabels);
  value = row[column.key];
  showBadge = badge ?? column.badge ?? false;
  labels = badgeLabels ?? column.badgeLabels ?? {};
  return `${showBadge ? `${validate_component(Badge, "Badge").$$render(
    $$result,
    {
      status: String(value ?? ""),
      label: labels[String(value)] ?? ""
    },
    {},
    {}
  )}` : `${column.format ? `${escape(column.format(value, row))}` : `${escape(value ?? "-")}`}`}`;
});
const DataTable = create_ssr_component(($$result, $$props, $$bindings, slots) => {
  let filteredData;
  let sortedData;
  let totalPages;
  let paginatedData;
  let startRange;
  let endRange;
  let pageNumbers;
  let $$slots = compute_slots(slots);
  let { columns = [] } = $$props;
  let { data = [] } = $$props;
  let { searchable = true } = $$props;
  let { searchPlaceholder = "Search records..." } = $$props;
  let { searchKeys = [] } = $$props;
  let { pageSize = 5 } = $$props;
  let { pageSizeOptions = [5, 10, 25, 50, 100] } = $$props;
  let { emptyMessage = "No records found" } = $$props;
  let { showPagination = true } = $$props;
  let searchTerm = "";
  let currentPage = 1;
  let sortKey = "";
  let previousPageSize = pageSize;
  if ($$props.columns === void 0 && $$bindings.columns && columns !== void 0) $$bindings.columns(columns);
  if ($$props.data === void 0 && $$bindings.data && data !== void 0) $$bindings.data(data);
  if ($$props.searchable === void 0 && $$bindings.searchable && searchable !== void 0) $$bindings.searchable(searchable);
  if ($$props.searchPlaceholder === void 0 && $$bindings.searchPlaceholder && searchPlaceholder !== void 0) $$bindings.searchPlaceholder(searchPlaceholder);
  if ($$props.searchKeys === void 0 && $$bindings.searchKeys && searchKeys !== void 0) $$bindings.searchKeys(searchKeys);
  if ($$props.pageSize === void 0 && $$bindings.pageSize && pageSize !== void 0) $$bindings.pageSize(pageSize);
  if ($$props.pageSizeOptions === void 0 && $$bindings.pageSizeOptions && pageSizeOptions !== void 0) $$bindings.pageSizeOptions(pageSizeOptions);
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
    if (pageSize !== previousPageSize) {
      previousPageSize = pageSize;
      currentPage = 1;
    }
  }
  {
    if (currentPage > totalPages) {
      currentPage = totalPages;
    }
  }
  paginatedData = showPagination ? sortedData.slice((currentPage - 1) * pageSize, currentPage * pageSize) : sortedData;
  startRange = sortedData.length === 0 ? 0 : (currentPage - 1) * pageSize + 1;
  endRange = Math.min(currentPage * pageSize, sortedData.length);
  pageNumbers = (() => {
    const pages = [];
    if (totalPages <= 7) {
      for (let i = 1; i <= totalPages; i++) pages.push(i);
      return pages;
    }
    pages.push(1);
    if (currentPage > 3) pages.push("left-ellipsis");
    const start = Math.max(2, currentPage - 1);
    const end = Math.min(totalPages - 1, currentPage + 1);
    for (let i = start; i <= end; i++) pages.push(i);
    if (currentPage < totalPages - 2) pages.push("right-ellipsis");
    pages.push(totalPages);
    return pages;
  })();
  return `<div class="space-y-4"> ${searchable || $$slots.controls || showPagination ? `<div class="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">${searchable ? `<div class="relative max-w-sm w-full"><div class="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-slate-500" data-svelte-h="svelte-1b4ptap"><svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></div> <input type="text"${add_attribute("placeholder", searchPlaceholder, 0)} class="block w-full pl-9 pr-8 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-900 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:focus:ring-blue-400"${add_attribute("value", searchTerm, 0)}> ${``}</div>` : `<div></div>`} <div class="flex items-center gap-3">${slots.controls ? slots.controls({}) : ``} ${showPagination ? `<div class="flex items-center gap-1.5 text-xs text-gray-500 dark:text-slate-400"><span data-svelte-h="svelte-b2pcbx">Rows per page</span> <select class="px-2 py-1.5 rounded-lg border border-gray-300 dark:border-slate-700 bg-white dark:bg-slate-900 text-gray-800 dark:text-gray-200 text-xs focus:ring-1 focus:ring-blue-500">${each(pageSizeOptions, (opt) => {
    return `<option${add_attribute("value", opt, 0)}>${escape(opt)}</option>`;
  })}</select></div>` : ``}</div></div>` : ``}  <div class="bg-white dark:bg-slate-900 rounded-xl shadow-sm border border-gray-200 dark:border-slate-800 overflow-hidden transition-colors"><div class="overflow-x-auto min-h-[140px]"><table class="min-w-full divide-y divide-gray-200 dark:divide-slate-800"><thead class="bg-slate-50 dark:bg-slate-950/60"><tr><th class="px-4 py-3.5 text-center text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-12" data-svelte-h="svelte-7hmgak">#</th> ${each(columns, (col) => {
    return `<th class="${"px-4 py-3.5 text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider select-none " + escape(
      col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
      true
    ) + " " + escape(
      col.sortable !== false ? "cursor-pointer hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors" : "",
      true
    )}"><div class="${"inline-flex items-center gap-1.5 " + escape(
      col.align === "right" ? "justify-end" : col.align === "center" ? "justify-center" : "",
      true
    )}"><span>${escape(col.label)}</span> ${col.sortable !== false ? `<span class="text-xs text-gray-400">${sortKey === col.key ? `${escape("▲")}` : `<span class="opacity-30" data-svelte-h="svelte-12onqsz">⇅</span>`} </span>` : ``}</div> </th>`;
  })} ${$$slots.actions ? `<th class="px-4 py-3.5 text-right text-xs font-semibold text-slate-500 dark:text-slate-400 uppercase tracking-wider w-28" data-svelte-h="svelte-scloyi">Actions</th>` : ``}</tr></thead> <tbody class="divide-y divide-gray-100 dark:divide-slate-800/80 bg-white dark:bg-slate-900">${paginatedData.length === 0 ? `<tr><td${add_attribute("colspan", columns.length + 1 + ($$slots.actions ? 1 : 0), 0)} class="px-6 py-12 text-center text-sm text-gray-500 dark:text-gray-400"><div class="flex flex-col items-center justify-center space-y-2"><div class="text-gray-300 dark:text-slate-700 text-4xl" data-svelte-h="svelte-6s9m6e">📂</div> <p class="font-medium text-gray-600 dark:text-gray-300">${escape(emptyMessage)}</p> ${``}</div></td></tr>` : `${each(paginatedData, (row, idx) => {
    return `<tr class="hover:bg-slate-50/80 dark:hover:bg-slate-800/50 transition-colors"><td class="px-4 py-3 text-xs text-gray-500 dark:text-gray-400 font-mono text-center">${escape((currentPage - 1) * pageSize + idx + 1)}</td> ${each(columns, (col) => {
      return `<td class="${"px-4 py-3 text-sm text-gray-800 dark:text-gray-200 " + escape(
        col.align === "right" ? "text-right" : col.align === "center" ? "text-center" : "text-left",
        true
      )}">${$$slots.cell ? `${slots.cell ? slots.cell({ row, column: col, value: row[col.key] }) : ` ${validate_component(DataTableCell, "DataTableCell").$$render($$result, { column: col, row }, {}, {})} `}` : `${validate_component(DataTableCell, "DataTableCell").$$render($$result, { column: col, row }, {}, {})}`} </td>`;
    })} ${$$slots.actions ? `<td class="px-4 py-3 text-right text-sm font-medium whitespace-nowrap">${slots.actions ? slots.actions({ row }) : ``} </td>` : ``} </tr>`;
  })}`}</tbody></table></div>  ${showPagination && sortedData.length > 0 ? `<div class="px-4 py-3 bg-white dark:bg-slate-900 border-t border-gray-100 dark:border-slate-800 flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500 dark:text-slate-400"><div>Showing
					<span class="font-semibold text-gray-700 dark:text-gray-200">${escape(startRange)}</span>
					to
					<span class="font-semibold text-gray-700 dark:text-gray-200">${escape(endRange)}</span>
					of
					<span class="font-semibold text-gray-700 dark:text-gray-200">${escape(sortedData.length)}</span>
					entries
					<span class="mx-1.5" data-svelte-h="svelte-3x6lm1">•</span> <span>Page <strong class="text-gray-700 dark:text-gray-200">${escape(currentPage)}</strong>
						of <strong class="text-gray-700 dark:text-gray-200">${escape(totalPages)}</strong></span></div> ${totalPages > 1 ? `<div class="flex items-center gap-1"><button type="button" ${currentPage === 1 ? "disabled" : ""} class="px-2 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed" title="First page">«</button> <button type="button" ${currentPage === 1 ? "disabled" : ""} class="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">Prev</button> ${each(pageNumbers, (p) => {
    return `${typeof p === "number" ? `<button type="button" class="${"min-w-[28px] h-7 px-1.5 rounded font-medium text-xs transition-colors " + escape(
      currentPage === p ? "bg-blue-600 text-white font-bold" : "border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 text-gray-700 dark:text-gray-300",
      true
    )}">${escape(p)} </button>` : `<span class="px-1 text-gray-400 dark:text-slate-500" data-svelte-h="svelte-4ansrg">…</span>`}`;
  })} <button type="button" ${currentPage === totalPages ? "disabled" : ""} class="px-2.5 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed">Next</button> <button type="button" ${currentPage === totalPages ? "disabled" : ""} class="px-2 py-1 rounded border border-gray-200 dark:border-slate-700 hover:bg-gray-50 dark:hover:bg-slate-800 disabled:opacity-30 disabled:cursor-not-allowed" title="Last page">»</button></div>` : ``}</div>` : ``}</div></div>`;
});
export {
  DataTable as D,
  DataTableCell as a
};
