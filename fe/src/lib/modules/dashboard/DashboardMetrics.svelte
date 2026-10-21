<script lang="ts">
  import StatCard from '$lib/components/ui/StatCard.svelte';
  import {
    totalSalesAmount,
    totalReceivableAmount,
    totalPayableAmount,
    paymentCompletionRate
  } from '$lib/stores/dataStore';
  import { formatCurrency } from '$lib/utils/formatters';
</script>

<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
  <StatCard
    title="Total Penjualan (SO)"
    value={formatCurrency($totalSalesAmount)}
    icon="📈"
    color="blue"
  />

  <StatCard
    title="Piutang Tertunggak"
    value={formatCurrency($totalReceivableAmount)}
    icon="🧾"
    color="yellow"
  />

  <StatCard
    title="Hutang Usaha ke Vendor"
    value={formatCurrency($totalPayableAmount)}
    icon="🏦"
    color="red"
  />

  <StatCard
    title="Persentase Pelunasan"
    value="{$paymentCompletionRate}%"
    icon="🎯"
    color="green"
  />
</div>
