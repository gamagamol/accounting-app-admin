import { writable } from 'svelte/store';
import type { User, UserRole } from '$lib/types';
import { currentUser, employees } from '$lib/data/mock-data';

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

export const user = writable<User>(currentUser);
export const isAuthenticated = writable<boolean>(true);
export const systemUsers = writable<User[]>(initialUsers);

export function switchRole(newRole: UserRole) {
	user.update((u) => ({
		...u,
		role: newRole
	}));
}

export function updateUserProfile(updated: Partial<User>) {
	user.update((u) => {
		const next = { ...u, ...updated };
		systemUsers.update((list) => list.map((usr) => (usr.id === next.id ? next : usr)));
		return next;
	});
}

export function addSystemUser(newUser: Omit<User, 'id'>) {
	const userObj: User = {
		id: `usr-${Date.now().toString(36)}`,
		...newUser
	};
	systemUsers.update((list) => [userObj, ...list]);
	return userObj;
}

export function updateSystemUser(id: string, data: Partial<User>) {
	systemUsers.update((list) =>
		list.map((u) => (u.id === id ? { ...u, ...data } : u))
	);
	user.update((curr) => (curr.id === id ? { ...curr, ...data } : curr));
}

export function deleteSystemUser(id: string) {
	systemUsers.update((list) => list.filter((u) => u.id !== id));
}
