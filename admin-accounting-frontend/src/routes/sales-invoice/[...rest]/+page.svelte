<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { salesInvoiceDefinition } from '$lib/components/transactions/crudDefinitions';
	import { billPayments } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={salesInvoiceDefinition} store={billPayments} />
