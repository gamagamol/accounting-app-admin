<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { purchaseReturnDefinition } from '$lib/components/transactions/crudDefinitions';
	import { purchaseReturns } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={purchaseReturnDefinition} store={purchaseReturns} />
