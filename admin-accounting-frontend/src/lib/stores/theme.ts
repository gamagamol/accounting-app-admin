import { writable } from 'svelte/store';
import { browser } from '$app/environment';

export type Theme = 'light' | 'dark';

function detectTheme(): Theme {
	if (!browser) return 'light';
	const stored = localStorage.getItem('theme') as Theme | null;
	if (stored === 'light' || stored === 'dark') return stored;
	return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
}

export const theme = writable<Theme>(detectTheme());

export function applyTheme(next: Theme) {
	if (!browser) return;
	const root = document.documentElement;
	root.classList.toggle('dark', next === 'dark');
	root.style.colorScheme = next;
	localStorage.setItem('theme', next);
}

// Keep the document class in sync with the store at all times.
theme.subscribe((value) => applyTheme(value));

export function toggleTheme() {
	theme.update((current) => (current === 'dark' ? 'light' : 'dark'));
}

export function setTheme(next: Theme) {
	theme.set(next);
}

export function initTheme() {
	if (browser) {
		theme.set(detectTheme());
	}
}
