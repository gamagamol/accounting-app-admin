<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { purchaseReturnDefinition } from '$lib/components/transactions/crudDefinitions';
	import { purchaseReturns } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={purchaseReturnDefinition} store={purchaseReturns} />
