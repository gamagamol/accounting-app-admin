import { browser } from '$app/environment';
import { writable } from 'svelte/store';
import type { User, UserRole } from '$lib/types';

const currentUser: User = {
	id: 'usr-001',
	name: 'Gama Ariefsadya',
	email: 'superadmin@byond.co.id',
	role: 'SUPER_ADMIN',
	avatar: ''
};

const SESSION_KEY = 'byond-accounting-session';
const ACCOUNTS_KEY = 'byond-accounting-accounts';
const USERS_KEY = 'byond-accounting-users';

export const initialUsers: User[] = [
	currentUser,
	{
		id: 'usr-002',
		name: 'Siti Aminah',
		email: 'siti.aminah@byond.co.id',
		role: 'SALES_ADMIN',
		avatar: ''
	},
	{
		id: 'usr-003',
		name: 'Bambang Soepomo',
		email: 'bambang.s@byond.co.id',
		role: 'ACCOUNTING_ADMIN',
		avatar: ''
	},
	{
		id: 'usr-004',
		name: 'Dewi Sartika',
		email: 'dewi.sartika@byond.co.id',
		role: 'OWNER',
		avatar: ''
	}
];

interface AuthAccount {
	user: User;
	password: string;
}

export interface AuthResult {
	ok: boolean;
	error?: string;
	user?: User;
}

const defaultAccounts: AuthAccount[] = [
	{ user: initialUsers[0], password: 'admin123' },
	{ user: initialUsers[1], password: 'sales123' },
	{ user: initialUsers[2], password: 'accounting123' },
	{ user: initialUsers[3], password: 'owner123' }
];

function readJson<T>(key: string, fallback: T): T {
	if (!browser) return fallback;

	try {
		const raw = localStorage.getItem(key);
		if (!raw) return fallback;
		return JSON.parse(raw) as T;
	} catch {
		return fallback;
	}
}

function writeJson(key: string, value: unknown) {
	if (!browser) return;
	localStorage.setItem(key, JSON.stringify(value));
}

function loadAccounts(): AuthAccount[] {
	const accounts = readJson<AuthAccount[]>(ACCOUNTS_KEY, defaultAccounts);
	if (!Array.isArray(accounts) || accounts.length === 0) {
		return defaultAccounts;
	}
	return accounts;
}

function loadUsers(): User[] {
	const users = readJson<User[]>(USERS_KEY, initialUsers);
	if (!Array.isArray(users) || users.length === 0) {
		return initialUsers;
	}
	return users;
}

function loadSession(): User | null {
	const session = readJson<User | null>(SESSION_KEY, null);
	if (!session || !session.id || !session.email || !session.role) {
		return null;
	}
	return session;
}

function persistAccounts(accounts: AuthAccount[]) {
	writeJson(ACCOUNTS_KEY, accounts);
}

function persistUsers(users: User[]) {
	writeJson(USERS_KEY, users);
}

function persistSession(nextUser: User | null) {
	if (!browser) return;
	if (nextUser) {
		writeJson(SESSION_KEY, nextUser);
	} else {
		localStorage.removeItem(SESSION_KEY);
	}
}

function normalizeEmail(email: string) {
	return email.trim().toLowerCase();
}

function syncAccountUser(accounts: AuthAccount[], nextUser: User): AuthAccount[] {
	return accounts.map((account) =>
		account.user.id === nextUser.id ? { ...account, user: nextUser } : account
	);
}

const sessionUser = loadSession();

export const user = writable<User>(sessionUser ?? currentUser);
export const isAuthenticated = writable<boolean>(Boolean(sessionUser));
export const systemUsers = writable<User[]>(loadUsers());

