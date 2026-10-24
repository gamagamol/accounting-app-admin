<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { purchaseInvoiceDefinition } from '$lib/components/transactions/crudDefinitions';
	import { purchaseInvoices } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={purchaseInvoiceDefinition} store={purchaseInvoices} />
