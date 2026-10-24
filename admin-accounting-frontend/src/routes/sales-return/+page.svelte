<script lang="ts">
	import EntityCrudList from '$lib/components/transactions/EntityCrudList.svelte';
	import { salesReturnDefinition } from '$lib/components/transactions/crudDefinitions';
	import { salesReturns } from '$lib/stores/dataStore';
</script>

<EntityCrudList definition={salesReturnDefinition} store={salesReturns} />