export function login(email: string, password: string): AuthResult {
	const normalizedEmail = normalizeEmail(email);
	const accounts = loadAccounts();
	const account = accounts.find(
		(candidate) =>
			normalizeEmail(candidate.user.email) === normalizedEmail &&
			candidate.password === password
	);

	if (!account) {
		return { ok: false, error: 'Invalid email or password.' };
	}

	user.set(account.user);
	isAuthenticated.set(true);
	persistSession(account.user);

	return { ok: true, user: account.user };
}

export function register(name: string, email: string, password: string): AuthResult {
	const trimmedName = name.trim();
	const normalizedEmail = normalizeEmail(email);

	if (trimmedName.length < 2) {
		return { ok: false, error: 'Name must be at least 2 characters.' };
	}
	if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(normalizedEmail)) {
		return { ok: false, error: 'Enter a valid email address.' };
	}
	if (password.length < 6) {
		return { ok: false, error: 'Password must be at least 6 characters.' };
	}

	const accounts = loadAccounts();
	const users = loadUsers();
	const emailExists =
		accounts.some((account) => normalizeEmail(account.user.email) === normalizedEmail) ||
		users.some((candidate) => normalizeEmail(candidate.email) === normalizedEmail);

	if (emailExists) {
		return { ok: false, error: 'That email is already registered.' };
	}

	const newUser: User = {
		id: `usr-${Date.now().toString(36)}`,
		name: trimmedName,
		email: normalizedEmail,
		role: 'SALES_ADMIN',
		avatar: ''
	};

	const nextAccounts = [...accounts, { user: newUser, password }];
	const nextUsers = [newUser, ...users];

	persistAccounts(nextAccounts);
	persistUsers(nextUsers);

	user.set(newUser);
	isAuthenticated.set(true);
	systemUsers.set(nextUsers);
	persistSession(newUser);

	return { ok: true, user: newUser };
}

export function logout() {
	isAuthenticated.set(false);
	persistSession(null);
	user.set(currentUser);
}

export function switchRole(newRole: UserRole) {
	user.update((u) => {
		const next = { ...u, role: newRole };
		const accounts = syncAccountUser(loadAccounts(), next);
		persistAccounts(accounts);
		persistSession(next);
		systemUsers.update((list) => {
			const nextList = list.map((usr) => (usr.id === next.id ? next : usr));
			persistUsers(nextList);
			return nextList;
		});
		return next;
	});
}

export function updateUserProfile(updated: Partial<User>) {
	user.update((u) => {
		const next = { ...u, ...updated };
		const accounts = syncAccountUser(loadAccounts(), next);
		persistAccounts(accounts);
		persistSession(next);
		systemUsers.update((list) => {
			const nextList = list.map((usr) => (usr.id === next.id ? next : usr));
			persistUsers(nextList);
			return nextList;
		});
		return next;
	});
}

export function addSystemUser(newUser: Omit<User, 'id'>) {
	const userObj: User = {
		id: `usr-${Date.now().toString(36)}`,
		...newUser
	};

	systemUsers.update((list) => {
		const next = [userObj, ...list];
		persistUsers(next);
		return next;
	});

	// Demo-only default password so users created from User Management can
	// also sign in. A production backend should replace this with an invite flow.
	const accounts = [...loadAccounts(), { user: userObj, password: 'changeme' }];
	persistAccounts(accounts);

	return userObj;
}

export function updateSystemUser(id: string, data: Partial<User>) {
	systemUsers.update((list) => {
		const next = list.map((u) => (u.id === id ? { ...u, ...data } : u));
		persistUsers(next);
		const updated = next.find((u) => u.id === id);
		if (updated) {
			persistAccounts(syncAccountUser(loadAccounts(), updated));
			user.update((curr) => {
				if (curr.id === id) {
					persistSession(updated);
					return updated;
				}
				return curr;
			});
		}
		return next;
	});
}

export function deleteSystemUser(id: string) {
	systemUsers.update((list) => {
		const next = list.filter((u) => u.id !== id);
		persistUsers(next);
		return next;
	});
	persistAccounts(loadAccounts().filter((account) => account.user.id !== id));
}
