export function formatCurrency(amount: number): string {
	return new Intl.NumberFormat('en-US', {
		style: 'currency',
		currency: 'IDR',
		minimumFractionDigits: 0,
		maximumFractionDigits: 0
	}).format(amount);
}

export function formatCompactCurrency(amount: number): string {
	if (Math.abs(amount) >= 1_000_000_000) return `IDR ${(amount / 1_000_000_000).toFixed(1)}B`;
	if (Math.abs(amount) >= 1_000_000) return `IDR ${(amount / 1_000_000).toFixed(1)}M`;
	if (Math.abs(amount) >= 1_000) return `IDR ${(amount / 1_000).toFixed(1)}K`;
	return formatCurrency(amount);
}

/**
 * Summary cards have limited width. Keep exact formatting for smaller amounts
 * and switch to a compact notation for billions so values never truncate.
 */
export function formatSummaryCurrency(amount: number): string {
	return Math.abs(amount) >= 1_000_000_000 ? formatCompactCurrency(amount) : formatCurrency(amount);
}

export function formatDate(dateStr: string): string {
	if (!dateStr) return '-';
	return new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'short',
		day: 'numeric'
	});
}

export function formatLongDate(dateStr: string): string {
	if (!dateStr) return '-';
	return new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: 'long',
		day: 'numeric'
	});
}

export function formatShortDate(dateStr: string): string {
	if (!dateStr) return '-';
	return new Date(dateStr).toLocaleDateString('en-US', {
		year: 'numeric',
		month: '2-digit',
		day: '2-digit'
	});
}

export function formatNumber(num: number): string {
	return new Intl.NumberFormat('en-US').format(num);
}

export function formatPercent(value: number, digits: number = 1): string {
	return `${value.toFixed(digits)}%`;
}

export function getStatusColor(status: string): string {
	const colors: Record<string, string> = {
		pending: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
		draft: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
		created: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		reopen: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
		reopened: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
		submitted: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		in_progress: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		inprogress: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		revised: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
		over_budget: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		quotation: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		sales: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-500/15 dark:text-indigo-200',
		sent: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		approved: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		completed: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		delivered: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		shipped: 'bg-cyan-100 text-cyan-800 dark:bg-cyan-500/15 dark:text-cyan-200',
		received: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		paid: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		active: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		inactive: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		rejected: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		cancelled: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		overdue: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		partial: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200',
		open: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		closed: 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200',
		posted: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		reconciled: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		discrepancy: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		goods: 'bg-blue-100 text-blue-800 dark:bg-blue-500/15 dark:text-blue-200',
		service: 'bg-purple-100 text-purple-800 dark:bg-purple-500/15 dark:text-purple-200',
		in: 'bg-emerald-100 text-emerald-800 dark:bg-emerald-500/15 dark:text-emerald-200',
		out: 'bg-rose-100 text-rose-800 dark:bg-rose-500/15 dark:text-rose-200',
		adjustment: 'bg-amber-100 text-amber-800 dark:bg-amber-500/15 dark:text-amber-200'
	};
	return colors[status?.toLowerCase()] || 'bg-slate-100 text-slate-700 dark:bg-slate-700/40 dark:text-slate-200';
}

export function generateId(): string {
	return Math.random().toString(36).substring(2, 11);
}
