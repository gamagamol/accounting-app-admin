<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { vendorPaymentDefinition } from '$lib/components/transactions/crudDefinitions';
	import { debtPayments } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={vendorPaymentDefinition} store={debtPayments} />
