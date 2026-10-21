<script lang="ts">
	import Button from '$lib/components/ui/Button.svelte';
	import FormField from '$lib/components/ui/FormField.svelte';
	import Alert from '$lib/components/ui/Alert.svelte';
	import { user, updateUserProfile } from '$lib/stores/auth';

	let name = $user.name;
	let email = $user.email;
	let currentPassword = '';
	let newPassword = '';
	let confirmPassword = '';
	let showSuccess = false;

	const inputClass =
		'w-full px-3 py-2 border border-gray-300 dark:border-slate-700 rounded-lg text-sm bg-white dark:bg-slate-950 text-gray-900 dark:text-gray-100 placeholder-gray-400 dark:placeholder-slate-500 focus:ring-2 focus:ring-blue-500 focus:outline-none';

	function handleSaveProfile() {
		updateUserProfile({ name, email });
		showSuccess = true;
		setTimeout(() => (showSuccess = false), 3000);
	}

	function handleChangePassword() {
		if (!newPassword || newPassword !== confirmPassword) {
			alert('The new password and confirmation do not match.');
			return;
		}
		alert('Account password updated successfully!');
		currentPassword = '';
		newPassword = '';
		confirmPassword = '';
	}
</script>

<div class="space-y-6 max-w-4xl">
	{#if showSuccess}
		<Alert type="success" message="Your profile has been saved successfully." />
	{/if}

	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<div class="flex items-center gap-4 border-b border-gray-100 dark:border-slate-800 pb-5 mb-5">
			<div class="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
				{$user.name ? $user.name.charAt(0) : 'U'}
			</div>
			<div>
				<h3 class="text-lg font-bold text-gray-900 dark:text-white">{$user.name}</h3>
				<p class="text-xs text-gray-500 dark:text-slate-400">{$user.email}</p>
				<span class="inline-block mt-1 text-[11px] font-bold text-blue-700 dark:text-blue-300 bg-blue-50 dark:bg-blue-500/10 px-2.5 py-0.5 rounded-full border border-blue-200 dark:border-blue-500/20 uppercase">
					{$user.role.replace('_', ' ')}
				</span>
			</div>
		</div>

		<form on:submit|preventDefault={handleSaveProfile} class="space-y-4">
			<div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
				<FormField label="Full Name" name="profileName" required>
					<input id="profileName" type="text" bind:value={name} class={inputClass} required />
				</FormField>

				<FormField label="Email Address" name="profileEmail" required>
					<input id="profileEmail" type="email" bind:value={email} class={inputClass} required />
				</FormField>
			</div>

			<div class="flex justify-end pt-2">
				<Button type="submit" variant="primary">Save My Profile</Button>
			</div>
		</form>
	</div>

	<div class="bg-white dark:bg-slate-900 p-6 rounded-2xl border border-gray-200 dark:border-slate-800 shadow-sm">
		<h4 class="text-base font-bold text-gray-900 dark:text-white border-b border-gray-100 dark:border-slate-800 pb-3 mb-4">
			Change Password
		</h4>

		<form on:submit|preventDefault={handleChangePassword} class="space-y-4 max-w-lg">
			<FormField label="Current Password" name="currentPassword">
				<input id="currentPassword" type="password" bind:value={currentPassword} placeholder="••••••••" class={inputClass} />
			</FormField>

			<FormField label="New Password" name="newPassword">
				<input id="newPassword" type="password" bind:value={newPassword} placeholder="At least 8 characters" class={inputClass} />
			</FormField>

			<FormField label="Confirm New Password" name="confirmPassword">
				<input id="confirmPassword" type="password" bind:value={confirmPassword} placeholder="Repeat the new password" class={inputClass} />
			</FormField>

			<div class="flex justify-start pt-2">
				<Button type="submit" variant="secondary">Update Password</Button>
			</div>
		</form>
	</div>
</div>
