<script lang="ts">
	import PageHeader from '$lib/components/ui/PageHeader.svelte';
	import GeneralLedgerView from '$lib/modules/reports/GeneralLedgerView.svelte';
</script>

<div class="space-y-6">
	<PageHeader
		title="General Ledger"
		description="Double-entry debit/credit records and account movement balances across the bookkeeping ledger."
	/>
	<GeneralLedgerView />
</div>
