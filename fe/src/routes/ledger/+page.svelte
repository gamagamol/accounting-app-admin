<script lang="ts">
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import GeneralLedgerView from '$lib/modules/reports/GeneralLedgerView.svelte';
</script>

<div class="space-y-6">
  <PageHeader
    title="Buku Besar & Jurnal Umum (General Ledger)"
    description="Catatan akuntansi berpasangan debit/kredit dan saldo mutasi rekening pembukuan"
  />
  <GeneralLedgerView />
</div>
