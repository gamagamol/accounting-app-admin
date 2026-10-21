<script lang="ts">
  import Button from '$lib/components/ui/Button.svelte';
  import FormField from '$lib/components/ui/FormField.svelte';
  import Alert from '$lib/components/ui/Alert.svelte';
  import { appSettings } from '$lib/stores/dataStore';

  let companyName = $appSettings.companyName;
  let companyAddress = $appSettings.companyAddress;
  let companyPhone = $appSettings.companyPhone;
  let companyEmail = $appSettings.companyEmail;
  let companyNpwp = $appSettings.companyNpwp;
  let currency = $appSettings.currency;
  let taxRate = $appSettings.taxRate;
  let showSuccess = false;

  function handleSaveCompany() {
    appSettings.set({
      companyName,
      companyAddress,
      companyPhone,
      companyEmail,
      companyNpwp,
      currency,
      taxRate
    });
    showSuccess = true;
    setTimeout(() => (showSuccess = false), 3000);
  }
</script>

<div class="space-y-6 max-w-4xl">
  {#if showSuccess}
    <Alert type="success" message="Informasi perusahaan dan perpajakan berhasil diperbarui!" />
  {/if}

  <div class="bg-white p-6 rounded-2xl border border-gray-200 shadow-sm">
    <h4 class="text-base font-bold text-gray-900 border-b border-gray-100 pb-3 mb-4">
      Identitas Perusahaan & Profil Dokumen Akuntansi
    </h4>

    <form on:submit|preventDefault={handleSaveCompany} class="space-y-4">
      <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <FormField label="Nama Resmi Perusahaan" name="compName" required>
          <input
            id="compName"
            type="text"
            bind:value={companyName}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </FormField>

        <FormField label="NPWP Perusahaan" name="compNpwp" required>
          <input
            id="compNpwp"
            type="text"
            bind:value={companyNpwp}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
            required
          />
        </FormField>

        <FormField label="Nomor Telepon Kantor" name="compPhone">
          <input
            id="compPhone"
            type="text"
            bind:value={companyPhone}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </FormField>

        <FormField label="Email Korespondensi" name="compEmail">
          <input
            id="compEmail"
            type="email"
            bind:value={companyEmail}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </FormField>

        <FormField label="Mata Uang Utama" name="currency">
          <input
            id="currency"
            type="text"
            bind:value={currency}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </FormField>

        <FormField label="Tarif PPN Standar (%)" name="taxRate">
          <input
            id="taxRate"
            type="number"
            min="0"
            max="100"
            bind:value={taxRate}
            class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm font-mono focus:ring-2 focus:ring-blue-500 focus:outline-none"
          />
        </FormField>
      </div>

      <FormField label="Alamat Kantor & NPWP" name="compAddress" required>
        <textarea
          id="compAddress"
          rows="3"
          bind:value={companyAddress}
          class="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:ring-2 focus:ring-blue-500 focus:outline-none"
          required
        ></textarea>
      </FormField>

      <div class="flex justify-end pt-2">
        <Button type="submit" variant="primary">Simpan Konfigurasi Perusahaan</Button>
      </div>
    </form>
  </div>
</div>
