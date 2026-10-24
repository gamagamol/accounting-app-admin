<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { purchaseInvoiceDefinition } from '$lib/components/transactions/crudDefinitions';
	import { purchaseInvoices } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={purchaseInvoiceDefinition} store={purchaseInvoices} />
