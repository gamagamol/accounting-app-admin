<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { vendorPaymentDefinition } from '$lib/components/transactions/crudDefinitions';
	import { debtPayments } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={vendorPaymentDefinition} store={debtPayments} />
