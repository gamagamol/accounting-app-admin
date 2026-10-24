<script lang="ts">
	import EntityCrudRoute from '$lib/components/transactions/EntityCrudRoute.svelte';
	import { salesReturnDefinition } from '$lib/components/transactions/crudDefinitions';
	import { salesReturns } from '$lib/stores/dataStore';
</script>

<EntityCrudRoute definition={salesReturnDefinition} store={salesReturns} />
