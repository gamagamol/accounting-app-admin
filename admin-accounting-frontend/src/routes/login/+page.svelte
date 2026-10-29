<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { page } from '$app/stores';
	import { isAuthenticated, login } from '$lib/stores/auth';

	const demoAccounts = [
		{ label: 'Super Admin', email: 'ahmad.fauzi@byond.co.id', password: 'admin123' },
		{ label: 'Sales Admin', email: 'siti.aminah@byond.co.id', password: 'sales123' },
		{ label: 'Accounting', email: 'bambang.s@byond.co.id', password: 'accounting123' },
		{ label: 'Owner', email: 'dewi.sartika@byond.co.id', password: 'owner123' }
	];

	let email = '';
	let password = '';
	let error = '';
	let isSubmitting = false;

	function safeRedirect(value: string | null) {
		if (!value || !value.startsWith('/') || value.startsWith('//')) return '/dashboard';
		if (
			value === '/login' ||
			value.startsWith('/login?') ||
			value === '/register' ||
			value.startsWith('/register?')
		) {
			return '/dashboard';
		}
		return value;
	}

	$: redirectTo = safeRedirect($page.url.searchParams.get('redirect'));

	onMount(() => {
		if ($isAuthenticated) {
			goto(redirectTo, { replaceState: true });
		}
	});

	function handleSubmit() {
		error = '';
		isSubmitting = true;

		const result = login(email, password);
		if (!result.ok) {
			error = result.error ?? 'Unable to sign in.';
			isSubmitting = false;
			return;
		}

		goto(redirectTo, { replaceState: true });
	}

	function useDemoAccount(demoEmail: string, demoPassword: string) {
		email = demoEmail;
		password = demoPassword;
		error = '';
	}
</script>

<svelte:head>
	<title>Sign in · Byond Accounting</title>
</svelte:head>

<div class="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10 font-sans text-slate-800 dark:text-slate-200">
	<div class="w-full max-w-5xl grid lg:grid-cols-[1.05fr_0.95fr] gap-8 items-stretch">
		<section class="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-blue-700 via-blue-600 to-indigo-700 p-10 text-white shadow-2xl shadow-blue-900/20">
			<div>
				<div class="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur">
					<span class="text-xl">📘</span>
					<span>BYOND ACCOUNTING</span>
				</div>
				<h1 class="mt-10 text-4xl font-bold leading-tight">Run your finance operations from one clean workspace.</h1>
				<p class="mt-5 max-w-md text-sm leading-6 text-blue-100">
					Track sales, purchasing, inventory, and financial reports with a role-aware approval flow built for growing teams.
				</p>
			</div>
			<div class="grid grid-cols-3 gap-3 text-center text-xs">
				<div class="rounded-2xl bg-white/10 px-3 py-4 backdrop-blur">
					<p class="text-lg font-bold">21</p>
					<p class="mt-1 text-blue-100">Approval flows</p>
				</div>
				<div class="rounded-2xl bg-white/10 px-3 py-4 backdrop-blur">
					<p class="text-lg font-bold">4</p>
					<p class="mt-1 text-blue-100">Role levels</p>
				</div>
				<div class="rounded-2xl bg-white/10 px-3 py-4 backdrop-blur">
					<p class="text-lg font-bold">1</p>
					<p class="mt-1 text-blue-100">Source of truth</p>
				</div>
			</div>
		</section>

		<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">
			<div class="lg:hidden mb-8 flex items-center gap-3 text-blue-700 dark:text-blue-400">
				<span class="text-3xl">📘</span>
				<div>
					<p class="text-sm font-bold tracking-wide">BYOND ACCOUNTING</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Finance workspace</p>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Welcome back</p>
				<h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Sign in to your account</h2>
				<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">Use one of the demo accounts below or your registered credentials.</p>
			</div>

			<form class="mt-7 space-y-4" on:submit|preventDefault={handleSubmit}>
				<label class="block">
					<span class="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Email address</span>
					<input
						bind:value={email}
						type="email"
						required
						autocomplete="email"
						placeholder="you@company.co.id"
						class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
					/>
				</label>

				<label class="block">
					<span class="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</span>
					<input
						bind:value={password}
						type="password"
						required
						autocomplete="current-password"
						placeholder="Enter your password"
						class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
					/>
				</label>

				{#if error}
					<p class="rounded-xl border border-red-200 bg-red-50 px-3.5 py-2.5 text-xs font-medium text-red-700 dark:border-red-500/30 dark:bg-red-500/10 dark:text-red-300">
						{error}
					</p>
				{/if}

				<button
					type="submit"
					disabled={isSubmitting}
					class="w-full rounded-xl bg-blue-600 px-4 py-2.5 text-sm font-semibold text-white shadow-lg shadow-blue-600/20 transition hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
				>
					{isSubmitting ? 'Signing in…' : 'Sign in'}
				</button>
			</form>

			<div class="mt-7">
				<div class="flex items-center gap-3">
					<div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
					<span class="text-[11px] font-semibold uppercase tracking-wider text-slate-400">Demo accounts</span>
					<div class="h-px flex-1 bg-slate-200 dark:bg-slate-800"></div>
				</div>

				<div class="mt-4 grid grid-cols-2 gap-2">
					{#each demoAccounts as demo}
						<button
							type="button"
							on:click={() => useDemoAccount(demo.email, demo.password)}
							class="rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-left transition hover:border-blue-300 hover:bg-blue-50 dark:border-slate-800 dark:bg-slate-950 dark:hover:border-blue-500/40 dark:hover:bg-blue-500/10"
						>
							<span class="block text-[11px] font-bold text-slate-700 dark:text-slate-200">{demo.label}</span>
							<span class="mt-0.5 block truncate text-[10px] text-slate-500 dark:text-slate-400">{demo.email}</span>
							<span class="mt-0.5 block text-[10px] font-medium text-slate-400 dark:text-slate-500">Password: {demo.password}</span>
						</button>
					{/each}
				</div>
			</div>

			<p class="mt-7 text-center text-xs text-slate-500 dark:text-slate-400">
				New to Byond Accounting?
				<a href="/register" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">Create an account</a>
			</p>
		</section>
	</div>
</div>
