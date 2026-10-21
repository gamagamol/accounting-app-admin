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
	<StatCard title="Total Sales (SO)" value={formatCurrency($totalSalesAmount)} icon="📈" color="blue" />
	<StatCard title="Outstanding Receivables" value={formatCurrency($totalReceivableAmount)} icon="🧾" color="yellow" />
	<StatCard title="Vendor Payables" value={formatCurrency($totalPayableAmount)} icon="🏦" color="red" />
	<StatCard title="Settlement Rate" value="{$paymentCompletionRate}%" icon="🎯" color="green" />
</div>
