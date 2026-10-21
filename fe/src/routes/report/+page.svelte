<script lang="ts">
  import { page } from '$app/stores';
  import PageHeader from '$lib/components/ui/PageHeader.svelte';
  import Tabs from '$lib/components/ui/Tabs.svelte';
  import AgingScheduleView from '$lib/modules/reports/AgingScheduleView.svelte';
  import QuotationVsPoView from '$lib/modules/reports/QuotationVsPoView.svelte';
  import QuotationDetailView from '$lib/modules/reports/QuotationDetailView.svelte';
  import CustomerOmzetView from '$lib/modules/reports/CustomerOmzetView.svelte';
  import OutstandingView from '$lib/modules/reports/OutstandingView.svelte';
  import OmzetReportView from '$lib/modules/reports/OmzetReportView.svelte';
  import TransactionTrackingView from '$lib/modules/reports/TransactionTrackingView.svelte';
  import GeneralLedgerView from '$lib/modules/reports/GeneralLedgerView.svelte';
  import type { TabItem } from '$lib/types';

  const tabs: TabItem[] = [
    { id: 'aging', label: 'Aging Schedule (Umur Piutang)', icon: '⏰' },
    { id: 'quotation-po', label: 'Quotation vs PO', icon: '📊' },
    { id: 'quotation-detail', label: 'Rincian Quotation', icon: '📑' },
    { id: 'customer-omzet', label: 'Omzet Customer', icon: '👥' },
    { id: 'outstanding', label: 'Outstanding Report', icon: '⚠️' },
    { id: 'omzet', label: 'Laporan Omzet Bulanan', icon: '📈' },
    { id: 'tracking', label: 'Transaction Tracking', icon: '🚀' },
    { id: 'ledger', label: 'General Ledger', icon: '📚' }
  ];

  let activeTab = $page.url.searchParams.get('tab') || 'aging';
</script>

<div class="space-y-6">
  <PageHeader
    title="Pusat Laporan & Analitik (Reports)"
    description="Analisis performa penawaran, omzet penjualan, piutang macet, dan rekonsiliasi buku besar"
  />

  <Tabs {tabs} bind:activeTab />

  <div class="pt-2">
    {#if activeTab === 'aging'}
      <AgingScheduleView />
    {:else if activeTab === 'quotation-po'}
      <QuotationVsPoView />
    {:else if activeTab === 'quotation-detail'}
      <QuotationDetailView />
    {:else if activeTab === 'customer-omzet'}
      <CustomerOmzetView />
    {:else if activeTab === 'outstanding'}
      <OutstandingView />
    {:else if activeTab === 'omzet'}
      <OmzetReportView />
    {:else if activeTab === 'tracking'}
      <TransactionTrackingView />
    {:else if activeTab === 'ledger'}
      <GeneralLedgerView />
    {/if}
  </div>
</div>
