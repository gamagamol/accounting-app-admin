<script lang="ts">
	import { onMount } from 'svelte';
	import { goto } from '$app/navigation';
	import { isAuthenticated, register } from '$lib/stores/auth';

	let name = '';
	let email = '';
	let password = '';
	let confirmPassword = '';
	let error = '';
	let isSubmitting = false;

	onMount(() => {
		if ($isAuthenticated) {
			goto('/dashboard', { replaceState: true });
		}
	});

	function handleSubmit() {
		error = '';

		if (password !== confirmPassword) {
			error = 'Passwords do not match.';
			return;
		}

		isSubmitting = true;
		const result = register(name, email, password);
		if (!result.ok) {
			error = result.error ?? 'Unable to create your account.';
			isSubmitting = false;
			return;
		}

		goto('/dashboard', { replaceState: true });
	}
</script>

<svelte:head>
	<title>Create account · Byond Accounting</title>
</svelte:head>

<div class="min-h-screen bg-slate-100 dark:bg-slate-950 flex items-center justify-center px-4 py-10 font-sans text-slate-800 dark:text-slate-200">
	<div class="w-full max-w-5xl grid lg:grid-cols-[0.95fr_1.05fr] gap-8 items-stretch">
		<section class="rounded-3xl border border-slate-200 bg-white p-6 shadow-xl shadow-slate-200/60 dark:border-slate-800 dark:bg-slate-900 dark:shadow-black/20 sm:p-9">
			<div class="mb-8 flex items-center gap-3 text-blue-700 dark:text-blue-400">
				<span class="text-3xl">📘</span>
				<div>
					<p class="text-sm font-bold tracking-wide">BYOND ACCOUNTING</p>
					<p class="text-xs text-slate-500 dark:text-slate-400">Finance workspace</p>
				</div>
			</div>

			<div>
				<p class="text-xs font-semibold uppercase tracking-[0.2em] text-blue-600 dark:text-blue-400">Get started</p>
				<h2 class="mt-2 text-2xl font-bold text-slate-900 dark:text-white">Create your account</h2>
				<p class="mt-2 text-sm text-slate-500 dark:text-slate-400">
					New accounts start with the Sales Admin role. An administrator can change it later from User Management.
				</p>
			</div>

			<form class="mt-7 space-y-4" on:submit|preventDefault={handleSubmit}>
				<label class="block">
					<span class="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Full name</span>
					<input
						bind:value={name}
						type="text"
						required
						autocomplete="name"
						placeholder="Your full name"
						class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
					/>
				</label>

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

				<div class="grid gap-4 sm:grid-cols-2">
					<label class="block">
						<span class="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Password</span>
						<input
							bind:value={password}
							type="password"
							required
							autocomplete="new-password"
							placeholder="At least 6 characters"
							class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
						/>
					</label>

					<label class="block">
						<span class="mb-1.5 block text-xs font-semibold text-slate-700 dark:text-slate-300">Confirm password</span>
						<input
							bind:value={confirmPassword}
							type="password"
							required
							autocomplete="new-password"
							placeholder="Repeat your password"
							class="w-full rounded-xl border border-slate-300 bg-white px-3.5 py-2.5 text-sm text-slate-900 outline-none transition placeholder:text-slate-400 focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 dark:border-slate-700 dark:bg-slate-950 dark:text-white dark:placeholder:text-slate-500"
						/>
					</label>
				</div>

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
					{isSubmitting ? 'Creating account…' : 'Create account'}
				</button>
			</form>

			<p class="mt-7 text-center text-xs text-slate-500 dark:text-slate-400">
				Already have an account?
				<a href="/login" class="font-semibold text-blue-600 hover:underline dark:text-blue-400">Sign in</a>
			</p>
		</section>

		<section class="hidden lg:flex flex-col justify-between rounded-3xl bg-gradient-to-br from-indigo-700 via-blue-600 to-blue-700 p-10 text-white shadow-2xl shadow-blue-900/20">
			<div>
				<div class="inline-flex items-center gap-3 rounded-2xl bg-white/10 px-4 py-2 text-sm font-semibold tracking-wide backdrop-blur">
					<span class="text-xl">✨</span>
					<span>ONE WORKSPACE</span>
				</div>
				<h1 class="mt-10 text-4xl font-bold leading-tight">From quotation to financial statement.</h1>
				<p class="mt-5 max-w-md text-sm leading-6 text-blue-100">
					Bring sales, purchasing, inventory, and accounting into a single flow with clear approvals and audit visibility.
				</p>
			</div>
			<ul class="space-y-3 text-sm text-blue-50">
				<li class="flex items-center gap-3"><span class="grid h-6 w-6 place-items-center rounded-full bg-white/15">✓</span> Role-aware approval workflow</li>
				<li class="flex items-center gap-3"><span class="grid h-6 w-6 place-items-center rounded-full bg-white/15">✓</span> Inventory and stock card visibility</li>
				<li class="flex items-center gap-3"><span class="grid h-6 w-6 place-items-center rounded-full bg-white/15">✓</span> Financial reports and audit trail</li>
			</ul>
		</section>
	</div>
</div>
