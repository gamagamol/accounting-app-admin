import { derived, writable } from 'svelte/store';
import { periodClosings } from './dataStore';

/** The fiscal year currently running in real life. */
export const currentFiscalYear = new Date().getFullYear();

/**
 * Selected fiscal year in the navbar. `currentFiscalYear` means the running
 * year; any other value is a closed/archived year that must remain readable.
 */
export const selectedFiscalYear = writable<number>(currentFiscalYear);

export const fiscalYearLabel = derived(selectedFiscalYear, ($year) =>
	$year === currentFiscalYear ? 'Current Financial Year' : String($year)
);

/** Years that have period records, newest first, always including the current year. */
export const availableFiscalYears = derived(periodClosings, ($periods) => {
	const years = new Set<number>([currentFiscalYear]);
	for (const period of $periods) {
		const year = Number(String(period.startDate).slice(0, 4));
		if (Number.isFinite(year) && year > 1900) years.add(year);
	}
	return [...years].sort((a, b) => b - a);
});

export function fiscalYearValue(year: number): string {
	return String(year);
}
