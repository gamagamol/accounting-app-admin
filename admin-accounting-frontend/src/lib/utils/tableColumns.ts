import type { TableColumn } from '$lib/types';
import { formatCurrency, formatDate, formatNumber, formatPercent } from './formatters';

type ColumnOptions = Omit<TableColumn, 'key' | 'label' | 'format'>;

export function currencyColumn(
	key: string,
	label: string,
	options: ColumnOptions = {}
): TableColumn {
	return {
		key,
		label,
		sortable: true,
		align: 'right',
		...options,
		format: (value) => formatCurrency(Number(value) || 0)
	};
}

export function numberColumn(
	key: string,
	label: string,
	options: ColumnOptions = {}
): TableColumn {
	return {
		key,
		label,
		sortable: true,
		align: 'right',
		...options,
		format: (value) => formatNumber(Number(value) || 0)
	};
}

export function percentColumn(
	key: string,
	label: string,
	options: ColumnOptions = {}
): TableColumn {
	return {
		key,
		label,
		sortable: true,
		align: 'right',
		...options,
		format: (value) => formatPercent(Number(value) || 0)
	};
}

export function dateColumn(
	key: string,
	label: string,
	options: ColumnOptions = {}
): TableColumn {
	return {
		key,
		label,
		sortable: true,
		...options,
		format: (value) => formatDate(String(value ?? ''))
	};
}

export function statusColumn(
	key: string = 'status',
	label: string = 'Status',
	options: ColumnOptions = {}
): TableColumn {
	return {
		key,
		label,
		sortable: true,
		...options,
		badge: true
	};
}
