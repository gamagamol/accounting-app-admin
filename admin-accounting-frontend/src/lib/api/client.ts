import { writable } from 'svelte/store';
import { browser } from '$app/environment';

const env = import.meta.env as Record<string, string | undefined>;
const configuredBaseUrl = (env.VITE_API_BASE_URL ?? '').replace(/\/$/, '');

export const apiBaseUrl = configuredBaseUrl;
export const isApiConfigured = configuredBaseUrl.length > 0;

export type ApiMode = 'mock' | 'live';
export type ApiCallStatus = 'success' | 'error' | 'mock';

export interface ApiCallLog {
	id: string;
	method: string;
	path: string;
	payload?: unknown;
	status: ApiCallStatus;
	mode: ApiMode;
	at: string;
	message?: string;
}

export interface ApiResult<T> {
	success: boolean;
	data: T;
	message?: string;
}

export const apiCalls = writable<ApiCallLog[]>([]);

export function clearApiCalls() {
	apiCalls.set([]);
}

function recordCall(entry: Omit<ApiCallLog, 'id' | 'at'>) {
	apiCalls.update((list) =>
		[
			{
				id: `api-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 6)}`,
				at: new Date().toISOString(),
				...entry
			},
			...list
		].slice(0, 50)
	);
}

interface RequestOptions {
	method?: 'GET' | 'POST' | 'PUT' | 'PATCH' | 'DELETE';
	body?: unknown;
	headers?: Record<string, string>;
}

/**
 * Central API gateway.
 *
 * When VITE_API_BASE_URL is not configured the request is not sent to the
 * network. The payload is logged (and exposed through `apiCalls`) so the
 * frontend can be wired to admin-accounting-backend later without changing
 * any screen. Business rules and persistence stay on the backend.
 */
export async function apiRequest<T>(
	path: string,
	options: RequestOptions = {}
): Promise<ApiResult<T>> {
	const method = options.method ?? 'GET';
	const normalizedPath = path.startsWith('/') ? path : `/${path}`;
	const versionedPath = normalizedPath.startsWith('/api/v1/')
		? normalizedPath
		: normalizedPath.startsWith('/api/')
			? normalizedPath.replace(/^\/api\//, '/api/v1/')
			: normalizedPath;

	if (!isApiConfigured) {
		const message = 'API base URL is not configured; payload captured in mock mode.';
		recordCall({
			method,
			path: versionedPath,
			payload: options.body,
			status: 'mock',
			mode: 'mock',
			message
		});

		if (browser) {
			console.info(`[accounting-api:mock] ${method} ${versionedPath}`, options.body ?? '(no body)');
		}

		return {
			success: true,
			data: options.body as T,
			message
		};
	}

	const url = `${configuredBaseUrl}${versionedPath}`;

	try {
		const response = await fetch(url, {
			method,
			headers: {
				'Content-Type': 'application/json',
				Accept: 'application/json',
				...options.headers
			},
			body: options.body === undefined ? undefined : JSON.stringify(options.body)
		});

		const text = await response.text();
		const parsed = text ? JSON.parse(text) : null;

		if (!response.ok) {
			const message =
				(parsed && (parsed.message as string)) || `Request failed with status ${response.status}`;
			recordCall({
				method,
				path: versionedPath,
				payload: options.body,
				status: 'error',
				mode: 'live',
				message
			});
			throw new Error(message);
		}

		recordCall({
			method,
			path: versionedPath,
			payload: options.body,
			status: 'success',
			mode: 'live'
		});

		return {
			success: true,
			data: (parsed?.data ?? parsed) as T,
			message: parsed?.message
		};
	} catch (error) {
		if (error instanceof Error) {
			if (!error.message.startsWith('Request failed')) {
				recordCall({
					method,
					path: versionedPath,
					payload: options.body,
					status: 'error',
					mode: 'live',
					message: error.message
				});
			}
			throw error;
		}
		throw new Error('Unknown API error');
	}
}
