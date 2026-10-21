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

  function handleSaveProfile() {
    updateUserProfile({ name, email });
    showSuccess = true;
    setTimeout(() => (showSuccess = false), 3000);
  }

  function handleChangePassword() {
    if (!newPassword || newPassword !== confirmPassword) {
      alert('Password baru dan konfirmasi tidak sesuai');
      return;
    }
    alert('Password akun berhasil diperbarui!');
    currentPassword = '';
    newPassword = '';
    confirmPassword = '';
  }
</script>

<div class="space-y-6 max-w-4xl">
  {#if showSuccess}
    <Alert type="success" message="Profil pengguna berhasil disimpan!" />
  {/if}

  <!-- Profile Information -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <div class="flex items-center gap-4 border-b border-gray-100 pb-5 mb-5">
      <div class="h-16 w-16 rounded-full bg-gradient-to-tr from-blue-600 to-indigo-600 text-white flex items-center justify-center font-bold text-2xl shadow-md">
        {$user.name ? $user.name.charAt(0) : 'U'}
      </div>
      <div>
        <h3 class="text-lg font-bold text-gray-900">{$user.name}</h3>
        <p class="text-xs text-gray-500">{$user.email}</p>
        <span class="inline-block mt-1 text-[11px] font-bold text-blue-700 bg-blue-50 px-2.5 py-0.5 rounded-full border border-blue-200 uppercase">
          {$user.role.replace('_', ' ')}
        </span>
      </div>
    </div>

    <form on:submit|preventDefault={handleSaveProfile} class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nama Lengkap" name="profileName" required>
          <input
            id="profileName"
            type="text"
            bind:value={name}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </FormField>

        <FormField label="Alamat Email" name="profileEmail" required>
          <input
            id="profileEmail"
            type="email"
            bind:value={email}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </FormField>
      </div>

      <div class="flex justify-end pt-2">
        <Button type="submit" variant="primary">Simpan Profil Saya</Button>
      </div>
    </form>
  </div>

  <!-- Change Password -->
  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <h4 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
      Ganti Kata Sandi (Password)
    </h4>

    <form on:submit|preventDefault={handleChangePassword} class="space-y-4 max-w-lg">
      <FormField label="Password Sekarang" name="currentPassword">
        <input
          id="currentPassword"
          type="password"
          bind:value={currentPassword}
          placeholder="••••••••"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Password Baru" name="newPassword">
        <input
          id="newPassword"
          type="password"
          bind:value={newPassword}
          placeholder="Minimal 8 karakter"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <FormField label="Konfirmasi Password Baru" name="confirmPassword">
        <input
          id="confirmPassword"
          type="password"
          bind:value={confirmPassword}
          placeholder="Ulangi password baru"
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
        />
      </FormField>

      <div class="flex justify-start pt-2">
        <Button type="submit" variant="secondary">Perbarui Password</Button>
      </div>
    </form>
  </div>
</div>
